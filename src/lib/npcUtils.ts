export interface NPCData {
  id: string;
  name: string;
  gender: 'male' | 'female' | string;
  species: string;
  classJob: string;
  imageUrl?: string;
}

const NPC_MATRIX_ASSETS = [
  'female_alchemist_lightfoot_halfling_matrix.webp',
  'female_artificer_dragonborn_matrix.webp',
  'female_blacksmith_high_elf_matrix.webp',
  'female_blacksmith_owlin_matrix.webp',
  'female_cleric_goliath_obaya_matrix.webp',
  'female_cleric_human_matrix.webp',
  'female_commoner_drow_matrix.webp',
  'female_commoner_firbolg_matrix.webp',
  'female_commoner_mountain_dwarf_matrix.webp',
  'female_fighter_mountain_dwarf_matrix.webp',
  'female_lord_moon_elf_matrix.webp',
  'female_mage_human_matrix.webp',
  'female_mage_tiefling_matrix.webp',
  'female_mercenary_tortle_matrix.webp',
  'female_queen_drow_matrix.webp',
  'female_ranger_high_elf_matrix.webp',
  'female_rogue_mountain_dwarf_matrix.webp',
  'female_sorcerer_human_matrix.webp',
  'female_wizard_highelf_laeral_matrix.webp',
  'male_bard_mountain_dwarf_matrix.webp',
  'male_blacksmith_dragonborn_matrix.webp',
  'male_blacksmith_dwarf_thrak_matrix.webp',
  'male_blacksmith_mountain_dwarf_matrix.webp',
  'male_captain_moon_elf_matrix.webp',
  'male_captain_water_genasi_matrix.webp',
  'male_commoner_drow_matrix.webp',
  'male_fighter_human_matrix.webp',
  'male_fighter_mountain_dwarf_matrix.webp',
  'male_fighter_tabaxi_matrix.webp',
  'male_innkeeper_half-orc_matrix.webp',
  'male_innkeeper_human_durnan_matrix.webp',
  'male_king_yuan-ti_matrix.webp',
  'male_lord_moon_elf_matrix.webp',
  'male_mage_mountain_dwarf_matrix.webp',
  'male_merchant_human_matrix.webp',
  'male_merchant_human_mirt_matrix.webp',
  'male_paladin_high_elf_matrix.webp'
];

/**
 * Resolves the best-fitting emotion matrix for an NPC based on their metadata.
 * Uses a keyword-scoring system to map specific NPCs to generic shared assets.
 */
export function resolveNPCMatrix(npc: NPCData): string {
  if (npc.imageUrl && npc.imageUrl.includes('_matrix')) return npc.imageUrl;

  const gender = npc.gender?.toLowerCase() || 'male';
  const species = npc.species?.toLowerCase() || 'human';
  const role = npc.classJob?.toLowerCase() || 'commoner';
  
  const npcKeywords = [
    gender,
    ...species.split(/[ \-_]/),
    ...role.split(/[ \-_]/),
    ...npc.name.toLowerCase().split(/[ \-_]/)
  ].filter(k => k.length > 2);

  // Synonyms/Mapping
  const roleMap: Record<string, string[]> = {
    'merchant': ['shopkeeper', 'trader', 'vendor', 'dealer', 'mirt'],
    'innkeeper': ['tavern', 'bartender', 'durnan'],
    'mage': ['wizard', 'sorcerer', 'warlock', 'cleric', 'priest', 'acolyte', 'laeral'],
    'fighter': ['guard', 'soldier', 'warrior', 'knight', 'captain', 'mercenary'],
    'commoner': ['villager', 'peasant', 'citizen']
  };

  let bestMatrix = gender === 'female' ? 'female_cleric_human_matrix.webp' : 'male_merchant_human_matrix.webp';
  let highestScore = -1;

  for (const filename of NPC_MATRIX_ASSETS) {
    let score = 0;
    const fileLower = filename.toLowerCase();

    // Gender is a hard filter for better aesthetics
    if (!fileLower.startsWith(gender)) {
       score -= 50; 
    } else {
       score += 10;
    }

    // Role Match
    for (const [key, synonyms] of Object.entries(roleMap)) {
      if (role.includes(key) || synonyms.some(s => role.includes(s))) {
        if (fileLower.includes(key) || synonyms.some(s => fileLower.includes(s))) {
          score += 20;
        }
      }
    }

    // Direct keyword matching
    for (const keyword of npcKeywords) {
      if (fileLower.includes(keyword)) {
        score += 15;
      }
    }

    // Species weight
    if (fileLower.includes(species)) {
      score += 25;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatrix = filename;
    }
  }

  return `/assets/atlas/characters/npc/images/${bestMatrix}`;
}
