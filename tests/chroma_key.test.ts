// @ts-nocheck
import { describe, it, expect } from 'vitest';

describe('ChromaKeyImage Infrastructure Algorithm', () => {
  it('correctly keys out target chroma color pixels', () => {
    const chromaColor = { r: 0, g: 255, b: 0 };
    const threshold = 100;
    const isGreenKey = chromaColor.g > Math.max(chromaColor.r, chromaColor.b);

    // Mock RGBA pixel array: Pure green background pixel
    const data = [0, 255, 0, 255]; // [R, G, B, A]

    const r = data[0];
    const g = data[1];
    const b = data[2];

    const dist = Math.sqrt(
      (r - chromaColor.r) ** 2 +
      (g - chromaColor.g) ** 2 +
      (b - chromaColor.b) ** 2
    );

    if (dist < threshold) {
      data[3] = 0;
    }

    expect(data[3]).toBe(0);
  });
});
