import { SeedableRNG } from '../naming/rng';
import { AtlasBackground } from '../../services/atlasService';
import { Character } from '../../store/useCharacterStore';

export interface ResolvedPersonality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

/**
 * Deterministically resolves personality traits, ideals, bonds, and flaws from canonical background data.
 * Returns empty arrays when background source data is missing (does not invent canonical content).
 */
export function resolvePersonality(
  backgroundData?: AtlasBackground | null,
  seed?: number | string
): ResolvedPersonality {
  const rng = new SeedableRNG(seed ?? 42);

  const suggested = backgroundData?.suggested_characteristics;
  if (!suggested) {
    return { traits: [], ideals: [], bonds: [], flaws: [] };
  }

  const pickOne = (list?: string[]): string[] => {
    if (!list || list.length === 0) return [];
    return [rng.pick(list)];
  };

  return {
    traits: pickOne(suggested.traits),
    ideals: pickOne(suggested.ideals),
    bonds: pickOne(suggested.bonds),
    flaws: pickOne(suggested.flaws)
  };
}

function getItemString(items?: any[]): string {
  if (!items || items.length === 0) return '';
  const first = items[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && first.name) return first.name;
  return String(first || '');
}

/**
 * Deterministically composes high-fantasy backstory prose from canonical character inputs.
 * Requires no external network or LLM dependency.
 */
export function generateDeterministicBackstory(
  char: Partial<Character> & { seed?: number | string },
  seedOverride?: number | string
): string {
  const effectiveSeed = seedOverride ?? char.seed ?? `${char.name || 'hero'}_${char.race || 'unknown'}_${char.class || 'adventurer'}_${char.background || 'origin'}`;
  const rng = new SeedableRNG(effectiveSeed);

  const name = char.name && char.name.trim() ? char.name.trim() : 'The Hero';
  const raceStr = [char.subrace, char.race].filter(Boolean).join(' ') || 'a wanderer of unknown lineage';
  const classStr = [char.subclass, char.class].filter(Boolean).join(' ') || 'adventurer';
  const bgStr = char.background ? char.background.toLowerCase() : 'mysterious origins';
  const alignStr = char.alignment ? char.alignment.toLowerCase() : 'unaligned';

  const trait = getItemString(char.traits);
  const ideal = getItemString(char.ideals);
  const bond = getItemString(char.bonds);
  const flaw = getItemString(char.flaws);

  // Paragraph 1: Origin and Roots
  const originTemplates = [
    `${name} was born into the path of a ${bgStr}, raised among those who revered the traditions of their kind. From early years as a ${raceStr}, the world revealed both its harsh boundaries and hidden wonder. ${alignStr !== 'unaligned' ? `Guided by a fundamentally ${alignStr} philosophy, ` : ''}${name} learned to navigate the trials of everyday life while harboring a deeper destiny.`,
    `Long before taking up arms, ${name} lived as a ${bgStr}. Life as a ${raceStr} taught sharp lessons about survival and community. ${alignStr !== 'unaligned' ? `A ${alignStr} compass steered every key decision, ` : ''}forging a quiet resilience long before the wider world called.`,
    `Hailing from origins as a ${bgStr}, ${name} spent formative years absorbing the lore and customs of a ${raceStr}. ${alignStr !== 'unaligned' ? `Impelled by a ${alignStr} outlook on life, ` : ''}every experience contributed to a growing awareness that greater trials lay ahead.`
  ];

  // Paragraph 2: Calling and Personality
  const callingTemplates = [
    `The decision to walk the path of a ${classStr} was born of necessity and inner conviction. ${trait ? `Known to companions for a distinct disposition—"${trait}"—` : ''}${name} brought unique strengths to every endeavor. ${ideal ? `At the core of this resolve lay an unflinching ideal: "${ideal}"` : `A strong sense of purpose shaped every step of the journey.`}`,
    `When fate intervened, ${name} answered the call of the ${classStr}. ${trait ? `Reflecting a distinct character—"${trait}"—` : ''}${name} faced challenges with singular focus. ${ideal ? `This conviction was fueled by a commitment: "${ideal}"` : `Every choice was weighed against a personal code of honor.`}`,
    `Mastering the art of the ${classStr} became an obsessive pursuit. ${trait ? `Characterized by a noteworthy trait—"${trait}"—` : ''}${name} transformed raw potential into honed capability. ${ideal ? `The driving force behind this dedication was a core belief: "${ideal}"` : `A deep internal discipline guided this arduous training.`}`
  ];

  // Paragraph 3: Bonds, Flaws, and the Horizon Ahead
  const horizonTemplates = [
    `${bond ? `A powerful bond continued to tether ${name} to the world: "${bond}" ` : ''}${flaw ? `Yet, even the steadfast carry burdens, and ${name} struggled against a personal flaw: "${flaw}" ` : ''}Now, stepping beyond familiar borders, ${name} seeks to test skill against the unknown dangers of Faerûn.`,
    `${bond ? `The strongest anchor remains a deeply held bond: "${bond}" ` : ''}${flaw ? `Though mindful of a persistent shortcoming—"${flaw}"—` : ''}${name} advances into the adventuring life ready to forge a legacy worth remembering.`,
    `${bond ? `Every step forward honors an enduring commitment: "${bond}" ` : ''}${flaw ? `Aware of personal vulnerabilities, particularly "${flaw}", ` : ''}${name} embraces the uncertain road ahead, determined to meet whatever fate brings.`
  ];

  const p1 = rng.pick(originTemplates);
  const p2 = rng.pick(callingTemplates);
  const p3 = rng.pick(horizonTemplates);

  return `${p1}\n\n${p2}\n\n${p3}`;
}
