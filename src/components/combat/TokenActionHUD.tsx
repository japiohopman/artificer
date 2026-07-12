import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getCharacterActions, ActionHudAction } from '../../lib/tokenActionHud';

interface TokenActionHUDProps {
  x: number;
  y: number;
  cellSize: number;
}

export const TokenActionHUD: React.FC<TokenActionHUDProps> = ({ x, y, cellSize }) => {
  const {
    isTargeting,
    targetingAction,
    setIsTargeting,
    setTargetingAction
  } = useUIStore();
  const { addLog, nextTurn, combatState } = useGameStore();
  const { activeCharacterId, characters, consumeAction } = useCharacterStore();
  const [isSpellsDropdownOpen, setIsSpellsDropdownOpen] = useState(false);
  const [isAttacksDropdownOpen, setIsAttacksDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find whose turn it actually is in the initiative order
  const activeTurnActor = combatState.initiativeOrder[combatState.activeTurnIndex];

  // Find character or ally data depending on active turn actor
  const activeChar = useMemo(() => {
    if (!activeTurnActor) return characters.find(c => c.id === activeCharacterId) || null;
    // If it is a monster/summon in the combatState
    const monster = combatState.monsters.find(m => m.id === activeTurnActor.id);
    if (monster) {
      // Mock a Character interface structure for the summon/ally to generate its available actions
      return {
        id: monster.id,
        name: monster.name,
        class: monster.type || 'Ally',
        race: 'Summon',
        gender: 'Male' as const,
        level: 1,
        xp: 0,
        alignment: 'Neutral',
        background: 'Summoned',
        stats: monster.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencies: [],
        traits: [],
        features: [],
        flaws: [],
        ideals: [],
        bonds: [],
        backstory: '',
        languages: [],
        appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
        inventory: {},
        backpack: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        choices: {},
        hp: monster.hp,
        maxHp: monster.maxHp,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        // Setup action economy for summon/ally
        actionEconomy: {
          actions: { current: 1, max: 1 },
          bonusActions: { current: 1, max: 1 },
          reactions: { current: 1, max: 1 },
          movement: { current: 30, max: 30 },
          objectInteractions: { current: 1, max: 1 }
        }
      } as any;
    }
    return characters.find(c => c.id === activeTurnActor.id) || characters.find(c => c.id === activeCharacterId) || null;
  }, [activeTurnActor, characters, activeCharacterId, combatState.monsters]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpellsDropdownOpen(false);
        setIsAttacksDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all actions
  const allActions = useMemo(() => getCharacterActions(activeChar || null), [activeChar]);

  // Filter equipped weapons dynamically
  const characterWeapons = useMemo(() => {
    if (!activeChar) return [];
    const list: any[] = [];

    // Check inventory
    const inventory = activeChar.inventory || {};
    Object.entries(inventory).forEach(([slot, item]: [string, any]) => {
      if (item && (
        item.equipment_category?.index === 'weapon' ||
        (item._type === 'equipment' && (
          item.index?.includes('sword') ||
          item.index?.includes('dagger') ||
          item.index?.includes('bow') ||
          item.index?.includes('axe') ||
          item.index?.includes('mace') ||
          item.index?.includes('spear') ||
          item.index?.includes('staff') ||
          item.index?.includes('club')
        ))
      )) {
        list.push({ ...item, slot });
      }
    });

    // Check items (v2 inventory format)
    const items = activeChar.items || {};
    Object.values(items).forEach((item: any) => {
      if (item && (
        item.equipment_category?.index === 'weapon' ||
        (item.template && (
          item.template.includes('Sword') ||
          item.template.includes('Dagger') ||
          item.template.includes('Bow') ||
          item.template.includes('Axe') ||
          item.template.includes('Mace') ||
          item.template.includes('Spear') ||
          item.template.includes('Staff')
        ))
      )) {
        if (!list.some(existing => existing.id === item.id)) {
          list.push(item);
        }
      }
    });

    return list;
  }, [activeChar]);

  // Build the list of attacks (Weapons + Unarmed)
  const attacksList = useMemo(() => {
    const list: any[] = [];
    if (!activeChar) return [];

    const stats = activeChar.stats || { str: 10, dex: 10 };
    const strMod = Math.floor(((stats.str || 10) - 10) / 2);
    const dexMod = Math.floor(((stats.dex || 10) - 10) / 2);

    characterWeapons.forEach((w: any) => {
      const isRanged = w.weapon_range === 'Ranged' || w.index?.includes('bow') || w.index?.includes('crossbow') || w.template?.toLowerCase().includes('bow');
      const isFinesse = w.properties?.some((p: any) => p.index === 'finesse' || p.name === 'Finesse') || w.template?.toLowerCase().includes('dagger');
      const abilityMod = (isRanged || (isFinesse && dexMod > strMod)) ? dexMod : strMod;

      const dmgDice = w.damage?.damage_dice || (
        w.index?.includes('sword') || w.template?.toLowerCase().includes('sword') ? '1d8' :
        w.index?.includes('dagger') || w.template?.toLowerCase().includes('dagger') ? '1d4' :
        w.index?.includes('bow') || w.template?.toLowerCase().includes('bow') ? '1d8' : '1d6'
      );

      const finalDamage = `${dmgDice}${abilityMod >= 0 ? '+' : ''}${abilityMod !== 0 ? abilityMod : ''}`;
      const range = isRanged ? Math.max(1, Math.round((w.range?.normal || 80) / 5)) : 1;

      list.push({
        id: `attack-${w.id || w.index || Math.random().toString()}`,
        name: w.name || w.template || w.customName || "Weapon Strike",
        damage: finalDamage,
        range: range,
        isRanged,
        attackBonus: 2 + abilityMod,
        damageType: w.damage?.damage_type?.name || (isRanged ? 'piercing' : 'slashing')
      });
    });

    // Unarmed Strike (always available)
    list.push({
      id: 'attack-unarmed',
      name: "Unarmed Strike",
      damage: `1${strMod >= 0 ? '+' : ''}${strMod !== 0 ? strMod : ''}`,
      range: 1,
      isRanged: false,
      attackBonus: 2 + strMod,
      damageType: 'bludgeoning'
    });

    return list;
  }, [activeChar, characterWeapons]);

  const handleWeaponClick = (attack: any) => {
    setIsAttacksDropdownOpen(false);

    // Set targeting
    setTargetingAction({
      id: attack.id,
      name: attack.name,
      icon: attack.isRanged ? 'ranged_attack' : 'melee',
      range: attack.range,
      actionType: 'actions',
      category: 'Standard',
      attack_bonus: attack.attackBonus,
      damage: [{ damage_dice: attack.damage, damage_type: { name: attack.damageType } }]
    });
    setIsTargeting(true);
    addLog(`Preparing attack with ${attack.name}... Choose a target on the grid.`, 'info');
  };

  // Extract core action items
  const attackAction = allActions.find(a => a.id === 'attack');
  const moveAction = allActions.find(a => a.id === 'move');
  const defendAction = allActions.find(a => a.id === 'defend');
  const spellActions = useMemo(() => allActions.filter(a => a.category === 'Spells'), [allActions]);

  const handleActionClick = (action: ActionHudAction) => {
    setIsSpellsDropdownOpen(false);
    const isActive = targetingAction?.id === action.id;

    if (isActive) {
      setIsTargeting(false);
      setTargetingAction(null);
      addLog(`Action cancelled: ${action.name}`, 'warning');
      return;
    }

    // Check action economy
    if (action.actionType && activeChar?.actionEconomy) {
      const remaining = activeChar.actionEconomy[action.actionType].current;
      if (remaining <= 0) {
        addLog(`You don't have enough ${action.actionType.replace('bonusActions', 'bonus actions')}!`, 'error');
        return;
      }
    }

    // Check spell slots
    if (action.category === 'Spells' && action.data?.level > 0 && activeChar?.spellSlots) {
      const level = action.data.level;
      const slots = activeChar.spellSlots[level.toString()];
      if (!slots || slots.current <= 0) {
        addLog(`You don't have any level ${level} spell slots remaining!`, 'error');
        return;
      }
    }

    addLog(`Action selected: ${action.name}`, 'info');

    if (action.id === 'attack') {
      setIsTargeting(true);
      setTargetingAction({
        ...action,
        attack_bonus: 5,
        damage: [{ damage_dice: '1d8+3', damage_type: { name: 'slashing' } }]
      });
      addLog("Select a target on the grid.", 'info');
    } else if (action.id === 'move') {
      setIsTargeting(true);
      setTargetingAction({ ...action });
      addLog("Select destination on the grid.", 'info');
    } else if (action.category === 'Spells') {
      setIsTargeting(true);
      setTargetingAction({ ...action });
      addLog(`Casting ${action.name}. Select target.`, 'info');
    } else if (action.id === 'defend') {
      if (activeChar && activeChar.isNpc) {
         // Do not consume store character actions for a mock ally/summon character object
      } else {
         consumeAction(activeCharacterId, 'actions');
      }
      const actorId = activeChar?.id || activeCharacterId || 'player';
      useGameStore.setState(state => ({
        combatState: {
          ...state.combatState,
          activeConditions: {
            ...state.combatState.activeConditions,
            [actorId]: [...(state.combatState.activeConditions[actorId] || []), 'defending']
          }
        }
      }));
      addLog(`${activeChar?.name || 'Player'} adopts a defensive stance! (+2 AC)`, 'success');
      nextTurn();
    }
  };

  // Check if it's currently this character's or friendly ally's turn
  const isMyTurn = useMemo(() => {
    if (combatState.initiativeOrder.length === 0) return true;
    const currentActor = combatState.initiativeOrder[combatState.activeTurnIndex];
    return currentActor?.id === activeCharacterId;
  }, [combatState.initiativeOrder, combatState.activeTurnIndex, activeCharacterId]);

  const renderHudResourceDots = () => {
    const dots: React.ReactNode[] = [];

    const actionEconomy = activeChar?.actionEconomy;
    const spellSlots = activeChar?.spellSlots;

    // 1. Actions (Green)
    if (actionEconomy?.actions) {
      const { current = 0, max = 0 } = actionEconomy.actions;
      for (let i = 0; i < max; i++) {
        const isSpent = i >= current;
        dots.push(
          <div key={`hud-action-${i}`} className="flex flex-col items-center gap-0.5 px-0.5">
            <span
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                isSpent
                  ? "bg-emerald-950/40 border border-emerald-500/30"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] border border-emerald-300"
              )}
            />
            <span className="text-[6px] text-emerald-400 font-bold font-elan uppercase tracking-tighter">ACT</span>
          </div>
        );
      }
    }

    // 2. Bonus Actions (Orange)
    if (actionEconomy?.bonusActions) {
      const { current = 0, max = 0 } = actionEconomy.bonusActions;
      for (let i = 0; i < max; i++) {
        const isSpent = i >= current;
        dots.push(
          <div key={`hud-bonus-${i}`} className="flex flex-col items-center gap-0.5 px-0.5">
            <span
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                isSpent
                  ? "bg-amber-950/40 border border-amber-500/30"
                  : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)] border border-amber-400"
              )}
            />
            <span className="text-[6px] text-amber-500 font-bold font-elan uppercase tracking-tighter">BON</span>
          </div>
        );
      }
    }

    // 3. Spell Slots (1-9)
    if (spellSlots) {
      const slotColors: Record<number, { fill: string, spentBorder: string, glow: string, text: string }> = {
        1: { fill: 'bg-[rgb(160,224,255)]', spentBorder: 'border-[rgb(160,224,255)]/30', glow: 'shadow-[0_0_8px_rgba(160,224,255,0.9)] border-[rgb(200,240,255)]', text: 'text-[rgb(160,224,255)]' },
        2: { fill: 'bg-[rgb(120,200,255)]', spentBorder: 'border-[rgb(120,200,255)]/30', glow: 'shadow-[0_0_8px_rgba(120,200,255,0.9)] border-[rgb(180,225,255)]', text: 'text-[rgb(120,200,255)]' },
        3: { fill: 'bg-[rgb(90,170,255)]', spentBorder: 'border-[rgb(90,170,255)]/30', glow: 'shadow-[0_0_8px_rgba(90,170,255,0.9)] border-[rgb(150,200,255)]', text: 'text-[rgb(90,170,255)]' },
        4: { fill: 'bg-[rgb(110,130,255)]', spentBorder: 'border-[rgb(110,130,255)]/30', glow: 'shadow-[0_0_8px_rgba(110,130,255,0.9)] border-[rgb(160,180,255)]', text: 'text-[rgb(110,130,255)]' },
        5: { fill: 'bg-[rgb(140,110,255)]', spentBorder: 'border-[rgb(140,110,255)]/30', glow: 'shadow-[0_0_8px_rgba(140,110,255,0.9)] border-[rgb(180,160,255)]', text: 'text-[rgb(140,110,255)]' },
        6: { fill: 'bg-[rgb(170,90,255)]', spentBorder: 'border-[rgb(170,90,255)]/30', glow: 'shadow-[0_0_8px_rgba(170,90,255,0.9)] border-[rgb(200,150,255)]', text: 'text-[rgb(170,90,255)]' },
        7: { fill: 'bg-[rgb(200,60,255)]', spentBorder: 'border-[rgb(200,60,255)]/30', glow: 'shadow-[0_0_8px_rgba(200,60,255,0.9)] border-[rgb(220,120,255)]', text: 'text-[rgb(200,60,255)]' },
        8: { fill: 'bg-[rgb(220,30,255)]', spentBorder: 'border-[rgb(220,30,255)]/30', glow: 'shadow-[0_0_8px_rgba(220,30,255,0.9)] border-[rgb(240,100,255)]', text: 'text-[rgb(220,30,255)]' },
        9: { fill: 'bg-[rgb(240,0,255)]', spentBorder: 'border-[rgb(240,0,255)]/30', glow: 'shadow-[0_0_10px_rgba(240,0,255,1)] border-[rgb(255,100,255)]', text: 'text-[rgb(240,0,255)]' },
      };

      for (let level = 1; level <= 9; level++) {
        const slots = spellSlots[level.toString()];
        if (slots) {
          const { current = 0, max = 0 } = slots;
          for (let i = 0; i < max; i++) {
            const isSpent = i >= current;
            const colors = slotColors[level] || slotColors[1];
            dots.push(
              <div key={`hud-spell-${level}-${i}`} className="flex flex-col items-center gap-0.5 px-0.5">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isSpent
                      ? `bg-stone-900/60 border ${colors.spentBorder}`
                      : `${colors.fill} ${colors.glow}`
                  )}
                />
                <span className={cn("text-[6px] font-bold font-elan", colors.text)}>L{level}</span>
              </div>
            );
          }
        }
      }
    }

    if (dots.length === 0) return null;

    return (
      <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-stone-950/95 border border-dragon-gold/30 rounded-full shadow-inner mb-1.5 pointer-events-auto">
        {dots}
      </div>
    );
  };

  if (!isMyTurn) return null;

  return (
    <div 
      className="absolute pointer-events-none z-[130] flex flex-col items-center"
      style={{
        left: x * cellSize + cellSize / 2,
        top: y * cellSize,
        transform: 'translate(-50%, -120%)'
      }}
    >
      {renderHudResourceDots()}

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="flex items-center gap-1.5 p-1.5 bg-stone-950/90 border border-dragon-gold/40 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-auto"
      >
        {/* Quick Attack */}
        {attackAction && (
          <div className="relative">
            <button
              onClick={() => setIsAttacksDropdownOpen(!isAttacksDropdownOpen)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow hover:scale-110",
                isAttacksDropdownOpen || targetingAction?.id?.startsWith('attack-')
                  ? "bg-dragon-red border-dragon-gold text-white"
                  : "bg-stone-900 border-white/10 text-white hover:border-white/30"
              )}
              title="Attack with Weapons (1 Action)"
            >
              <GameIcon name="melee" size={16} />
            </button>

            {/* Compact Attacks Dropdown */}
            <AnimatePresence>
              {isAttacksDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-stone-950 border border-dragon-gold/30 rounded-md shadow-xl p-1 z-50 max-h-48 overflow-y-auto custom-scrollbar"
                >
                  <div className="text-[8px] font-black uppercase text-dragon-gold tracking-widest px-2 py-1 border-b border-white/5 mb-1 text-center font-elan">
                    Weapons & Attacks
                  </div>
                  {attacksList.map((atk) => (
                    <button
                      key={atk.id}
                      onClick={() => handleWeaponClick(atk)}
                      className={cn(
                        "w-full px-2 py-1.5 text-left rounded text-white/80 hover:text-white hover:bg-stone-900 transition-colors flex flex-col gap-0.5",
                        targetingAction?.id === atk.id && "text-dragon-gold bg-dragon-gold/10"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate text-[10px] font-serif font-black uppercase tracking-wider">{atk.name}</span>
                        <span className="text-[8px] text-dragon-gold font-black font-elan">{atk.isRanged ? 'RNG' : 'MEL'}</span>
                      </div>
                      <div className="flex items-center justify-between w-full text-[8px] opacity-60">
                        <span>Range: {atk.range * 5}ft ({atk.range} cells)</span>
                        <span>Dmg: {atk.damage}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Move */}
        {moveAction && (
          <button
            onClick={() => handleActionClick(moveAction)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow hover:scale-110",
              targetingAction?.id === 'move'
                ? "bg-blue-600 border-dragon-gold text-white"
                : "bg-stone-900 border-white/10 text-white hover:border-white/30"
            )}
            title="Move (Movement)"
          >
            <GameIcon name="footsteps" size={16} />
          </button>
        )}

        {/* Spells Menu */}
        {spellActions.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSpellsDropdownOpen(!isSpellsDropdownOpen)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow hover:scale-110",
                isSpellsDropdownOpen || targetingAction?.category === 'Spells'
                  ? "bg-purple-600 border-dragon-gold text-white"
                  : "bg-stone-900 border-white/10 text-white hover:border-white/30"
              )}
              title="Known Spells"
            >
              <GameIcon name="spells" size={16} />
            </button>

            {/* Compact Spell Dropdown */}
            <AnimatePresence>
              {isSpellsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-stone-950 border border-dragon-gold/30 rounded-md shadow-xl p-1 z-50 max-h-48 overflow-y-auto custom-scrollbar"
                >
                  <div className="text-[8px] font-black uppercase text-dragon-gold tracking-widest px-2 py-1 border-b border-white/5 mb-1 text-center font-elan">
                    Spells
                  </div>
                  {spellActions.map((spell) => (
                    <button
                      key={spell.id}
                      onClick={() => handleActionClick(spell)}
                      className={cn(
                        "w-full px-2 py-1 text-left text-[10px] font-serif font-black uppercase tracking-wider rounded text-white/80 hover:text-white hover:bg-stone-900 transition-colors flex items-center justify-between",
                        targetingAction?.id === spell.id && "text-dragon-gold bg-dragon-gold/10"
                      )}
                    >
                      <span className="truncate">{spell.name}</span>
                      {spell.data?.level !== undefined && (
                        <span className="text-[8px] text-purple-400 font-bold">L{spell.data.level}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Defend */}
        {defendAction && (
          <button
            onClick={() => handleActionClick(defendAction)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all border bg-stone-900 border-white/10 text-white hover:border-white/30 shadow hover:scale-110"
            title="Defend stance (+2 AC)"
          >
            <GameIcon name="shield" size={16} />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-0.5" />

        {/* End Turn */}
        <button
          onClick={() => {
            addLog(`${activeChar?.name || 'Player'} has ended their turn.`, 'success');
            setIsSpellsDropdownOpen(false);
            nextTurn();
          }}
          className="px-3 h-8 bg-dragon-gold text-stone-950 text-[10px] font-black uppercase tracking-wider rounded-full hover:brightness-110 active:scale-95 transition-all shadow border border-white/20 font-elan"
          title="End Your Turn"
        >
          End Turn
        </button>
      </motion.div>
    </div>
  );
};
