/**
 * Service to handle GitHub commits using a Personal Access Token.
 */

import { soundService } from './soundService';
import { useGameStore } from '../store/useGameStore';
import { migrateCharacterV1ToV2 } from '../lib/migrationUtils';

export const REPO = process.env.GITHUB_REPO || "japiohopman/artificer";
export const BRANCH = process.env.GITHUB_BRANCH || "main";

// Schema caches to prevent redundant local / proxy network waterfalls
const monsterCache: Record<string, any> = {};
const materialCache: Record<string, any> = {};
const equipmentCache: Record<string, any> = {};
const magicItemCache: Record<string, any> = {};
const spellCache: Record<string, any> = {};
const backgroundCache: Record<string, any> = {};
const classLevelsCache: Record<string, any[]> = {};
let monsterCategoriesCache: any[] | null = null;
let monsterMappingCache: Record<string, string> | null = null;
let materialCategoriesCache: any[] | null = null;
let materialMappingCache: Record<string, string> | null = null;
let equipmentCategoriesCache: any[] | null = null;
let equipmentMappingCache: Record<string, string> | null = null;
let materialsListCache: any[] | null = null;
let equipmentListCache: any[] | null = null;
let magicItemListCache: any[] | null = null;
let spellListCache: any[] | null = null;

async function safeJson(res: Response): Promise<any> {
  if (!res.ok) return null;
  try {
    const text = await res.text();
    if (!text || text.trim() === '') return null;
    
    const trimmed = text.trim();
    if (!((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')))) {
      return null;
    }

    try {
      // Attempt standard parse first to avoid unnecessary (and potentially corruptive) regex cleaning
      return JSON.parse(text);
    } catch (e) {
      try {
        // Fallback cleaning for common JSON issues like trailing dots or missing leading zeros
        const cleaned = text.trim()
          .replace(/(\d+)\.(?!\d)/g, '$1.0')  // 15. -> 15.0
          .replace(/(?<!\d)\.(\d+)/g, '0.$1') // .5 -> 0.5
          .replace(/,\s*([}\]])/g, '$1');     // Trailing commas
        return JSON.parse(cleaned);
      } catch (e2) {
        console.warn("safeJson: Malformed JSON detected, returning null.", e2);
        return null;
      }
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      // Silently ignore abort errors as they are expected during navigation or rapid updates
      return null;
    }
    console.error("Failed to parse JSON response:", e);
    return null;
  }
}

export async function fetchRecruitNPCList(): Promise<{ name: string; path: string; index: string }[]> {
  try {
    const localRes = await fetch('/assets/atlas/characters/recruit_npc/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((f: any) => ({
          name: f.name || f.index.replace(/_/g, ' '),
          path: f.path || `/assets/atlas/characters/recruit_npc/${f.index}.json`,
          index: f.index
        }));
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/characters/recruit_npc?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;

  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        path: f.path,
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching Recruit NPC list:", e);
    return [];
  }
}

export async function fetchRecruitNPCData(index: string): Promise<any> {
  let data: any = null;
  // Try local first
  try {
    const res = await fetch(`/assets/atlas/characters/recruit_npc/${index}.json`);
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {}

  if (!data) {
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/characters/recruit_npc/${index}.json?t=${Date.now()}`;
    const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
    try {
      const res = await fetch(url);
      data = await safeJson(res);
    } catch (e) {
      return null;
    }
  }

  return data ? migrateCharacterV1ToV2(data) : null;
}

export async function fetchMonsterCategories(): Promise<{ name: string; index: string; monsters: any[] }[]> {
  if (monsterCategoriesCache) return monsterCategoriesCache;
  try {
    const localRes = await fetch('/assets/atlas/enemies_categories/index.json');
    if (localRes.ok) {
      const fileList = await localRes.json();
      if (Array.isArray(fileList)) {
        const categories = await Promise.all(
          fileList.map(async (f: any) => {
            const res = await fetch(`/assets/atlas/enemies_categories/json/${f.index}.json`);
            return res.ok ? await res.json() : null;
          })
        );
        const filtered = categories.filter(c => c !== null);
        monsterCategoriesCache = filtered;
        return filtered;
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/enemies_categories/json?ref=${BRANCH}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    
    const categories = await Promise.all(
      files
        .filter((f: any) => f.name.endsWith('.json'))
        .map(async (f: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
          const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
          return await safeJson(rawRes);
        })
    );
    
    return categories.filter(c => c !== null);
  } catch (e) {
    console.error("Error fetching monster categories:", e);
    return [];
  }
}

export async function fetchMonsterCategoryMapping(): Promise<Record<string, string>> {
  if (monsterMappingCache) return monsterMappingCache;
  try {
    const categories = await fetchMonsterCategories();
    const mapping: Record<string, string> = {};
    categories.forEach(data => {
      if (data && data.monsters && data.name) {
        data.monsters.forEach((item: any) => {
          mapping[item.index] = data.name;
        });
      }
    });
    if (Object.keys(mapping).length > 0) {
      monsterMappingCache = mapping;
      return mapping;
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/enemies_categories/json?ref=${BRANCH}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files) return {};
    const mapping: Record<string, string> = {};
    
    const categoryPromises = files
      .filter((f: any) => f.name.endsWith('.json'))
      .map(async (f: any) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
          const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
          if (rawRes.ok) {
            const data = await safeJson(rawRes);
            if (data && data.monsters && data.name) {
              data.monsters.forEach((item: any) => {
                mapping[item.index] = data.name;
              });
            }
          }
        } catch (fileError) {
          console.warn(`Error parsing category file ${f.path}:`, fileError);
        }
      });
    
    await Promise.all(categoryPromises);
    return mapping;
  } catch (e) {
    console.error("Error fetching monster category mapping:", e);
    return {};
  }
}

export function getActiveRulesetContext(explicitRuleset?: '2014' | '2024'): '2014' | '2024' {
  if (explicitRuleset === '2014' || explicitRuleset === '2024') {
    return explicitRuleset;
  }
  try {
    const gameRuleset = useGameStore.getState()?.ruleset;
    if (gameRuleset === '2014' || gameRuleset === '2024') {
      return gameRuleset;
    }
  } catch (e) {}
  return '2014';
}

export function getRulesetVersionFolder(ruleset?: '2014' | '2024'): '14' | '24' {
  const active = getActiveRulesetContext(ruleset);
  return active === '2024' ? '24' : '14';
}

export async function fetchMonsterList(): Promise<{ name: string; path: string; index: string }[]> {
  const versionFolder = getRulesetVersionFolder();
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/enemies/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          ...item,
          name: item.name || item.index.replace(/_/g, ' '),
          path: item.json_path || `public/assets/atlas/enemies/json/${versionFolder}/${item.index}.json`,
          index: item.index
        }));
      }
    }
  } catch (e) {
    console.warn("Local monster index not found, trying GitHub fallback...");
  }

  // Fallback to GitHub API (recursively scanning rulesets 14 and 24 if index fails)
  const results: any[] = [];
  const rulesets = ['14', '24'];
  for (const r of rulesets) {
    const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/enemies/json/${r}?ref=${BRANCH}&t=${Date.now()}`;
    const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
    try {
      const res = await fetch(url);
      const files = await safeJson(res);
      if (files && Array.isArray(files)) {
        files
          .filter((f: any) => f.name.endsWith('.json'))
          .forEach((f: any) => {
            results.push({
              name: f.name.replace('.json', '').replace(/_/g, ' '),
              path: f.path,
              index: f.name.replace('.json', '')
            });
          });
      }
    } catch (e) {}
  }
  return results;
}

export async function fetchMonsterData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  const activeRuleset = getActiveRulesetContext(ruleset);
  const cacheKey = `${activeRuleset}:${index}`;
  if (monsterCache[cacheKey]) return monsterCache[cacheKey];

  let data: any = null;
  let resolvedPath: string | null = null;
  const versionFolder = getRulesetVersionFolder(ruleset);
  const altFolder = versionFolder === '24' ? '14' : '24';

  // Node CLI local filesystem fallback for test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');

      // 1. Try resolving via local index.json first
      const indexPath = pathModule.resolve(process.cwd(), 'public/assets/atlas/enemies/index.json');
      if (fs.existsSync(indexPath)) {
        const enemyIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const cleanSearch = index.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
        const matching = enemyIndex.filter((e: any) =>
          e.index.toLowerCase() === index.toLowerCase() ||
          (e.name && e.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim() === cleanSearch)
        );
        const versioned = matching.find((e: any) => e.json_path && e.json_path.includes(`/${versionFolder}/`));
        const entry = versioned || matching[0];
        if (entry && entry.json_path) {
          resolvedPath = entry.json_path;
        }
      }

      // 2. Direct folder fallback
      if (!resolvedPath) {
        const subfolders = [versionFolder, altFolder, ''];
        for (const sub of subfolders) {
          const candidate = sub ? `/assets/atlas/enemies/json/${sub}/${index}.json` : `/assets/atlas/enemies/json/${index}.json`;
          const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
          if (fs.existsSync(fullFsPath)) {
            resolvedPath = candidate;
            break;
          }
        }
      }

      if (resolvedPath) {
        const fullFsPath = pathModule.resolve(process.cwd(), `public${resolvedPath.replace(/^\/?public\//, '/')}`);
        if (fs.existsSync(fullFsPath)) {
          const fileContent = fs.readFileSync(fullFsPath, 'utf8');
          data = JSON.parse(fileContent);
        }
      }
    } catch (e) {}
  }

  // Resolve sub-directory from local index first (supporting index or name-based fallback matching)
    try {
      const indexRes = await fetch('/assets/atlas/enemies/index.json');
      if (indexRes.ok) {
        const enemyIndex = await indexRes.json();
        const cleanSearch = index.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
        const matchingEntries = enemyIndex.filter((e: any) =>
          e.index.toLowerCase() === index.toLowerCase() ||
          (e.name && e.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim() === cleanSearch)
        );
        const versionedEntry = matchingEntries.find((e: any) => e.json_path && e.json_path.includes(`/${versionFolder}/`));
        const entry = versionedEntry || matchingEntries[0];
        if (entry && entry.json_path) {
          resolvedPath = entry.json_path;
        }
      }
    } catch (e) {}

    // Iterative fallbacks prioritizing current ruleset version folder
    if (!resolvedPath) {
      const subfolders = [versionFolder, altFolder];
      for (const sub of subfolders) {
        try {
          const checkRes = await fetch(`/assets/atlas/enemies/json/${sub}/${index}.json`, { method: 'HEAD' });
          if (checkRes.ok) {
            resolvedPath = `/assets/atlas/enemies/json/${sub}/${index}.json`;
            break;
          }
        } catch (e) {}
      }
    }

    if (!resolvedPath) {
      resolvedPath = `/assets/atlas/enemies/json/${versionFolder}/${index}.json`;
    }

    // Fetch local file
    try {
      const res = await fetch(resolvedPath);
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {}

  if (!data && resolvedPath) {
    // Fallback to GitHub
    const cleanSubpath = resolvedPath.replace(/^\/?assets\/atlas\/enemies\/json\//, '').replace(/^\/?public\/assets\/atlas\/enemies\/json\//, '');
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/enemies/json/${cleanSubpath}?t=${Date.now()}`;
    const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
    
    try {
      const res = await fetch(url);
      data = await safeJson(res);
    } catch (e) {
      console.error("Error fetching monster data from GitHub:", e);
    }
  }

  if (!data) return null;

  // Normalize Data Structure
  const normalized = { ...data };
  
  // 1. Ensure stats object exists
  if (!normalized.stats) {
    normalized.stats = {
      str: normalized.strength || normalized.STR || 10,
      dex: normalized.dexterity || normalized.DEX || 10,
      con: normalized.constitution || normalized.CON || 10,
      int: normalized.intelligence || normalized.INT || 10,
      wis: normalized.wisdom || normalized.WIS || 10,
      cha: normalized.charisma || normalized.CHA || 10,
    };
  }

  // 2. Normalize Armor Class
  if (Array.isArray(normalized.armor_class) && normalized.armor_class.length > 0) {
    normalized.armor_class = normalized.armor_class[0].value;
  } else if (typeof normalized.armor_class === 'object' && normalized.armor_class !== null) {
    normalized.armor_class = normalized.armor_class.value || 10;
  }

  // 3. Normalize Challenge Rating
  if (typeof normalized.challenge_rating !== 'undefined') {
    normalized.challenge_rating = String(normalized.challenge_rating);
  }

  // 4. Fix index if it's a URL-like string
  if (normalized.index && normalized.index.includes('/')) {
    normalized.index = index;
  }

  // 5. Handle Lore (Check local first)
  if (!normalized.lore || normalized.lore.length < 10) {
     try {
       const fallbackRes = await fetch(`/assets/atlas/enemies/enemies_wiki/${index}.json`);
       if (fallbackRes.ok) {
         const wikiData = await fallbackRes.json();
         normalized.lore = wikiData.lore || wikiData.mainLore || normalized.lore;
         normalized.wikiData = wikiData.wikiData || wikiData.sections || wikiData;
       }
     } catch(e) {}
  }

  // Determine actual ruleset of the loaded monster record based on resolved path or record URL
  const actualPath = resolvedPath || normalized.url || '';
  const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';

  const finalResult = {
    ...normalized,
    rulesetContext: actualRuleset,
    imageUrl: normalizeImageUrl(normalized.imageUrl || normalized.image || normalized.image_url || data.imageUrl, 'enemies', index, normalized.name)
  };
  monsterCache[cacheKey] = finalResult;
  return finalResult;
}

export async function fetchMaterialData(index: string): Promise<any> {
  if (materialCache[index]) return materialCache[index];
  // Local first
  try {
    const res = await fetch(`/assets/atlas/materials/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      const finalResult = { ...data, imageUrl: normalizeImageUrl(data.imageUrl, 'materials', index, data.name) };
      materialCache[index] = finalResult;
      return finalResult;
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/materials/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl, 'materials', index, data.name)
    };
  } catch (e) {
    console.error("Error fetching material data:", e);
    return null;
  }
}

