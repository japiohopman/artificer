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
  });

  test('executes resolveEnemyArtworkUrl behavioral logic directly', () => {
    // 1. Token path input -> non-token enemies/images/ output
    const tokenInput = '/assets/atlas/enemies/tokens/humanoid/goblin_scout.webp';
    const resolvedFromToken = resolveEnemyArtworkUrl(tokenInput, 'goblin');
    assert.equal(resolvedFromToken, '/assets/atlas/enemies/images/goblin.webp');

    // 2. Canonical enemies/images/ input -> preserves canonical enemies/images/ artwork
    const canonicalInput = '/assets/atlas/enemies/images/goblin.webp';
    const resolvedCanonical = resolveEnemyArtworkUrl(canonicalInput, 'goblin');
    assert.equal(resolvedCanonical, '/assets/atlas/enemies/images/goblin.webp');

    // 3. Handling Foundry 16-char ID with name
    const foundryResolved = resolveEnemyArtworkUrl('/assets/atlas/enemies/tokens/orc_sentry.webp', '125qFnXvT9z0iOic', 'Orc');
    assert.equal(foundryResolved, '/assets/atlas/enemies/images/orc.webp');
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
