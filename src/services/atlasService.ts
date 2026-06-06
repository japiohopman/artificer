
import { REPO, BRANCH } from './storageService';

export interface StartingEquipmentOption {
  desc: string;
  choose: number;
  type: string;
  from: {
    option_set_type: string;
    options?: any[];
    equipment_category?: { index: string; name: string };
  };
}

export interface AtlasProficiency {
  index: string;
  name: string;
  type: string;
  ability_score?: {
    index: string;
    name: string;
  };
}

export interface AtlasClass {
  index: string;
  name: string;
  hit_die: number;
  proficiencies: Array<{ index: string; name: string; url: string }>;
  saving_throws: Array<{ index: string; name: string; url: string }>;
  proficiency_choices?: any[];
  starting_equipment?: Array<{ 
    equipment: { index: string; name: string; url: string }; 
    quantity: number;
    slot?: string;
  }>;
  starting_equipment_options?: StartingEquipmentOption[];
}

export interface AtlasSpecies {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: any[];
  languages: any[];
  traits: any[];
  proficiencies?: any[];
}

export interface AtlasBackground {
  index: string;
  name: string;
  description?: string;
  ability_scores?: Array<{ index: string; name: string; url: string }>;
  feat?: { index: string; name: string; url: string };
  starting_proficiencies: any[];
  languages?: any[];
  language_options?: any;
  feature?: any;
  starting_equipment?: Array<{
    equipment: { index: string; name: string; url: string };
    quantity: number;
    slot?: string;
  }>;
  starting_equipment_options?: StartingEquipmentOption[];
  suggested_characteristics?: {
    traits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
}

export interface AtlasTrait {
  index: string;
  name: string;
  desc: string[];
  race?: { index: string; name: string; url: string };
  proficiencies?: any[];
}

export interface AtlasTransport {
  index: string;
  name: string;
  equipment_category: { index: string; name: string };
  vehicle_category: string;
  cost: { quantity: number; unit: string };
  speed?: {
    land?: { quantity: number; unit: string };
    water?: { quantity: number; unit: string };
    air?: { quantity: number; unit: string };
  };
  capacity?: {
    cargo?: string;
  };
  desc?: string[];
  image?: string;
  sprite_index?: number;
  sprite_sheet?: string;
  transport_type: 'mount' | 'vehicle';
  transport_specific?: {
    stat_block?: { index: string; name: string; url: string };
    feed?: { index: string; name: string; url: string };
  };
  weight?: number;
  [key: string]: any;
}

class AtlasService {
  private classCache: Record<string, AtlasClass> = {};
  private speciesCache: Record<string, AtlasSpecies> = {};
  private backgroundCache: Record<string, AtlasBackground> = {};
  private traitCache: Record<string, AtlasTrait> = {};
  private transportCache: Record<string, AtlasTransport> = {};
  private repo = REPO;
  private branch = BRANCH;

  private isJson(text: string): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  private cleanJsonText(text: string): string {
    if (!text) return "";
    let cleaned = text.trim();
    // Fix common malformed number issues like "bonus": 15. or "damage": .5
    // 1. Trailing dots: 15. -> 15.0
    cleaned = cleaned.replace(/(\d+)\.(?=[^\d])/g, '$1.0');
    // 2. Leading dots: .5 -> 0.5
    cleaned = cleaned.replace(/(?<=[^\d])\.(\d+)/g, '0.$1');
    return cleaned;
  }