export function getCachedEquipment(index: string, ruleset?: '2014' | '2024'): any | null {
  const activeRuleset = getActiveRulesetContext(ruleset);
  return equipmentCache[`${activeRuleset}:${index}`] || equipmentCache[`2014:${index}`] || equipmentCache[`2024:${index}`] || null;
}

export async function fetchEquipmentData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  const activeRuleset = getActiveRulesetContext(ruleset);
  const cacheKey = `${activeRuleset}:${index}`;
  if (equipmentCache[cacheKey]) return equipmentCache[cacheKey];

  const versionFolder = getRulesetVersionFolder(ruleset);
  const cleanIndex = index.toLowerCase().replace(/_/g, '-');
  const packNames = ['burglars-pack', 'explorers-pack', 'dungeoneers-pack', 'priests-pack', 'entertainers-pack', 'scholars-pack', 'diplomats-pack'];

  // Node CLI local filesystem fallback for unit test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      let nodePath: string | null = null;

      if (packNames.includes(cleanIndex)) {
        nodePath = `public/assets/atlas/equipment/json/${versionFolder}/equipment-packs/${cleanIndex}/_container.json`;
      } else {
        const indexPath = path.resolve(process.cwd(), 'public/assets/atlas/equipment/index.json');
        if (fs.existsSync(indexPath)) {
          const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
          const cleanSearch = index.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
          const hyphenSearch = index.toLowerCase().replace(/_/g, '-');
          const matching = indexData.filter((e: any) =>
            e.index.toLowerCase() === index.toLowerCase() ||
            e.index.toLowerCase() === cleanIndex ||
            e.index.toLowerCase() === hyphenSearch ||
            (e.name && e.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim() === cleanSearch)
          );
          const versioned = matching.find((e: any) => e.json_path && e.json_path.includes(`/${versionFolder}/`));
          const entry = versioned || matching[0];
          if (entry && entry.json_path) {
            nodePath = entry.json_path.replace(/^\/?assets\/atlas\//, 'public/assets/atlas/').replace(/^\/?public\/assets\/atlas\//, 'public/assets/atlas/');
          }
        }
      }

      if (nodePath) {
        const fullPath = path.resolve(process.cwd(), nodePath);
        if (fs.existsSync(fullPath)) {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const data = JSON.parse(fileContent);
          if (packNames.includes(cleanIndex)) {
            data.index = index;
            const underscoreName = cleanIndex.replace(/-/g, '_');
            data.imageUrl = `/assets/atlas/equipment/images/${underscoreName}.webp`;
            data.image = `/assets/atlas/equipment/images/${underscoreName}.webp`;
          }
          const actualPath = nodePath || data.url || '';
          const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';
          const finalResult = { ...data, rulesetContext: actualRuleset, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'equipment', index, data.name) };
          equipmentCache[cacheKey] = finalResult;
          return finalResult;
        }
      }
    } catch (e) {}
    return null;
  }

  let resolvedPath: string | null = null;
  if (packNames.includes(cleanIndex)) {
    resolvedPath = `/assets/atlas/equipment/json/${versionFolder}/equipment-packs/${cleanIndex}/_container.json`;
  }

  try {
    if (!resolvedPath) {
      const indexRes = await fetch('/assets/atlas/equipment/index.json');
      if (indexRes.ok) {
        const equipmentIndex = await indexRes.json();
        const cleanSearch = index.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
        const matchingEntries = equipmentIndex.filter((e: any) =>
          e.index.toLowerCase() === index.toLowerCase() ||
          (e.name && e.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim() === cleanSearch)
        );
        const versionedEntry = matchingEntries.find((e: any) => e.json_path && e.json_path.includes(`/${versionFolder}/`));
        const entry = versionedEntry || matchingEntries[0];
        if (entry && entry.json_path) {
          resolvedPath = entry.json_path;
        }
      }
    }
  } catch (e) {
    console.warn("Error loading equipment index:", e);
  }

  if (!resolvedPath) {
    resolvedPath = `/assets/atlas/equipment/json/${versionFolder}/${index}.json`;
  }

  // Node CLI local filesystem fallback for resolvedPath in test environments
  if (typeof window === 'undefined' && resolvedPath) {
    try {
      const fs = require('fs');
      const path = require('path');
      const cleanSubpath = resolvedPath.replace(/^\/?assets\/atlas\//, 'public/assets/atlas/').replace(/^\/?public\/assets\/atlas\//, 'public/assets/atlas/');
      const fullFsPath = path.resolve(process.cwd(), cleanSubpath);
      if (fs.existsSync(fullFsPath)) {
        const fileContent = fs.readFileSync(fullFsPath, 'utf8');
        const data = JSON.parse(fileContent);
        if (packNames.includes(cleanIndex)) {
          data.index = index;
          const underscoreName = cleanIndex.replace(/-/g, '_');
          data.imageUrl = `/assets/atlas/equipment/images/${underscoreName}.webp`;
          data.image = `/assets/atlas/equipment/images/${underscoreName}.webp`;
        }
        const actualPath = resolvedPath || data.url || '';
        const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';
        const finalResult = { ...data, rulesetContext: actualRuleset, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'equipment', index, data.name) };
        equipmentCache[cacheKey] = finalResult;
        return finalResult;
      }
    } catch (e) {}
  }

  // Local first
  try {
    const res = await fetch(resolvedPath);
    if (res.ok) {
      const data = await res.json();
      // If it's an intercepted pack container, override index and imageUrl to match the pack
      if (packNames.includes(cleanIndex)) {
        data.index = index; // Keep original index format (e.g. burglars_pack)
        const underscoreName = cleanIndex.replace(/-/g, '_');
        data.imageUrl = `/assets/atlas/equipment/images/${underscoreName}.webp`;
        data.image = `/assets/atlas/equipment/images/${underscoreName}.webp`;
      }
      const actualPath = resolvedPath || data.url || '';
      const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';
      const finalResult = { ...data, rulesetContext: actualRuleset, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'equipment', index, data.name) };
      equipmentCache[cacheKey] = finalResult;
      return finalResult;
    }
  } catch (e) {}

  // Fallback to GitHub raw
  const cleanSubpath = resolvedPath.replace(/^\/?assets\/atlas\/equipment\/json\//, '').replace(/^\/?public\/assets\/atlas\/equipment\/json\//, '');
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/equipment/json/${cleanSubpath}?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    if (packNames.includes(cleanIndex)) {
      data.index = index;
      const underscoreName = cleanIndex.replace(/-/g, '_');
      data.imageUrl = `/assets/atlas/equipment/images/${underscoreName}.webp`;
      data.image = `/assets/atlas/equipment/images/${underscoreName}.webp`;
    }
    const actualPath = resolvedPath || data.url || '';
    const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';
    return {
      ...data,
      rulesetContext: actualRuleset,
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'equipment', index, data.name)
    };
  } catch (e) {
    console.error("Error fetching equipment data from GitHub:", e);
    return null;
  }
}


