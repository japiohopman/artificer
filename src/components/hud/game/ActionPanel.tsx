import React, { useEffect, useMemo } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useGameStore } from '../../../store/useGameStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { getCharacterActions, ActionHudAction } from '../../../lib/tokenActionHud';
import { DeathSavesPanel } from './DeathSavesPanel';
import { calculateWeaponAttackBonus, getEquippedWeapons } from '../../../lib/statCalculations';

const resourceValue = (resource?: { current: number; max: number }) =>
  resource && Number.isFinite(resource.current) && Number.isFinite(resource.max)
    ? `${resource.current}/${resource.max}`
    : '—';

export const ActionPanel: React.FC = () => {
  const {
    gameMode,
    setGameMode,
    combatActionCategory,
    setCombatActionCategory,
    setIsTargeting,
    setTargetingAction,
    isTargeting,
    targetingAction
  } = useUIStore();

  const combatState = useGameStore(state => state.combatState);
  const addLog = useGameStore(state => state.addLog);
  const nextTurn = useGameStore(state => state.nextTurn);
  const characters = useCharacterStore(state => state.characters);
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId);
  const setActiveCharacter = useCharacterStore(state => state.setActiveCharacter);
  const consumeAction = useCharacterStore(state => state.consumeAction);

  const activeTurnActor = combatState.initiativeOrder[combatState.activeTurnIndex];
  const activeChar = useMemo(
    () => activeTurnActor ? characters.find(character => character.id === activeTurnActor.id) : undefined,
    [activeTurnActor, characters]
  );

  useEffect(() => {
    setCombatActionCategory(null);

    // Keep targeting and combat resolution aligned when an allied party character owns the turn.
    if (activeTurnActor?.isAlly && activeChar && activeCharacterId !== activeChar.id) {
      void setActiveCharacter(activeChar.id);
    }
  }, [activeTurnActor?.id, activeChar?.id, activeCharacterId, setActiveCharacter, setCombatActionCategory]);

  const allActions = useMemo(
    () => getCharacterActions(activeChar || null),
    [activeChar]
  );

  const attackActions = useMemo<ActionHudAction[]>(() => {
    if (!activeChar) return [];

    const weapons = getEquippedWeapons(activeChar).map(({ slotId, item }) => {
      const isRanged = item.weapon_range === 'Ranged' || item.category === 'Ranged';
      const rangeFeet = isRanged ? item.range?.normal : undefined;
      const range = typeof rangeFeet === 'number' ? Math.max(1, Math.ceil(rangeFeet / 5)) : 1;
      const damageDice = item.damage?.damage_dice || item.damage_dice || (typeof item.damage === 'string' ? item.damage : null);

      return {
        id: `attack-${slotId}-${item.id || item.index || 'equipped'}`,
        name: item.customName || item.name || item.index || `Equipped ${slotId.replace(/_/g, ' ')} weapon`,
        icon: 'melee',
        color: 'bg-dragon-red',
        description: `Equipped ${slotId.replace(/_/g, ' ')}${damageDice ? ` · ${damageDice}` : ''}`,
        range,
        category: 'Standard',
        actionType: 'actions',
        data: { weapon: item, slotId }
      } satisfies ActionHudAction;
    });

    return [
      ...weapons,
      {
        id: 'attack-unarmed',
        name: 'Unarmed Strike',
        icon: 'melee',
        color: 'bg-dragon-red',
        description: 'Unarmed strike',
        range: 1,
        category: 'Standard',
        actionType: 'actions',
        data: { unarmed: true }
      }
    ];
  }, [activeChar]);

  const backpackActions = useMemo<ActionHudAction[]>(() => {
    if (!activeChar) return [];
    const items = new Map<string, any>();
    const addItem = (item: any, fallbackId: string) => {
      if (!item) return;
      const id = String(item.id || item.index || fallbackId);
      items.set(id, item);
    };

    (activeChar.backpack || []).forEach((item: any, index: number) => {
      addItem(item, `backpack-${index}`);
    });

    const equippedIds = new Set((activeChar.equipment?.slots || []).map(slot => slot.itemId).filter(Boolean));
    Object.values(activeChar.items || {}).forEach((item: any, index) => {
      if (item && !equippedIds.has(item.id)) addItem(item, `stored-${index}`);
    });

    Object.entries(activeChar.inventory || {}).forEach(([slot, item]) => {
      if (['main_hand', 'off_hand', 'main-hand', 'off-hand', 'chest'].includes(slot)) return;
      addItem(item, `legacy-${slot}`);
    });

    return Array.from(items.entries()).map(([id, item]) => ({
      id: `item-${id}`,
      name: item.customName || item.name || item.template || 'Unnamed item',
      icon: 'package',
      color: 'bg-amber-700',
      description: item.description || `Use ${item.customName || item.name || item.template || 'this item'}.`,
      range: 4,
      category: 'Items',
      actionType: 'objectInteractions',
      data: item
    }));
  }, [activeChar]);

  const displayedActions = useMemo(() => {
    switch (combatActionCategory) {
      case 'Attack':
        return attackActions;
      case 'Spell':
        return allActions.filter(action => action.category === 'Spells');
      case 'Move':
        return allActions.filter(action => action.id === 'move');
      case 'Backpack':
        return backpackActions;
      default:
        return [];
    }
  }, [allActions, attackActions, backpackActions, combatActionCategory]);

  const playableCharacters = characters.filter(character =>
    character &&
    character.name !== 'Empty Slot' &&
    (!character.isNpc || character.isRecruitable)
  );

  const handleActionClick = (action: ActionHudAction) => {
    const isActive = targetingAction?.id === action.id;

    if (isActive) {
      setIsTargeting(false);
      setTargetingAction(null);
      setCombatActionCategory(null);
      addLog(`Action cancelled: ${action.name}`, 'warning');
      return;
    }

    if (!activeChar) return;

    if (action.actionType && activeChar.actionEconomy) {
      const remaining = activeChar.actionEconomy[action.actionType]?.current;
      if (typeof remaining === 'number' && remaining <= 0) {
        addLog(`You don't have enough ${action.actionType.replace('bonusActions', 'bonus actions')}!`, 'error');
        return;
      }
    }

    if (action.category === 'Spells' && action.data?.level > 0) {
      const slots = activeChar.spellSlots?.[String(action.data.level)];
      if (!slots || slots.current <= 0) {
        addLog(`You don't have any level ${action.data.level} spell slots remaining!`, 'error');
        return;
      }
    }

    addLog(`Action selected: ${action.name}`, 'info');

    if (action.id === 'attack' || action.id.startsWith('attack-')) {
      const isUnarmed = action.data?.unarmed === true;
      const equippedWeapon = isUnarmed ? null : action.data?.weapon || getEquippedWeapons(activeChar)[0]?.item || null;
      const calculatedBonus = calculateWeaponAttackBonus(activeChar, equippedWeapon);
      const strengthModifier = Math.floor(((activeChar.stats?.str || 10) - 10) / 2);
      const unarmedDamage = `1${strengthModifier >= 0 ? '+' : ''}${strengthModifier !== 0 ? strengthModifier : ''}`;
      const damageDice = isUnarmed
        ? unarmedDamage
        : equippedWeapon?.damage?.damage_dice || equippedWeapon?.damage_dice || (typeof equippedWeapon?.damage === 'string' ? equippedWeapon.damage : null) || '1d4';
      const damageType = isUnarmed
        ? 'bludgeoning'
        : equippedWeapon?.damage?.damage_type?.name || equippedWeapon?.damageType || equippedWeapon?.damage_type?.name || 'slashing';

      setTargetingAction({
        ...action,
        attack_bonus: calculatedBonus,
        damage: [{ damage_dice: damageDice, damage_type: { name: damageType } }]
      });
      setIsTargeting(true);
      setCombatActionCategory(null);
      addLog('Select a target on the grid.', 'info');
    } else if (action.id === 'move') {
      setTargetingAction({ ...action });
      setIsTargeting(true);
      setCombatActionCategory(null);
      addLog('Select a destination on the grid.', 'info');
    } else if (action.category === 'Spells') {
      setTargetingAction({ ...action });
      setIsTargeting(true);
      setCombatActionCategory(null);
      addLog(`Casting ${action.name}. Select a target on the grid.`, 'info');
    } else if (action.category === 'Items') {
      setTargetingAction({ ...action });
      setIsTargeting(true);
      setCombatActionCategory(null);
      addLog(`Using ${action.name}. Select a target on the grid.`, 'info');
    } else if (action.id === 'defend') {
      consumeAction(activeChar.id, 'actions');
      useGameStore.setState(state => ({
        combatState: {
          ...state.combatState,
          activeConditions: {
            ...state.combatState.activeConditions,
            [activeChar.id]: [...(state.combatState.activeConditions[activeChar.id] || []), 'defending']
          }
        }
      }));
      addLog(`${activeChar.name} adopts a defensive stance! (+2 AC)`, 'success');
      setCombatActionCategory(null);
      nextTurn();
    }
  };

  if (gameMode !== 'combat' || !activeTurnActor) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-dragon-gold/35 bg-stone-950/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.65)] backdrop-blur-md font-serif">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2">
        <div className="min-w-0 flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-dragon-gold shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dragon-gold">Action workspace</span>
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-white/70">{activeChar?.name || activeTurnActor.name}</span>
          {activeChar && <span className="hidden sm:inline truncate text-[8px] uppercase tracking-widest text-white/35">Level {activeChar.level} {activeChar.class}</span>}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {combatActionCategory && (
            <button
              onClick={() => setCombatActionCategory(null)}
              aria-label="Close action choices"
              className="rounded border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white/50 hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          )}
          <button
            onClick={() => {
              setCombatActionCategory(null);
              setIsTargeting(false);
              setTargetingAction(null);
              setGameMode('exploration');
            }}
            className="rounded border border-dragon-red/40 bg-dragon-red/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-red-200/80 hover:bg-dragon-red/20 hover:text-white transition-colors"
          >
            Withdraw
          </button>
        </div>
      </div>

      {!activeChar || activeChar.id !== activeTurnActor.id || !(activeTurnActor.isPlayer || activeTurnActor.isAlly) ? (
        <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-white/40">
          Hostile turn · {activeTurnActor.name}
        </div>
      ) : activeChar.hp <= 0 ? (
        <div className="p-3">
          <DeathSavesPanel
            activeChar={activeChar}
            onEndTurn={() => {
              addLog(`${activeChar.name} passes their turn while downed.`, 'success');
              nextTurn();
            }}
          />
        </div>
      ) : combatActionCategory ? (
        <div className="max-h-36 overflow-y-auto custom-scrollbar px-3 py-2">
          {displayedActions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayedActions.map(action => {
                const isActive = targetingAction?.id === action.id;
                const hasNoActionResource = Boolean(
                  action.actionType &&
                  activeChar.actionEconomy &&
                  typeof activeChar.actionEconomy[action.actionType]?.current === 'number' &&
                  activeChar.actionEconomy[action.actionType].current <= 0
                );
                const spellSlots = action.category === 'Spells' && action.data?.level > 0
                  ? activeChar.spellSlots?.[String(action.data.level)]
                  : null;
                const hasNoSpellSlot = Boolean(action.category === 'Spells' && action.data?.level > 0 && (!spellSlots || spellSlots.current <= 0));
                const isUnavailable = hasNoActionResource || hasNoSpellSlot;
                return (
                  <motion.button
                    key={action.id}
                    whileHover={!isUnavailable ? { y: -1 } : undefined}
                    whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
                    disabled={isUnavailable}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "min-w-[150px] max-w-[260px] flex-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                      isUnavailable
                        ? "cursor-not-allowed border-white/5 bg-black/30 text-white/25"
                        : isActive
                          ? "border-dragon-gold bg-dragon-gold/10 text-dragon-gold"
                          : "border-white/10 bg-white/[0.04] text-white/85 hover:border-white/25 hover:bg-white/[0.08]"
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/30">
                      <GameIcon name={action.icon} size={16} color="currentColor" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-black uppercase tracking-wider">{action.name}</span>
                      <span className="mt-0.5 block truncate text-[8px] text-white/40">{action.description}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="py-3 text-center text-[9px] uppercase tracking-widest text-white/35">
              {combatActionCategory === 'Backpack' ? 'No backpack items available' : 'No choices available'}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-white/35">
          Choose an action around your character to see its available choices here.
        </div>
      )}

      <div className="border-t border-white/10 bg-black/35 px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35">Party action economy</span>
          <span className="text-[7px] uppercase tracking-widest text-white/25">Live character state</span>
        </div>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {playableCharacters.map(character => {
            const economy = character.actionEconomy;
            const slots = Object.entries(character.spellSlots || {})
              .filter(([, slot]) => slot && slot.max > 0)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, slot]) => `L${level} ${slot.current}/${slot.max}`)
              .join(' · ');
            const isCurrent = character.id === activeTurnActor.id;

            return (
              <div
                key={character.id}
                className={cn(
                  "min-w-[190px] max-w-[250px] rounded-lg border px-2.5 py-2",
                  isCurrent ? "border-dragon-gold/60 bg-dragon-gold/10" : "border-white/10 bg-white/[0.03]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("truncate text-[8px] font-black uppercase tracking-wider", isCurrent ? "text-dragon-gold" : "text-white/70")}>{character.name}</span>
                  {isCurrent && <span className="text-[7px] font-black uppercase tracking-widest text-dragon-gold">Turn</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[8px] font-bold text-white/45">
                  <span>ACT {resourceValue(economy?.actions)}</span>
                  <span>BON {resourceValue(economy?.bonusActions)}</span>
                  <span>REA {resourceValue(economy?.reactions)}</span>
                  <span>MOV {resourceValue(economy?.movement)}</span>
                </div>
                <div className="mt-1 truncate text-[8px] text-purple-200/65" title={slots || 'No spell-slot data'}>
                  {slots || 'No spell slots'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isTargeting && (
        <div className="flex items-center gap-2 border-t border-dragon-gold/20 bg-dragon-gold/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-dragon-gold animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-dragon-gold">Targeting</span>
          <span className="truncate text-[8px] text-white/60">{targetingAction?.description || 'Select a target on the grid.'}</span>
        </div>
      )}
    </div>
  );
};
