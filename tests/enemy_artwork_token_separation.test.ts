import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { resolveEnemyArtworkUrl } from '../src/lib/enemyArtworkResolver';
import { normalizeImageUrl, getEnemyArtworkUrl } from '../src/services/storageService';

describe('Enemy Artwork vs Token Resolution Separation (#311)', () => {
  const storageServicePath = path.join(__dirname, '../src/services/storageService.ts');
  const tokenComponentPath = path.join(__dirname, '../src/components/combat/Token.tsx');
  const monsterProfilePath = path.join(__dirname, '../src/components/character/MonsterProfile.tsx');
  const monsterCardPath = path.join(__dirname, '../src/components/atlas/MonsterCard.tsx');

  it('verifies storageService enforces FORCE ENEMIES image resolution logic to separate images/ from tokens/', () => {
    expect(fs.existsSync(storageServicePath)).toBe(true);
    const source = fs.readFileSync(storageServicePath, 'utf8');

    expect(source).toContain("if (folder === 'enemies')");
    expect(source).toContain("resolveEnemyArtworkUrl(");
    expect(source).toContain("finalUrl = resolvedEnemyArtwork;");
  });

  it('behavioral test: resolveEnemyArtworkUrl on real Gargoyle contract', () => {
    const gargoyleRecord = {
      name: 'gargoyle',
      image: '/assets/atlas/enemies/tokens/elemental/Gargoyle.webp',
      imageUrl: '/assets/atlas/enemies/images/gargoyle.webp'
    };

    // 1. Canonical imageUrl resolves to /assets/atlas/enemies/images/gargoyle.webp
    const resolvedArtwork = resolveEnemyArtworkUrl(gargoyleRecord.imageUrl, '0m8qydn52qw9zzom', gargoyleRecord.name);
    expect(resolvedArtwork).toBe('/assets/atlas/enemies/images/gargoyle.webp');

    // 2. Token-only input returns explicit missing/empty artwork and NEVER contains /enemies/tokens/
    const tokenResolved = resolveEnemyArtworkUrl(gargoyleRecord.image, '0m8qydn52qw9zzom', gargoyleRecord.name);
    expect(tokenResolved.includes('/enemies/tokens/')).toBe(false);
    expect(tokenResolved).toBe('');
  });

  it('integration test: normalizeImageUrl and getEnemyArtworkUrl integration on Gargoyle and Spy records', () => {
    const gargoyleRecord = {
      name: 'gargoyle',
      image: '/assets/atlas/enemies/tokens/elemental/Gargoyle.webp',
      imageUrl: '/assets/atlas/enemies/images/gargoyle.webp'
    };

    // 1. Canonical imageUrl input to normalizeImageUrl resolves to canonical artwork path
    const canonicalNormalized = normalizeImageUrl(gargoyleRecord.imageUrl, 'enemies', '0m8qydn52qw9zzom', gargoyleRecord.name);
    expect(decodeURIComponent(canonicalNormalized)).toContain('/assets/atlas/enemies/images/gargoyle.webp');

    // 2. Token-only input to normalizeImageUrl yields explicit missing artwork ('') and NEVER contains /enemies/tokens/
    const tokenNormalized = normalizeImageUrl(gargoyleRecord.image, 'enemies', '0m8qydn52qw9zzom', gargoyleRecord.name);
    expect(decodeURIComponent(tokenNormalized).includes('/enemies/tokens/')).toBe(false);
    expect(tokenNormalized).toBe('');

    // 3. getEnemyArtworkUrl with Gargoyle record having imageUrl
    const artworkFromCanonicalEnemy = getEnemyArtworkUrl(gargoyleRecord);
    expect(decodeURIComponent(artworkFromCanonicalEnemy)).toContain('/assets/atlas/enemies/images/gargoyle.webp');

    // 4. getEnemyArtworkUrl with token-only record (Spy)
    const spyTokenOnlyRecord = {
      index: '13k3xk2a3wwxvkld',
      name: 'spy',
      image: '/assets/atlas/enemies/tokens/humanoid/Spy.webp'
    };
    const artworkFromTokenEnemy = getEnemyArtworkUrl(spyTokenOnlyRecord);
    expect(decodeURIComponent(artworkFromTokenEnemy).includes('/enemies/tokens/')).toBe(false);
    expect(artworkFromTokenEnemy).toBe('');
  });

  it('verifies non-grid components consume getEnemyArtworkUrl or non-token artwork resolution', () => {
    expect(fs.existsSync(monsterProfilePath)).toBe(true);
    expect(fs.existsSync(monsterCardPath)).toBe(true);

    const profileSource = fs.readFileSync(monsterProfilePath, 'utf8');
    const cardSource = fs.readFileSync(monsterCardPath, 'utf8');

    expect(profileSource).toContain("getEnemyArtworkUrl(monster)");
    expect(cardSource).toContain("normalizeImageUrl(rawUrl, 'enemies'");
  });

  it('verifies CombatGrid Token explicitly preserves token path handling', () => {
    expect(fs.existsSync(tokenComponentPath)).toBe(true);
    const tokenSource = fs.readFileSync(tokenComponentPath, 'utf8');

    expect(tokenSource).toContain("imageUrl.includes('/enemies/tokens/')");
  });
});
