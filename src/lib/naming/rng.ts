/**
 * Deterministic Seedable Pseudo-Random Number Generator (PRNG)
 * Independent of browser/UI state or Math.random().
 */

/**
 * Converts any seed (string or number) into a 32-bit unsigned integer hash seed.
 */
export function hashSeed(seed: number | string): number {
  if (typeof seed === 'number') {
    return (seed >>> 0) || 0x12345678;
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 PRNG generator.
 * Fast, high-quality 32-bit PRNG.
 */
export class SeedableRNG {
  private state: number;

  constructor(seed: number | string) {
    this.state = hashSeed(seed);
  }

  /**
   * Generates a float in the range [0, 1).
   */
  nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in the range [min, max] inclusive.
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }
    const range = max - min + 1;
    return min + Math.floor(this.nextFloat() * range);
  }

  /**
   * Selects a random element from an array.
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('SeedableRNG.pick called with an empty array');
    }
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }

  /**
   * Returns a shuffled copy of an array using Fisher-Yates algorithm.
   */
  shuffle<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  /**
   * Selects N unique items from an array (or up to array.length if N > length).
   */
  sample<T>(array: readonly T[], count: number): T[] {
    if (count <= 0) return [];
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Creates a child RNG seeded deterministically from this RNG.
   */
  fork(subKey?: string | number): SeedableRNG {
    const childSeed = this.nextInt(0, 0x7fffffff) ^ hashSeed(subKey ?? 'child');
    return new SeedableRNG(childSeed);
  }
}