export async function fetchMagicItemData(index: string): Promise<any> {
  if (magicItemCache[index]) return magicItemCache[index];
  // Local first
  try {
    const res = await fetch(`/assets/atlas/magic_items/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      const finalResult = { ...data, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'magic_items', index, data.name) };
      magicItemCache[index] = finalResult;
      return finalResult;
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/magic_items/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'magic_items', index, data.name)
    };
  } catch (e) {
    console.error("Error fetching magic item data:", e);
    return null;
  }
}

export function normalizeImageUrl(url: string | undefined, category: string, index: string, name?: string): string {
  const timestamp = Date.now();
  let finalUrl = "";

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.gitpod.io')
  );

  // Support 2024 class assets and official illustrations by mapping from /assets/atlas/ui/official/classes/ to /assets/ui/official/classes/
  if (url && typeof url === 'string') {
    url = url.replace(/\/assets\/atlas\/ui\/official\/classes\//gi, '/assets/ui/official/classes/');
    url = url.replace(/assets\/atlas\/ui\/official\/classes\//gi, 'assets/ui/official/classes/');
    // Replace dragons with dragon for token paths (case-insensitive and robustly)
    url = url.replace(/tokens\/dragons\//gi, 'tokens/dragon/');
  }

  // Normalize category names to folder names
  const categoryToFolder: Record<string, string> = {
    'enemy': 'enemies',
    'enemies': 'enemies',
    'monster': 'enemies',
    'monsters': 'enemies',
    'material': 'materials',
    'materials': 'materials',
    'magic_item': 'magic_items',
    'magic_items': 'magic_items',
    'equipment': 'equipment',
    'spell': 'spell',
    'spells': 'spell',
    'npc_profile': 'npc_profiles',
    'npc_profiles': 'npc_profiles',
    'npc_character_profile': 'npc_character_profiles',
    'npc_character_profiles': 'npc_character_profiles',
    'crafting': 'materials',
    'class': 'class',
    'species': 'species',
    'subrace': 'subraces',
    'subraces': 'subraces',
    'background': 'backgrounds',
    'backgrounds': 'backgrounds',
    'transport': 'transport'
  };

  const folder = categoryToFolder[category.toLowerCase()] || category.toLowerCase();
  
  // Use name instead of index if index is a 16-character alphanumeric Foundry ID
  const isFoundryId = /^[a-z0-9]{16}$/i.test(index);
  const baseIdentifier = (isFoundryId && name) ? name : (index || "");
  const cleanIndex = baseIdentifier.toLowerCase();
  
  const underscoreIndex = cleanIndex.replace(/\s+/g, '_');
  const ddbIndex = cleanIndex.replace(/_/g, '-').replace(/\s+/g, '-');

  // Handle and replace generic underscore prefixes with the actual item names dynamically (Option B / Task Board optimization)
  if (url && typeof url === 'string') {
    const genericPlaceholders = ['_container.webp', '_weapon.webp', '_armor.webp', '_shield.webp', '_potion.webp', '_ring.webp', '_scroll.webp', '_tool.webp', '_loot.webp', '_food.webp', '_ammunition.webp'];
    if (genericPlaceholders.some(p => url!.endsWith(p))) {
      const dirPath = url!.substring(0, url!.lastIndexOf('/'));
      url = `${dirPath}/${underscoreIndex}.webp`;
    }
  }

  if (url && (url.startsWith('/api/raw') || url.startsWith('/api/fetch'))) {
    return url;
  }

  if (url && url.startsWith('data:image/')) {
    return url;
  }
  
  // Support local character saves
  let isSavePath = false;
  let savePathRelative = "";
  if (url && typeof url === 'string') {
    const cleanUrlForSave = url.startsWith('/') ? url.substring(1) : url;
    if (cleanUrlForSave.startsWith('data/character_save/')) {
      isSavePath = true;
      savePathRelative = cleanUrlForSave;
    } else if (cleanUrlForSave.startsWith('public/data/character_save/')) {
      isSavePath = true;
      savePathRelative = cleanUrlForSave.substring(7); // strip public/
    }
  }

  if (isSavePath) {
    const localUrl = `/${savePathRelative}`;
    if (isLocalhost) {
      return localUrl;
    }
    return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/${savePathRelative}?t=${timestamp}`;
  }

  if (!url) {
    // Standard directory structure for atlas assets
    const categoriesWithImagesFolder = ['magic_items', 'equipment', 'enemies', 'materials', 'npc_character_profiles', 'npc_profiles', 'spell', 'transport'];
    const wikiImageCategories = ['class', 'species', 'subraces', 'backgrounds'];
    
    // We try both underscore and hyphen versions if guessing
    if (folder === 'npc_character_profiles' || folder === 'npc_profiles') {
      const actualCategory = 'character/npc_character_profiles';
      if (isLocalhost) {
        finalUrl = `/assets/atlas/${actualCategory}/images/${underscoreIndex}/${underscoreIndex}_portrait.webp`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${actualCategory}/images/${underscoreIndex}/${underscoreIndex}_portrait.webp`;
      }
    } else if (wikiImageCategories.includes(folder)) {
      if (isLocalhost) {
        finalUrl = `/assets/atlas/${folder}/wiki_image/${ddbIndex}.webp`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/wiki_image/${ddbIndex}.webp`;
      }
    } else if (categoriesWithImagesFolder.includes(folder)) {
      // Prefer underscore for equipment/materials as they often match filenames
      const filename = (folder === 'equipment' || folder === 'materials' || folder === 'transport') ? underscoreIndex : ddbIndex;
      if (isLocalhost) {
        finalUrl = `/assets/atlas/${folder}/images/${filename}.webp`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/images/${filename}.webp`;
      }
    } else {
      if (isLocalhost) {
        finalUrl = `/assets/atlas/${folder}/${ddbIndex}.webp`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/${ddbIndex}.webp`;
      }
    }
  } else if (url && url.startsWith('data:image/')) {
    return url;
  } else if (url && (url.startsWith('assets/') || url.startsWith('/assets/') || url.startsWith('public/assets/'))) {
    // If it's a local-looking path, resolve it to GitHub to ensure it's found
    let cleanUrl = url.startsWith('public/') ? url.substring(6) : url;
    if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;
    
    // Inject images/ or wiki_image/ if missing in the path
    const categoriesWithImages = ['equipment', 'enemies', 'magic_items', 'spell', 'npc_character_profiles', 'npc_profiles', 'materials', 'transport'];
    const wikiImageCategories = ['class', 'species', 'subraces', 'backgrounds'];
    
    // Determine path category from URL
    const pathParts = cleanUrl.split('/');
    const atlasIndex = pathParts.indexOf('atlas');
    const pathCategory = atlasIndex !== -1 ? pathParts[atlasIndex + 1] : folder;
    
    if (categoriesWithImages.includes(pathCategory) && cleanUrl.includes(`/atlas/${pathCategory}/`) && !cleanUrl.includes(`/atlas/${pathCategory}/images/`) && !cleanUrl.includes(`/atlas/${pathCategory}/tokens/`)) {
      cleanUrl = cleanUrl.replace(`/atlas/${pathCategory}/`, `/atlas/${pathCategory}/images/`);
    } else if (wikiImageCategories.includes(pathCategory) && cleanUrl.includes(`/atlas/${pathCategory}/`) && !cleanUrl.includes(`/atlas/${pathCategory}/wiki_image/`)) {
      cleanUrl = cleanUrl.replace(`/atlas/${pathCategory}/`, `/atlas/${pathCategory}/wiki_image/`);
    }
    
    if (isLocalhost) {
      finalUrl = cleanUrl;
    } else {
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public${cleanUrl}`;
    }
  } else if (url && url.includes('github.com') && (url.includes('/blob/') || url.includes('/tree/'))) {
    finalUrl = url.replace('github.com', 'raw.githubusercontent.com')
                  .replace('/blob/', '/')
                  .replace('/tree/', '/')
                  .split('?')[0];
  } else if (url && !url.startsWith('http')) {
    // Simple filename or relative path from JSON
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    if (cleanPath.includes('/atlas/')) {
      if (isLocalhost) {
        finalUrl = `/assets${cleanPath.substring(cleanPath.indexOf('/atlas/'))}`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets${cleanPath.substring(cleanPath.indexOf('/atlas/'))}`;
      }
    } else {
      const wikiImageCategories = ['class', 'species', 'subraces', 'backgrounds'];
      const isWiki = wikiImageCategories.includes(folder);
      const subfolder = isWiki ? 'wiki_image' : 'images';
      
      const filename = url.includes('.') ? url : url + '.webp';
      if (isLocalhost) {
        finalUrl = `/assets/atlas/${folder}/${subfolder}/${filename}`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/${subfolder}/${filename}`;
      }
    }
  } else {
    finalUrl = url || "";
  }

  // FORCE ENEMIES image resolution logic to separate portraits (images/) from grid tokens (tokens/)
  if (folder === 'enemies') {
    const isTokenPath = url && (url.includes('/tokens/') || url.includes('/enemies/tokens/'));
    if (!isTokenPath) {
      const filename = ddbIndex + '.webp';
      if (isLocalhost) {
        finalUrl = `/assets/atlas/enemies/images/${filename}`;
      } else {
        finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/enemies/images/${filename}`;
      }
    }
  }

  // Ensure equipment, materials, and transport image filenames use underscores instead of hyphens
  if (finalUrl.includes('/assets/atlas/equipment/images/') || finalUrl.includes('/assets/atlas/materials/images/') || finalUrl.includes('/assets/atlas/transport/images/')) {
    const parts = finalUrl.split('/');
    const filename = parts[parts.length - 1];
    if (filename.includes('-')) {
      parts[parts.length - 1] = filename.replace(/-/g, '_');
      finalUrl = parts.join('/');
    }
  }

  // Use the proxy for all external atlas images to handle CORS and auth
  if (finalUrl.startsWith('http')) {
    // Add timestamp for cache busting inside the encoded URL
    const sep = finalUrl.includes('?') ? '&' : '?';
    const urlWithTimestamp = `${finalUrl}${sep}t=${timestamp}`;
    return `/api/raw?url=${encodeURIComponent(urlWithTimestamp)}`;
  }
  
  return finalUrl;
}

