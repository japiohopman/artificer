import { AssetCategory } from './types';

/**
 * Mapping of canonical item template keys (and aliases) to stable visual identities.
 * Example: 'longsword' -> 'equipment.longsword'
 */
const TEMPLATE_TO_VISUAL_MAP: Record<string, string> = {
  // --- STARTER WEAPONS 01 ---
  'dagger': 'equipment.dagger',
  'handaxe': 'equipment.handaxe',
  'javelin': 'equipment.javelin',
  'mace': 'equipment.mace',
  'quarterstaff': 'equipment.quarterstaff',
  'sickle': 'equipment.sickle',
  'club': 'equipment.club',
  'spear': 'equipment.spear',
  'shortsword': 'equipment.shortsword',
  'rapier': 'equipment.rapier',
  'longsword': 'equipment.longsword',
  'scimitar': 'equipment.scimitar',
  'greatsword': 'equipment.greatsword',
  'greataxe': 'equipment.greataxe',
  'greatclub': 'equipment.greatclub',
  'light-hammer': 'equipment.light_hammer',
  'light_hammer': 'equipment.light_hammer',

  // --- STARTER WEAPONS 02 ---
  'shortbow': 'equipment.shortbow',
  'longbow': 'equipment.longbow',
  'light-crossbow': 'equipment.light_crossbow',
  'light_crossbow': 'equipment.light_crossbow',
  'crossbow-light': 'equipment.light_crossbow',
  'crossbow_light': 'equipment.light_crossbow',
  'heavy-crossbow': 'equipment.heavy_crossbow',
  'heavy_crossbow': 'equipment.heavy_crossbow',
  'crossbow-heavy': 'equipment.heavy_crossbow',
  'crossbow_heavy': 'equipment.heavy_crossbow',
  'sling': 'equipment.sling',
  'dart': 'equipment.dart',
  'blowgun': 'equipment.blowgun',
  'trident': 'equipment.trident',
  'warhammer': 'equipment.warhammer',
  'battleaxe': 'equipment.battleaxe',
  'flail': 'equipment.flail',
  'maul': 'equipment.maul',
  'morningstar': 'equipment.morningstar',
  'pike': 'equipment.pike',
  'halberd': 'equipment.halberd',
  'glaive': 'equipment.glaive',
  'arrow': 'equipment.arrow',
  'crossbow-bolt': 'equipment.crossbow_bolt',
  'crossbow_bolt': 'equipment.crossbow_bolt',

  // --- STARTER SPELLCASTING 01 ---
  'arcane-focus': 'equipment.arcane_focus',
  'arcane_focus': 'equipment.arcane_focus',
  'component-pouch': 'equipment.component_pouch',
  'component_pouch': 'equipment.component_pouch',
  'druidic-focus': 'equipment.druidic_focus',
  'druidic_focus': 'equipment.druidic_focus',
  'holy-symbol': 'equipment.holy_symbol',
  'holy_symbol': 'equipment.holy_symbol',
  'crystal': 'equipment.crystal',
  'orb': 'equipment.orb',
  'rod': 'equipment.rod',
  'staff': 'equipment.staff',
  'wand': 'equipment.wand',
  'spellbook': 'equipment.spellbook',
  'amulet': 'equipment.amulet',
  'reliquary': 'equipment.reliquary',
  'emblem': 'equipment.emblem',
  'sprig-of-mistletoe': 'equipment.sprig_of_mistletoe',
  'sprig_of_mistletoe': 'equipment.sprig_of_mistletoe',
  'totem': 'equipment.totem',

  // --- STARTER ARMOR 01 ---
  'padded': 'equipment.padded_armor',
  'padded-armor': 'equipment.padded_armor',
  'padded_armor': 'equipment.padded_armor',
  'leather': 'equipment.leather_armor',
  'leather-armor': 'equipment.leather_armor',
  'leather_armor': 'equipment.leather_armor',
  'studded-leather': 'equipment.studded_leather_armor',
  'studded-leather-armor': 'equipment.studded_leather_armor',
  'studded_leather_armor': 'equipment.studded_leather_armor',
  'hide': 'equipment.hide_armor',
  'hide-armor': 'equipment.hide_armor',
  'hide_armor': 'equipment.hide_armor',
  'chain-shirt': 'equipment.chain_shirt',
  'chain_shirt': 'equipment.chain_shirt',
  'scale-mail': 'equipment.scale_mail',
  'scale_mail': 'equipment.scale_mail',
  'breastplate': 'equipment.breastplate',
  'half-plate': 'equipment.half_plate',
  'half_plate': 'equipment.half_plate',
  'ring-mail': 'equipment.ring_mail',
  'ring_mail': 'equipment.ring_mail',
  'chain-mail': 'equipment.chain_mail',
  'chain_mail': 'equipment.chain_mail',
  'splint': 'equipment.splint_armor',
  'splint-armor': 'equipment.splint_armor',
  'splint_armor': 'equipment.splint_armor',
  'plate': 'equipment.plate_armor',
  'plate-armor': 'equipment.plate_armor',
  'plate_armor': 'equipment.plate_armor',
  'shield': 'equipment.shield',

  // --- STARTER ADVENTURING 01 (PACKS & CONTENTS) ---
  'explorers-pack': 'equipment.explorers_pack',
  'explorers_pack': 'equipment.explorers_pack',
  'dungeoneers-pack': 'equipment.dungeoneers_pack',
  'dungeoneers_pack': 'equipment.dungeoneers_pack',
  'burglars-pack': 'equipment.burglars_pack',
  'burglars_pack': 'equipment.burglars_pack',
  'diplomats-pack': 'equipment.diplomats_pack',
  'diplomats_pack': 'equipment.diplomats_pack',
  'entertainers-pack': 'equipment.entertainers_pack',
  'entertainers_pack': 'equipment.entertainers_pack',
  'priests-pack': 'equipment.priests_pack',
  'priests_pack': 'equipment.priests_pack',
  'scholars-pack': 'equipment.scholars_pack',
  'scholars_pack': 'equipment.scholars_pack',

  'backpack': 'equipment.backpack',
  'bedroll': 'equipment.bedroll',
  'hempen-rope-50-ft': 'equipment.rope_hempen_50',
  'hempen_rope_50_ft': 'equipment.rope_hempen_50',
  'rope-hempen-50-feet': 'equipment.rope_hempen_50',
  'rope': 'equipment.rope_hempen_50',
  'rations': 'equipment.rations',
  'rations-1-day': 'equipment.rations',
  'torch': 'equipment.torch',
  'tinderbox': 'equipment.tinderbox',
  'waterskin': 'equipment.waterskin',
  'mess-kit': 'equipment.mess_kit',
  'mess_kit': 'equipment.mess_kit',
  'crowbar': 'equipment.crowbar',
  'hammer': 'equipment.hammer',
  'piton': 'equipment.piton',

  // --- STARTER TOOLS 01 ---
  'thieves-tools': 'equipment.thieves_tools',
  'thieves_tools': 'equipment.thieves_tools',
  'disguise-kit': 'equipment.disguise_kit',
  'disguise_kit': 'equipment.disguise_kit',
  'herbalism-kit': 'equipment.herbalism_kit',
  'herbalism_kit': 'equipment.herbalism_kit',
  'artisans-tools': 'equipment.artisans_tools',
  'artisans_tools': 'equipment.artisans_tools',
  'alchemists-supplies': 'equipment.alchemists_supplies',
  'brewers-supplies': 'equipment.brewers_supplies',
  'calligraphers-supplies': 'equipment.calligraphers_supplies',
  'carpenters-tools': 'equipment.carpenters_tools',
  'cartographers-tools': 'equipment.cartographers_tools',
  'cobblers-tools': 'equipment.cobblers_tools',
  'cooks-utensils': 'equipment.cooks_utensils',
  'glassblowers-tools': 'equipment.glassblowers_tools',
  'jewelers-tools': 'equipment.jewelers_tools',
  'leatherworkers-tools': 'equipment.leatherworkers_tools',
  'masons-tools': 'equipment.masons_tools',
  'painters-supplies': 'equipment.painters_supplies',
  'potters-tools': 'equipment.potters_tools',
  'smiths-tools': 'equipment.smiths_tools',
  'tinkers-tools': 'equipment.tinkers_tools',
  'weavers-tools': 'equipment.weavers_tools',
  'woodcarvers-tools': 'equipment.woodcarvers_tools',
  'navigators-tools': 'equipment.navigators_tools',
  'poisoners-kit': 'equipment.poisoners_kit',
  'musical-instrument': 'equipment.musical_instrument',
  'lute': 'equipment.lute',
  'flute': 'equipment.flute',
  'lyre': 'equipment.lyre',
  'horn': 'equipment.horn',
  'viol': 'equipment.viol',
  'drum': 'equipment.drum',
  'bagpipes': 'equipment.bagpipes',
  'pan-flute': 'equipment.pan_flute',
  'shawm': 'equipment.shawm',
  'dulcimer': 'equipment.dulcimer',
  'gaming-set': 'equipment.gaming_set',
  'dice-set': 'equipment.dice_set',
  'playing-card-set': 'equipment.playing_card_set',

  // --- STARTER PERSONAL / ROLEPLAY 01 ---
  'clothes-common': 'equipment.clothes_common',
  'clothes_common': 'equipment.clothes_common',
  'common-clothes': 'equipment.clothes_common',
  'clothes-fine': 'equipment.clothes_fine',
  'clothes_fine': 'equipment.clothes_fine',
  'fine-clothes': 'equipment.clothes_fine',
  'clothes-travelers': 'equipment.clothes_travelers',
  'clothes_travelers': 'equipment.clothes_travelers',
  'travelers-clothes': 'equipment.clothes_travelers',
  'clothes-costume': 'equipment.costume',
  'costume': 'equipment.costume',
  'pouch': 'equipment.pouch',
  'chest': 'equipment.chest',
  'candle': 'equipment.candle',
  'lantern-hooded': 'equipment.lantern_hooded',
  'lantern_hooded': 'equipment.lantern_hooded',
  'oil-flask': 'equipment.oil_flask',
  'oil_flask': 'equipment.oil_flask',
  'flask-of-oil': 'equipment.oil_flask',
  'blanket': 'equipment.blanket',
  'ink-1-ounce-bottle': 'equipment.ink_bottle',
  'ink-pen': 'equipment.ink_pen',
  'paper-one-sheet': 'equipment.paper_sheet',
  'parchment-one-sheet': 'equipment.parchment_sheet',
  'book-of-lore': 'equipment.book_lore',
  'book': 'equipment.book_lore',
  'tome': 'equipment.book_lore',

  // --- POTIONS & CONSUMABLES ---
  'potion-of-healing': 'equipment.potion_healing',
  'potion_of_healing': 'equipment.potion_healing',
  'healing-potion': 'equipment.potion_healing',
  'antitoxin': 'equipment.antitoxin',

  // --- SPECIALIZED / TRADE GOODS ---
  'gold-piece': 'equipment.coin_gold',
  'gp': 'equipment.coin_gold',
  'silver-piece': 'equipment.coin_silver',
  'sp': 'equipment.coin_silver',
  'copper-piece': 'equipment.coin_copper',
  'cp': 'equipment.coin_copper',
};

