/**
 * Service to handle GitHub commits using a Personal Access Token.
 */

import { soundService } from './soundService';

export const REPO = process.env.GITHUB_REPO || "japiohopman/artificer";
export const BRANCH = process.env.GITHUB_BRANCH || "main";

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
      // Robust cleaning for common JSON issues like trailing dots in numbers
      let cleaned = text.trim()
        .replace(/(\d+)\.(?=[^\d])/g, '$1.0') // 15. -> 15.0
        .replace(/(?<=[^\d])\.(\d+)/g, '0.$1'); // .5 -> 0.5
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("safeJson: Malformed JSON detected, returning null.", e);
      return null;
    }
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    return null;
  }
}

export async function fetchMonsterCategories(): Promise<{ name: string; index: string; monsters: any[] }[]> {
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

export async function fetchMonsterList(): Promise<{ name: string; path: string; index: string }[]> {
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/enemies/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name,
          path: item.json_path || `public/assets/atlas/enemies/json/${item.index}.json`,
          index: item.index
        }));
      }
    }
  } catch (e) {
    console.warn("Local monster index not found, trying GitHub fallback...");
  }

  // Fallback to GitHub API
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/enemies/json?ref=${BRANCH}&t=${Date.now()}`;
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
    console.error("Error fetching monster list:", e);
    return [];
  }
}

export async function fetchMonsterData(index: string): Promise<any> {
  // Try local first
  const localUrl = `/assets/atlas/enemies/json/${index}.json`;
  let data: any = null;

  try {
    const res = await fetch(localUrl);
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    // Ignore and try GitHub
  }

  if (!data) {
    // Fallback to GitHub
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/enemies/json/${index}.json?t=${Date.now()}`;
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

  return {
    ...normalized,
    imageUrl: normalizeImageUrl(normalized.imageUrl || normalized.image || normalized.image_url, 'enemies', index)
  };
}

export async function fetchMaterialData(index: string): Promise<any> {
  // Local first
  try {
    const res = await fetch(`/assets/atlas/crafting/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      return { ...data, imageUrl: normalizeImageUrl(data.imageUrl, 'crafting', index) };
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/crafting/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl, 'crafting', index)
    };
  } catch (e) {
    console.error("Error fetching material data:", e);
    return null;
  }
}

export async function fetchEquipmentData(index: string): Promise<any> {
  // Local first
  try {
    const res = await fetch(`/assets/atlas/equipment/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      return { ...data, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'equipment', index) };
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/equipment/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'equipment', index)
    };
  } catch (e) {
    console.error("Error fetching equipment data:", e);
    return null;
  }
}

