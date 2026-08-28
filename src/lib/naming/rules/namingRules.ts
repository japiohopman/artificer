/**
 * Naming Rule Models & Profile Resolver
 * Defines species-specific naming rules and resolves structured NamingContext into NamingProfile.
 */

import { NamingContext, NamingProfileRef, NamingDomainError, NameComponentType, CultureStatus } from '../types';
import { SOURCE_NAMING_DATA } from '../data/sourceData';

export interface ComponentRule {
  type: NameComponentType;
  required: boolean;
  poolSource: string; // Identifier to data pool, e.g. "tiefling.genderGiven", "human.illuskan.maleGiven"
  isOptional?: boolean;
}

export interface NamingRule {
  id: string;
  species: string;
  subrace?: string;
  culture?: string;
  tradition: string;
  description: string;
  componentRules: ComponentRule[];
  compositionPattern: string; // e.g. "{given} {family}", "{clan} {given}", "{surname} {given}"
  matchesContext: (ctx: NamingContext) => boolean;
  scoreMatch: (ctx: NamingContext) => number;
}

export function normalizeSpeciesKey(species?: string): string {
  if (!species) return 'unknown';
  const clean = species.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (clean.includes('tiefling')) return 'tiefling';
  if (clean.includes('gnome')) return 'gnome';
  if (clean.includes('dragonborn')) return 'dragonborn';
  if (clean.includes('elf') && !clean.includes('half')) return 'elf';
  if (clean.includes('dwarf')) return 'dwarf';
  if (clean.includes('halfling')) return 'halfling';
  if (clean.includes('halfelf') || (clean.includes('half') && clean.includes('elf'))) return 'halfElf';
  if (clean.includes('halforc') || (clean.includes('half') && clean.includes('orc'))) return 'halfOrc';
  if (clean.includes('human')) return 'human';
  return clean;
}

export interface HumanCultureResolution {
  key: string;
  status: CultureStatus;
}

export function resolveHumanCulture(culture?: string): HumanCultureResolution {
  if (!culture || culture.trim().length === 0) {
    return { key: 'neutral', status: 'missing' };
  }
  const clean = culture.trim().toLowerCase();
  if (clean.includes('calish')) return { key: 'calishite', status: 'known' };
  if (clean.includes('chondath')) return { key: 'chondathan', status: 'known' };
  if (clean.includes('damar')) return { key: 'damaran', status: 'known' };
  if (clean.includes('illusk')) return { key: 'illuskan', status: 'known' };
  if (clean.includes('mulan')) return { key: 'mulan', status: 'known' };
  if (clean.includes('rashem')) return { key: 'rashemi', status: 'known' };
  if (clean.includes('shou')) return { key: 'shou', status: 'known' };
  if (clean.includes('tethyr')) return { key: 'tethyrian', status: 'known' };
  if (clean.includes('turam')) return { key: 'turami', status: 'known' };
  if (clean === 'neutral') return { key: 'neutral', status: 'known' };

  // Unrecognized culture name -> explicit 'unknown' status, map to neutral pool without identity corruption
  return { key: 'neutral', status: 'unknown' };
}

/**
 * Catalog of built-in data-driven rules for all source species.
 */
