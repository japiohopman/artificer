/**
 * Naming Rule Models & Profile Resolver
 * Defines species-specific naming rules and resolves structured NamingContext into NamingProfile.
 */

import { NamingContext, NamingProfileRef, NamingDomainError, NameComponentType } from '../types';
import { SOURCE_NAMING_DATA, SourceNamePool } from '../data/sourceData';

export interface ComponentRule {
  type: NameComponentType;
  required: boolean;
  poolSource: string; // Path or identifier to data pool, e.g. "tiefling.maleGiven", "human.illuskan.maleGiven"
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
  compositionPattern: string; // e.g. "{given} {family}", "{clan} {given}", "{given} '{nickname}' {clan}"
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

export function normalizeCultureKey(culture?: string): string {
  if (!culture) return 'chondathan';
  const clean = culture.trim().toLowerCase();
  if (clean.includes('calish')) return 'calishite';
  if (clean.includes('chondath')) return 'chondathan';
  if (clean.includes('damar')) return 'damaran';
  if (clean.includes('illusk')) return 'illuskan';
  if (clean.includes('mulan')) return 'mulan';
  if (clean.includes('rashem')) return 'rashemi';
  if (clean.includes('shou')) return 'shou';
  if (clean.includes('tethyr')) return 'tethyrian';
  if (clean.includes('turam')) return 'turami';
  return 'chondathan';
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

  // 4. Dragonborn - Clan First + Personal + Childhood
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
    scoreMatch: (ctx) => {
      if (ctx.lifeStage === 'child') return 5;
      return 10;
    }
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

  // 10. Half-Elf Delegated Naming (Human or Elven)
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
    scoreMatch: () => 10
  },

  // 11. Half-Orc Guttural Orc or Human Trade Name
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

  // 12. Human Cultural Ethnicity Naming
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
    scoreMatch: (ctx) => (ctx.culture ? 12 : 10)
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

  const profileRef: NamingProfileRef = {
    id: bestRule.id,
    species: ctx.species || speciesKey,
    subrace: ctx.subrace,
    culture: ctx.culture,
    tradition: bestRule.tradition,
    description: bestRule.description
  };

  return { rule: bestRule, profileRef };
}

/**
 * Resolves a pool string like "tiefling.genderGiven" or "human.culturalGiven" into an array of string values.
 */
export function resolveDataPool(poolSource: string, ctx: NamingContext): readonly string[] {
  const gender = (ctx.gender || 'male').toString().toLowerCase();

  if (poolSource === 'tiefling.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.tiefling.femaleGiven!
      : SOURCE_NAMING_DATA.tiefling.maleGiven!;
  }
  if (poolSource === 'tiefling.virtueNames') {
    return SOURCE_NAMING_DATA.tiefling.virtueNames!;
  }

  if (poolSource === 'gnome.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.gnome.femaleGiven!
      : SOURCE_NAMING_DATA.gnome.maleGiven!;
  }
  if (poolSource === 'gnome.clanNames') return SOURCE_NAMING_DATA.gnome.clanNames!;
  if (poolSource === 'gnome.nicknames') return SOURCE_NAMING_DATA.gnome.nicknames!;

  if (poolSource === 'dragonborn.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.dragonborn.femaleGiven!
      : SOURCE_NAMING_DATA.dragonborn.maleGiven!;
  }
  if (poolSource === 'dragonborn.clanNames') return SOURCE_NAMING_DATA.dragonborn.clanNames!;
  if (poolSource === 'dragonborn.childhoodNames') return SOURCE_NAMING_DATA.dragonborn.childhoodNames!;

  if (poolSource === 'elf.childGiven') return SOURCE_NAMING_DATA.elf.childGiven!;
  if (poolSource === 'elf.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.elf.femaleGiven!
      : SOURCE_NAMING_DATA.elf.maleGiven!;
  }
  if (poolSource === 'elf.familyNames') return SOURCE_NAMING_DATA.elf.familyNames!;

  if (poolSource === 'dwarf.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.dwarf.femaleGiven!
      : SOURCE_NAMING_DATA.dwarf.maleGiven!;
  }
  if (poolSource === 'dwarf.clanNames') return SOURCE_NAMING_DATA.dwarf.clanNames!;

  if (poolSource === 'halfling.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.halfling.femaleGiven!
      : SOURCE_NAMING_DATA.halfling.maleGiven!;
  }
  if (poolSource === 'halfling.familyNames') return SOURCE_NAMING_DATA.halfling.familyNames!;

  if (poolSource === 'halfOrc.genderGiven') {
    return gender === 'female'
      ? SOURCE_NAMING_DATA.halfOrc.femaleGiven!
      : SOURCE_NAMING_DATA.halfOrc.maleGiven!;
  }

  if (poolSource === 'halfElf.delegatedGiven') {
    // Half-Elf delegates to either Elf or Human given names
    const pool = gender === 'female' ? SOURCE_NAMING_DATA.elf.femaleGiven! : SOURCE_NAMING_DATA.elf.maleGiven!;
    return pool;
  }
  if (poolSource === 'halfElf.delegatedFamily') {
    return SOURCE_NAMING_DATA.elf.familyNames!;
  }

  if (poolSource === 'human.culturalGiven') {
    const cultureKey = normalizeCultureKey(ctx.culture);
    const humanPool = SOURCE_NAMING_DATA.human[cultureKey] || SOURCE_NAMING_DATA.human.chondathan;
    return gender === 'female' ? humanPool.femaleGiven! : humanPool.maleGiven!;
  }
  if (poolSource === 'human.culturalSurname') {
    const cultureKey = normalizeCultureKey(ctx.culture);
    const humanPool = SOURCE_NAMING_DATA.human[cultureKey] || SOURCE_NAMING_DATA.human.chondathan;
    return humanPool.surnames!;
  }

  // Fallback to project generic extension
  return SOURCE_NAMING_DATA.projectExtensions!.genericFantasy.unisexGiven!;
}
