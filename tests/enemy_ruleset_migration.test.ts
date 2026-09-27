import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fetchMonsterData, fetchMonsterList } from '../src/services/storageService';

describe('Enemy Ruleset Migration Audits & Isolation', () => {
  const rootDir = process.cwd();

  it('should verify 2014 vs 2024 enemy JSON directory hierarchy exists', () => {
    const dir14 = path.resolve(rootDir, 'public/assets/atlas/enemies/json/14');
    const dir24 = path.resolve(rootDir, 'public/assets/atlas/enemies/json/24');

    expect(fs.existsSync(dir14)).toBe(true);
    expect(fs.existsSync(dir24)).toBe(true);

    const cats14 = fs.readdirSync(dir14).filter(f => fs.statSync(path.join(dir14, f)).isDirectory());
    const cats24 = fs.readdirSync(dir24).filter(f => fs.statSync(path.join(dir24, f)).isDirectory());

    expect(cats14.length).toBeGreaterThan(10);
    expect(cats24.length).toBeGreaterThan(10);
  });

  it('should verify 2014 vs 2024 monster feature directory hierarchy exists', () => {
    const featureDir14 = path.resolve(rootDir, 'public/assets/atlas/enemies/monsterfeatures/json/14');
    const featureDir24 = path.resolve(rootDir, 'public/assets/atlas/enemies/monsterfeatures/json/24');

    expect(fs.existsSync(featureDir14)).toBe(true);
    expect(fs.existsSync(featureDir24)).toBe(true);

    const featFiles14 = fs.readdirSync(featureDir14).filter(f => f.endsWith('.json'));
    const featSubdirs24 = fs.readdirSync(featureDir24).filter(f => fs.statSync(path.join(featureDir24, f)).isDirectory());

    expect(featFiles14.length).toBeGreaterThan(200);
    expect(featSubdirs24).toContain('actions');
    expect(featSubdirs24).toContain('attacks');
    expect(featSubdirs24).toContain('legendary-actions');
    expect(featSubdirs24).toContain('traits');
  });

  it('should resolve distinct 2014 and 2024 records for Adult Black Dragon', async () => {
    // 2014 Adult Black Dragon: ID 'm4ex4mu5ihcr3tmf'
    const dragon14 = await fetchMonsterData('m4ex4mu5ihcr3tmf', '2014');
    expect(dragon14).not.toBeNull();
    expect(dragon14.name).toBe('adult black dragon');
    expect(dragon14.rulesetContext).toBe('2014');
    expect(dragon14.imageUrl).toBe('/assets/atlas/enemies/images/adult_black_dragon.webp');

    // 2024 Adult Black Dragon: ID 'mmadultblackdrag'
    const dragon24 = await fetchMonsterData('mmadultblackdrag', '2024');
    expect(dragon24).not.toBeNull();
    expect(dragon24.name).toBe('adult black dragon');
    expect(dragon24.rulesetContext).toBe('2024');
    expect(dragon24.imageUrl).toBe('/assets/atlas/enemies/images/adult_black_dragon.webp');

    expect(dragon14.index).not.toBe(dragon24.index);
  });

  it('should enforce strict ruleset isolation when querying monsters by name', async () => {
    const aboleth14 = await fetchMonsterData('aboleth', '2014');
    expect(aboleth14).not.toBeNull();
    expect(aboleth14.index).toBe('shhhte7b92pefcwb');
    expect(aboleth14.rulesetContext).toBe('2014');

    const aboleth24 = await fetchMonsterData('aboleth', '2024');
    expect(aboleth24).not.toBeNull();
    expect(aboleth24.index).toBe('mmaboleth0000000');
    expect(aboleth24.rulesetContext).toBe('2024');
  });

  it('should verify enemy category mappings point to canonical versioned paths', () => {
    const catIndex14Path = path.resolve(rootDir, 'public/assets/atlas/enemies_categories/index_14.json');
    const catIndex24Path = path.resolve(rootDir, 'public/assets/atlas/enemies_categories/index_24.json');

    expect(fs.existsSync(catIndex14Path)).toBe(true);
    expect(fs.existsSync(catIndex24Path)).toBe(true);

    const cat14 = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'public/assets/atlas/enemies_categories/json/14/aberration.json'), 'utf8'));
    expect(cat14.monsters.length).toBeGreaterThan(0);
    cat14.monsters.forEach((m: any) => {
      expect(m.json_path).toContain('/enemies/json/14/aberration/');
    });

    const cat24 = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'public/assets/atlas/enemies_categories/json/24/aberration.json'), 'utf8'));
    expect(cat24.monsters.length).toBeGreaterThan(0);
    cat24.monsters.forEach((m: any) => {
      expect(m.json_path).toContain('/enemies/json/24/aberration/');
    });
  });

  it('should ensure non-grid imageUrl references resolve to enemies/images/ and never token paths', async () => {
    const monster = await fetchMonsterData('shhhte7b92pefcwb', '2014');
    expect(monster.imageUrl).toBe('/assets/atlas/enemies/images/aboleth.webp');
    expect(monster.imageUrl).not.toContain('/enemies/tokens/');
    expect(monster.image).toBe('/assets/atlas/enemies/tokens/aberration/Aboleth.webp');
  });
});