export function getEnemyArtworkUrl(enemy: any): string {
  if (!enemy) return "";
  const index = enemy.index || enemy.id || enemy.name || "";
  const imageUrl = enemy.imageUrl || enemy.image || enemy.avatarUrl || "";
  return normalizeImageUrl(imageUrl, 'enemies', index, enemy.name);
}

export async function deleteFile(path: string, message?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, message }) })

    if (!res.ok) {
      const error = await res.json();
      console.error("Delete failed via server proxy:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error calling server proxy delete:", error);
    return false;
  }
}

export async function commitFile(path: string, content: string, isBase64: boolean = false): Promise<boolean> {
  try {
    const res = await fetch('/api/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, isBase64 })
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Bake failed via server proxy:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error calling server proxy:", error);
    return false;
  }
}

export async function bakeWikiEntry(category: string, index: string, name: string, data: any): Promise<boolean> {
  const jsonPath = `public/assets/atlas/${category}/json/${index}.json`;
  return await commitFile(jsonPath, JSON.stringify(data, null, 2));
}

export async function updateMonsterCategory(categoryIndex: string, monsterIndex: string, monsterName: string): Promise<boolean> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/enemies_categories/json/${categoryIndex}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    let data: any;
    if (res.ok) {
      data = await res.json();
    } else {
      // Create new category if it doesn't exist
      data = {
        name: categoryIndex.charAt(0).toUpperCase() + categoryIndex.slice(1),
        index: categoryIndex,
        monsters: []
      };
    }

    if (!data.monsters) data.monsters = [];
    
    // Check if already exists
    const exists = data.monsters.some((m: any) => m.index === monsterIndex);
    if (!exists) {
      data.monsters.push({
        name: monsterName,
        index: monsterIndex
      });
      
      const jsonPath = `public/assets/atlas/enemies_categories/json/${categoryIndex}.json`;
      return await commitFile(jsonPath, JSON.stringify(data, null, 2));
    }
    
    return true;
  } catch (e) {
    console.error("Error updating monster category:", e);
    return false;
  }
}

export function playClickSound() {
  soundService.playEffect('UI_CLICK_LIGHT');
}

export function playSuccessSound() {
  soundService.playEffect('TRANSACTION_SUCCESS');
}

export function playFailSound() {
  soundService.playEffect('UI_ERROR');
}

export function playSlotSound() {
  soundService.playEffect('ITEM_SLOT');
}

export function playGrabSound() {
  soundService.playEffect('ITEM_GRAB');
}

export function playEquipSound() {
  soundService.playEffect('ITEM_EQUIP');
}

export function playPlaceSound() {
  soundService.playEffect('ITEM_SLOT');
}

export function playModalOpenSound() {
  soundService.playEffect('UI_MODAL_OPEN');
}

export function playModalCloseSound() {
  soundService.playEffect('UI_BACK_EXIT');
}

export async function fetchNPCList(): Promise<{ name: string; path: string; index: string }[]> {
  try {
    const localRes = await fetch('/assets/atlas/characters/npc/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((f: any) => ({
          name: f.name || f.index.replace(/_/g, ' '),
          path: f.path || `/assets/atlas/characters/npc/${f.index}.json`,
          index: f.index
        }));
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/characters/npc?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        path: f.path,
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching NPC list:", e);
    return [];
  }
}