/**
 * Resolves a game item, template ID, or item reference into a canonical visual identity string.
 *
 * Flow:
 * Canonical Item -> Visual Identity -> Sprite Manifest Cell -> Renderer
 *
 * @param itemInput Template string (e.g. 'longsword', '2014/longsword') or item object
 * @param options Optional context parameters (ruleset variant overrides)
 */
export function resolveVisualIdentity(
  itemInput: string | { template?: string; index?: string; id?: string },
  options?: { ruleset?: '2014' | '2024' }
): string {
  let rawKey = '';
  if (typeof itemInput === 'string') {
    rawKey = itemInput;
  } else if (itemInput) {
    rawKey = itemInput.template || itemInput.index || itemInput.id || '';
  }

  if (!rawKey) {
    return 'equipment.unknown';
  }

  // Normalize path segments (e.g. '/assets/atlas/equipment/json/14/longsword.json' or '2014/longsword')
  const cleanKey = rawKey
    .toLowerCase()
    .split('/')
    .pop()
    ?.replace('.json', '')
    .trim() || '';

  // Check explicit ruleset variants if defined (only when visual representation differs)
  if (options?.ruleset) {
    const rulesetKey = `${cleanKey}_${options.ruleset}`;
    if (TEMPLATE_TO_VISUAL_MAP[rulesetKey]) {
      return TEMPLATE_TO_VISUAL_MAP[rulesetKey];
    }
  }

  // Check direct lookup
  if (TEMPLATE_TO_VISUAL_MAP[cleanKey]) {
    return TEMPLATE_TO_VISUAL_MAP[cleanKey];
  }

  // Normalize hyphens/underscores fallback
  const hyphenKey = cleanKey.replace(/_/g, '-');
  if (TEMPLATE_TO_VISUAL_MAP[hyphenKey]) {
    return TEMPLATE_TO_VISUAL_MAP[hyphenKey];
  }

  const underscoreKey = cleanKey.replace(/-/g, '_');
  if (TEMPLATE_TO_VISUAL_MAP[underscoreKey]) {
    return TEMPLATE_TO_VISUAL_MAP[underscoreKey];
  }

  // Generic prefix fallback formatting (e.g., 'shortsword' -> 'equipment.shortsword')
  const formattedName = cleanKey.replace(/[-]/g, '_');
  return `equipment.${formattedName}`;
}

