import { useStore } from '../store/useStore';

export interface SpellSlotConfig {
  cantrips: number;
  leveled: number[];
}

const LEVEL_CONFIG: Record<number, SpellSlotConfig> = {
  1: { cantrips: 3, leveled: [2] },
  2: { cantrips: 3, leveled: [3, 2] },
  3: { cantrips: 3, leveled: [4, 2, 2] }, // Level 3 spells unlocked for 'Level 3' NPCs
  4: { cantrips: 4, leveled: [4, 3, 3] },
  5: { cantrips: 4, leveled: [4, 3, 3, 2] },
  6: { cantrips: 4, leveled: [4, 3, 3, 3] },
  7: { cantrips: 4, leveled: [4, 3, 3, 3, 1] },
  8: { cantrips: 4, leveled: [4, 3, 3, 3, 2] },
  9: { cantrips: 4, leveled: [4, 3, 3, 3, 3, 1] },
  10: { cantrips: 5, leveled: [4, 3, 3, 3, 3, 2] },
  11: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1] },
  12: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1] },
  13: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1, 1] },
  14: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1, 1] },
  15: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1, 1, 1] },
  16: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1, 1, 1] },
  17: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1, 1, 1, 1] },
  18: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 1, 1, 1, 1] },
  19: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 2, 1, 1, 1] },
  20: { cantrips: 5, leveled: [4, 3, 3, 3, 2, 2, 2, 1, 1] },
};

/**
 * Generates a random set of spells for an NPC based on level and class.
 */
export function generateNpcSpells(level: number, className: string): any[] {
  const store = useStore.getState();
  const allSpells = store.spellsList;
  
  if (allSpells.length === 0) return [];

  const config = LEVEL_CONFIG[Math.min(20, Math.max(1, level))] || LEVEL_CONFIG[1];
  const npcSpells: any[] = [];
  
  const normalizedClass = className.toLowerCase();

  // Filter spells that this class can actually use
  const classSpells = allSpells.filter(spell => {
    const s = spell as any;
    return s.classes?.some((c: any) => c.name?.toLowerCase() === normalizedClass || c.toLowerCase?.() === normalizedClass);
  });

  if (classSpells.length === 0) {
    // If no specific class spells found (e.g. custom class), fallback to all spells filter by level
    const fallbackSpells = allSpells;
    
    // Pick cantrips
    const cantrips = fallbackSpells.filter(spell => {
      const s = spell as any;
      return s.level === 0 || s.level === '0';
    });
    npcSpells.push(...getRandomItems(cantrips, config.cantrips));
    
    // Pick leveled spells
    config.leveled.forEach((count, spellLvlIndex) => {
      const spellLevel = spellLvlIndex + 1;
      const leveledSpells = fallbackSpells.filter(spell => {
        const s = spell as any;
        return Number(s.level) === spellLevel;
      });
      npcSpells.push(...getRandomItems(leveledSpells, count));
    });
  } else {
    // Pick cantrips
    const cantrips = classSpells.filter(spell => {
      const s = spell as any;
      return s.level === 0 || s.level === '0';
    });
    npcSpells.push(...getRandomItems(cantrips, config.cantrips));
    
    // Pick leveled spells
    config.leveled.forEach((count, spellLvlIndex) => {
      const spellLevel = spellLvlIndex + 1;
      const leveledSpells = classSpells.filter(spell => {
        const s = spell as any;
        return Number(s.level) === spellLevel;
      });
      npcSpells.push(...getRandomItems(leveledSpells, count));
    });
  }

  return npcSpells.filter(Boolean);
}

function getRandomItems(array: any[], count: number): any[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Checks if a monster name suggests they are a magic user (Spellweaver)
 */
export function isMagicUser(monster: any): boolean {
  if (!monster) return false;
  
  // Explicit flag or property
  if (monster.is_magic_user || monster.spellcasting) return true;
  
  const name = (monster.name || "").toLowerCase();
  const magicKeywords = [
    'mage', 'wizard', 'sorcerer', 'druid', 'cleric', 'warlock', 
    'acolyte', 'priest', 'lich', 'shaman', 'witch', 'necromancer',
    'spellweaver', 'artificer', 'sage'
  ];
  
  return magicKeywords.some(keyword => name.includes(keyword));
}

/**
 * Inferred class for spell generation
 */
export function inferSpellClass(monster: any): string {
  const name = (monster.name || "").toLowerCase();
  if (name.includes('wizard') || name.includes('mage') || name.includes('lich')) return 'Wizard';
  if (name.includes('sorcerer')) return 'Sorcerer';
  if (name.includes('druid') || name.includes('shaman')) return 'Druid';
  if (name.includes('cleric') || name.includes('priest') || name.includes('acolyte')) return 'Cleric';
  if (name.includes('warlock')) return 'Warlock';
  if (name.includes('bard')) return 'Bard';
  if (name.includes('artificer')) return 'Artificer';
  if (name.includes('paladin')) return 'Paladin';
  if (name.includes('ranger')) return 'Ranger';
  
  return 'Wizard'; // Default fallback
}