export async function fetchMagicItemData(index: string): Promise<any> {
  // Local first
  try {
    const res = await fetch(`/assets/atlas/magic_items/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      return { ...data, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'magic_items', index) };
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
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'magic_items', index)
    };
  } catch (e) {
    console.error("Error fetching magic item data:", e);
    return null;
  }
}

export function normalizeImageUrl(url: string | undefined, category: string, index: string): string {
  const timestamp = Date.now();
  let finalUrl = "";

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
    'crafting': 'crafting',
    'class': 'class',
    'species': 'species',
    'subrace': 'subraces',
    'subraces': 'subraces',
    'background': 'backgrounds',
    'backgrounds': 'backgrounds',
    'transport': 'transport'
  };

  const folder = categoryToFolder[category.toLowerCase()] || category.toLowerCase();
  const cleanIndex = (index || "").toLowerCase();
  const underscoreIndex = cleanIndex.replace(/\s+/g, '_');
  const ddbIndex = cleanIndex.replace(/_/g, '-').replace(/\s+/g, '-');

  if (url && (url.startsWith('/api/raw') || url.startsWith('/api/fetch'))) {
    return url;
  }

  if (url && url.startsWith('data:image/')) {
    return url;
  }
  
  if (url && url.startsWith('data/character_save/')) {
    return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${url}?t=${timestamp}`;
  }

  if (!url) {
    // Standard directory structure for atlas assets
    const categoriesWithImagesFolder = ['magic_items', 'equipment', 'enemies', 'crafting', 'materials', 'npc_character_profiles', 'npc_profiles', 'spell', 'transport'];
    const wikiImageCategories = ['class', 'species', 'subraces', 'backgrounds'];
    
    // We try both underscore and hyphen versions if guessing
    if (folder === 'npc_character_profiles' || folder === 'npc_profiles') {
      const actualCategory = 'character/npc_character_profiles';
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${actualCategory}/images/${underscoreIndex}/${underscoreIndex}_portrait.webp`;
    } else if (wikiImageCategories.includes(folder)) {
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/wiki_image/${ddbIndex}.webp`;
    } else if (categoriesWithImagesFolder.includes(folder)) {
      // Prefer underscore for equipment/materials as they often match filenames
      const filename = (folder === 'equipment' || folder === 'materials' || folder === 'transport') ? underscoreIndex : ddbIndex;
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/images/${filename}.webp`;
    } else {
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/${ddbIndex}.webp`;
    }
  } else if (url && url.startsWith('data:image/')) {
    return url;
  } else if (url && (url.startsWith('assets/') || url.startsWith('/assets/') || url.startsWith('public/assets/'))) {
    // If it's a local-looking path, resolve it to GitHub to ensure it's found
    let cleanUrl = url.startsWith('public/') ? url.substring(6) : url;
    if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;
    
    // Inject images/ or wiki_image/ if missing in the path
    const categoriesWithImages = ['equipment', 'enemies', 'magic_items', 'crafting', 'spell', 'npc_character_profiles', 'npc_profiles', 'materials', 'transport'];
    const wikiImageCategories = ['class', 'species', 'subraces', 'backgrounds'];
    
    // Determine path category from URL
    const pathParts = cleanUrl.split('/');
    const atlasIndex = pathParts.indexOf('atlas');
    const pathCategory = atlasIndex !== -1 ? pathParts[atlasIndex + 1] : folder;
    
    if (categoriesWithImages.includes(pathCategory) && cleanUrl.includes(`/atlas/${pathCategory}/`) && !cleanUrl.includes(`/atlas/${pathCategory}/images/`)) {
      cleanUrl = cleanUrl.replace(`/atlas/${pathCategory}/`, `/atlas/${pathCategory}/images/`);
    } else if (wikiImageCategories.includes(pathCategory) && cleanUrl.includes(`/atlas/${pathCategory}/`) && !cleanUrl.includes(`/atlas/${pathCategory}/wiki_image/`)) {
      cleanUrl = cleanUrl.replace(`/atlas/${pathCategory}/`, `/atlas/${pathCategory}/wiki_image/`);
    }
    
    finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public${cleanUrl}`;
  } else if (url && url.includes('github.com') && (url.includes('/blob/') || url.includes('/tree/'))) {
    finalUrl = url.replace('github.com', 'raw.githubusercontent.com')
                  .replace('/blob/', '/')
                  .replace('/tree/', '/')
                  .split('?')[0];
  } else if (url && !url.startsWith('http')) {
    // Simple filename or relative path from JSON
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    if (cleanPath.includes('/atlas/')) {
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets${cleanPath.substring(cleanPath.indexOf('/atlas/'))}`;
    } else {
      const wikiImageCategories = ['class', 'species', 'subraces', 'backgrounds'];
      const isWiki = wikiImageCategories.includes(folder);
      const subfolder = isWiki ? 'wiki_image' : 'images';
      
      const filename = url.includes('.') ? url : url + '.webp';
      finalUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/${folder}/${subfolder}/${filename}`;
    }
  } else {
    finalUrl = url || "";
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

export async function deleteFile(path: string, message?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, message })
    });

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
  try {
    // Try local index first (if it exists, though materials index might be different)
    const localRes = await fetch('/assets/atlas/materials/index.json');
    if (localRes.ok) {
       const data = await localRes.json();
       if (Array.isArray(data)) {
         return data.map((item: any) => ({
           name: item.name || item.index.replace(/_/g, ' '),
           index: item.index
         }));
       }
    }
  } catch(e) {}

  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/crafting/json?ref=${BRANCH}&t=${Date.now()}`;
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
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/equipment/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name || item.index.replace(/_/g, ' '),
          index: item.index
        }));
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
  try {
    const localRes = await fetch('/assets/atlas/magic_items/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name || item.index.replace(/_/g, ' '),
          index: item.index
        }));
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
    
    return categories.filter(c => c !== null);
  } catch (e) {
    console.error("Error fetching equipment categories:", e);
    return [];
  }
}

