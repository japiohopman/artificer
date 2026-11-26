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
    expect(source).toContain('{activeActor.name}');
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
    expect(source).toContain('activeTurnActor.isAlly ? [RADIAL_ACTIONS[4]] : []');
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
    expect(icons).toContain('title={title}');
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

  it('keeps radial category selection UI-only and resets it between turns', () => {
    const store = useUIStore.getState();

    expect(store.combatActionCategory).toBeNull();
    store.setCombatActionCategory('Spell');
    expect(useUIStore.getState().combatActionCategory).toBe('Spell');
    store.setCombatActionCategory(null);
    expect(useUIStore.getState().combatActionCategory).toBeNull();
  });
});
