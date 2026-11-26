// @ts-nocheck
import { beforeEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { useUIStore } from '../src/store/useUIStore';

const readSource = (relativePath: string) =>
  readFileSync(join(__dirname, '..', relativePath), 'utf8');

describe('Combat HUD layout contract (#420)', () => {
  beforeEach(() => {
    useUIStore.setState({ combatActionCategory: null, gameMode: 'exploration' });
  });

  it('keeps the exploration WorldPanel and switches to a dedicated combat encounter panel', () => {
    const source = readSource('src/components/hud/WorldPanel.tsx');

    expect(source).toContain("if (gameMode === 'combat')");
    expect(source).toContain('<CombatEncounterPanel');
    expect(source).toContain('<WorldEnvironmentHeader');
    expect(source).toContain('<ActiveContextPanel');
    expect(source).toContain('<Travel');
  });

  it('builds the hostile roster from canonical combat state and keeps allies out of the enemy list', () => {
    const source = readSource('src/components/hud/world/CombatEncounterPanel.tsx');

    expect(source).toContain('state => state.combatState');
    expect(source).toContain('combatState.monsters.filter(monster => !monster.isAlly)');
    expect(source).toContain('combatState.activeConditions[monster.id]');
    expect(source).toContain('combatState.initiativeOrder.find(entry => entry.id === monster.id)');
    expect(source).toContain('const canonicalIndex =');
    expect(source).not.toContain('fetchMonsterData(baseName)');
  });

  it('uses initiative as the combat notification header and keeps region/zoom in the exploration branch', () => {
    const source = readSource('src/components/hud/NotificationWindow.tsx');

    expect(source).toContain('const isCombat = gameMode === \'combat\'');
    expect(source).toContain('Encounter initiative');
    expect(source).not.toContain('Next Turn');
    expect(source).toContain('activeActor?.name');
    expect(source).toContain('currentLocation?.name');
    expect(source).toContain('Zoom {mapZoom}');
    expect(source).toContain("const role = entry.isPlayer ? 'PC' : entry.isAlly ? 'ALLY' : 'HOSTILE'");
  });

  it('provides a 3–5 item radial action layer around the current playable actor', () => {
    const source = readSource('src/components/combat/TokenActionHUD.tsx');

    expect(source).toContain("id: 'Attack'");
    expect(source).toContain("id: 'Spell'");
    expect(source).toContain("id: 'Move'");
    expect(source).toContain("id: 'Backpack'");
    expect(source).toContain("id: 'End Turn'");
    expect(source).toContain('360 / options.length');
    expect(source).toContain('activeTurnActor.id');
    expect(source).toContain('setCombatActionCategory');
  });

  it('routes selected categories to the bottom workspace and summarizes resources for all playable party members', () => {
    const source = readSource('src/components/hud/game/ActionPanel.tsx');
    const screen = readSource('src/components/hud/GameScreen.tsx');

    expect(screen).toContain('<ActionPanel />');
    expect(source).toContain("case 'Attack':");
    expect(source).toContain("case 'Spell':");
    expect(source).toContain("case 'Move':");
    expect(source).toContain("case 'Backpack':");
    expect(source).toContain('activeTurnActor.id');
    expect(source).toContain('playableCharacters.map');
    expect(source).toContain('character.spellSlots');
    expect(source).toContain('Party action economy');
    expect(source).toContain('Hostile turn');
  });

  it('keeps radial category selection UI-only and resets it between turns', () => {
    const store = useUIStore.getState();

    expect(store.combatActionCategory).toBeNull();
    store.setCombatActionCategory('Spell');
    expect(useUIStore.getState().combatActionCategory).toBe('Spell');
    store.setCombatActionCategory(null);
    expect(useUIStore.getState().combatActionCategory).toBeNull();
  });
});
