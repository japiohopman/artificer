import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEnemyArtworkUrl } from '../src/lib/enemyArtworkResolver.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Enemy Artwork vs Token Resolution Separation (#311)', () => {
  const storageServicePath = path.join(__dirname, '../src/services/storageService.ts');
  const tokenComponentPath = path.join(__dirname, '../src/components/combat/Token.tsx');
  const monsterProfilePath = path.join(__dirname, '../src/components/character/MonsterProfile.tsx');
  const monsterCardPath = path.join(__dirname, '../src/components/atlas/MonsterCard.tsx');

  test('verifies storageService enforces FORCE ENEMIES image resolution logic to separate images/ from tokens/', () => {
    assert.equal(fs.existsSync(storageServicePath), true);
    const source = fs.readFileSync(storageServicePath, 'utf8');

    assert.equal(source.includes("if (folder === 'enemies')"), true);
    assert.equal(source.includes("resolveEnemyArtworkUrl("), true);
    assert.equal(source.includes("finalUrl = resolvedEnemyArtwork;"), true);
  });

  test('behavioral test: resolveEnemyArtworkUrl on real Gargoyle contract', () => {
    const gargoyleRecord = {
      name: 'gargoyle',
      image: '/assets/atlas/enemies/tokens/elemental/Gargoyle.webp',
      imageUrl: '/assets/atlas/enemies/images/gargoyle.webp'
    };

    // 1. Canonical imageUrl resolves to /assets/atlas/enemies/images/gargoyle.webp
    const resolvedArtwork = resolveEnemyArtworkUrl(gargoyleRecord.imageUrl, '0m8qydn52qw9zzom', gargoyleRecord.name);
    assert.equal(resolvedArtwork, '/assets/atlas/enemies/images/gargoyle.webp');

    // 2. Token-only input returns explicit missing/empty artwork and NEVER contains /enemies/tokens/
    const tokenResolved = resolveEnemyArtworkUrl(gargoyleRecord.image, '0m8qydn52qw9zzom', gargoyleRecord.name);
    assert.equal(tokenResolved.includes('/enemies/tokens/'), false);
    assert.equal(tokenResolved, '');
  });

  test('verifies non-grid components consume getEnemyArtworkUrl or non-token artwork resolution', () => {
    assert.equal(fs.existsSync(monsterProfilePath), true);
    assert.equal(fs.existsSync(monsterCardPath), true);

    const profileSource = fs.readFileSync(monsterProfilePath, 'utf8');
    const cardSource = fs.readFileSync(monsterCardPath, 'utf8');

    assert.equal(profileSource.includes("getEnemyArtworkUrl(monster)"), true);
    assert.equal(cardSource.includes("normalizeImageUrl(rawUrl, 'enemies'"), true);
  });

  test('verifies CombatGrid Token explicitly preserves token path handling', () => {
    assert.equal(fs.existsSync(tokenComponentPath), true);
    const tokenSource = fs.readFileSync(tokenComponentPath, 'utf8');

    assert.equal(tokenSource.includes("imageUrl.includes('/enemies/tokens/')"), true);
  });
});
