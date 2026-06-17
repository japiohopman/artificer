import { atlasService, AtlasClass, AtlasBackground, AtlasSpecies } from "../services/atlasService";
import { CharacterPipeline } from "./characterPipeline";
import { NPCProfile } from "../services/ai/npcService";
import { ItemInstance, InventorySlot, InventoryContainer, EQUIPMENT_SLOT_CATALOG } from "../types/inventory";

const SLOT_MAP: Record<string, string> = {
  'chest': 'chest',
  'main-hand': 'main_hand',
  'off-hand': 'off_hand',
  'focus': 'focus',
  'neck': 'neck',
  'ring-1': 'ring_1',
  'clothes': 'clothes',
  'acc-1': 'acc_1'
};

export interface ResolvedItem {
  id: string;
  name: string;
  index: string;
  quantity: number;
  weight: number;
  _type: 'equipment' | 'books';
  url: string;
  image_url: string;
  slot?: string;
  [key: string]: any;
}

export class NPCChoiceResolver {
  private static REPO = "japiohopman/artificer";
  private static BRANCH = "main";

  /**
   * Resolves a complex "choice" object from D&D 5e-style JSON.
   */
  static async resolveChoice(choice: any): Promise<any[]> {
    if (!choice) return [];
    
    // If it's a multiple-item choice (results in multiple items)
    if (choice.option_type === 'multiple' || choice.items) {
      const results: any[] = [];
      const items = choice.items || choice.from?.options || [];
      for (const item of items) {
        const nested = await this.resolveChoice(item);
        results.push(...nested);
      }
      return results;
    }

    // If it's a recursive choice or a choice from a category
    if (choice.option_type === 'choice' || choice.from) {
      const from = choice.choice?.from || choice.from;
      if (!from) return [];

      if (from.option_set_type === 'options_array') {
        const options = from.options || [];
        if (options.length === 0) return [];
        const randomOpt = options[Math.floor(Math.random() * options.length)];
        return this.resolveChoice(randomOpt);
      } else if (from.option_set_type === 'equipment_category') {
        if (!from.equipment_category?.index) return [];
        const categoryItems = await atlasService.loadEquipmentByCategory(from.equipment_category.index);
        if (categoryItems.length > 0) {
          const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          return [{ index: randomItem.index, name: randomItem.name, quantity: 1 }];
        }
      }
    }

    // Direct reference (counted_reference)
    if (choice.option_type === 'counted_reference') {
      const item = choice.of || choice.item;
      if (!item) return [];
      return [{ index: item.index, name: item.name, quantity: choice.count || choice.quantity || 1 }];
    }
    
    // Simple reference
    if (choice.index) {
        return [{ index: choice.index, name: choice.name || choice.index, quantity: choice.quantity || 1 }];
    }

    if (choice.item) {
        const itemIndex = choice.item.index || choice.item;
        const itemName = choice.item.name || choice.item.index || (typeof choice.item === 'string' ? choice.item : 'Item');
        return [{ index: itemIndex, name: itemName, quantity: choice.quantity || choice.item.quantity || 1 }];
    }

    return [];
  }

  /**
   * Expands equipment packs into their contents recursively.
   */
  static async expandPacks(items: any[]): Promise<any[]> {
    const results: any[] = [];
    
    for (const item of items) {
      if (!item) continue;
      const index = String(item.index || item.item?.index || '');
      if (!index) continue;

      if (index.toLowerCase().endsWith('_pack')) {
        const pack = await atlasService.loadEquipmentPack(index);
        if (pack && pack.contents) {
          const packContents = await this.expandPacks(pack.contents.map((c: any) => {
            const inner = c.item?.of || c.item?.item || c.item?.equipment || c.item;
            return {
              index: inner?.index || inner,
              quantity: c.quantity || 1
            };
          }));
          results.push(...packContents);
          continue;
        }
      }
      results.push(item);
    }
    
    return results;
  }

