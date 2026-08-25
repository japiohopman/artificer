import { VisualIdentityResolution } from './types';

/**
 * Known template alias mapping to canonical item IDs.
 */
const TEMPLATE_ALIASES: Record<string, string> = {
  // Weapon & Ammunition aliases
  'crossbow_light': 'light_crossbow',
  'crossbow-light': 'light_crossbow',
  'light-crossbow': 'light_crossbow',
  'crossbow_heavy': 'heavy_crossbow',
  'crossbow-heavy': 'heavy_crossbow',
  'heavy-crossbow': 'heavy_crossbow',
  'light_hammer': 'light_hammer',
  'light-hammer': 'light_hammer',
  'crossbow_bolt': 'crossbow_bolt',
  'crossbow-bolt': 'crossbow_bolt',

  // Armor aliases
  'padded-armor': 'padded_armor',
  'padded': 'padded_armor',
  'leather-armor': 'leather_armor',
  'leather': 'leather_armor',
  'studded-leather-armor': 'studded_leather_armor',
  'studded-leather': 'studded_leather_armor',
  'studded_leather': 'studded_leather_armor',
  'hide-armor': 'hide_armor',
  'hide': 'hide_armor',
  'chain-shirt': 'chain_shirt',
  'scale-mail': 'scale_mail',
  'half-plate': 'half_plate',
  'ring-mail': 'ring_mail',
  'chain-mail': 'chain_mail',
  'splint-armor': 'splint_armor',
  'splint': 'splint_armor',
  'plate-armor': 'plate_armor',
  'plate': 'plate_armor',

  // Spellcasting focus & religious aliases
  'arcane-focus': 'arcane_focus',
  'component-pouch': 'component_pouch',
  'druidic-focus': 'druidic_focus',
  'holy-symbol': 'holy_symbol',
  'sprig-of-mistletoe': 'sprig_of_mistletoe',

  // Pack aliases
  'explorers-pack': 'explorers_pack',
  'dungeoneers-pack': 'dungeoneers_pack',
  'burglars-pack': 'burglars_pack',
  'diplomats-pack': 'diplomats_pack',
  'entertainers-pack': 'entertainers_pack',
  'priests-pack': 'priests_pack',
  'scholars-pack': 'scholars_pack',

  // Adventuring gear aliases
  'hempen-rope-50-ft': 'hempen_rope_50_ft',
  'rope-hempen-50-feet': 'hempen_rope_50_ft',
  'rope_hempen_50_feet': 'hempen_rope_50_ft',
  'rope_silk_50_feet': 'hempen_rope_50_ft',
  'rope-silk-50-feet': 'hempen_rope_50_ft',
  'hempen_rope_50_ft': 'hempen_rope_50_ft',
  'rope': 'hempen_rope_50_ft',
  'rations-1-day': 'rations',
  'rations_1_day': 'rations',
  'mess-kit': 'mess_kit',
  'ball-bearings-bag-of-1000': 'ball_bearings',
  'ball_bearings_bag_of_1000': 'ball_bearings',
  'string-10-feet': 'string',
  'string_10_feet': 'string',
  'case-for-maps-and-scrolls': 'map_case',
  'case_for_maps_and_scrolls': 'map_case',

  // Tool aliases
  'thieves-tools': 'thieves_tools',
  'disguise-kit': 'disguise_kit',
  'forgery-kit': 'forgery_kit',
  'herbalism-kit': 'herbalism_kit',
  'navigators-tools': 'navigators_tools',
  'poisoners-kit': 'poisoners_kit',
  'alchemists-supplies': 'alchemists_supplies',
  'playing-card-set': 'playing_card_set',
  'dice-set': 'dice_set',

  // Clothes & Personal item aliases
  'clothes-travelers': 'travelers_clothes',
  'clothes_travelers': 'travelers_clothes',
  'travelers-clothes': 'travelers_clothes',
  'clothes-fine': 'fine_clothes',
  'clothes_fine': 'fine_clothes',
  'fine-clothes': 'fine_clothes',
  'clothes-costume': 'costume',
  'clothes_costume': 'costume',
  'parchment-one-sheet': 'parchment',
  'parchment_one_sheet': 'parchment',
  'paper-one-sheet': 'paper',
  'paper_one_sheet': 'paper',
  'ink-1-ounce-bottle': 'ink',
  'ink_1_ounce_bottle': 'ink',
  'ink-pen': 'ink_pen',
  'book-of-lore': 'book_of_lore',
  'little-bag-of-sand': 'little_bag_of_sand',
  'little_bag_of_sand': 'little_bag_of_sand',
  'knife-small': 'knife_small',
  'knife_small': 'knife_small',
  'scale-merchants': 'scale_merchants',
  'scale_merchants': 'scale_merchants',
};

/**
 * Explicit registry of items with distinct 2014 vs 2024 visual identity requirements.
 */
const RULESET_SPECIFIC_VISUALS = new Set<string>([]);

/**
 * Extract canonical template key from raw string input or item object.
 */
export function normalizeCanonicalId(itemInput: string | { template?: string; index?: string; id?: string; name?: string }): string {
  let raw = '';
  if (typeof itemInput === 'string') {
    raw = itemInput;
  } else if (itemInput && typeof itemInput === 'object') {
    raw = itemInput.template || itemInput.index || itemInput.id || itemInput.name || '';
  }

  if (!raw) return 'unknown_item';

  let clean = raw.toLowerCase().trim();
  clean = clean.split('/').pop() || clean;
  clean = clean.replace(/\.json$/, '').replace(/\.webp$/, '');

  if (TEMPLATE_ALIASES[clean]) {
    return TEMPLATE_ALIASES[clean];
  }

  const underscore = clean.replace(/-/g, '_');
  if (TEMPLATE_ALIASES[underscore]) {
    return TEMPLATE_ALIASES[underscore];
  }

  return underscore;
}

/**
 * Resolves any item reference into a canonical VisualIdentity string (e.g., `equipment.longsword`).
 */
export function resolveVisualIdentity(
  itemInput: string | { template?: string; index?: string; id?: string; name?: string },
  ruleset?: '2014' | '2024'
): string {
  const canonicalId = normalizeCanonicalId(itemInput);

  const isCustomRuleset = ruleset && RULESET_SPECIFIC_VISUALS.has(`${canonicalId}_${ruleset}`);
  const visualKey = isCustomRuleset ? `${canonicalId}_${ruleset}` : canonicalId;

  return `equipment.${visualKey}`;
}

/**
 * Detailed resolution helper returning metadata.
 */
export function resolveVisualIdentityDetails(
  itemInput: string | { template?: string; index?: string; id?: string; name?: string },
  ruleset?: '2014' | '2024'
): VisualIdentityResolution {
  const canonicalId = normalizeCanonicalId(itemInput);
  const visualId = resolveVisualIdentity(itemInput, ruleset);
  const isCustomRulesetVisual = visualId.endsWith('_2014') || visualId.endsWith('_2024');

  return {
    visualId,
    canonicalId,
    isCustomRulesetVisual,
  };
}