  private async fetchAtlasData(path: string, remotePath?: string): Promise<any> {
    // 1. Try local fetch first (for speed/offline)
    try {
      const localRes = await fetch(path);
      if (localRes.ok) {
        const text = await localRes.text();
        if (this.isJson(text)) {
          try {
            const cleaned = this.cleanJsonText(text);
            return JSON.parse(cleaned);
          } catch (parseError) {
            console.error(`Failed to parse local JSON for ${path}:`, parseError);
          }
        }
      }
    } catch (e) {
      // Local fail is expected sometimes
    }

    // 2. Fallback to GitHub Proxy
    try {
      const gPath = remotePath || path;
      const normalizedPath = gPath.startsWith('/') ? gPath : `/${gPath}`;
      const githubUrl = `https://raw.githubusercontent.com/${this.repo}/${this.branch}/public${normalizedPath}`;
      const proxyUrl = `/api/raw?url=${encodeURIComponent(githubUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) return null;
      
      const text = await response.text();
      if (!text || !this.isJson(text)) return null;
      
      try {
        const cleaned = this.cleanJsonText(text);
        const data = JSON.parse(cleaned);
        if (data && !data.error) return data;
        return null;
      } catch (e) {
        console.error(`Failed to parse remote JSON for ${path}:`, e);
        return null;
      }
    } catch (err) {
      return null;
    }
  }

  async loadClass(className: string): Promise<AtlasClass | null> {
    const slug = className.toLowerCase().replace(/\s+/g, '_');
    const hyphenSlug = className.toLowerCase().replace(/\s+/g, '-');
    
    if (this.classCache[slug]) return this.classCache[slug];

    const paths = [
      `/assets/atlas/classes/json/${slug}.json`,
      `/assets/atlas/classes/json/${hyphenSlug}.json`,
      `/assets/atlas/class/json/${slug}.json`,
      `/assets/atlas/class/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) {
        this.classCache[slug] = data;
        return data;
      }
    }
    return null;
  }

  async loadSpecies(speciesName: string): Promise<AtlasSpecies | null> {
    const slug = speciesName.toLowerCase().replace(/\s+/g, '_');
    const hyphenSlug = speciesName.toLowerCase().replace(/\s+/g, '-');
    
    if (this.speciesCache[slug]) return this.speciesCache[slug];

    const paths = [
      `/assets/atlas/species/json/${slug}.json`,
      `/assets/atlas/species/json/${hyphenSlug}.json`,
      `/assets/atlas/subraces/json/${slug}.json`,
      `/assets/atlas/subraces/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) {
        this.speciesCache[slug] = data;
        return data;
      }
    }
    return null;
  }

  async loadBackground(backgroundName: string): Promise<AtlasBackground | null> {
    const slug = backgroundName.toLowerCase().replace(/\s+/g, '_');
    const hyphenSlug = backgroundName.toLowerCase().replace(/\s+/g, '-');
    
    if (this.backgroundCache[slug]) return this.backgroundCache[slug];

    // Try multiple possible paths
    const paths = [
      `/assets/atlas/backgrounds/json/${slug}.json`,
      `/assets/atlas/backgrounds/json/${hyphenSlug}.json`,
      `/assets/atlas/background/json/${slug}.json`,
      `/assets/atlas/background/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) {
        this.backgroundCache[slug] = data;
        return data;
      }
    }