  /**
   * Standardizes item objects with correct URLs and metadata.
   */
  static async standardizeItems(items: any[]): Promise<ResolvedItem[]> {
    const standardized: ResolvedItem[] = [];

    for (const raw of items) {
      if (!raw) continue;
      const index = String(raw.index || raw.item?.index || '');
      if (!index) continue;

      const fullData = await atlasService.loadEquipment(index);
      const slug = index.toLowerCase().replace(/[\s-]/g, '_').replace(/'/g, '');
      
      const rawName = raw.name || fullData?.name || index;
      const safeName = Array.isArray(rawName) ? rawName[0] : (typeof rawName === 'string' ? rawName : String(rawName));
      
      const item: ResolvedItem = {
        id: `${index}_${Math.random().toString(36).substr(2, 9)}`,
        index: index,
        name: safeName.toLowerCase().replace(/[_-]/g, ' '),
        quantity: raw.quantity || 1,
        weight: fullData?.weight || 0,
        _type: (index === 'spellbook' || fullData?.equipment_category?.index === 'books') ? 'books' : 'equipment',
        url: `public/assets/atlas/equipment/json/${index}.json`,
        image_url: `public/assets/atlas/equipment/images/${slug}.webp`,
        imageUrl: `/assets/atlas/equipment/images/${slug}.webp`,
        ...fullData,
        ...raw
      };

      delete item.url_5e; 
      standardized.push(item);
    }

    return standardized;
  }

  /**
   * Resolves starting equipment.
   */
  static async resolveFullStartingEquipment(atlasClass: AtlasClass | null, atlasBackground: AtlasBackground | null): Promise<{ 
    inventory: Record<string, ResolvedItem>, 
    backpack: ResolvedItem[],
    v2: {
      items: Record<string, ItemInstance>,
      containers: Record<string, InventoryContainer>,
      equipment: { containerId: string, slots: InventorySlot[] }
    }
  }> {
    let allRawItems: any[] = [];

    if (atlasClass?.starting_equipment) {
      atlasClass.starting_equipment.forEach(e => {
        allRawItems.push({ index: e.equipment.index, quantity: e.quantity || 1 });
      });
    }
    if (atlasBackground?.starting_equipment) {
      atlasBackground.starting_equipment.forEach(e => {
        allRawItems.push({ index: e.equipment.index, quantity: e.quantity || 1 });
      });
    }

    if (atlasClass?.starting_equipment_options) {
      for (const option of atlasClass.starting_equipment_options) {
        const resolved = await this.resolveChoice(option);
        allRawItems.push(...resolved);
      }
    }
    if (atlasBackground?.starting_equipment_options) {
      for (const option of atlasBackground.starting_equipment_options) {
        const resolved = await this.resolveChoice(option);
        allRawItems.push(...resolved);
      }
    }

    const expandedItems = await this.expandPacks(allRawItems);
    const standardizedItems = await this.standardizeItems(expandedItems);
    const v1 = await this.buildResolvedInventory({}, standardizedItems);
    const v2 = await this.buildV2Inventory(standardizedItems);
    
    return { ...v1, v2 };
  }

  /**
   * Resolves spells for a class (cantrips and level 1).
   */
  static async resolveSpells(atlasClass: any): Promise<any[]> {
    const spells: any[] = [];
    if (!atlasClass || !atlasClass.spells) {
       // Check if there's a spellcasting property
       if (!atlasClass?.spellcasting) return [];
    }

    // This is a simplified resolver; real D&D 5e data might be in different places
    // Usually atlasClass.spells is a URL or a list of options
    // Let's assume there's a proficiency_choices for spells or a direct spells array
    
    const resolveList = async (list: any[]) => {
      for (const item of list) {
        if (item.index) {
          const full = await atlasService.loadSpell(item.index);
          if (full) spells.push(full);
        }
      }
    };

    if (atlasClass.spells && Array.isArray(atlasClass.spells)) {
       await resolveList(atlasClass.spells);
    }

    // Handle magic choices (common in Wizard/Cleric)
    if (atlasClass.proficiency_choices) {
      for (const choice of atlasClass.proficiency_choices) {
        if (choice.type === 'spells' || choice.from?.option_set_type === 'spells') {
          const resolved = await this.resolveChoice(choice);
          for (const r of resolved) {
             const full = await atlasService.loadSpell(r.index);
             if (full) spells.push(full);
          }
        }
      }
    }

    return spells;
  }

  /**
   * Helper to build v2 inventory structure.
   */
  static async buildV2Inventory(items: ResolvedItem[]): Promise<{ 
    items: Record<string, ItemInstance>, 
    containers: Record<string, InventoryContainer>, 
    equipment: { containerId: string, slots: InventorySlot[] } 
  }> {
    const registry: Record<string, ItemInstance> = {};
    const backpackId = `backpack_${Math.random().toString(36).substr(2, 9)}`;
    const backpack: InventoryContainer = {
      id: backpackId,
      name: "Backpack",
      type: "backpack",
      slots: Array.from({ length: 120 }, (_, i) => ({ id: `slot_${i}`, itemId: null }))
    };
    const equipment = {
      containerId: `equipment_${Math.random().toString(36).substr(2, 9)}`,
      slots: [...EQUIPMENT_SLOT_CATALOG].map(s => ({ ...s, itemId: null }))
    };

    for (const item of items) {
      const id = crypto.randomUUID();
      registry[id] = {
        id,
        template: item.index,
        quantity: item.quantity || 1,
        addedAt: Date.now()
      };

      const slot = await CharacterPipeline.resolveEquipmentSlot(item.index);
      const v2SlotId = SLOT_MAP[slot] || slot;
      
      const targetSlot = equipment.slots.find(s => s.id === v2SlotId && s.itemId === null);
      if (targetSlot) {
        targetSlot.itemId = id;
      } else {
        const bagSlot = backpack.slots.find(s => s.itemId === null);
        if (bagSlot) bagSlot.itemId = id;
      }
    }
    
    return { 
      items: registry, 
      containers: { [backpack.id]: backpack }, 
      equipment 
    };
  }

  /**
   * Helper to build inventory/backpack.
   */
  static async buildResolvedInventory(character: any, items: ResolvedItem[]): Promise<{ inventory: Record<string, ResolvedItem>, backpack: ResolvedItem[] }> {
    const inventory: Record<string, ResolvedItem> = {};
    const backpack: ResolvedItem[] = [];

    for (const item of items) {
      const slot = await CharacterPipeline.resolveEquipmentSlot(item.index);
      if (slot !== 'backpack') {
        let finalSlot = slot;
        if (slot === 'main-hand' && inventory['main-hand']) finalSlot = 'off-hand';
        if (!inventory[finalSlot]) {
          const slotTag = `${finalSlot.replace('-', '_')}_slot`;
          inventory[finalSlot] = { ...item, [slotTag]: item.name, slot: finalSlot, quantity: item.quantity || 1 };
        } else {
          // If already equipped, or slot full, try stacking in backpack
          this.stackInList(backpack, item);
        }
      } else {
        this.stackInList(backpack, item);
      }
    }
    return { inventory, backpack };
  }

  private static stackInList(list: ResolvedItem[], item: ResolvedItem) {
    const existing = list.findIndex(i => (i.index && i.index === item.index) || (i.name === item.name));
    if (existing > -1) {
      list[existing].quantity = (list[existing].quantity || 1) + (item.quantity || 1);
    } else {
      list.push({ ...item, quantity: item.quantity || 1 });
    }
  }

  /**
   * Resolves personality aspects from background.
   */
  static resolvePersonality(background: AtlasBackground | null): { traits: string[], ideals: string[], bonds: string[], flaws: string[] } {
    const pickRandom = (set: any) => {
      if (!set || !set.from || !set.from.options) return '';
      const options = set.from.options;
      const picked = options[Math.floor(Math.random() * options.length)];
      return picked.desc || picked.text || picked;
    };

    // Try to find personality data - it varies in format
    const traits = background?.suggested_characteristics?.traits || [];
    const ideals = background?.suggested_characteristics?.ideals || [];
    const bonds = background?.suggested_characteristics?.bonds || [];
    const flaws = background?.suggested_characteristics?.flaws || [];

    return {
      traits: traits.length > 0 ? [traits[Math.floor(Math.random() * traits.length)]] : [],
      ideals: ideals.length > 0 ? [ideals[Math.floor(Math.random() * ideals.length)]] : [],
      bonds: bonds.length > 0 ? [bonds[Math.floor(Math.random() * bonds.length)]] : [],
      flaws: flaws.length > 0 ? [flaws[Math.floor(Math.random() * flaws.length)]] : []
    };
  }

  /**
   * Resolves proficiency choices across class, background, and race.
   */
  static resolveAllProficiencies(atlasClass: AtlasClass | null, atlasBackground: AtlasBackground | null, atlasSpecies: AtlasSpecies | null): string[] {
    let results: string[] = [];

    // 1. Static proficiencies
    if (atlasClass?.proficiencies) {
      atlasClass.proficiencies.forEach(p => results.push(p.index || p.name));
    }
    if (atlasBackground?.starting_proficiencies) {
      atlasBackground.starting_proficiencies.forEach(p => results.push(p.index || p.name));
    }
    if (atlasSpecies?.proficiencies) {
      atlasSpecies.proficiencies.forEach(p => results.push(p.index || p.name));
    }

    // 2. Resolve choices
    const resolveFromChoices = (source: any) => {
      if (!source?.proficiency_choices) return;
      for (const choice of source.proficiency_choices) {
        const options = choice.from.options || [];
        const chooseCount = choice.choose || 1;
        
        const available = options.filter((opt: any) => {
          const idx = opt.item?.index || opt.index;
          return !results.includes(idx);
        });

        const shuffled = [...available].sort(() => 0.5 - Math.random());
        shuffled.slice(0, Math.min(chooseCount, shuffled.length)).forEach((s: any) => {
          const idx = s.item?.index || s.index;
          if (idx) results.push(idx);
        });
      }
    };

    resolveFromChoices(atlasClass);
    resolveFromChoices(atlasBackground);
    resolveFromChoices(atlasSpecies);
    return [...new Set(results)];
  }

  /**
   * Resolves ability scores based on a specific method.
   */
  static resolveStats(method: 'Standard Array' | 'Rolling' | 'Point Buy'): NPCProfile['stats'] {
    const stats: NPCProfile['stats'] = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const keys: (keyof NPCProfile['stats'])[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    if (method === 'Standard Array') {
      const array = [15, 14, 13, 12, 10, 8];
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      keys.forEach((key, i) => stats[key] = shuffled[i]);
      return stats;
    }
    
    if (method === 'Rolling') {
      const rollStat = () => {
        const rolls = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ].sort((a, b) => a - b);
        return rolls[1] + rolls[2] + rolls[3]; // 4d6 drop lowest
      };
      keys.forEach(key => stats[key] = rollStat());
      return stats;
    }

    if (method === 'Point Buy') {
      // Very basic point buy simulation for NPCs
      // Start all at 8, spend 27 points
      const pointsArray = [0, 0, 0, 0, 0, 0];
      let remaining = 27;
      while (remaining > 0) {
        const idx = Math.floor(Math.random() * 6);
        if (pointsArray[idx] < 7) { // Max 15 (7 points spent on top of 8 base)
          pointsArray[idx]++;
          remaining--;
        } else {
          // If all are maxed or near max, just stop or break
          if (pointsArray.every(p => p >= 7)) break;
        }
      }
      keys.forEach((key, i) => {
        const spent = pointsArray[i];
        // Point buy costs: 8->0, 9->1, 10->2, 11->3, 12->4, 13->5, 14->7, 15->9
        // Simplified mapping for simulation
        const mapping: Record<number, number> = { 0:8, 1:9, 2:10, 3:11, 4:12, 5:13, 6:14, 7:15 };
        stats[key] = mapping[spent] || 15;
      });
      return stats;
    }

    return stats;
  }

  /**
   * Resolves starting money between 5 and 100 GP.
   */
  static resolveStartingMoney(): { cp: number, sp: number, ep: number, gp: number, pp: number } {
    const totalGP = Math.floor(Math.random() * 96) + 5; // 5 to 100
    return {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: totalGP,
      pp: 0
    };
  }
}