export const BUILTIN_NAMING_RULES: NamingRule[] = [
  // 1. Tiefling - Infernal (Male/Female)
  {
    id: 'tiefling_infernal',
    species: 'tiefling',
    tradition: 'Infernal Heritage',
    description: 'Traditional Infernal-derived given name passed down through fiendish lineage.',
    compositionPattern: '{given}',
    componentRules: [
      {
        type: 'given',
        required: true,
        poolSource: 'tiefling.genderGiven'
      }
    ],
    matchesContext: (ctx) => {
      const sp = normalizeSpeciesKey(ctx.species);
      return sp === 'tiefling' && ctx.traditionStyle !== 'virtue';
    },
    scoreMatch: (ctx) => {
      let score = 10;
      if (ctx.traditionStyle === 'infernal') score += 5;
      return score;
    }
  },

  // 2. Tiefling - Virtue Name
  {
    id: 'tiefling_virtue',
    species: 'tiefling',
    tradition: 'Virtue Concept',
    description: 'A chosen concept or virtue adopted to embody a personal quest or destiny.',
    compositionPattern: '{virtue}',
    componentRules: [
      {
        type: 'virtue',
        required: true,
        poolSource: 'tiefling.virtueNames'
      }
    ],
    matchesContext: (ctx) => {
      const sp = normalizeSpeciesKey(ctx.species);
      return sp === 'tiefling' && ctx.traditionStyle === 'virtue';
    },
    scoreMatch: (ctx) => {
      let score = 10;
      if (ctx.traditionStyle === 'virtue') score += 10;
      return score;
    }
  },

  // 3. Gnome - 3-Part Personal + Clan + Nickname
  {
    id: 'gnome_traditional',
    species: 'gnome',
    tradition: 'Personal, Clan & Nickname',
    description: 'Gnome naming structure featuring a personal given name, clan name, and playful nickname.',
    compositionPattern: "{given} '{nickname}' {clan}",
    componentRules: [
      { type: 'given', required: true, poolSource: 'gnome.genderGiven' },
      { type: 'nickname', required: false, poolSource: 'gnome.nicknames', isOptional: true },
      { type: 'clan', required: true, poolSource: 'gnome.clanNames' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'gnome',
    scoreMatch: () => 10
  },

  // 4. Dragonborn - Clan First + Personal
  {
    id: 'dragonborn_honor',
    species: 'dragonborn',
    tradition: 'Clan First Honor',
    description: 'Dragonborn clan name placed first as a mark of honor, followed by personal given name.',
    compositionPattern: '{clan} {given}',
    componentRules: [
      { type: 'clan', required: true, poolSource: 'dragonborn.clanNames' },
      { type: 'given', required: true, poolSource: 'dragonborn.genderGiven' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'dragonborn',
    scoreMatch: (ctx) => (ctx.lifeStage === 'child' ? 5 : 10)
  },

  // 5. Dragonborn Childhood Name
  {
    id: 'dragonborn_childhood',
    species: 'dragonborn',
    tradition: 'Childhood Descriptive Name',
    description: 'Descriptive childhood term used among clutchmates.',
    compositionPattern: "{given} '{child}'",
    componentRules: [
      { type: 'given', required: true, poolSource: 'dragonborn.genderGiven' },
      { type: 'child', required: true, poolSource: 'dragonborn.childhoodNames' }
    ],
    matchesContext: (ctx) => {
      return normalizeSpeciesKey(ctx.species) === 'dragonborn' && ctx.lifeStage === 'child';
    },
    scoreMatch: (ctx) => (ctx.lifeStage === 'child' ? 15 : 2)
  },

  // 6. Elf Child
  {
    id: 'elf_child',
    species: 'elf',
    tradition: 'Elven Child Name',
    description: 'Childhood name used prior to declaring adulthood around the 100th birthday.',
    compositionPattern: '{child} {family}',
    componentRules: [
      { type: 'child', required: true, poolSource: 'elf.childGiven' },
      { type: 'family', required: true, poolSource: 'elf.familyNames' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'elf' && ctx.lifeStage === 'child',
    scoreMatch: (ctx) => (ctx.lifeStage === 'child' ? 15 : 2)
  },

  // 7. Elf Adult + Family Name
  {
    id: 'elf_adult',
    species: 'elf',
    tradition: 'Adult Elven Name & Family Lineage',
    description: 'Unique adult creation selected upon reaching adulthood alongside a combined family name.',
    compositionPattern: '{given} {family}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'elf.genderGiven' },
      { type: 'family', required: true, poolSource: 'elf.familyNames' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'elf' && ctx.lifeStage !== 'child',
    scoreMatch: (ctx) => (ctx.lifeStage !== 'child' ? 10 : 2)
  },

  // 8. Dwarf Personal + Clan Name
  {
    id: 'dwarf_clan',
    species: 'dwarf',
    tradition: 'Clan Elder Granted Name',
    description: 'Ancient dwarven name granted by a clan elder, belonging to the clan tradition.',
    compositionPattern: '{given} {clan}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'dwarf.genderGiven' },
      { type: 'clan', required: true, poolSource: 'dwarf.clanNames' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'dwarf',
    scoreMatch: () => 10
  },

  // 9. Halfling Given + Family Name
  {
    id: 'halfling_family',
    species: 'halfling',
    tradition: 'Halfling Given & Family Name',
    description: 'Given name with a persistent family nickname passed down generations.',
    compositionPattern: '{given} {family}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'halfling.genderGiven' },
      { type: 'family', required: true, poolSource: 'halfling.familyNames' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'halfling',
    scoreMatch: () => 10
  },

  // 10a. Half-Elf Delegated Naming - Elven Tradition
  {
    id: 'half_elf_elven',
    species: 'halfElf',
    tradition: 'Elven Heritage Delegation',
    description: 'Half-elves raised among elves adopting traditional Elven given and family names.',
    compositionPattern: '{given} {family}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'halfElf.elvenGiven' },
      { type: 'family', required: true, poolSource: 'halfElf.elvenFamily' }
    ],
    matchesContext: (ctx) => {
      if (normalizeSpeciesKey(ctx.species) !== 'halfElf') return false;
      const style = (ctx.traditionStyle || '').toLowerCase();
      const origin = (ctx.origin || '').toLowerCase();
      return style === 'elven' || origin.includes('elf') || origin.includes('elven');
    },
    scoreMatch: (ctx) => {
      const style = (ctx.traditionStyle || '').toLowerCase();
      const origin = (ctx.origin || '').toLowerCase();
      if (style === 'elven' || origin.includes('elf')) return 15;
      return 10;
    }
  },

  // 10b. Half-Elf Delegated Naming - Human Tradition
  {
    id: 'half_elf_human',
    species: 'halfElf',
    tradition: 'Human Heritage Delegation',
    description: 'Half-elves raised in human society adopting Human regional given and surnames.',
    compositionPattern: '{given} {surname}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'halfElf.humanGiven' },
      { type: 'surname', required: true, poolSource: 'halfElf.humanSurname' }
    ],
    matchesContext: (ctx) => {
      if (normalizeSpeciesKey(ctx.species) !== 'halfElf') return false;
      const style = (ctx.traditionStyle || '').toLowerCase();
      const origin = (ctx.origin || '').toLowerCase();
      return style === 'human' || origin.includes('human');
    },
    scoreMatch: (ctx) => {
      const style = (ctx.traditionStyle || '').toLowerCase();
      const origin = (ctx.origin || '').toLowerCase();
      if (style === 'human' || origin.includes('human')) return 15;
      return 10;
    }
  },

  // 10c. Half-Elf General / Default Dual Delegation
  {
    id: 'half_elf_delegated',
    species: 'halfElf',
    tradition: 'Cross-Cultural Delegation',
    description: 'Half-elves taking human or elven names based on environment or upbringing.',
    compositionPattern: '{given} {family}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'halfElf.delegatedGiven' },
      { type: 'family', required: true, poolSource: 'halfElf.delegatedFamily' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'halfElf',
    scoreMatch: () => 8 // Lower score than specific elven/human match
  },

  // 11. Half-Orc Orc/Human Naming
  {
    id: 'half_orc_traditional',
    species: 'halfOrc',
    tradition: 'Orc Guttural / Cultural Name',
    description: 'Guttural Orc given name or adapted human trade name.',
    compositionPattern: '{given}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'halfOrc.genderGiven' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'halfOrc',
    scoreMatch: () => 10
  },

  // 12a. Human Cultural Naming - Shou Tradition (Surname First)
  {
    id: 'human_shou',
    species: 'human',
    culture: 'shou',
    tradition: 'Shou Clan First Lineage',
    description: 'Shou cultural tradition placing family surname before given name.',
    compositionPattern: '{surname} {given}',
    componentRules: [
      { type: 'surname', required: true, poolSource: 'human.culturalSurname' },
      { type: 'given', required: true, poolSource: 'human.culturalGiven' }
    ],
    matchesContext: (ctx) => {
      if (normalizeSpeciesKey(ctx.species) !== 'human') return false;
      const cul = resolveHumanCulture(ctx.culture);
      return cul.key === 'shou';
    },
    scoreMatch: () => 15
  },

  // 12b. Human Cultural Naming - Standard Regional (Given + Surname)
  {
    id: 'human_cultural',
    species: 'human',
    tradition: 'Human Ethnic Regional Lineage',
    description: 'Names linked to regional human ethnicity and culture.',
    compositionPattern: '{given} {surname}',
    componentRules: [
      { type: 'given', required: true, poolSource: 'human.culturalGiven' },
      { type: 'surname', required: true, poolSource: 'human.culturalSurname' }
    ],
    matchesContext: (ctx) => normalizeSpeciesKey(ctx.species) === 'human',
    scoreMatch: (ctx) => {
      const cul = resolveHumanCulture(ctx.culture);
      if (cul.status === 'known') return 12;
      return 10;
    }
  }
];

export function resolveNamingProfile(ctx: NamingContext): {
  rule: NamingRule;
  profileRef: NamingProfileRef;
} {
  const speciesKey = normalizeSpeciesKey(ctx.species);

  // Filter matching rules
  const matchingRules = BUILTIN_NAMING_RULES.filter((rule) => rule.matchesContext(ctx));

  if (matchingRules.length === 0) {
    throw new NamingDomainError(
      'UNKNOWN_SPECIES',
      `No naming rule matched species context: '${ctx.species || 'unspecified'}'`,
      ctx
    );
  }

  // Sort by context match score descending
  matchingRules.sort((a, b) => b.scoreMatch(ctx) - a.scoreMatch(ctx));
  const bestRule = matchingRules[0];

  let cultureStatus: CultureStatus = 'missing';
  if (speciesKey === 'human') {
    cultureStatus = resolveHumanCulture(ctx.culture).status;
  }

  const profileRef: NamingProfileRef = {
    id: bestRule.id,
    species: ctx.species || speciesKey,
    subrace: ctx.subrace,
    culture: ctx.culture,
    cultureStatus,
    tradition: bestRule.tradition,
    description: bestRule.description
  };

  return { rule: bestRule, profileRef };
}

/**
 * Safely resolves gender pool selection without silent male-only defaults.
 * If gender is unspecified/non-binary, combines male and female pools or uses unisex pool.
 */
function resolveGenderPool(
  malePool: readonly string[] = [],
  femalePool: readonly string[] = [],
  unisexPool?: readonly string[],
  gender?: string
): readonly string[] {
  const g = (gender || 'unspecified').trim().toLowerCase();

  if (g === 'female') return femalePool.length > 0 ? femalePool : malePool;
  if (g === 'male') return malePool.length > 0 ? malePool : femalePool;

  // Unspecified, non-binary, or non-gendered
  if (unisexPool && unisexPool.length > 0) {
    return unisexPool;
  }
  return [...malePool, ...femalePool];
}

/**
 * Resolves a pool string like "tiefling.genderGiven" or "human.culturalGiven" into an array of string values.
 */
export function resolveDataPool(poolSource: string, ctx: NamingContext): readonly string[] {
  const genderStr = ctx.gender ? ctx.gender.toString() : undefined;

  if (poolSource === 'tiefling.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.tiefling.maleGiven,
      SOURCE_NAMING_DATA.tiefling.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'tiefling.virtueNames') {
    return SOURCE_NAMING_DATA.tiefling.virtueNames!;
  }

  if (poolSource === 'gnome.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.gnome.maleGiven,
      SOURCE_NAMING_DATA.gnome.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'gnome.clanNames') return SOURCE_NAMING_DATA.gnome.clanNames!;
  if (poolSource === 'gnome.nicknames') return SOURCE_NAMING_DATA.gnome.nicknames!;

  if (poolSource === 'dragonborn.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.dragonborn.maleGiven,
      SOURCE_NAMING_DATA.dragonborn.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'dragonborn.clanNames') return SOURCE_NAMING_DATA.dragonborn.clanNames!;
  if (poolSource === 'dragonborn.childhoodNames') return SOURCE_NAMING_DATA.dragonborn.childhoodNames!;

  if (poolSource === 'elf.childGiven') return SOURCE_NAMING_DATA.elf.childGiven!;
  if (poolSource === 'elf.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.elf.maleGiven,
      SOURCE_NAMING_DATA.elf.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'elf.familyNames') return SOURCE_NAMING_DATA.elf.familyNames!;

  if (poolSource === 'dwarf.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.dwarf.maleGiven,
      SOURCE_NAMING_DATA.dwarf.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'dwarf.clanNames') return SOURCE_NAMING_DATA.dwarf.clanNames!;

  if (poolSource === 'halfling.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.halfling.maleGiven,
      SOURCE_NAMING_DATA.halfling.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'halfling.familyNames') return SOURCE_NAMING_DATA.halfling.familyNames!;

  if (poolSource === 'halfOrc.genderGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.halfOrc.maleGiven,
      SOURCE_NAMING_DATA.halfOrc.femaleGiven,
      undefined,
      genderStr
    );
  }

  // Half-Elf specific delegated pool sources
  if (poolSource === 'halfElf.elvenGiven') {
    return resolveGenderPool(
      SOURCE_NAMING_DATA.elf.maleGiven,
      SOURCE_NAMING_DATA.elf.femaleGiven,
      undefined,
      genderStr
    );
  }
  if (poolSource === 'halfElf.elvenFamily') {
    return SOURCE_NAMING_DATA.elf.familyNames!;
  }
  if (poolSource === 'halfElf.humanGiven') {
    const cul = resolveHumanCulture(ctx.culture);
    const pool = SOURCE_NAMING_DATA.human[cul.key] || SOURCE_NAMING_DATA.human.neutral;
    return resolveGenderPool(pool.maleGiven, pool.femaleGiven, undefined, genderStr);
  }
  if (poolSource === 'halfElf.humanSurname') {
    const cul = resolveHumanCulture(ctx.culture);
    const pool = SOURCE_NAMING_DATA.human[cul.key] || SOURCE_NAMING_DATA.human.neutral;
    return pool.surnames!;
  }
  if (poolSource === 'halfElf.delegatedGiven') {
    const elvenPool = resolveGenderPool(
      SOURCE_NAMING_DATA.elf.maleGiven,
      SOURCE_NAMING_DATA.elf.femaleGiven,
      undefined,
      genderStr
    );
    const cul = resolveHumanCulture(ctx.culture);
    const humanObj = SOURCE_NAMING_DATA.human[cul.key] || SOURCE_NAMING_DATA.human.neutral;
    const humanPool = resolveGenderPool(
      humanObj.maleGiven,
      humanObj.femaleGiven,
      undefined,
      genderStr
    );
    return [...elvenPool, ...humanPool];
  }
  if (poolSource === 'halfElf.delegatedFamily') {
    const cul = resolveHumanCulture(ctx.culture);
    const humanObj = SOURCE_NAMING_DATA.human[cul.key] || SOURCE_NAMING_DATA.human.neutral;
    return [...SOURCE_NAMING_DATA.elf.familyNames!, ...humanObj.surnames!];
  }

  // Human cultural pools
  if (poolSource === 'human.culturalGiven') {
    const cul = resolveHumanCulture(ctx.culture);
    const humanPool = SOURCE_NAMING_DATA.human[cul.key] || SOURCE_NAMING_DATA.human.neutral;
    return resolveGenderPool(humanPool.maleGiven, humanPool.femaleGiven, undefined, genderStr);
  }
  if (poolSource === 'human.culturalSurname') {
    const cul = resolveHumanCulture(ctx.culture);
    const humanPool = SOURCE_NAMING_DATA.human[cul.key] || SOURCE_NAMING_DATA.human.neutral;
    return humanPool.surnames!;
  }

  // Explicit Fallback to project generic extensions
  return SOURCE_NAMING_DATA.projectExtensions!.genericFantasy.unisexGiven!;
}
