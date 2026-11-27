import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { fetchMonsterData } from '../../../services/storageService';

export const CombatEncounterPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const combatState = useGameStore(state => state.combatState);
  const { setFocusedItem, setIsMonsterProfileOpen } = useUIStore();
  const profileRequestId = useRef(0);

  useEffect(() => () => {
    profileRequestId.current += 1;
  }, []);

  const activeActor = combatState.initiativeOrder[combatState.activeTurnIndex];
  const hostiles = combatState.monsters.filter(monster => !monster.isAlly);

  const openEnemyProfile = async (monster: (typeof hostiles)[number]) => {
    const requestId = ++profileRequestId.current;
    // Only resolve through Atlas when the combatant carries its canonical index.
    // Older runtime records are still inspectable, but are never looked up by creature type.
    const canonicalIndex = monster.index;
    const profile = canonicalIndex ? await fetchMonsterData(canonicalIndex) : null;

    // Drop stale results after another selection, panel unmount, or leaving combat.
    if (requestId !== profileRequestId.current || useUIStore.getState().gameMode !== 'combat') return;

    setFocusedItem(profile || {
      ...monster,
      hit_points: monster.maxHp,
      armor_class: monster.armor_class,
      strength: monster.stats?.str,
      dexterity: monster.stats?.dex,
      constitution: monster.stats?.con,
      intelligence: monster.stats?.int,
      wisdom: monster.stats?.wis,
      charisma: monster.stats?.cha,
      image: monster.imageUrl,
      isCombatRuntimeFallback: true
    });
    setIsMonsterProfileOpen(true);
  };

  return (
    <div className="world-panel h-full w-80 shrink-0 relative flex flex-col overflow-hidden bg-stone-950 text-parchment-100 border-r border-dragon-gold/30 shadow-2xl">
      <div className="shrink-0 p-4 border-b border-dragon-gold/20 bg-black/40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-dragon-gold">
              <GameIcon name="identity" size={15} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Encounter</span>
            </div>
            <h2 className="mt-1 text-lg font-header font-black uppercase tracking-wider text-white">Hostile forces</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close combat encounter panel"
            title="Close panel"
            className="p-2 rounded border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <GameIcon name="x" size={14} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
          <span>{hostiles.length} hostile{hostiles.length === 1 ? '' : 's'}</span>
          <span>Turn: <span className="text-dragon-gold">{activeActor?.name || 'Awaiting initiative'}</span></span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {hostiles.length === 0 ? (
          <div className="h-full min-h-40 flex flex-col items-center justify-center text-center px-5 text-white/35">
            <GameIcon name="shield" size={30} />
            <p className="mt-3 text-xs font-bold uppercase tracking-widest">No hostiles present</p>
            <p className="mt-1 text-[10px] leading-relaxed">Hostile combatants will appear here when they join the encounter.</p>
          </div>
        ) : hostiles.map(monster => {
          const hpPercent = monster.maxHp > 0
            ? Math.max(0, Math.min(100, (monster.hp / monster.maxHp) * 100))
            : 0;
          const activeConditions = combatState.activeConditions[monster.id] || [];
          const initiative = combatState.initiativeOrder.find(entry => entry.id === monster.id);
          const isActive = activeActor?.id === monster.id;
          const speedInFeet = Number.isFinite(monster.speed) ? monster.speed * 5 : null;

          return (
            <button
              key={monster.id}
              onClick={() => void openEnemyProfile(monster)}
              aria-label={`Inspect ${monster.name}`}
              className={cn(
                "w-full text-left flex gap-3 p-3 rounded border transition-all group",
                isActive
                  ? "bg-dragon-red/20 border-dragon-gold/70 shadow-[0_0_16px_rgba(212,175,55,0.12)]"
                  : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/25"
              )}
            >
              <div className="w-12 h-12 shrink-0 rounded overflow-hidden bg-black/40 border border-white/10 relative">
                {monster.imageUrl ? (
                  <img src={monster.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <GameIcon name="identity" size={20} />
                  </div>
                )}
                {isActive && <span className="absolute inset-0 ring-2 ring-inset ring-dragon-gold pointer-events-none" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate text-[11px] font-black uppercase tracking-wide text-white group-hover:text-dragon-gold">
                    {monster.name}
                  </span>
                  <span className="shrink-0 text-[9px] font-mono text-dragon-gold/80">
                    {initiative ? `#${initiative.value}` : ''}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-[9px] font-bold text-white/55">
                  <span>HP {monster.hp}/{monster.maxHp}</span>
                  <span>AC {monster.armor_class?.[0]?.value ?? monster.armor_class ?? '—'}</span>
                  {speedInFeet !== null && <span>{speedInFeet} ft</span>}
                </div>

                <div className="mt-1.5 h-1.5 rounded-full bg-black/60 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      hpPercent <= 25 ? "bg-red-500" : hpPercent <= 50 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>

                {activeConditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {activeConditions.map(condition => (
                      <span key={condition} className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-400/20 text-[8px] uppercase tracking-wide text-amber-200">
                        {condition.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {(monster as typeof monster & { challenge_rating?: string | number }).challenge_rating !== undefined && (
                  <span className="mt-1 block text-[8px] uppercase tracking-widest text-white/30">
                    CR {(monster as typeof monster & { challenge_rating?: string | number }).challenge_rating}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-black/30 px-4 py-3 flex items-center justify-between text-[8px] uppercase tracking-widest text-white/30">
        <span>Combat state</span>
        <span className="text-dragon-gold">{combatState.initiativeOrder.length} in initiative</span>
      </div>
    </div>
  );
};
