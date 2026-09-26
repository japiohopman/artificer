import React from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore, SavedLocation } from '../../../store/useWorldStore';
import { useGameStore } from '../../../store/useGameStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import ReactMarkdown from 'react-markdown';

class MarkdownErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export type ActiveContextType = 'combat' | 'landmark' | 'npc' | 'shop' | 'object' | 'encounter';

interface ActiveContextPanelProps {
  displayLocation: SavedLocation | null;
  loreContent: string | null;
}

export const ActiveContextPanel: React.FC<ActiveContextPanelProps> = ({ displayLocation, loreContent }) => {
  const { gameMode, setIsMonsterProfileOpen, setFocusedItem } = useUIStore();
  const { inspectedLocation, setInspectedLocation } = useWorldStore();
  const { combatState } = useGameStore();

  // Determine active context mode dynamically
  const activeContextType: ActiveContextType = gameMode === 'combat' && combatState.monsters.length > 0
    ? 'combat'
    : 'landmark';

  return (
    <div className="active-context-panel space-y-4">
      {/* A. ACTIVE COMBAT THREATS CONTEXT */}
      {activeContextType === 'combat' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
            <div className="flex items-center gap-2">
              <GameIcon name="identity" size={14} color="#8B0000" />
              <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">Active_Threats</h3>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {combatState.monsters.map((monster) => {
              const hpPercent = (monster.hp / monster.maxHp) * 100;
              const barColor = hpPercent < 30 ? "bg-red-600" : "bg-green-600 animate-pulse";
              const speedText = monster.speed ? (typeof monster.speed === 'object' ? ((monster.speed as any).walk || '30 ft') : `${(monster.speed as any) * 5} ft`) : '30 ft';

              return (
                <button
                  key={monster.id}
                  onClick={async () => {
                    const { fetchMonsterData } = await import('../../../services/storageService');
                    const baseName = monster.type || monster.name.replace(/\s\d+$/, '').replace(/-\d+$/, '').trim().toLowerCase().replace(/\s+/g, '-');
                    const fullData = await fetchMonsterData(baseName);
                    setFocusedItem(fullData || monster);
                    setIsMonsterProfileOpen(true);
                  }}
                  className="group flex items-center gap-3 p-2 bg-red-50/50 hover:bg-red-100/50 border border-dragon-red/10 hover:border-dragon-red/30 rounded transition-all text-left shadow-sm hover:shadow-md active:scale-[0.98] relative pl-4"
                >
                  <div className="absolute left-1 top-2 bottom-2 w-1.5 bg-stone-950/40 rounded-full overflow-hidden flex flex-col justify-end">
                    <div
                      className={cn("w-full transition-all duration-500 rounded-full", barColor)}
                      style={{ height: `${hpPercent}%` }}
                    />
                  </div>

                  <div className="w-10 h-10 rounded border border-dragon-red/20 overflow-hidden bg-white flex items-center justify-center shrink-0 group-hover:border-dragon-red transition-colors relative">
                    {monster.imageUrl ? (
                      <img src={monster.imageUrl} className="w-full h-full object-cover" alt={monster.name} />
                    ) : (
                      <GameIcon name="identity" size={20} color="#8B0000" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-[11px] font-black text-parchment-900 uppercase tracking-tight truncate group-hover:text-dragon-darkRed transition-colors">
                        {monster.name}
                      </p>
                      <span className="text-[8px] font-bold text-stone-500 whitespace-nowrap uppercase">
                        CR {(monster as any).challenge_rating ?? '0'}
                      </span>
                    </div>
                    <div className="text-[8px] font-black uppercase text-stone-500/80 tracking-wide flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>HP: {monster.hp}/{monster.maxHp}</span>
                      <span>AC: {monster.armor_class ?? '10'}</span>
                      <span>Speed: {speedText}</span>
                      <span className="text-dragon-red/70">{monster.type ?? 'Monster'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* B. ACTIVE LANDMARK / DOMAIN CONTEXT */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
          <div className="flex items-center gap-2">
            <GameIcon name={inspectedLocation ? "search" : "map"} size={14} color="#8B0000" />
            <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">
              {inspectedLocation ? 'Inspecting_Landmark' : 'Active_Domain'}
            </h3>
            {inspectedLocation && (
              <button
                onClick={() => setInspectedLocation(null)}
                className="ml-2 text-[8px] bg-dragon-red/10 hover:bg-dragon-red/20 text-dragon-red px-2 py-0.5 rounded-full transition-colors font-black uppercase tracking-tighter"
              >
                Clear
              </button>
            )}
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
        </div>

        <div className={cn(
          "bg-white/30 border rounded overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 p-4 bg-white/40",
          inspectedLocation ? "border-blue-500/50 shadow-blue-500/10" : "border-dragon-red/10"
        )}>
          {loreContent ? (
            <div className="text-xs text-parchment-800 leading-relaxed font-serif markdown-content space-y-2">
              <MarkdownErrorBoundary fallback={<p>{loreContent}</p>}>
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-black text-dragon-red uppercase tracking-widest mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-dragon-red uppercase tracking-wider mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-dragon-darkRed mt-4 mb-2" {...props} />,
                    hr: ({node, ...props}) => <hr className="border-t-2 border-dragon-gold my-6 shadow-sm" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-parchment-900 leading-relaxed font-serif" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-dragon-darkRed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-parchment-900 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-parchment-900 space-y-1" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-dragon-gold pl-4 py-1 italic bg-dragon-gold/10 text-parchment-800 my-4" {...props} />,
                  }}
                >
                  {loreContent}
                </ReactMarkdown>
              </MarkdownErrorBoundary>
            </div>
          ) : (
            <p className="text-xs text-parchment-800 italic leading-relaxed font-serif">
              {displayLocation?.description || (displayLocation ? 'No detailed description available for this domain.' : 'Unknown location - missing canonical Atlas record.')}
            </p>
          )}

          {displayLocation?.region && (
            <div className="mt-4 pt-4 border-t border-dragon-red/5 flex items-center justify-between">
              <span className="text-[8px] font-black text-parchment-400 uppercase tracking-widest">Regional Cluster</span>
              <span className="text-[10px] font-bold text-dragon-red uppercase">{displayLocation?.region}</span>
            </div>
          )}

          {/* Metadata Schema Fields */}
          <div className="mt-6 space-y-4">
            {displayLocation && Object.entries({
              history: 'History & Lore',
              government: 'Government',
              ruler: 'Ruler',
              population: 'Population',
              economy: 'Economy & Trade',
              metadata: 'Metadata',
              climate: 'Climate',
              biome: 'Biome',
              wildlife: 'Wildlife',
              dangers: 'Dangers',
              factions: 'Factions',
              religion: 'Religion',
              services: 'Services',
              inventory: 'Inventory',
              opening_hours: 'Opening Hours',
              quests: 'Rumors & Quests',
              districts: 'Districts',
              owner: 'Owner'
            }).map(([key, title]) => {
              const data = (displayLocation as any)[key];
              if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) return null;

              return (
                <div key={key} className="pt-4 border-t border-dragon-red/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dragon-red mb-2 flex items-center gap-2">
                    <GameIcon name="scroll" size={12} color="#8B0000" />
                    {title}
                  </h4>
                  {typeof data === 'string' ? (
                    <p className="text-xs text-parchment-800 leading-relaxed font-serif whitespace-pre-wrap">{data}</p>
                  ) : Array.isArray(data) ? (
                    <ul className="list-disc pl-4 text-xs text-parchment-800 space-y-1 font-serif">
                      {data.map((item, idx) => (
                        <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(data).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs text-parchment-800 font-serif">
                          <span className="font-bold capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span>{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