export async function fetchNPCData(index: string): Promise<any> {
  // Try local first
  try {
    const res = await fetch(`/assets/atlas/characters/npc/${index}.json`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/characters/npc/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    return await safeJson(res);
  } catch (e) {
    return null;
  }
}

export async function fetchMaterialsList(): Promise<{ name: string; index: string }[]> {
  if (materialsListCache) return materialsListCache;
  try {
    // Try local index first (if it exists, though materials index might be different)
    const localRes = await fetch('/assets/atlas/materials/index.json');
    if (localRes.ok) {
       const data = await localRes.json();
       if (Array.isArray(data)) {
         const list = data.map((item: any) => ({
           name: item.name || item.index.replace(/_/g, ' '),
           index: item.index
         }));
         materialsListCache = list;
         return list;
       }
    }
  } catch(e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/materials/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching materials list:", e);
    return [];
  }
}

export async function fetchEquipmentList(): Promise<{ name: string; index: string }[]> {
  if (equipmentListCache) return equipmentListCache;
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/equipment/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        const list = data.map((item: any) => ({
          name: item.name || item.index.replace(/_/g, ' '),
          index: item.index
        }));
        equipmentListCache = list;
        return list;
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/equipment/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching equipment list:", e);
    return [];
  }
}

export async function fetchMagicItemList(): Promise<{ name: string; index: string }[]> {
  if (magicItemListCache) return magicItemListCache;
  try {
    const localRes = await fetch('/assets/atlas/magic_items/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        const list = data.map((item: any) => ({
          name: item.name || item.index.replace(/_/g, ' '),
          index: item.index
        }));
        magicItemListCache = list;
        return list;
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/magic_items/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching magic item list:", e);
    return [];
  }
}

export async function fetchEquipmentCategories(): Promise<{ name: string; index: string; equipment: any[] }[]> {
  if (equipmentCategoriesCache) return equipmentCategoriesCache;
  try {
    const localRes = await fetch('/assets/atlas/equipment_categories/index.json');
    if (localRes.ok) {
      const fileList = await localRes.json();
      if (Array.isArray(fileList)) {
        const categories = await Promise.all(
          fileList.map(async (f: any) => {
            const res = await fetch(`/assets/atlas/equipment_categories/json/${f.index}.json`);
            return res.ok ? await res.json() : null;
          })
        );
        const filtered = categories.filter(c => c !== null);
        equipmentCategoriesCache = filtered;
        return filtered;
      }
    }
  } catch (e) {
    console.warn("Failed to load local equipment categories, trying fallback:", e);
  }

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/equipment_categories/json?ref=${BRANCH}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    
    const categories = await Promise.all(
      files
        .filter((f: any) => f.name.endsWith('.json'))
        .map(async (f: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
          const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
          return await safeJson(rawRes);
        })
    );
    
    const filtered = categories.filter(c => c !== null);
    equipmentCategoriesCache = filtered;
    return filtered;
  } catch (e) {
    console.error("Error fetching equipment categories from GitHub:", e);
    return [];
  }
}

export async function fetchEquipmentCategoryMapping(): Promise<Record<string, string>> {
  if (equipmentMappingCache) return equipmentMappingCache;
  try {
    const categories = await fetchEquipmentCategories();
    const mapping: Record<string, string> = {};
    categories.forEach(cat => {
      if (cat && cat.equipment && cat.name) {
        cat.equipment.forEach((item: any) => {
          const itemIndex = typeof item === 'object' ? (item.index || item.name) : item;
          if (itemIndex) {
            mapping[itemIndex] = cat.name;
          }
        });
      }
    });
    equipmentMappingCache = mapping;
    return mapping;
  } catch (e) {
    console.error("Error fetching equipment category mapping:", e);
    return {};
  }
}

export async function fetchMaterialCategories(): Promise<{ name: string; index: string; materials: any[] }[]> {
  if (materialCategoriesCache) return materialCategoriesCache;
  try {
    const localRes = await fetch('/assets/atlas/materials_categories/index.json');
    if (localRes.ok) {
      const fileList = await localRes.json();
      if (Array.isArray(fileList)) {
        const categories = await Promise.all(
          fileList.map(async (f: any) => {
            const res = await fetch(`/assets/atlas/materials_categories/json/${f.index}.json`);
            return res.ok ? await res.json() : null;
          })
        );
        const filtered = categories.filter(c => c !== null);
        materialCategoriesCache = filtered;
        return filtered;
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/materials_categories/json?ref=${BRANCH}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    
    const categories = await Promise.all(
      files
        .filter((f: any) => f.name.endsWith('.json'))
        .map(async (f: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
          const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
          return await safeJson(rawRes);
        })
    );
    
    return categories.filter(c => c !== null);
  } catch (e) {
    console.error("Error fetching material categories:", e);
    return [];
  }
}

export async function fetchMaterialCategoryMapping(): Promise<Record<string, string>> {
  if (materialMappingCache) return materialMappingCache;
  const categories = await fetchMaterialCategories();
  const mapping: Record<string, string> = {};
  categories.forEach(cat => {
    if (cat.materials && cat.name) {
      cat.materials.forEach((item: any) => {
        mapping[item.index] = cat.name;
      });
    }
  });
  materialMappingCache = mapping;
  return mapping;
}

export async function fetchDamageTypeList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/damage_types/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching damage types list:", e);
    return [];
  }
}

export async function fetchDamageTypeData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/damage_types/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    return await safeJson(res);
  } catch (e) {
    console.error("Error fetching damage type data:", e);
    return null;
  }
}

