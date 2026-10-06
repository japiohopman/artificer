import { atlasService, AtlasClass, AtlasBackground, AtlasSpecies } from "../services/atlasService";
import { CharacterPipeline } from "./characterPipeline";
import { NPCProfile } from "../services/ai/npcService";
import { ItemInstance, InventorySlot, InventoryContainer, EQUIPMENT_SLOT_CATALOG } from "../types/inventory";
import { resolvePersonality as resolvePersonalityDomain } from "./narrative/narrativeResolver";
import { SeedableRNG } from "./naming/rng";

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

let resolverSeedCounter = 0;

function getRng(seed?: number | string | SeedableRNG): SeedableRNG {
  if (seed instanceof SeedableRNG) return seed;
  if (seed !== undefined && seed !== null) {
    return new SeedableRNG(seed);
  }
  resolverSeedCounter = (resolverSeedCounter + 1) % 1000000;
  return new SeedableRNG(`choice_resolver_${Date.now()}_${resolverSeedCounter}`);
}

export class NPCChoiceResolver {
  private static REPO = "japiohopman/artificer";
  private static BRANCH = "main";

  /**
   * Resolves a complex "choice" object from D&D 5e-style JSON deterministically.
   */
  static async resolveChoice(choice: any, seed?: number | string | SeedableRNG): Promise<any[]> {
    if (!choice) return [];
    const rng = getRng(seed);
    
    // If it's a multiple-item choice (results in multiple items)
    if (choice.option_type === 'multiple' || choice.items) {
      const results: any[] = [];
      const items = choice.items || choice.from?.options || [];
      for (let i = 0; i < items.length; i++) {
        const nested = await this.resolveChoice(items[i], rng.fork(`mult_${i}`));
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
        const randomOpt = rng.pick(options);
        return this.resolveChoice(randomOpt, rng.fork('opt_array'));
      } else if (from.option_set_type === 'equipment_category') {
        if (!from.equipment_category?.index) return [];
        const categoryItems = await atlasService.loadEquipmentByCategory(from.equipment_category.index);
        if (categoryItems.length > 0) {
          const randomItem = rng.pick(categoryItems);
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
  static async standardizeItems(items: any[], seed?: number | string | SeedableRNG): Promise<ResolvedItem[]> {
    const standardized: ResolvedItem[] = [];
    const rng = getRng(seed);

    for (let idx = 0; idx < items.length; idx++) {
      const raw = items[idx];
      if (!raw) continue;
      const index = String(raw.index || raw.item?.index || '');
      if (!index) continue;

      const fullData = await atlasService.loadEquipment(index);
      const slug = index.toLowerCase().replace(/[\s-]/g, '_').replace(/'/g, '');
      
      const rawName = raw.name || fullData?.name || index;
      const safeName = Array.isArray(rawName) ? rawName[0] : (typeof rawName === 'string' ? rawName : String(rawName));
      
      const item: ResolvedItem = {
        id: `${index}_${rng.nextInt(100000, 999999)}`,
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
   * Resolves starting equipment deterministically.
   */
  static async resolveFullStartingEquipment(
    atlasClass: AtlasClass | null,
    atlasBackground: AtlasBackground | null,
    seed?: number | string | SeedableRNG
  ): Promise<{
    inventory: Record<string, ResolvedItem>, 
    backpack: ResolvedItem[],
    v2: {
      items: Record<string, ItemInstance>,
      containers: Record<string, InventoryContainer>,
      equipment: { containerId: string, slots: InventorySlot[] }
    }
  }> {
    const rng = getRng(seed);
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
      for (let i = 0; i < atlasClass.starting_equipment_options.length; i++) {
        const option = atlasClass.starting_equipment_options[i];
        const resolved = await this.resolveChoice(option, rng.fork(`cls_opt_${i}`));
        allRawItems.push(...resolved);
      }
    }
    if (atlasBackground?.starting_equipment_options) {
      for (let i = 0; i < atlasBackground.starting_equipment_options.length; i++) {
        const option = atlasBackground.starting_equipment_options[i];
        const resolved = await this.resolveChoice(option, rng.fork(`bg_opt_${i}`));
        allRawItems.push(...resolved);
      }
    }

    const expandedItems = await this.expandPacks(allRawItems);
    const standardizedItems = await this.standardizeItems(expandedItems, rng.fork('standardize'));
    const v1 = await this.buildResolvedInventory({}, standardizedItems);
    const v2 = await this.buildV2Inventory(standardizedItems, rng.fork('v2_inv'));
    
    return { ...v1, v2 };
  }

  /**
   * Resolves spells for a class (cantrips and level 1).
   */
  static async resolveSpells(atlasClass: any, seed?: number | string | SeedableRNG): Promise<any[]> {
    const spells: any[] = [];
    const rng = getRng(seed);

    if (!atlasClass || (!atlasClass.spells && !atlasClass.spellcasting)) {
       return [];
    }
    
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

    if (atlasClass.proficiency_choices) {
      for (let i = 0; i < atlasClass.proficiency_choices.length; i++) {
        const choice = atlasClass.proficiency_choices[i];
        if (choice.type === 'spells' || choice.from?.option_set_type === 'spells') {
          const resolved = await this.resolveChoice(choice, rng.fork(`spell_choice_${i}`));
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
   * Helper to build v2 inventory structure deterministically.
   */
  static async buildV2Inventory(items: ResolvedItem[], seed?: number | string | SeedableRNG): Promise<{
    items: Record<string, ItemInstance>, 
    containers: Record<string, InventoryContainer>, 
    equipment: { containerId: string, slots: InventorySlot[] } 
  }> {
    const rng = getRng(seed);
    const registry: Record<string, ItemInstance> = {};
    const backpackId = `backpack_${rng.nextInt(100000, 999999)}`;
    const backpack: InventoryContainer = {
      id: backpackId,
      name: "Backpack",
      type: "backpack",
      slots: Array.from({ length: 120 }, (_, i) => ({ id: `slot_${i}`, itemId: null }))
    };
    const equipment = {
      containerId: `equipment_${rng.nextInt(100000, 999999)}`,
      slots: [...EQUIPMENT_SLOT_CATALOG].map(s => ({ ...s, itemId: null }))
    };

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const id = `item_${rng.nextInt(100000, 999999)}_${idx}`;
      registry[id] = {
        id,
        template: item.index,
        quantity: item.quantity || 1,
        addedAt: Date.now()
      };

      const slot = await CharacterPipeline.resolveEquipmentSlot(item.index);
      const v2SlotId = SLOT_MAP[slot] || slot;
      
      const targetSlot = (equipment.slots as any[]).find(s => s.id === v2SlotId && s.itemId === null);
      if (targetSlot) {
        targetSlot.itemId = id;
      } else {
        const bagSlot = (backpack.slots as any[]).find(s => s.itemId === null);
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
   * Resolves personality aspects from background deterministically.
   */
  static resolvePersonality(background: AtlasBackground | null, seed?: number | string): { traits: string[], ideals: string[], bonds: string[], flaws: string[] } {
    return resolvePersonalityDomain(background, seed);
  }

  /**
   * Resolves proficiency choices across class, background, and race deterministically.
   */
  static resolveAllProficiencies(
    atlasClass: AtlasClass | null,
    atlasBackground: AtlasBackground | null,
    atlasSpecies: AtlasSpecies | null,
    seed?: number | string | SeedableRNG
  ): string[] {
    let results: string[] = [];
    const rng = getRng(seed);

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
    const resolveFromChoices = (source: any, subKey: string) => {
      if (!source?.proficiency_choices) return;
      for (let i = 0; i < source.proficiency_choices.length; i++) {
        const choice = source.proficiency_choices[i];
        const options = choice.from.options || [];
        const chooseCount = choice.choose || 1;
        
        const available = options.filter((opt: any) => {
          const idx = opt.item?.index || opt.index;
          return !results.includes(idx);
        });

        const childRng = rng.fork(`${subKey}_${i}`);
        const shuffled = childRng.shuffle(available);
        shuffled.slice(0, Math.min(chooseCount, shuffled.length)).forEach((s: any) => {
          const idx = s.item?.index || s.index;
          if (idx) results.push(idx);
        });
      }
    };

    resolveFromChoices(atlasClass, 'cls');
    resolveFromChoices(atlasBackground, 'bg');
    resolveFromChoices(atlasSpecies, 'spc');
    return [...new Set(results)];
  }

  /**
   * Resolves ability scores based on a specific method deterministically.
   */
  static resolveStats(method: 'Standard Array' | 'Rolling' | 'Point Buy', seed?: number | string): NPCProfile['stats'] {
    const stats: NPCProfile['stats'] = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const keys: (keyof NPCProfile['stats'])[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const rng = getRng(seed);

    if (method === 'Standard Array') {
      const array = [15, 14, 13, 12, 10, 8];
      const shuffled = rng.shuffle(array);
      keys.forEach((key, i) => stats[key] = shuffled[i]);
      return stats;
    }
    
    if (method === 'Rolling') {
      const rollStat = (subKey: string) => {
        const childRng = rng.fork(subKey);
        const rolls = [
          childRng.nextInt(1, 6),
          childRng.nextInt(1, 6),
          childRng.nextInt(1, 6),
          childRng.nextInt(1, 6)
        ].sort((a, b) => a - b);
        return rolls[1] + rolls[2] + rolls[3]; // 4d6 drop lowest
      };
      keys.forEach(key => stats[key] = rollStat(key));
      return stats;
    }

    if (method === 'Point Buy') {
      const pointsArray = [0, 0, 0, 0, 0, 0];
      let remaining = 27;
      let counter = 0;
      while (remaining > 0) {
        const idx = rng.nextInt(0, 5);
        counter++;
        if (pointsArray[idx] < 7) {
          pointsArray[idx]++;
          remaining--;
        } else {
          if (pointsArray.every(p => p >= 7) || counter > 100) break;
        }
      }
      keys.forEach((key, i) => {
        const spent = pointsArray[i];
        const mapping: Record<number, number> = { 0:8, 1:9, 2:10, 3:11, 4:12, 5:13, 6:14, 7:15 };
        stats[key] = mapping[spent] || 15;
      });
      return stats;
    }

    return stats;
  }

  /**
   * Resolves starting money between 5 and 100 GP deterministically.
   */
  static resolveStartingMoney(seed?: number | string): { cp: number, sp: number, ep: number, gp: number, pp: number } {
    const rng = getRng(seed);
    const totalGP = rng.nextInt(5, 100);
    return {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: totalGP,
      pp: 0
    };
  }
}
