// @ts-nocheck
import { describe, it, expect } from 'vitest';

describe('ChromaKeyImage Green Dominance Algorithm', () => {
  const processPixel = (r: number, g: number, b: number, a: number = 255) => {
    const maxOther = Math.max(r, b);
    const diff = g - maxOther;
    let alpha = a;

    if (g > maxOther) {
      if (diff > 5) {
        const factor = Math.max(0, Math.min(1, (diff - 5) / 30));
        alpha = Math.floor(255 * (1 - factor));
        if (diff > 35) alpha = 0;
        if (g > 160 && diff > 15) alpha = 0;
      }
    }

    if (g > 180 && g > r && g > b) {
      alpha = 0;
    }

    return alpha;
  };

  it('keys out pure green background pixels completely', () => {
    expect(processPixel(0, 255, 0)).toBe(0);
  });

  it('keys out noisy AI green background pixels', () => {
    expect(processPixel(20, 200, 30)).toBe(0);
  });

  it('preserves non-green subject assets (e.g. steel sword, red potion)', () => {
    expect(processPixel(180, 180, 180)).toBe(255); // Steel sword
    expect(processPixel(200, 30, 30)).toBe(255);   // Red health potion
  });
});