export async function fetchSpellData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  const activeRuleset = getActiveRulesetContext(ruleset);
  const cacheKey = `${activeRuleset}:${index}`;
  if (spellCache[cacheKey]) return spellCache[cacheKey];

  let resolvedPath: string | null = null;
  const versionFolder = getRulesetVersionFolder(ruleset);

  // Node CLI local filesystem fallback for test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      const indexPath = pathModule.resolve(process.cwd(), 'public/assets/atlas/spell/index.json');
      if (fs.existsSync(indexPath)) {
        const spellIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const cleanSearch = index.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
        const matchingEntries = spellIndex.filter((s: any) =>
          s.index.toLowerCase() === index.toLowerCase() ||
          (s.name && s.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim() === cleanSearch)
        );
        const versionedEntry = matchingEntries.find((s: any) => s.json_path && s.json_path.includes(`/${versionFolder}/`));
        const entry = versionedEntry || matchingEntries[0];
        if (entry && entry.json_path) {
          resolvedPath = entry.json_path;
        }
      }

      if (!resolvedPath) {
        const levels = ['cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level', '6th-level', '7th-level', '8th-level', '9th-level'];
        const subfolders = [versionFolder, ''];
        for (const sub of subfolders) {
          const folderPrefix = sub ? `${sub}/` : '';
          for (const lvl of levels) {
            const candidate = `/assets/atlas/spell/json/${folderPrefix}${lvl}/${index}.json`;
            const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
            if (fs.existsSync(fullFsPath)) {
              resolvedPath = candidate;
              break;
            }
          }
          if (resolvedPath) break;
        }
      }

      if (resolvedPath) {
        const fullFsPath = pathModule.resolve(process.cwd(), `public${resolvedPath.replace(/^\/?public\//, '/')}`);
        if (fs.existsSync(fullFsPath)) {
          const data = JSON.parse(fs.readFileSync(fullFsPath, 'utf8'));
          const actualRuleset: '2014' | '2024' = (resolvedPath.includes('/24/') || resolvedPath.includes('/2024/')) ? '2024' : '2014';
          const finalResult = {
            ...data,
            rulesetContext: actualRuleset,
            imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'spell', index)
          };
          spellCache[cacheKey] = finalResult;
          return finalResult;
        }
      }
    } catch (e) {}
  }

  // Try resolving path from local index first (supporting index or name-based fallback matching)
  try {
    const indexRes = await fetch('/assets/atlas/spell/index.json');
    if (indexRes.ok) {
      const spellIndex = await indexRes.json();
      const cleanSearch = index.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
      const matchingEntries = spellIndex.filter((s: any) =>
        s.index.toLowerCase() === index.toLowerCase() ||
        (s.name && s.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim() === cleanSearch)
      );
      const versionedEntry = matchingEntries.find((s: any) => s.json_path && s.json_path.includes(`/${versionFolder}/`));
      const entry = versionedEntry || matchingEntries[0];
      if (entry && entry.json_path) {
        resolvedPath = entry.json_path;
      }
    }
  } catch (e) {}

  // If not found in index, attempt direct subdirectories via iterative fallback
  if (!resolvedPath) {
    const levels = ['cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level', '5th-level', '6th-level', '7th-level', '8th-level', '9th-level'];
    const subfolders = [versionFolder, ''];
    for (const sub of subfolders) {
      const folderPrefix = sub ? `${sub}/` : '';
      for (const lvl of levels) {
        try {
          const checkRes = await fetch(`/assets/atlas/spell/json/${folderPrefix}${lvl}/${index}.json`, { method: 'HEAD' });
          if (checkRes.ok) {
            resolvedPath = `/assets/atlas/spell/json/${folderPrefix}${lvl}/${index}.json`;
            break;
          }
        } catch (e) {}
      }
      if (resolvedPath) break;
    }
  }

  // Fallback to legacy path if still unresolved
  if (!resolvedPath) {
    resolvedPath = `/assets/atlas/spell/json/${index}.json`;
  }

  // Fetch local spell data
  try {
    const res = await fetch(resolvedPath);
    if (res.ok) {
      const data = await res.json();
      const actualPath = resolvedPath || data.url || '';
      const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';
      const finalResult = {
        ...data,
        rulesetContext: actualRuleset,
        imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'spell', index)
      };
      spellCache[cacheKey] = finalResult;
      return finalResult;
    }
  } catch (e) {}

  // Construct GitHub raw path
  const cleanSubpath = resolvedPath ? resolvedPath.replace(/^\/?assets\/atlas\/spell\/json\//, '').replace(/^\/?public\/assets\/atlas\/spell\/json\//, '') : '';
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/spell/json/${cleanSubpath}?t=${Date.now()}`;
  const rawApiUrl = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(rawApiUrl);
    const data = await safeJson(res);
    if (!data) return null;
    const actualPath = cleanSubpath || data.url || '';
    const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';
    const finalResult = {
      ...data,
      rulesetContext: actualRuleset,
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'spell', index)
    };
    spellCache[cacheKey] = finalResult;
    return finalResult;
  } catch (e) {
    console.error("Error fetching spell data:", e);
    return null;
  }
}

export async function fetchSpellList(): Promise<any[]> {
  if (spellListCache) return spellListCache;
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/spell/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        const list = data.map((s: any) => ({
          ...s,
          imageUrl: normalizeImageUrl(s.image || s.imageUrl, 'spell', s.index)
        }));
        spellListCache = list;
        return list;
      }
    }
  } catch (e) {}

  // Try to load index from GitHub raw first before calling GitHub Contents API
  const githubIndexUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/spell/index.json?t=${Date.now()}`;
  try {
    const res = await fetch(`/api/raw?url=${encodeURIComponent(githubIndexUrl)}`);
    const data = await safeJson(res);
    if (data && Array.isArray(data)) {
      return data.map((s: any) => ({
        ...s,
        imageUrl: normalizeImageUrl(s.image || s.imageUrl, 'spell', s.index)
      }));
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/spell/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    
    const spells = await Promise.all(
      files
        .filter((f: any) => f.name.endsWith('.json'))
        .map(async (f: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
          const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
          const data = await safeJson(rawRes);
          if (data) {
            return {
              ...data,
              imageUrl: normalizeImageUrl(data.image || data.imageUrl, 'spell', data.index)
            };
          }
          return null;
        })
    );
    
    return spells.filter(s => s !== null);
  } catch (e) {
    console.error("Error fetching spell list:", e);
    return [];
  }
}

export async function fetchCharacterList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/character/npc_character_profiles/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching character list:", e);
    return [];
  }
}

export async function fetchCharacterData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/character/npc_character_profiles/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    return await safeJson(res);
  } catch (e) {
    console.error("Error fetching character data:", e);
    return null;
  }
}

export async function saveCharacterData(index: string, data: any): Promise<boolean> {
  const path = `public/assets/atlas/character/npc_character_profiles/json/${index}.json`;
  const content = JSON.stringify(data, null, 2);
  return await commitFile(path, content);
}

export async function fetchMagicSchools(): Promise<{ name: string; index: string; spells?: string[] }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/magic_schools/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    
    const schools = await Promise.all(
      files
        .filter((f: any) => f.name.endsWith('.json'))
        .map(async (f: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
          const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
          return await safeJson(rawRes);
        })
    );
    
    return schools.filter(s => s !== null);
  } catch (e) {
    console.error("Error fetching magic schools:", e);
    return [];
  }
}

export async function fetchSpeciesList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/species/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchSpeciesWikiData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  return fetchSpeciesData(index, ruleset);
}

export async function fetchSpeciesData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
    if (!index) return null;

    const activeRuleset = getActiveRulesetContext(ruleset);
    const versionFolder = activeRuleset === '2024' ? '24' : '14';

    const parts = index.split(':');
    const racePart = parts[0].toLowerCase().trim();
    const subracePart = parts.length > 1 ? parts[1].toLowerCase().trim() : '';

    const cleanIndex = index.toLowerCase().trim();
    const underscoreIndex = cleanIndex.replace(/[:-]/g, '_');
    const hyphenatedIndex = cleanIndex.replace(/[:_]/g, '-');

    const localCandidates: string[] = [];
    if (subracePart) {
      const subraceUnderscore = subracePart.replace(/-/g, '_');
      localCandidates.push(`/assets/atlas/subraces/json/${versionFolder}/${subraceUnderscore}.json`);
      if (versionFolder === '14') {
        localCandidates.push(`/assets/atlas/subraces/json/${subraceUnderscore}.json`);
        localCandidates.push(`/assets/atlas/subraces/json/${subracePart}.json`);
      }
    }
    // Versioned species subfolders
    localCandidates.push(`/assets/atlas/species/json/${versionFolder}/${underscoreIndex}.json`);
    localCandidates.push(`/assets/atlas/species/json/${versionFolder}/${hyphenatedIndex}.json`);
    if (racePart) {
      localCandidates.push(`/assets/atlas/species/json/${versionFolder}/${racePart}.json`);
    }

    // Only for 2014 ruleset: fallback to unversioned root species folder
    if (versionFolder === '14') {
      localCandidates.push(`/assets/atlas/species/json/${underscoreIndex}.json`);
      localCandidates.push(`/assets/atlas/species/json/${hyphenatedIndex}.json`);
      localCandidates.push(`/assets/atlas/subraces/json/${underscoreIndex}.json`);
      if (racePart) {
        localCandidates.push(`/assets/atlas/species/json/${racePart}.json`);
      }
    }

    let data: any = null;
    let resolvedPath: string | null = null;

    // Node CLI local filesystem fallback for unit test environments
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const pathModule = await import('path');
        for (const candidate of localCandidates) {
          const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
          if (fs.existsSync(fullFsPath)) {
            const fileContent = fs.readFileSync(fullFsPath, 'utf8');
            data = JSON.parse(fileContent);
            resolvedPath = candidate;
            break;
          }
        }
      } catch (e) {}
    }

    // Try local static files first if not resolved via Node CLI
    if (!data) {
      for (const path of localCandidates) {
        try {
          const res = await fetch(path);
          if (res.ok) {
            const parsed = await safeJson(res);
            if (parsed) {
              data = parsed;
              resolvedPath = path;
              break;
            }
          }
        } catch (e) {
          // continue to next candidate
        }
      }
    }

    // Fallback to GitHub raw ONLY within the requested version folder
    if (!data) {
      const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/species/json/${versionFolder}/${underscoreIndex}.json?t=${Date.now()}`;
      const wikiUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/species/spicies_wiki/${underscoreIndex}.json?t=${Date.now()}`;

      try {
        const [res, wRes] = await Promise.all([
          fetch(`/api/raw?url=${encodeURIComponent(githubUrl)}`),
          fetch(`/api/raw?url=${encodeURIComponent(wikiUrl)}`)
        ]);

        const mainData = await safeJson(res);
        const wiki = await safeJson(wRes);

        if (mainData || wiki) {
          data = { ...(mainData || {}), ...wiki, wiki_source: !!wiki };
          resolvedPath = mainData ? githubUrl : wikiUrl;
        }
      } catch (e) {}
    }

    if (!data) return null;

    const actualPath = resolvedPath || data.url || '';
    const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';

    // Strict safety check: if ruleset requested was 2024 but loaded record is not 2024, reject!
    if (activeRuleset === '2024' && actualRuleset !== '2024') {
      return null;
    }

    return {
      ...data,
      index: index,
      rulesetContext: actualRuleset,
      imageUrl: normalizeImageUrl(data.image || data.imageUrl, 'species', index)
    };
}

