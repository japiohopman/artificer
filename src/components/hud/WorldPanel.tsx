import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useGameStore } from '../../store/useGameStore';
import { useJournalStore } from '../../store/useJournalStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Travel } from './game/Travel';
import { WorldEnvironmentHeader } from './WorldEnvironmentHeader';

class MarkdownErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const WorldPanel: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
    isInsideSubMap,
    setIsInsideSubMap,
    gameMode,
    setIsMonsterProfileOpen,
    setFocusedItem
  } = useUIStore();

  const {
    partyLocation,
    partySubLocation,
    currentLocation,
    inspectedLocation,
    isTraveling,
    travelProgress,
    destination,
    subMapActiveCategories: activeCategories,
    setSubMapActiveCategories: setActiveCategories,
    subMapAllCategories: allCategories,
    subMapActiveLayer: activeLayer,
    setSubMapActiveLayer: setActiveLayer
  } = useWorldStore();

  // Spatial presentation context
  const displayLocation = inspectedLocation || currentLocation || partyLocation;

  const { combatState } = useGameStore();
  const { unlockLore } = useJournalStore();

  const [isTravelExpanded, setIsTravelExpanded] = React.useState(true);
  const [loreContent, setLoreContent] = React.useState<string | null>(null);

  // Fetch lore markdown
  React.useEffect(() => {
    let isMounted = true;
    const fetchLore = async () => {
      if ((displayLocation as any)?.lore) {
        try {
          const res = await fetch((displayLocation as any).lore);
          if (res.ok) {
            const text = await res.text();
            if (text.trim().toLowerCase().startsWith('<!doctype html>') || text.trim().toLowerCase().startsWith('<html')) {
              if (isMounted) setLoreContent(null);
            } else {
              if (isMounted) setLoreContent(text);
            }
          } else {
            if (isMounted) setLoreContent(null);
          }
        } catch (e) {
          if (isMounted) setLoreContent(null);
        }
      } else {
        if (isMounted) setLoreContent(null);
      }
    };
    fetchLore();
    return () => { isMounted = false; };
  }, [(displayLocation as any)?.lore, displayLocation?.id]);

  return (
    <div className="world-panel h-full bg-parchment-50 overflow-hidden relative flex flex-col bg-paper-texture w-80 shrink-0 border-r border-dragon-gold/20 shadow-2xl">
      {/* 1. WORLD CONTEXT: Integrated World Environment Header Banner */}
      <WorldEnvironmentHeader
        displayLocation={displayLocation}
        isTravelExpanded={isTravelExpanded}
        onToggleTravel={() => setIsTravelExpanded(!isTravelExpanded)}
        onClose={() => setIsWorldPanelOpen(false)}
      />

      {/* CONTENT: Scrollable Context Layers */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

        {/* 2. PARTY PRESENCE: Authoritative Party Position & Spatial State */}
        <div className="space-y-3 p-3 bg-white/40 border border-dragon-gold/30 rounded-md shadow-sm">
          <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-1.5">
            <div className="flex items-center gap-2">
              <GameIcon name="footsteps" size={14} color="#8B0000" />
              <span className="text-[10px] font-black uppercase text-dragon-red tracking-[0.2em]">
                Party_Presence
              </span>
            </div>
            {isTraveling && (
              <span className="text-[8px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                In Transit
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-parchment-900 font-serif">
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] font-bold text-stone-500 uppercase">Physical Location:</span>
              <span className="text-[11px] font-black text-dragon-darkRed truncate max-w-[170px] text-right">
                {partyLocation ? (partyLocation.name || partyLocation.title || partyLocation.id) : 'Unknown Location'}
              </span>
            </div>

            {partySubLocation && (
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] font-bold text-stone-500 uppercase">Sector/Sub-Location:</span>
                <span className="text-[10px] font-bold text-parchment-800 truncate max-w-[150px] text-right">
                  {typeof partySubLocation === 'string' ? partySubLocation : (partySubLocation.name || partySubLocation.id)}
                </span>
              </div>
            )}

            {isTraveling && destination && (
              <div className="mt-2 pt-2 border-t border-dragon-gold/15 space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-dragon-red uppercase">
                  <span>Destination: {destination.name}</span>
                  <span>{Math.round((travelProgress || 0) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-900/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-dragon-gold transition-all duration-300"
                    style={{ width: `${Math.round((travelProgress || 0) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. ACTIVE CONTEXT: Combat Threats / Topography / Active Landmark & Entities */}

        {/* 3A. Active Combat Context (Consumes canonical combatState) */}
        {gameMode === 'combat' && combatState.monsters.length > 0 && (
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
                      const { fetchMonsterData } = await import('../../services/storageService');
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

        {/* 3B. SubMap Category Filters & Layers */}
        {isInsideSubMap && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
                <div className="flex items-center gap-2">
                   <GameIcon name="city" size={14} color="#8B0000" />
                   <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">Local_Topography</h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
             </div>

             {/* Layers Toggles if Sewers exist */}
             {currentLocation?.sub_location_files?.some((f: string) => f.includes('sewers')) && (
               <div className="bg-white/40 border border-dragon-red/10 rounded p-3 space-y-2">
                 <span className="text-[8px] font-black text-dragon-gold uppercase tracking-widest block">Map Layers</span>
                 <div className="flex gap-2">
                   <button
                     onClick={() => setActiveLayer(null)}
                     className={cn(
                       "flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-all",
                       !activeLayer ? "bg-dragon-gold text-white border-dragon-gold" : "bg-white/50 text-dragon-red/60 border-dragon-red/10"
                     )}
                   >
                     Surface
                   </button>
                   <button
                     onClick={() => {
                       const sewerMap = (currentLocation?.map || '').replace('.webp', '_sewers.webp');
                       setActiveLayer(sewerMap);
                     }}
                     className={cn(
                       "flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-all",
                       activeLayer ? "bg-dragon-gold text-white border-dragon-gold" : "bg-white/50 text-dragon-red/60 border-dragon-red/10"
                     )}
                   >
                     Sewers
                   </button>
                 </div>
               </div>
             )}

             {/* Submap categories toggler */}
             {allCategories.length > 0 && (
               <div className="bg-white/40 border border-dragon-red/10 rounded p-3 space-y-3">
                  <span className="text-[8px] font-black text-dragon-gold uppercase tracking-widest block">Location Legend & Filters</span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                    {allCategories.map((cat) => {
                      const isActive = activeCategories.includes(cat);
                      const label = cat.replace(/_/g, ' ').replace('.json', '');

                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategories(isActive ? activeCategories.filter(c => c !== cat) : [...activeCategories, cat]);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-tighter transition-all group",
                            isActive
                              ? "bg-dragon-red text-white"
                              : "bg-parchment-200/50 text-dragon-red/60 hover:bg-parchment-300 hover:text-dragon-red"
                          )}
                        >
                          <span>{label}</span>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors",
                            isActive ? "bg-dragon-gold animate-pulse" : "bg-dragon-red/20 group-hover:bg-dragon-red/40"
                          )} />
                        </button>
                      );
                    })}
                  </div>
               </div>
             )}
          </div>
        )}

        {/* 3C. Active Domain / Landmark Context & Lore */}
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
                  onClick={() => useWorldStore.getState().setInspectedLocation(null)}
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

      {/* 4. INTERACTION / RESOLUTION CONTEXT: Contextual Actions, Travel, Lore Codex */}
      <div className="bg-parchment-100/95 border-t-2 border-dragon-gold shadow-[0_-4px_12px_rgba(0,0,0,0.1)] shrink-0 z-30">
        {displayLocation && (
          <div className="flex flex-col">
            {!isInsideSubMap ? (
              <Travel
                destination={displayLocation}
                isMinimized={!isTravelExpanded}
              />
            ) : (
              <div className="p-4 bg-parchment-100/90 flex flex-col gap-3">
                 <div className="flex items-center justify-between border-b border-dragon-red/10 pb-2">
                    <div className="flex items-center gap-2">
                       <GameIcon name="city" size={14} color="#8B0000" />
                       <span className="text-[9px] font-black uppercase text-dragon-red tracking-widest">Active Settlement</span>
                    </div>
                    <button
                      onClick={() => setIsInsideSubMap(false)}
                      className="text-[9px] font-black text-dragon-red hover:underline uppercase tracking-tighter"
                    >
                      Return to Atlas
                    </button>
                 </div>

                 <button
                   onClick={() => setIsInsideSubMap(false)}
                   className="w-full py-3 bg-dragon-red hover:bg-dragon-darkRed text-white font-bold text-xs uppercase tracking-widest rounded border-2 border-dragon-gold/30 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                 >
                   <GameIcon name="chevron_left" size={14} color="#FFFFFF" />
                   Exit Location
                 </button>
              </div>
            )}

            {(displayLocation as any).lore && (
              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    const lorePath = (displayLocation as any).lore;
                    unlockLore(lorePath);
                    setIsWorldPanelOpen(false);
                    useUIStore.getState().setIsJournalOpen(true);
                  }}
                  className="w-full py-2 bg-parchment-200 hover:bg-parchment-300 text-dragon-red font-bold text-[10px] uppercase tracking-widest rounded border border-dragon-gold/30 transition-all flex items-center justify-center gap-2"
                >
                  <GameIcon name="lore" size={12} color="#8B0000" />
                  Open Lore Codex
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