export async function fetchEquipmentCategoryMapping(): Promise<Record<string, string>> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/equipment_categories/json?ref=${BRANCH}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return {};
    const mapping: Record<string, string> = {};
    
    const categoryPromises = files
      .filter((f: any) => f.name.endsWith('.json'))
      .map(async (f: any) => {
        const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}`;
        const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
        if (rawRes.ok) {
          const data = await safeJson(rawRes);
          if (data && data.equipment && data.name) {
            data.equipment.forEach((item: any) => {
              mapping[item.index] = data.name;
            });
          }
        }
      });
    
    await Promise.all(categoryPromises);
    return mapping;
  } catch (e) {
    console.error("Error fetching equipment category mapping:", e);
    return {};
  }
}

export async function fetchMaterialCategories(): Promise<{ name: string; index: string; materials: any[] }[]> {
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
        return categories.filter(c => c !== null);
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
  const categories = await fetchMaterialCategories();
  const mapping: Record<string, string> = {};
  categories.forEach(cat => {
    if (cat.materials && cat.name) {
      cat.materials.forEach((item: any) => {
        mapping[item.index] = cat.name;
      });
    }
  });
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

export async function fetchSpellData(index: string): Promise<any> {
  // Try local first
  try {
    const res = await fetch(`/assets/atlas/spell/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      return { ...data, imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'spell', index) };
    }
  } catch (e) {}

  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/spell/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    if (!data) return null;
    return {
      ...data,
      imageUrl: normalizeImageUrl(data.imageUrl || data.image, 'spell', index)
    };
  } catch (e) {
    console.error("Error fetching spell data:", e);
    return null;
  }
}

export async function fetchSpellList(): Promise<any[]> {
  try {
    // Try local index first
    const localRes = await fetch('/assets/atlas/spell/index.json');
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data)) {
        return data.map((s: any) => ({
          ...s,
          imageUrl: normalizeImageUrl(s.image || s.imageUrl, 'spell', s.index)
        }));
      }
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
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchSpeciesWikiData(index: string): Promise<any> {
  return fetchSpeciesData(index);
}

export async function fetchSpeciesData(index: string): Promise<any> {
    const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/species/json/${index}.json?t=${Date.now()}`;
    const wikiUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/species/spicies_wiki/${index}.json?t=${Date.now()}`;
    
    try {
      const [res, wRes] = await Promise.all([
        fetch(`/api/raw?url=${encodeURIComponent(githubUrl)}`),
        fetch(`/api/raw?url=${encodeURIComponent(wikiUrl)}`)
      ]);
      
      const data = await safeJson(res);
      const wiki = await safeJson(wRes);
      
      if (!data && !wiki) return null;
      
      const merged = { ...(data || {}), ...wiki, wiki_source: !!wiki };
      return { 
        ...merged, 
        imageUrl: normalizeImageUrl(merged.image || merged.imageUrl, 'species', index) 
      };
    } catch (e) {
      return null;
    }
}

export async function fetchClassesList(): Promise<{ name: string; index: string }[]> {
  const githubUrl = `https://api.github.com/repos/${REPO}/contents/public/assets/atlas/class/json?ref=${BRANCH}&t=${Date.now()}`;
  const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const files = await safeJson(res);
    if (!files || !Array.isArray(files)) return [];
    return files
      .filter((f: any) => f.name.endsWith('.json'))
      .map((f: any) => ({
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchClassWikiData(index: string): Promise<any> {
  return fetchClassData(index);
}

export async function fetchClassData(index: string): Promise<any> {
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/class/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    const data = await safeJson(res);
    return data ? { ...data, imageUrl: normalizeImageUrl(data.image || data.imageUrl, 'class', index) } : null;
  } catch (e) {
    return null;
  }
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
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        index: f.name.replace('.json', '')
      }));
  } catch (e) {
    return [];
  }
}

export async function fetchBackgroundData(index: string): Promise<any> {
  // Local first
  try {
    const res = await fetch(`/assets/atlas/backgrounds/json/${index}.json`);
    if (res.ok) {
      const data = await res.json();
      return data ? { ...data, imageUrl: normalizeImageUrl(data.image || data.imageUrl || data.image_url, 'backgrounds', index) } : null;
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
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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

export async function fetchClassLevels(classIndex: string): Promise<any[]> {
  // First try the new structure (individual level files)
  try {
    const levels: any[] = [];
    for (let level = 1; level <= 20; level++) {
      const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/class/levels/${level}/${classIndex}_level_${level}.json?t=${Date.now()}`;
      const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
      const res = await fetch(url);
      if (res.ok) {
        const levelData = await safeJson(res);
        if (levelData) levels.push(levelData);
      } else if (level === 1) {
        // If level 1 fails, fall back to legacy single-file array
        break;
      }
    }
    
    if (levels.length > 0) return levels;
  } catch (e) {
    console.warn("New class levels structure fetch failed, trying legacy:", e);
  }

  // Fallback to legacy single-file array structure
  const legacyUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/class/levels/${classIndex}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(legacyUrl)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const levels = await safeJson(res);
    return Array.isArray(levels) ? levels : [];
  } catch (e) {
    console.error("Error fetching legacy class levels:", e);
    return [];
  }
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
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
  const githubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/traits/json/${index}.json?t=${Date.now()}`;
  const url = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
  try {
    const res = await fetch(url);
    return await safeJson(res);
  } catch (e) {
    return null;
  }
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
        name: f.name.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
