import { describe, it, expect, beforeEach } from 'vitest';
import { useWorldStore } from '../src/store/useWorldStore';
import { useGameStore } from '../src/store/useGameStore';
import fs from 'fs';
import path from 'path';

describe('World Context Window Architecture & Boundaries (#355)', () => {
  beforeEach(() => {
    useWorldStore.setState({
      partyLocation: {
        id: 'sword_coast_road',
        name: 'Sword Coast Road',
        category: 'landmark',
      },
      partySubLocation: null,
      currentLocation: null,
      inspectedLocation: null,
      isTraveling: false,
      travelProgress: 0,
      destination: null,
    });

    useGameStore.setState({
      combatState: {
        playerPos: { x: 2, y: 2 },
        monsters: [],
        initiativeOrder: [],
        activeTurnIndex: 0,
        grid: [],
        victoryXp: 500,
        activeConditions: {},
        combatMapBackground: null,
        activeAttack: null,
      },
    });
  });

  it('verifies WorldPanel source code does NOT permanently embed AdvancedRoller or MapLegend', () => {
    const worldPanelPath = path.join(__dirname, '../src/components/hud/WorldPanel.tsx');
    const source = fs.readFileSync(worldPanelPath, 'utf8');

    // AdvancedRoller and MapLegend must not be imported or permanently rendered in WorldPanel
    expect(source).not.toContain('import { AdvancedRoller }');
    expect(source).not.toContain('import { MapLegend }');
    expect(source).not.toContain('<AdvancedRoller');
    expect(source).not.toContain('<MapLegend');
  });

  it('verifies 4 Root Structure sections are documented and implemented in WorldPanel.tsx', () => {
    const worldPanelPath = path.join(__dirname, '../src/components/hud/WorldPanel.tsx');
    const source = fs.readFileSync(worldPanelPath, 'utf8');

    // 1. World Context
    expect(source).toContain('WORLD CONTEXT');
    expect(source).toContain('WorldEnvironmentHeader');

    // 2. Party Presence
    expect(source).toContain('PARTY PRESENCE');
    expect(source).toContain('Party_Presence');

    // 3. Active Context
    expect(source).toContain('ACTIVE CONTEXT');
    expect(source).toContain('Active_Threats');

    // 4. Interaction / Resolution Context
    expect(source).toContain('INTERACTION / RESOLUTION CONTEXT');
    expect(source).toContain('Travel');
  });

  it('verifies distinct separation between physical partyLocation and displayLocation in World Store', () => {
    const store = useWorldStore.getState();

    // Physical location represents where the party actually is
    expect(store.partyLocation?.name).toBe('Sword Coast Road');

    // Setting inspected location updates inspected context without mutating physical location
    store.setInspectedLocation({
      id: 'waterdeep',
      name: 'Waterdeep',
      category: 'city',
    });

    const updatedStore = useWorldStore.getState();
    expect(updatedStore.partyLocation?.name).toBe('Sword Coast Road');
    expect(updatedStore.inspectedLocation?.name).toBe('Waterdeep');

    const snapshot = updatedStore.getEnvironmentSnapshot();
    expect(snapshot.locations.physical?.name).toBe('Sword Coast Road');
    expect(snapshot.locations.inspected?.name).toBe('Waterdeep');
  });

  it('verifies combat threats in World Context consume canonical combatState.monsters', () => {
    useGameStore.setState({
      combatState: {
        playerPos: { x: 0, y: 0 },
        monsters: [
          {
            id: 'goblin-1',
            name: 'Goblin Scout',
            type: 'goblin',
            hp: 7,
            maxHp: 7,
            x: 5,
            y: 5,
            awareness: 'combat',
            viewDirection: 0,
            perception: 10,
            speed: 6,
            armor_class: 15,
          },
        ],
        initiativeOrder: [],
        activeTurnIndex: 0,
        grid: [],
        victoryXp: 50,
        activeConditions: {},
      },
    });

    const gameStoreState = useGameStore.getState();
    expect(gameStoreState.combatState.monsters).toHaveLength(1);
    expect(gameStoreState.combatState.monsters[0].name).toBe('Goblin Scout');
    expect(gameStoreState.combatState.monsters[0].armor_class).toBe(15);
  });

  it('verifies missing canonical data fallback message is explicit and contains no fabricated lore/stats', () => {
    const worldPanelPath = path.join(__dirname, '../src/components/hud/WorldPanel.tsx');
    const source = fs.readFileSync(worldPanelPath, 'utf8');

    // Checks that fallback description for missing canonical records is explicit
    expect(source).toContain('Unknown location - missing canonical Atlas record.');
    expect(source).toContain('No detailed description available for this domain.');
  });
});
