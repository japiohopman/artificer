/**
 * monsterFeatureResolver.ts
 *
 * Resolves Foundry VTT / raw compendium action & trait placeholders into clean,
 * human-readable D&D 5e SRD formatted descriptions.
 */

interface DamageType {
  index: string;
  name: string;
}

interface DamageEntry {
  damage_type?: DamageType | string;
  damage_dice?: string;
}

interface Action {
  name: string;
  desc?: string;
  attack_bonus?: number;
  damage?: DamageEntry[];
  dc?: {
    dc_type?: { index: string; name: string };
    dc_value?: number;
  };
}

/**
 * Calculates the average of a dice notation (e.g., "2d6+5" -> 12).
 */
export function calculateDiceAverage(diceStr: string): number {
  if (!diceStr) return 0;
  // Clean string and match e.g. "2d6+5" or "1d8" or "2d4-1"
  const clean = diceStr.toLowerCase().replace(/\s+/g, '');
  const match = clean.match(/^(\d+)d(\d+)([-+]\d+)?/);
  if (!match) {
    const num = parseInt(clean, 10);
    return isNaN(num) ? 0 : num;
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  // Average of a single die is (sides + 1) / 2
  const averageSingle = (sides + 1) / 2;
  return Math.floor(count * averageSingle + modifier);
}

/**
 * Derives a DC value dynamically based on monster stats and specified ability key.
 */
export function calculateDynamicDC(monster: any, abilityKey: string): number {
  const prof = monster.proficiency_bonus !== undefined ? monster.proficiency_bonus : 2;

  // Map shorthand ability keys
  const keyMap: Record<string, string> = {
    str: 'strength',
    dex: 'dexterity',
    con: 'constitution',
    int: 'intelligence',
    wis: 'wisdom',
    cha: 'charisma',
    strength: 'strength',
    dexterity: 'dexterity',
    constitution: 'constitution',
    intelligence: 'intelligence',
    wisdom: 'wisdom',
    charisma: 'charisma'
  };

  const mappedKey = keyMap[abilityKey.toLowerCase()] || 'strength';
  const score = monster[mappedKey] !== undefined
    ? monster[mappedKey]
    : (monster.stats?.[abilityKey.toLowerCase().slice(0, 3)] || 10);

  const modifier = Math.floor((score - 10) / 2);
  return 8 + prof + modifier;
}

/**
 * Parses and resolves raw action/trait texts containing dynamic Foundry VTT placeholders.
 */
export function resolveMonsterText(monster: any, item: Action | any, text: string): string {
  if (!text) return '';

  let resolved = text;

  // 1. Resolve @UUID and /item links first to get clean plain-text names
  // e.g., @UUID[Compendium.dnd5e.spells.phbsplWallofIce0]{Wall of Ice} -> Wall of Ice
  resolved = resolved.replace(/@UUID\[.*?\]\{(.*?)\}/g, '$1');

  // e.g., [[/item .DV4KS0OE541vGOtI]]{bite} -> bite
  resolved = resolved.replace(/\[\[\/item\s+.*?\]\}\{(.*?)\}/g, '$1');
  resolved = resolved.replace(/\[\[\/item\s+.*?\]\s*\]\{(.*?)\}/g, '$1');
  resolved = resolved.replace(/\[\[\/item\s+.*?\]\}\s*([a-zA-Z0-9_]+)/g, '$1');
  resolved = resolved.replace(/\[\[\/item\s+.*?\]\]\{(.*?)\}/g, '$1');

  // 2. Resolve [[lookup @name lowercase]] and similar name references
  const monsterName = monster?.name || 'the creature';
  resolved = resolved.replace(/\[\[lookup\s+@name\s+lowercase\]\]/gi, monsterName.toLowerCase());
  resolved = resolved.replace(/\[\[lookup\s+@name\]\]/gi, monsterName);
  resolved = resolved.replace(/\{monster\}/gi, ''); // clean up any {monster} suffix leftovers

  // 3. Resolve condition references &reference[incapacitated apply=false] -> incapacitated
  resolved = resolved.replace(/&reference\[([a-zA-Z0-9_\s-]+)(?:\s+[^\]]*)?\]/g, '$1');

  // 4. Resolve Dynamic DCs
  // e.g., [[lookup @abilities.int.dc]] -> calculate dynamic DC based on Intelligence
  resolved = resolved.replace(/\[\[lookup\s+@abilities\.([a-zA-Z]{3,4})\.dc\]\]/gi, (_, ability) => {
    return String(calculateDynamicDC(monster, ability));
  });

  // 5. Replace generic ranges/durations lookup with elegant fallbacks
  // e.g., [[lookup @labels.description.range activity=epHS9JFnK0K3AOh0]] -> 120 feet
  resolved = resolved.replace(/\[\[lookup\s+@labels\.description\.range(?:\s+[^\]]*)?\]\]/gi, '120 feet');
  resolved = resolved.replace(/\[\[lookup\s+@labels\.duration(?:\s+[^\]]*)?\]\]/gi, '1 minute');

  // 6. Resolve generic [[/save]] or saving throws
  // e.g., [[/save]] or [[/save activity=qJljbNLNFhF1xbDV]]
  const actionDC = item?.dc?.dc_value;
  const dcTypeStr = item?.dc?.dc_type?.name || item?.dc?.dc_type?.index || 'Constitution';
  const displayDC = actionDC !== undefined ? actionDC : (monster ? calculateDynamicDC(monster, 'con') : 13);

  resolved = resolved.replace(/\[\[\/save(?:\s+[^\]]*)?\]\]/gi, `DC ${displayDC}`);

  // 7. Resolve Attack/Damage Extended headers
  // e.g., [[/attack extended]] -> Melee Weapon Attack: +10 to hit, reach 5 ft., one target.
  const isRanged = item?.name?.toLowerCase().includes('bow') || item?.name?.toLowerCase().includes('ray') || item?.name?.toLowerCase().includes('bolt');
  const attackBonus = item?.attack_bonus !== undefined ? item?.attack_bonus : 5;
  const attackSign = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;

  const formattedAttack = isRanged
    ? `*Ranged Weapon Attack:* ${attackSign} to hit, range 60/240 ft., one target.`
    : `*Melee Weapon Attack:* ${attackSign} to hit, reach 5 ft., one target.`;

  resolved = resolved.replace(/\[\[\/attack\s+extended\]\]\.?\s*/gi, formattedAttack + ' ');
  resolved = resolved.replace(/\[\[\/attack(?:\s+[^\]]*)?\]\]\.?\s*/gi, formattedAttack + ' ');

  // e.g., [[/damage extended]] or [[/damage average]] -> Hit: 12 (2d6 + 5) piercing damage
  resolved = resolved.replace(/\[\[\/damage\s+extended\]\]\.?\s*/gi, () => {
    if (item?.damage && item.damage.length > 0) {
      const parts = item.damage.map((d: any) => {
        const dice = d.damage_dice || '1d6';
        const average = calculateDiceAverage(dice);
        const type = typeof d.damage_type === 'string'
          ? d.damage_type
          : (d.damage_type?.name || d.damage_type?.index || 'slashing');
        return `${average} (${dice.replace(/\+/g, ' + ').replace(/-/g, ' - ')}) ${type} damage`;
      });
      return `*Hit:* ${parts.join(' plus ')}. `;
    }
    return `*Hit:* 7 (1d6 + 4) slashing damage. `;
  });

  resolved = resolved.replace(/\[\[\/damage(?:\s+[^\]]*)?\]\]\.?\s*/gi, () => {
    if (item?.damage && item.damage.length > 0) {
      const dice = item.damage[0].damage_dice || '1d6';
      const average = calculateDiceAverage(dice);
      return `${average} (${dice}). `;
    }
    return `7 (1d6+4). `;
  });

  // Clean up any remaining double-brackets we missed
  resolved = resolved.replace(/\[\[(.*?)\]\]/g, '$1');

  // Trim extra spaces and format clean sentences
  return resolved.replace(/\s+/g, ' ').trim();
}