export async function fetchClassesList(ruleset?: '2014' | '2024'): Promise<{ name: string; index: string }[]> {
  const activeRuleset = getActiveRulesetContext(ruleset);
  const versionFolder = activeRuleset === '2024' ? '24' : '14';

  // Node CLI local filesystem fallback for unit test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      const dirPath = pathModule.resolve(process.cwd(), `public/assets/atlas/class/json/${versionFolder}`);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        return files
          .filter((f: string) => f.endsWith('.json'))
          .map((f: string) => ({
            name: f.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            index: f.replace('.json', '')
          }));
      }
    } catch (e) {}
  }

  // Try local index first if available
  try {
    const indexRes = await fetch(`/assets/atlas/class/index.json`);
    if (indexRes.ok) {
      const indexData = await indexRes.json();
      if (Array.isArray(indexData)) {
        if (versionFolder === '24') {
          // For 2024, filter index entries by presence in /24/ folder
          const valid24 = ['fighter', 'wizard', 'cleric', 'rogue'];
          return indexData
            .filter((c: any) => valid24.includes(c.index))
            .map((c: any) => ({
              name: c.name || c.index.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              index: c.index
            }));
        }
        return indexData.map((c: any) => ({
          name: c.name || c.index.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          index: c.index
        }));
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/class/json/${versionFolder}?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchClassWikiData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  return fetchClassData(index, ruleset);
}

export async function fetchClassData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  if (!index) return null;

  const activeRuleset = getActiveRulesetContext(ruleset);
  const versionFolder = activeRuleset === '2024' ? '24' : '14';
  const cleanIndex = index.toLowerCase().trim();
  const underscoreIndex = cleanIndex.replace(/[:-]/g, '_');
  const hyphenatedIndex = cleanIndex.replace(/[:_]/g, '-');

  const localCandidates: string[] = [
    `/assets/atlas/class/json/${versionFolder}/${underscoreIndex}.json`,
    `/assets/atlas/class/json/${versionFolder}/${hyphenatedIndex}.json`,
  ];

  if (versionFolder === '14') {
    localCandidates.push(`/assets/atlas/class/json/${underscoreIndex}.json`);
    localCandidates.push(`/assets/atlas/class/json/${hyphenatedIndex}.json`);
  }

  let data: any = null;
  let resolvedPath: string | null = null;

  // Node CLI local filesystem fallback for unit test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      for (const candidate of localCandidates) {
        const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
        if (fs.existsSync(fullFsPath)) {
          const fileContent = fs.readFileSync(fullFsPath, 'utf8');
          data = JSON.parse(fileContent);
          resolvedPath = candidate;
          break;
        }
      }
    } catch (e) {}
  }

  // Try local static files first if not resolved via Node CLI
  if (!data) {
    for (const path of localCandidates) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          const parsed = await safeJson(res);
          if (parsed) {
            data = parsed;
            resolvedPath = path;
            break;
          }
        }
      } catch (e) {}
    }
  }

  // Fallback to GitHub raw ONLY within requested version folder
  if (!data) {
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/class/json/${versionFolder}/${underscoreIndex}.json?t=${Date.now()}`;
    try {
      const res = await fetch(`/api/raw?url=${encodeURIComponent(githubUrl)}`);
      data = await safeJson(res);
      if (data) resolvedPath = githubUrl;
    } catch (e) {
      data = null;
    }
  }

  if (!data) return null;

  const actualPath = resolvedPath || data.url || '';
  const actualRuleset: '2014' | '2024' = (actualPath.includes('/24/') || actualPath.includes('/2024/')) ? '2024' : '2014';

  // Strict safety check: if ruleset requested was 2024 but loaded record is not 2024, reject!
  if (activeRuleset === '2024' && actualRuleset !== '2024') {
    return null;
  }

  // Try fetching official markdown lore guide (e.g., /assets/ui/official/classes/rogue.md)
  let markdownGuide = '';
  try {
    const mdRes = await fetch(`/assets/ui/official/classes/${cleanIndex}.md`);
    if (mdRes.ok) {
      markdownGuide = await mdRes.text();
    }
  } catch (e) {}

  return {
    ...data,
    rulesetContext: actualRuleset,
    markdownGuide,
    imageUrl: normalizeImageUrl(data.image || data.imageUrl, 'class', cleanIndex)
  };
}

export async function fetchBackgroundsList(): Promise<{ name: string; index: string }[]> {
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/backgrounds/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((b: any) => ({
          name: b.name || b.index.replace(/_/g, ' '),
          index: b.index
        }));
      }
    }
  } catch (e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/backgrounds/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchBackgroundData(index: string): Promise<any> {
  if (backgroundCache[index]) return backgroundCache[index];
  // Local first
  try {
    const res = await fetch(`/assets/atlas/backgrounds/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      const finalResult = data ? { ...data, imageUrl: normalizeImageUrl(data.image || data.imageUrl || data.image_url, 'backgrounds', index) } : null;
      if (finalResult) backgroundCache[index] = finalResult;
      return finalResult;
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/backgrounds/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    return data ? { ...data, imageUrl: normalizeImageUrl(data.image || data.imageUrl || data.image_url, 'backgrounds', index) } : null;
  } catch (e) {
    return null;
  }
}

export async function fetchBackgroundJson(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/backgrounds/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    return data;
  } catch (e) {
    return null;
  }
}

export async function fetchSubraceList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/subraces/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchSubraceData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/subraces/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    return data ? { ...data, imageUrl: normalizeImageUrl(data.image || data.imageUrl || data.image_url, 'subraces', index) } : null;
  } catch (e) {
    return null;
  }
}

