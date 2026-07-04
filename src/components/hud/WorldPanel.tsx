import React from 'react';
import { motion } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useGameStore } from '../../store/useGameStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useJournalStore } from '../../store/useJournalStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { createPortal } from 'react-dom';

class MarkdownErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const WorldPanel: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
    gameMode,
    setIsMonsterProfileOpen,
    setFocusedItem
  } = useUIStore();

  const {
    currentLocation,
    inspectedLocation,
    savedLocations,
    gameTime,
    gameDay,
    partyLocation,
    isTraveling,
    destination,
    travelProgress,
    startTravel,
    stopTravel
  } = useWorldStore();

  const displayLocation = inspectedLocation || currentLocation;

  const isNight = gameTime < 360 || gameTime >= 1080;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const { partyVehicles, partyInventory, partyStats } = useInventoryStore();
  const { characters } = useCharacterStore();
  const { combatState } = useGameStore();
  const { unlockLore, unlockedLore } = useJournalStore();

  const [showTravelJournal, setShowTravelJournal] = React.useState(false);
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

  const calcTravelStats = React.useCallback((dest: any) => {
    if (!dest || !partyLocation) return null;

    const x1 = partyLocation.coordinates?.x ?? partyLocation.position?.[0] ?? 0;
    const y1 = partyLocation.coordinates?.y ?? partyLocation.position?.[1] ?? 0;
    const x2 = dest.coordinates?.x ?? dest.position?.[0] ?? 0;
    const y2 = dest.coordinates?.y ?? dest.position?.[1] ?? 0;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distProto = Math.sqrt(dx * dx + dy * dy);
    const milesRemaining = distProto / (4763 / 4000);

    let speedMph = 3.0;
    
    // Weight Penalty Check
    const parseWeight = (weight: any): number => {
      if (!weight) return 0;
      if (typeof weight === 'number') return weight;
      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
      return weightMatch ? parseFloat(weightMatch[0]) : 0;
    };
    const calculateItemWeight = (item: any): number => parseWeight(item.weight) * (item.quantity || 1);
    const totalWeight = (partyInventory || []).reduce((acc, item) => acc + calculateItemWeight(item), 0) + 
                       characters.reduce((acc, char) => acc + (char.backpack || []).reduce((cAcc: number, item: any) => cAcc + calculateItemWeight(item), 0), 0);
    const totalCapacity = (Math.max(partyStats.memberCount, characters.length, 1) * partyStats.baseCapacityPerMember) + 
                          partyStats.vehicleCapacityBonus + (partyVehicles || []).reduce((acc, v) => acc + (v.capacity || 0), 0);

    if (totalWeight > totalCapacity) speedMph *= 0.5;
    if (partyVehicles && partyVehicles.length > 0) speedMph *= 1.5;

    const hoursRemaining = milesRemaining / speedMph;
    const minsRemaining = Math.round(hoursRemaining * 60);

    const rationsNeeded = Math.ceil(hoursRemaining / 24) * partyStats.memberCount;
    const waterNeeded = Math.ceil(hoursRemaining / 24) * partyStats.memberCount;

    return {
      speed: speedMph,
      miles: milesRemaining,
      eta: minsRemaining,
      isOverburdened: totalWeight > totalCapacity,
      rationsNeeded,
      waterNeeded,
      vehicles: partyVehicles || []
    };
  }, [partyLocation, partyInventory, characters, partyStats, partyVehicles]);

  const travelStats = React.useMemo(() => isTraveling ? calcTravelStats(destination) : null, [isTraveling, destination, calcTravelStats]);
  const preTravelStats = React.useMemo(() => showTravelJournal ? calcTravelStats(displayLocation) : null, [showTravelJournal, displayLocation, calcTravelStats]);

  return (
    <div
      className="h-full bg-parchment-50 overflow-hidden relative flex flex-col bg-paper-texture"
    >
      <div className="w-80 h-full flex flex-col shrink-0">
        <div 
          className="relative p-6 border-b-2 border-dragon-red flex items-center justify-between shadow-sm min-h-[140px] overflow-hidden"
        >
          {displayLocation?.image ? (
            <div 
              className="absolute inset-0 z-0 bg-cover bg-no-repeat transition-all duration-1000"
              style={{
                backgroundImage: `url(${displayLocation.image})`,
                backgroundSize: '100% 200%',
                backgroundPosition: isNight ? 'bottom center' : 'top center'
              }}
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-parchment-100/80 backdrop-blur-sm" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

          <div className="relative z-20 flex flex-col">
            <span className="text-[8px] font-black text-dragon-gold uppercase tracking-[0.3em] leading-none mb-1 drop-shadow-md">
              {displayLocation ? displayLocation.category || 'Location' : 'Cartographic'}
            </span>
            <h2 className="text-2xl font-header text-white uppercase tracking-widest leading-none drop-shadow-lg">
              {displayLocation ? displayLocation.name : 'World Atlas'}
            </h2>
          </div>
          <button 
            onClick={() => setIsWorldPanelOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 group relative z-20"
            title="Close World Panel"
            aria-label="Close World Panel"
          >
            <GameIcon name="chevron_left" size={24} color="#FFFFFF" className="group-hover:-translate-x-1 transition-transform drop-shadow-md" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Active Combat Monsters */}
          {gameMode === 'combat' && combatState.monsters.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
                <div className="flex items-center gap-2">
                  <GameIcon name="identity" size={14} color="#8B0000" />
                  <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">Active_Threats</h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {combatState.monsters.map((monster) => (
                  <button
                    key={monster.id}
                    onClick={() => {
                      setFocusedItem(monster);
                      setIsMonsterProfileOpen(true);
                    }}
                    className="group flex items-center gap-4 p-3 bg-red-50/50 hover:bg-red-100/50 border border-dragon-red/10 hover:border-dragon-red/30 rounded transition-all text-left shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded border-2 border-dragon-red/20 overflow-hidden bg-white flex items-center justify-center shrink-0 group-hover:border-dragon-red transition-colors">
                      {monster.imageUrl ? (
                        <img src={monster.imageUrl} className="w-full h-full object-cover" alt={monster.name} />
                      ) : (
                        <GameIcon name="identity" size={20} color="#8B0000" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[11px] font-black text-parchment-900 uppercase tracking-tight truncate group-hover:text-dragon-darkRed transition-colors">{monster.name}</p>
                        <span className="text-[9px] font-bold text-dragon-red/60 uppercase">{monster.hp}/{monster.maxHp} HP</span>
                      </div>
                      <div className="w-full h-1 bg-parchment-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-dragon-red transition-all duration-500"
                          style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}



          {/* Current Location */}
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
              "bg-white/30 border rounded overflow-hidden shadow-md hover:shadow-xl transition-all duration-500",
              inspectedLocation ? "border-blue-500/50 shadow-blue-500/10" : "border-dragon-red/10"
            )}>
               <div className="p-4 bg-white/40 backdrop-blur-sm">
                 {loreContent ? (
                   <div className="text-xs text-parchment-800 italic leading-relaxed font-serif markdown-content space-y-2">
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
                     {displayLocation?.description || 'The horizon stretches infinitely, a canvas of primal forces awaiting the touch of a pathfinder.'}
                   </p>
                 )}
                 
                 {displayLocation?.region && (
                   <div className="mt-4 pt-4 border-t border-dragon-red/5 flex items-center justify-between">
                      <span className="text-[8px] font-black text-parchment-400 uppercase tracking-widest">Regional Cluster</span>
                      <span className="text-[10px] font-bold text-dragon-red uppercase">{displayLocation.region}</span>
                   </div>
                 )}

                 {/* Travel Button */}
                 {displayLocation && displayLocation.id !== partyLocation?.id && (
                   <div className="mt-6 space-y-3">
                     {(displayLocation as any).lore && (
                       <button
                         onClick={() => {
                           const lorePath = (displayLocation as any).lore;
                           unlockLore(lorePath);
                           setIsWorldPanelOpen(false);
                           useUIStore.getState().setIsJournalOpen(true);
                         }}
                         className="w-full py-2 bg-parchment-200 hover:bg-parchment-300 text-dragon-red font-bold text-xs uppercase tracking-widest rounded border border-dragon-gold transition-all flex items-center justify-center gap-2"
                       >
                         <GameIcon name="lore" size={14} color="#8B0000" />
                         Open Lore Codex
                       </button>
                     )}
                      {!isTraveling ? (
                        <button 
                          id="set-course-btn"
                          onClick={() => setShowTravelJournal(true)}
                          className="w-full py-3 bg-dragon-red hover:bg-dragon-darkRed text-white font-header font-black uppercase tracking-widest text-xs rounded shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-dragon-gold/30"
                        >
                          <GameIcon name="compass" size={14} color="#FFFFFF" />
                          Plan Expedition
                        </button>
                      ) : destination?.id === displayLocation.id ? (
                        <button 
                          onClick={() => stopTravel()}
                          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-header font-black uppercase tracking-widest text-xs rounded shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-white/20"
                        >
                          <GameIcon name="close" size={14} color="#FFFFFF" />
                          Abort Travel
                        </button>
                      ) : null}
                   </div>
                 )}

                 {/* Pre-travel Journal Overlay */}
                 {showTravelJournal && preTravelStats && createPortal(
                   <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
                     <div className="bg-parchment-100 w-full max-w-sm rounded border-2 border-dragon-gold shadow-2xl p-6 relative bg-paper-texture">
                       <button onClick={() => setShowTravelJournal(false)} className="absolute top-4 right-4 text-dragon-red/60 hover:text-dragon-red"><GameIcon name="close" size={20} /></button>
                       <h3 className="font-header text-xl text-dragon-red font-black uppercase tracking-widest border-b-2 border-dragon-red/20 pb-2 mb-4">Expedition Journal</h3>
                       <p className="text-sm text-parchment-800 font-serif mb-4 italic">Preparation for the journey to <strong className="text-dragon-darkRed">{displayLocation?.name}</strong>.</p>
                       
                       <div className="space-y-4 mb-6">
                         <div className="flex justify-between items-center border-b border-dragon-red/10 pb-2">
                           <span className="text-xs uppercase font-black text-parchment-500">Distance</span>
                           <span className="text-sm font-bold text-dragon-darkRed">{preTravelStats.miles.toFixed(1)} miles</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-dragon-red/10 pb-2">
                           <span className="text-xs uppercase font-black text-parchment-500">Est. Time</span>
                           <span className="text-sm font-bold text-dragon-darkRed">
                             {preTravelStats.eta > 1440 
                               ? `${Math.floor(preTravelStats.eta / 1440)}d ${Math.floor((preTravelStats.eta % 1440)/60)}h` 
                               : preTravelStats.eta > 60 ? `${Math.floor(preTravelStats.eta / 60)}h ${preTravelStats.eta % 60}m` : `${preTravelStats.eta}m`}
                           </span>
                         </div>
                         <div className="flex justify-between items-center border-b border-dragon-red/10 pb-2">
                           <span className="text-xs uppercase font-black text-parchment-500">Pace / Status</span>
                           <span className={cn("text-sm font-bold", preTravelStats.isOverburdened ? "text-red-500" : "text-green-700")}>
                             {preTravelStats.speed.toFixed(1)} mph {preTravelStats.isOverburdened && '(Overburdened)'}
                           </span>
                         </div>
                         <div className="bg-white/40 p-3 rounded border border-dragon-red/10 space-y-2">
                           <h4 className="text-[10px] font-black uppercase text-dragon-red">Required Provisions (Est.)</h4>
                           <div className="flex justify-between text-xs font-serif text-parchment-800">
                             <span>Rations:</span> <strong>{preTravelStats.rationsNeeded} units</strong>
                           </div>
                           <div className="flex justify-between text-xs font-serif text-parchment-800">
                             <span>Water:</span> <strong>{preTravelStats.waterNeeded} skins</strong>
                           </div>
                         </div>
                         {preTravelStats.vehicles.length > 0 && (
                           <div className="bg-white/40 p-3 rounded border border-dragon-red/10">
                             <h4 className="text-[10px] font-black uppercase text-dragon-red mb-1">Active Vehicles</h4>
                             <p className="text-xs font-serif text-parchment-800">{preTravelStats.vehicles.map((v: any) => v.name).join(', ')}</p>
                           </div>
                         )}
                       </div>

                       <div className="flex gap-3">
                         <button onClick={() => setShowTravelJournal(false)} className="flex-1 py-2 bg-parchment-200 hover:bg-parchment-300 text-dragon-red font-bold text-xs uppercase tracking-widest rounded border border-dragon-red/20 transition-all">Cancel</button>
                         <button onClick={() => { setShowTravelJournal(false); startTravel(displayLocation); }} className="flex-1 py-2 bg-dragon-red hover:bg-dragon-darkRed text-white font-bold text-xs uppercase tracking-widest rounded border border-dragon-gold transition-all shadow-md">Embark</button>
                       </div>
                     </div>
                   </div>,
                   document.body
                 )}
               </div>
            </div>
          </div>

          {/* Travel Status Widget */}
          {isTraveling && destination && travelStats && (
            <div className="bg-dragon-darkRed text-white p-4 rounded border-2 border-dragon-gold shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-dragon-gold">Expedition Progress</span>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-dragon-gold animate-ping" />
                     <span className="text-[9px] font-black uppercase tracking-widest">En_Route</span>
                  </div>
               </div>
               
               <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-header uppercase">
                     <span className="opacity-60">To:</span>
                     <span className="font-bold text-dragon-gold">{destination.name}</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                        initial={false}
                        animate={{ width: `${travelProgress * 100}%` }}
                        className="h-full bg-dragon-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                     />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter opacity-40">
                     <span>Origin</span>
                     <span>{Math.round(travelProgress * 100)}% Complete</span>
                     <span>Arrival</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase font-black text-white/40">Speed</span>
                    <span className={cn("text-[10px] font-bold", travelStats.isOverburdened ? "text-red-400" : "text-white")}>
                      {travelStats.speed.toFixed(1)} mph
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] uppercase font-black text-white/40">Est. Arrival</span>
                    <span className="text-[10px] font-bold text-dragon-gold">
                      {travelStats.eta > 60 
                        ? `${Math.floor(travelStats.eta / 60)}h ${travelStats.eta % 60}m` 
                        : `${travelStats.eta}m`}
                    </span>
                  </div>
               </div>
               
               <div className="flex justify-center items-center pt-1 gap-2">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                    {travelStats.miles.toFixed(1)} Miles Remaining
                  </span>
                  <button 
                    onClick={() => useWorldStore.getState().setIsFastForwarding(!useWorldStore.getState().isFastForwarding)}
                    className={cn("text-[8px] px-2 py-0.5 rounded border uppercase font-black transition-colors", useWorldStore.getState().isFastForwarding ? "bg-dragon-gold text-dragon-darkRed border-dragon-gold" : "border-white/30 text-white/50 hover:text-white")}
                  >
                    {useWorldStore.getState().isFastForwarding ? 'Normal Pace' : 'Fast Forward'}
                  </button>
               </div>
            </div>
          )}



          {/* Dynamic Lore System / Schema Driven Rendering */}
          <div className="space-y-2">
             {displayLocation && Object.entries({
               history: 'History & Lore',
               government: 'Government',
               ruler: 'Ruler',
               population: 'Population',
               economy: 'Economy & Trade',
               climate: 'Climate',
               biome: 'Biome',
               dominant_trees: 'Flora',
               wildlife: 'Wildlife',
               dangers: 'Dangers',
               factions: 'Factions',
               religion: 'Religion',
               services: 'Services',
               inventory: 'Inventory',
               prices: 'Local Prices',
               opening_hours: 'Opening Hours',
               reputation: 'Reputation',
               quests: 'Rumors & Quests',
               notes: 'Notes',
               districts: 'Districts',
               owner: 'Owner'
             }).map(([key, title]) => {
               const data = (displayLocation as any)[key] || (displayLocation as any)[key.replace('_', ' ')] || (displayLocation as any)[key.replace('_', '')];
               if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) return null;
               
               return (
                 <div key={key} className="pt-4 border-t-2 border-dragon-red/5">
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
                   ) : typeof data === 'object' ? (
                     <div className="space-y-1">
                       {Object.entries(data).map(([k, v]) => (
                         <div key={k} className="flex gap-2 text-xs text-parchment-800 font-serif">
                           <span className="font-bold capitalize">{k.replace(/_/g, ' ')}:</span>
                           <span>{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-xs text-parchment-800 font-serif">{String(data)}</p>
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