    return null;
  }

  async loadEquipmentCategory(index: string): Promise<any | null> {
    const slug = index.toLowerCase().replace(/[\s-]/g, '_');
    return this.fetchAtlasData(
      `/assets/atlas/equipment_categories/json/${slug}.json`
    );
  }

  async loadEquipmentByCategory(categoryIndex: string): Promise<any[]> {
    const data = await this.loadEquipmentCategory(categoryIndex);
    return data?.equipment || [];
  }

  async loadEquipment(index: string): Promise<any | null> {
    const slug = index.toLowerCase().replace(/[\s-]/g, '_').replace(/'/g, '');
    const hyphenSlug = index.toLowerCase().replace(/[\s_]/g, '-').replace(/'/g, '');
    
    const paths = [
      `/assets/atlas/equipment/json/${slug}.json`,
      `/assets/atlas/equipment/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) return data;
    }
    return null;
  }

  async loadEquipmentPack(packName: string): Promise<any | null> {
    return this.loadEquipment(packName);
  }
  
  async loadTrait(traitIndex: string): Promise<AtlasTrait | null> {
    const slug = traitIndex.toLowerCase().replace(/[\s-]/g, '_');
    const hyphenSlug = traitIndex.toLowerCase().replace(/[\s_]/g, '-');
    
    if (this.traitCache[slug]) return this.traitCache[slug];
    
    const paths = [
      `/assets/atlas/traits/json/${slug}.json`,
      `/assets/atlas/traits/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) {
        this.traitCache[slug] = data;
        return data;
      }
    }
    return null;
  }

  async loadProficiency(index: string): Promise<AtlasProficiency | null> {
    const slug = index.toLowerCase().replace(/[\s-]/g, '_');
    const hyphenSlug = index.toLowerCase().replace(/[\s_]/g, '-');
    
    const paths = [
      `/assets/atlas/proficiencies/json/${slug}.json`,
      `/assets/atlas/proficiencies/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) return data;
    }
    return null;
  }

  async loadSkill(index: string): Promise<any | null> {
    return this.fetchAtlasData(
      `/assets/atlas/skills/json/${index.toLowerCase().replace(/[\s-]/g, '_')}.json`
    );
  }

  async loadLanguage(index: string): Promise<any | null> {
    return this.fetchAtlasData(
      `/assets/atlas/languages/json/${index.toLowerCase().replace(/[\s-]/g, '_')}.json`
    );
  }

  async loadSpell(index: string): Promise<any | null> {
    return this.fetchAtlasData(
      `/assets/atlas/spells/json/${index.toLowerCase().replace(/[\s-]/g, '_')}.json`
    );
  }

  async loadLevelData(className: string, level: number): Promise<any | null> {
    const slug = className.toLowerCase().replace(/\s+/g, '_');
    const hyphenSlug = className.toLowerCase().replace(/\s+/g, '-');
    
    // Look for explicit level file if it exists, otherwise usually class data or special levels folder
    const paths = [
      `/assets/atlas/class/levels/${level}/${slug}_level_${level}.json`,
      `/assets/atlas/levels/json/${slug}_${level}.json`,
      `/assets/atlas/levels/json/${hyphenSlug}_${level}.json`,
      `/assets/atlas/class/levels/${slug}_${level}.json`,
      `/assets/atlas/class/levels/${slug}.json` // Sometimes it's a big array in one file
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) {
        if (Array.isArray(data)) {
          return data.find(lvl => lvl.level === level) || null;
        }
        return data;
      }
    }
    return null;
  }

  async loadFeature(index: string): Promise<any | null> {
    return this.fetchAtlasData(
      `/assets/atlas/features/json/${index.toLowerCase().replace(/[\s-]/g, '_')}.json`
    );
  }

  async loadSubclass(index: string): Promise<any | null> {
    return this.fetchAtlasData(
      `/assets/atlas/subclasses/json/${index.toLowerCase().replace(/[\s-]/g, '_')}.json`
    );
  }

  async loadTransport(index: string): Promise<AtlasTransport | null> {
    const slug = index.toLowerCase().replace(/[\s-]/g, '_');
    const hyphenSlug = index.toLowerCase().replace(/[\s_]/g, '-');
    
    if (this.transportCache[slug]) return this.transportCache[slug];

    const paths = [
      `/assets/atlas/transport/json/${slug}.json`,
      `/assets/atlas/transport/json/${hyphenSlug}.json`
    ];

    for (const p of paths) {
      const data = await this.fetchAtlasData(p);
      if (data) {
        this.transportCache[slug] = data;
        return data;
      }
    }
    return null;
  }

  async fetchCollectionIndices(collectionName: string): Promise<string[]> {
    const githubUrl = `https://api.github.com/repos/${this.repo}/contents/public/assets/atlas/${collectionName}/json?ref=${this.branch}`;
    const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const files = await res.json();
      if (!Array.isArray(files)) return [];
      return files
        .filter(f => f.name.endsWith('.json'))
        .map(f => f.name.replace('.json', ''));
    } catch (e) {
      console.error(`Error fetching collection indices for ${collectionName}:`, e);
      return [];
    }
  }
}

export const atlasService = new AtlasService();