export async function fetchClassLevels(classIndex: string, ruleset?: '2014' | '2024'): Promise<any[]> {
  const activeRuleset = getActiveRulesetContext(ruleset);
  const versionFolder = getRulesetVersionFolder(ruleset);
  const slug = classIndex.toLowerCase().replace(/[\s-]/g, '_');
  const cacheKey = `${activeRuleset}:${slug}`;

  if (classLevelsCache[cacheKey]) return classLevelsCache[cacheKey];

  // Define strict candidate paths per ruleset
  // For 2024, search ONLY /24/ paths (no fallback to 14/ or unversioned root)
  const candidatesForLevel = (lvl: number): string[] => {
    if (versionFolder === '24') {
      return [
        `/assets/atlas/class/levels/24/${lvl}/${slug}_level_${lvl}.json`,
        `/assets/atlas/class/levels/24/${slug}_level_${lvl}.json`,
      ];
    }
    return [
      `/assets/atlas/class/levels/14/${lvl}/${slug}_level_${lvl}.json`,
      `/assets/atlas/class/levels/14/${slug}_level_${lvl}.json`,
      `/assets/atlas/class/levels/${lvl}/${slug}_level_${lvl}.json`,
    ];
  };

  const legacyCandidates: string[] = versionFolder === '24'
    ? [`/assets/atlas/class/levels/24/${slug}.json`]
    : [
        `/assets/atlas/class/levels/14/${slug}.json`,
        `/assets/atlas/class/levels/${slug}.json`
      ];

  // Node CLI local filesystem fallback for test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');

      const levels: any[] = [];
      for (let level = 1; level <= 20; level++) {
        const candidates = candidatesForLevel(level);
        let levelData: any = null;
        let resolvedPath: string | null = null;

        for (const candidate of candidates) {
          const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
          if (fs.existsSync(fullFsPath)) {
            const fileContent = fs.readFileSync(fullFsPath, 'utf8');
            levelData = JSON.parse(fileContent);
            resolvedPath = candidate;
            break;
          }
        }

        if (levelData) {
          const actualRuleset: '2014' | '2024' = (resolvedPath && (resolvedPath.includes('/24/') || resolvedPath.includes('/2024/'))) ? '2024' : '2014';
          if (activeRuleset === '2024' && actualRuleset !== '2024') {
            break;
          }
          levels.push({ ...levelData, rulesetContext: actualRuleset });
        } else if (level === 1) {
          break;
        }
      }

      if (levels.length > 0) {
        classLevelsCache[cacheKey] = levels;
        return levels;
      }

      for (const candidate of legacyCandidates) {
        const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
        if (fs.existsSync(fullFsPath)) {
          const fileContent = fs.readFileSync(fullFsPath, 'utf8');
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed)) {
            const actualRuleset: '2014' | '2024' = (candidate.includes('/24/') || candidate.includes('/2024/')) ? '2024' : '2014';
            if (activeRuleset === '2024' && actualRuleset !== '2024') {
              continue;
            }
            const result = parsed.map((lvl: any) => ({ ...lvl, rulesetContext: actualRuleset }));
            classLevelsCache[cacheKey] = result;
            return result;
          }
        }
      }

      // If ruleset is 2024 and no 2024 files were found, return empty array
      if (activeRuleset === '2024') {
        return [];
      }
    } catch (e) {}
  }

  // First try individual level files (levels 1 to 20) in browser/runtime
  try {
    const levels: any[] = [];
    for (let level = 1; level <= 20; level++) {
      let levelData: any = null;
      let resolvedPath: string | null = null;
      const candidates = candidatesForLevel(level);

      for (const p of candidates) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            const data = await safeJson(res);
            if (data) {
              levelData = data;
              resolvedPath = p;
              break;
            }
          }
        } catch (e) {}
      }

      // Remote fallback if local fetch returned nothing
      if (!levelData) {
        const remoteCandidates = candidates.map(c => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public${c}?t=${Date.now()}`);
        for (const remoteUrl of remoteCandidates) {
          try {
            const res = await fetch(`/api/raw?url=${encodeURIComponent(remoteUrl)}`);
            if (res.ok) {
              const data = await safeJson(res);
              if (data) {
                levelData = data;
                resolvedPath = remoteUrl;
                break;
              }
            }
          } catch (e) {}
        }
      }

      if (levelData) {
        const actualRuleset: '2014' | '2024' = (resolvedPath && (resolvedPath.includes('/24/') || resolvedPath.includes('/2024/'))) ? '2024' : '2014';
        if (activeRuleset === '2024' && actualRuleset !== '2024') {
          break;
        }
        levels.push({ ...levelData, rulesetContext: actualRuleset });
      } else if (level === 1) {
        break;
      }
    }

    if (levels.length > 0) {
      classLevelsCache[cacheKey] = levels;
      return levels;
    }
  } catch (e) {
    console.warn("Class levels structure fetch failed:", e);
  }

  // Fallback to legacy single-file array structure
  for (const p of legacyCandidates) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        const levels = await safeJson(res);
        if (Array.isArray(levels)) {
          const actualRuleset: '2014' | '2024' = (p.includes('/24/') || p.includes('/2024/')) ? '2024' : '2014';
          if (activeRuleset === '2024' && actualRuleset !== '2024') {
            continue;
          }
          const result = levels.map((lvl: any) => ({ ...lvl, rulesetContext: actualRuleset }));
          classLevelsCache[cacheKey] = result;
          return result;
        }
      }
    } catch (e) {}
  }

  // If ruleset 2024 was requested, strictly return empty array if 2024 files were not found
  if (activeRuleset === '2024') {
    return [];
  }

  // Legacy fallback for 2014 only
  const legacyUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/class/levels/${slug}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(legacyUrl)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const levels = await safeJson(res);
    if (Array.isArray(levels)) {
      const result = levels.map((lvl: any) => ({ ...lvl, rulesetContext: '2014' as const }));
      classLevelsCache[cacheKey] = result;
      return result;
    }
    return [];
  } catch (e) {
    console.error("Error fetching legacy class levels:", e);
    return [];
  }
}

export async function fetchFeatData(index: string, ruleset?: '2014' | '2024'): Promise<any> {
  const activeRuleset = getActiveRulesetContext(ruleset);
  const versionFolder = getRulesetVersionFolder(ruleset);
  const cleanIndex = index.toLowerCase().replace(/[\s-]/g, '_').replace(/'/g, '');
  const hyphenIndex = index.toLowerCase().replace(/[\s_]/g, '-').replace(/'/g, '');

  const candidatePaths = [
    // 1. Explicit ruleset version folder
    `/assets/atlas/feats/json/${versionFolder}/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/${hyphenIndex}.json`,
    // Subcategory paths for 2024 feats (origin-feats, general-feats, fighting-style-feats, epic-boon-feats)
    `/assets/atlas/feats/json/${versionFolder}/origin-feats/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/origin-feats/${hyphenIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/general-feats/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/general-feats/${hyphenIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/fighting-style-feats/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/fighting-style-feats/${hyphenIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/epic-boon-feats/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder}/epic-boon-feats/${hyphenIndex}.json`,
    // 2. Unversioned root folder
    `/assets/atlas/feats/json/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${hyphenIndex}.json`,
    // 3. Fallback to alternative ruleset version folder
    `/assets/atlas/feats/json/${versionFolder === '14' ? '24' : '14'}/${cleanIndex}.json`,
    `/assets/atlas/feats/json/${versionFolder === '14' ? '24' : '14'}/${hyphenIndex}.json`
  ];

  // Node CLI local filesystem fallback for test environments
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs');
      const pathModule = await import('path');
      for (const candidate of candidatePaths) {
        const fullFsPath = pathModule.resolve(process.cwd(), `public${candidate}`);
        if (fs.existsSync(fullFsPath)) {
          const fileContent = fs.readFileSync(fullFsPath, 'utf8');
          const data = JSON.parse(fileContent);
          const actualRuleset: '2014' | '2024' = (candidate.includes('/24/') || candidate.includes('/2024/')) ? '2024' : '2014';
          return { ...data, rulesetContext: actualRuleset };
        }
      }
    } catch (e) {}
  }

  for (const path of candidatePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
          const data = JSON.parse(text);
          const actualRuleset: '2014' | '2024' = (path.includes('/24/') || path.includes('/2024/')) ? '2024' : '2014';
          return { ...data, rulesetContext: actualRuleset };
        }
      }
    } catch (e) {}
  }

  // 4. Remote proxy fallbacks
  const remotePaths = candidatePaths.map(p => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public${p}?t=${Date.now()}`);
  for (const rawUrl of remotePaths) {
    try {
      const res = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) {
          const actualRuleset: '2014' | '2024' = (rawUrl.includes('/24/') || rawUrl.includes('/2024/')) ? '2024' : '2014';
          return { ...data, rulesetContext: actualRuleset };
        }
      }
    } catch (e) {}
  }

  return null;
}

export async function fetchFeatureData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/features/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    return await safeJson(res);
  } catch (e) {
    return null;
  }
}

export async function fetchAlignmentsList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/alignments/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchAlignmentData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/alignments/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    return await safeJson(res);
  } catch (e) {
    return null;
  }
}

export async function fetchTraitData(index: string): Promise<any> {
  // Try local traits
  try {
    const localTraits = await fetch(`/assets/atlas/traits/json/${index}.json`);
    if (localTraits.ok) return await localTraits.json();
  } catch (e) {}

  // Try local proficiencies
  try {
    const localProf = await fetch(`/assets/atlas/proficiencies/json/${index}.json`);
    if (localProf.ok) return await localProf.json();
  } catch (e) {}

  // GitHub traits
  const traitUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/traits/json/${index}.json?t=${Date.now()}`;
  try {
    const res = await fetch(`/api/raw?url=${encodeURIComponent(traitUrl)}`);
    if (res.ok) {
      const data = await safeJson(res);
      if (data) return data;
    }
  } catch (e) {}

  // GitHub proficiencies
  const profUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/proficiencies/json/${index}.json?t=${Date.now()}`;
  try {
    const res = await fetch(`/api/raw?url=${encodeURIComponent(profUrl)}`);
    if (res.ok) {
      const data = await safeJson(res);
      if (data) return data;
    }
  } catch (e) {}

  return null;
}

export async function fetchLanguagesList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/languages/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchLanguageData(index: string): Promise<any> {
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/json/${index}.json?t=${Date.now()}`;
    const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
    try {
      const res = await fetch(url);
      const data = await safeJson(res);
      return data;
    } catch (e) {
      return null;
    }
}

export async function fetchTransportList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/transport/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' '),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    console.error("Error fetching transport list:", e);
    return [];
  }
}

export async function fetchTransportData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/transport/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'transport', index)
    };
  } catch (e) {
    console.error("Error fetching transport data:", e);
    return null;
  }
}

export async function fetchWikiAsset(path: string): Promise<any> {
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path.startsWith('/') ? path.substring(1) : path}${path.endsWith('.json') ? '' : '.json'}?t=${Date.now()}`;
    const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
    try {
      const res = await fetch(url);
      return await safeJson(res);
    } catch (e) {
      return null;
    }
}

export function formatPathName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function fetchMissingAssets(category: 'enemy' | 'equipment' | 'magic_items' | 'materials' | 'spells'): Promise<string[]> {
  const categoryMap = {
    enemy: 'missing_enemy_list.md',
    equipment: 'missing_equipment_list.md',
    magic_items: 'missing_magic_items_list.md',
    materials: 'missing_materials_list.md',
    spells: 'missing_spells_list.md'
  };

  const filename = categoryMap[category];
  if (!filename) return [];

  const path = `docs/missing_assets/${filename}`;
  try {
    const res = await fetch(`/api/local-file?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const content = await res.text();
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Filter empty lines and comments
    }
  } catch (e) {
    console.error(`Failed to fetch missing assets for ${category}:`, e);
  }
  return [];
}