/**
 * Derives the canonical asset category for a visual identity.
 */
export function getCategoryForVisual(visualId: string): AssetCategory {
  if (visualId.includes('.explorers_pack') || visualId.includes('.dungeoneers_pack') ||
      visualId.includes('.burglars_pack') || visualId.includes('.diplomats_pack') ||
      visualId.includes('.entertainers_pack') || visualId.includes('.priests_pack') ||
      visualId.includes('.scholars_pack')) {
    return 'pack';
  }
  if (visualId.includes('sword') || visualId.includes('axe') || visualId.includes('dagger') ||
      visualId.includes('bow') || visualId.includes('hammer') || visualId.includes('staff') ||
      visualId.includes('spear') || visualId.includes('mace') || visualId.includes('javelin') ||
      visualId.includes('crossbow') || visualId.includes('arrow') || visualId.includes('bolt') ||
      visualId.includes('scimitar') || visualId.includes('rapier') || visualId.includes('flail') ||
      visualId.includes('glaive') || visualId.includes('halberd') || visualId.includes('pike')) {
    return 'weapon';
  }
  if (visualId.includes('armor') || visualId.includes('shield') || visualId.includes('mail') ||
      visualId.includes('breastplate') || visualId.includes('leather') || visualId.includes('hide')) {
    return 'armor';
  }
  if (visualId.includes('focus') || visualId.includes('holy') || visualId.includes('spellbook') ||
      visualId.includes('symbol') || visualId.includes('crystal') || visualId.includes('orb') ||
      visualId.includes('amulet') || visualId.includes('reliquary')) {
    return 'spellcasting';
  }
  if (visualId.includes('tools') || visualId.includes('supplies') || visualId.includes('kit') ||
      visualId.includes('lute') || visualId.includes('flute') || visualId.includes('instrument')) {
    return 'tool';
  }
  if (visualId.includes('potion') || visualId.includes('antitoxin')) {
    return 'potion';
  }
  if (visualId.includes('ring')) {
    return 'ring';
  }
  if (visualId.includes('scroll')) {
    return 'scroll';
  }
  if (visualId.includes('clothes') || visualId.includes('costume') || visualId.includes('pouch') ||
      visualId.includes('book') || visualId.includes('lantern') || visualId.includes('ink')) {
    return 'personal';
  }
  if (visualId.includes('backpack') || visualId.includes('chest')) {
    return 'container';
  }
  return 'adventuring_gear';
}
