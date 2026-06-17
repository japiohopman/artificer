import { atlasService, AtlasClass, AtlasSpecies, AtlasBackground } from "../services/atlasService";
import { getXPForLevel, getModifier } from "./npcGeneratorUtils";

export interface PipelineChoice {
  species?: string;
  subrace?: string;
  class?: string;
  background?: string;
  level?: number;
  statsMethod?: 'point_buy' | 'standard_array' | 'roll';
  stats?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  alignment?: string;
  gender?: 'Male' | 'Female' | 'Other';
}

export interface CharacterAttributes {
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  speed: number;
  passivePerception: number;
  carryWeight: number;
}

export class CharacterPipeline {
  private repo = "japiohopman/artificer";
  private branch = "main";
  private githubBase = `https://github.com/${this.repo}/blob/${this.branch}/`;

  // Step 3: Ability Scores Logic
  static calculatePointBuy(baseStats: Record<string, number>, racialBonuses: any[]): Record<string, number> {
    const finalStats = { ...baseStats };
    racialBonuses.forEach(bonus => {
      const ability = bonus.ability_score.index.toLowerCase() as keyof typeof finalStats;
      if (finalStats[ability] !== undefined) {
        finalStats[ability] += bonus.bonus;
      }
    });
    return finalStats;
  }

  static getStandardArray(): number[] {
    return [15, 14, 13, 12, 10, 8];
  }

  // Step 8: HP Calculation
  static calculateHP(level: number, con: number, hitDie: number): number {
    const conMod = getModifier(con);
    if (level <= 0) return Math.max(1, Math.floor(hitDie / 2) + conMod);
    let hp = hitDie + conMod;
    for (let i = 2; i <= level; i++) {
        hp += Math.floor(hitDie / 2) + 1 + conMod;
    }
    return Math.max(hp, 1);
  }

  // Step 9: AC calculation
  static async calculateAC(dex: number, inventory: Record<string, any>, choices?: Record<string, any>): Promise<number> {
    const dexMod = getModifier(dex);
    let baseAC = 10 + dexMod;
    
    const armor = inventory['chest'];
    const shield = inventory['off-hand'];

    if (armor && armor.armor_class) {
      const acData = armor.armor_class;
      if (acData.base) {
        baseAC = acData.base;
        if (acData.dex_bonus) {
          const maxDex = acData.max_bonus ?? 10;
          baseAC += Math.min(dexMod, maxDex);
        }
      }
    }

    if (shield && (shield.armor_category === 'Shield' || shield.index === 'shield')) {
      baseAC += (shield.armor_class?.base || 2);
    }

    // Defense Fighting Style
    if (choices?.['fighting-style'] && armor) {
        const styles = (choices['fighting-style'] || []).map((s: string) => s.toLowerCase());
        if (styles.some((s: string) => s === 'defense' || s.includes('defense'))) {
            baseAC += 1;
        }
    }

    return baseAC;
  }

  // Step 7: Equipment Resolver
  static async resolveEquipmentSlot(itemIndex: string): Promise<string> {
    const itemData = await atlasService.loadEquipment(itemIndex);
    if (!itemData) return 'backpack';

    const cat = itemData.equipment_category?.index;
    const armorCat = itemData.armor_category;
    const weaponCat = itemData.weapon_category;

    if (armorCat === 'Shield' || itemIndex === 'shield') return 'off-hand';
    if (armorCat && ['Light', 'Medium', 'Heavy'].includes(armorCat)) return 'chest';
    if (weaponCat || cat === 'weapon' || itemData.category === 'Weapon') return 'main-hand';
    
    if (itemIndex.includes('focus') || itemIndex.includes('holy_symbol') || itemIndex === 'spellbook') return 'focus';
    if (itemIndex.includes('clothes')) return 'clothes';
    if (itemIndex.includes('ring')) return 'ring-1';
    if (itemIndex.includes('amulet') || itemIndex.includes('necklace')) return 'neck';
    
    return 'backpack';
  }

  static createItemObject(itemData: any) {
    if (!itemData?.index) return null;

    const repo = "japiohopman/artificer";
    const branch = "main";
    const githubBase = `https://github.com/${repo}/blob/${branch}/`;
    const index = itemData.index;
    const slug = index.toLowerCase().replace(/[\s-]/g, '_');

    return {
      id: `${index}-${Math.random().toString(36).substr(2, 9)}`,
      name: (itemData.name || index).replace(/[_-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      index: index,
      _type: (index === 'spellbook' || itemData.equipment_category?.index === 'books') ? 'books' : 'equipment',
      weight: itemData.weight || 1,
      quantity: itemData.quantity || 1,
      dataPath: `${githubBase}public/assets/atlas/equipment/json/${index}.json`,
      imageUrl: itemData.imageUrl || `/assets/atlas/equipment/images/${slug}.webp`,
      ...itemData
    };
  }
}
