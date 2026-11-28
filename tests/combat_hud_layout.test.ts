// @ts-nocheck
import { beforeEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { useUIStore } from '../src/store/useUIStore';
import { useGameStore } from '../src/store/useGameStore';

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
    expect(source).toContain('{activeActor.name}');
    expect(source).toContain('currentLocation?.name');
    expect(source).toContain('Zoom {mapZoom}');
    expect(source).toContain("const role = entry.isPlayer ? 'PC' : entry.isAlly ? 'ALLY' : 'HOSTILE'");
  });

  it('provides a 3–6 item radial action layer around the current playable actor', () => {
    const source = readSource('src/components/combat/TokenActionHUD.tsx');

    expect(source).toContain("id: 'Attack'");
    expect(source).toContain("id: 'Spell'");
    expect(source).toContain("id: 'Move'");
    expect(source).toContain("id: 'Backpack'");
    expect(source).toContain("id: 'Defend'");
    expect(source).toContain("id: 'End Turn'");
    expect(source).toContain('360 / options.length');
    expect(source).toContain('activeTurnActor.id');
    expect(source).toContain('setCombatActionCategory');
    expect(source).toContain('activeTurnActor.isAlly ? [RADIAL_ACTIONS[5]] : []');
    expect(source).toContain('getBackpackItems(activeChar).length > 0');
  });

  it('keeps the radial action layer anchored to the actor center while animating only its inner layer', () => {
    const source = readSource('src/components/combat/TokenActionHUD.tsx');
    const anchorClassIndex = source.indexOf('className="absolute z-[130] pointer-events-none"');
    const anchorStart = source.lastIndexOf('<div', anchorClassIndex);
    const animatedLayerStart = source.indexOf('<motion.div', anchorClassIndex);

    expect(anchorClassIndex).toBeGreaterThan(-1);
    expect(anchorStart).toBeGreaterThan(-1);
    expect(animatedLayerStart).toBeGreaterThan(anchorStart);

    const anchorMarkup = source.slice(anchorStart, animatedLayerStart);
    expect(anchorMarkup).toContain('left: x * cellSize + cellSize / 2');
    expect(anchorMarkup).toContain('top: y * cellSize + cellSize / 2');
    expect(anchorMarkup).toContain("transform: 'translate(-50%, -50%)'");
  });

  it('uses a single monochrome visual treatment for every radial action and keeps labels in tooltips', () => {
    const source = readSource('src/components/combat/TokenActionHUD.tsx');

    expect(source).toContain('border-dragon-gold/45 bg-stone-950/90 text-dragon-gold');
    expect(source).toContain('<GameIcon name={action.icon} size={17} color="currentColor" />');
    expect(source).toContain('title={action.label}');
    expect(source).not.toContain('action.tone');
    expect(source).not.toContain('{action.label}</span>');
  });

  it('mounts a shared adventure-style tooltip layer for native title attributes', () => {
    const app = readSource('src/App.tsx');
    const layer = readSource('src/components/ui/GameTooltipLayer.tsx');
    const icons = readSource('src/game_icons.tsx');
    const styles = readSource('src/index.css');

    expect(app).toContain('<GameTooltipLayer />');
    expect(icons).toContain('data-game-tooltip={title}');
    expect(icons).not.toContain('<title>{title}</title>');
    expect(layer).toContain("const TOOLTIP_SELECTOR = '[data-game-tooltip]'");
    expect(layer).toContain("element.dataset.gameTooltip = title");
    expect(layer).toContain('role="tooltip"');
    expect(layer).toContain('pointerover');
    expect(layer).toContain('focusin');
    expect(styles).toContain('.game-tooltip {');
    expect(styles).toContain('font-family: "Roboto Condensed", "Crimson Text", serif;');
    expect(styles).toContain('rgba(212, 175, 55, 0.62)');
  });

  it('uses the same Backpack item selector in the radial layer and action workspace', () => {
    const radial = readSource('src/components/combat/TokenActionHUD.tsx');
    const panel = readSource('src/components/hud/game/ActionPanel.tsx');
    const selector = readSource('src/lib/tokenActionHud.ts');

    expect(radial).toContain('getBackpackItems(activeChar).length > 0');
    expect(panel).toContain('getBackpackItems(activeChar).map');
    expect(selector).toContain("['main_hand', 'off_hand', 'main-hand', 'off-hand', 'chest']");
  });

  it('keeps combat action damage and spell-slot states unambiguous', () => {
    const source = readSource('src/components/hud/game/ActionPanel.tsx');

    expect(source).toContain("strengthModifier === 0 ? '1'");
    expect(source).toContain("'Spell slots unavailable'");
    expect(source).toContain("'No spell slots'");
  });

  it('exposes Defend and preserves pending dice drafts while combat hides the roller', () => {
    const panel = readSource('src/components/hud/game/ActionPanel.tsx');
    const grid = readSource('src/components/combat/TokenActionHUD.tsx');
    const screen = readSource('src/components/hud/GameScreen.tsx');

    expect(panel).toContain("case 'Defend':");
    expect(panel).toContain("action.id === 'defend'");
    expect(grid).toContain("id: 'Defend'");
    expect(screen).toContain('<AdvancedRoller />');
    expect(screen).toContain('&& "hidden"');
  });

  it('clears pending targeting when initiative is started or rerolled', () => {
    const source = readSource('src/store/useGameStore.ts');

    expect(source).toContain('uiState.setIsTargeting(false)');
    expect(source).toContain('uiState.setTargetingAction(null)');
  });

  it('shows structured recent dice rolls in the NotificationWindow without a duplicate overlay', () => {
    const notification = readSource('src/components/hud/NotificationWindow.tsx');
    const overlay = readSource('src/dice_roller/DiceRollOverlay.tsx');

    expect(notification).toContain('recentRolls');
    expect(notification).toContain('Recent dice rolls');
    expect(notification).toContain('selectedRoll.rolls');
    expect(notification).toContain('Dropped from the final total');
    expect(notification).toContain('selectedRoll.outcome.status');
    expect(notification).toContain('clearRoll()');
    expect(overlay).toContain('recentRolls.map');
  });

  it('uses the visible weapon d20 result as the only hit-resolution roll', () => {
    const source = readSource('src/store/useGameStore.ts');
    const start = source.indexOf('// 1. Roll to Hit');
    const end = source.indexOf('return true;', start);
    const attackResolution = source.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(attackResolution).toContain('let hitRoll = await rollDice3D');
    expect(attackResolution).toContain('const totalHit = hitRoll.total');
    expect(attackResolution).not.toContain('Math.random');
    expect(attackResolution).toContain('updateRollOutcome(hitRoll.id');
  });

  it('resolves initiative portraits and enemy profile selection by combatant identity', () => {
    const notification = readSource('src/components/hud/NotificationWindow.tsx');
    const encounter = readSource('src/components/hud/world/CombatEncounterPanel.tsx');
    const store = readSource('src/store/useGameStore.ts');
    const mapAdapter = readSource('src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts');

    expect(notification).not.toContain('c.name === entry.name');
    expect(notification).toContain('characters.find(character => character.id === entry.id)');
    expect(encounter).toContain('const requestId = ++profileRequestId.current');
    expect(encounter).toContain("useUIStore.getState().gameMode !== 'combat'");
    expect(store).toContain('index: monster.index || undefined');
    expect(mapAdapter).toContain('index: foundMonster?.index || t.index');
  });

  it('keeps Bun test suites separate from the Playwright spec run', () => {
    const packageJson = readSource('package.json');

    expect(packageJson).toContain("--test-match='**/*.spec.ts'");
    expect(packageJson).toContain('"test:unit": "bun test tests/*.test.ts"');
  });

  it('routes selected categories to the bottom workspace and summarizes resources for all playable party members', () => {
    const source = readSource('src/components/hud/game/ActionPanel.tsx');
    const screen = readSource('src/components/hud/GameScreen.tsx');

    expect(screen).toContain('<ActionPanel />');
    expect(source).toContain("case 'Attack':");
    expect(source).toContain('const attackActions = useMemo<ActionHudAction[]>');
    expect(source).toContain('getEquippedWeapons(activeChar)');
    expect(source).toContain('Unarmed Strike');
    expect(source).toContain("case 'Spell':");
    expect(source).toContain("case 'Move':");
    expect(source).toContain("case 'Backpack':");
    expect(source).toContain('activeTurnActor.id');
    expect(source).toContain('playableCharacters.map');
    expect(source).toContain('character.spellSlots');
    expect(source).toContain('Party action economy');
    expect(source).toContain('Hostile turn');
    expect(source).toContain('Ally turn');
    expect(source).toContain('End Turn remains available around the actor');
    expect(source).toContain("setGameMode('exploration')");
    expect(source).toContain('Withdraw');
  });

  it('resets the selected action category through production initiative advancement', () => {
    const originalCombatState = useGameStore.getState().combatState;
    const alliedIds = ['test-ally-one', 'test-ally-two'];
    const alliedMonsters = alliedIds.map((id, index) => ({
      id,
      name: id,
      type: 'npc',
      hp: 10,
      maxHp: 10,
      x: index,
      y: 0,
      awareness: 'combat' as const,
      viewDirection: 0,
      perception: 10,
      speed: 6,
      isAlly: true
    }));

    useGameStore.setState(state => ({
      combatState: {
        ...state.combatState,
        monsters: alliedMonsters as any,
        initiativeOrder: alliedIds.map((id, index) => ({
          id,
          name: id,
          value: 20 - index,
          isPlayer: false,
          isAlly: true
        })),
        activeTurnIndex: 0
      }
    }));
    useUIStore.getState().setCombatActionCategory('Spell');

    useGameStore.getState().nextTurn();

    expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
    expect(useUIStore.getState().combatActionCategory).toBeNull();

    useGameStore.setState(state => ({ combatState: originalCombatState }));
  });
});
