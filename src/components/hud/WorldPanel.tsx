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
import { ActiveContextPanel } from './world/ActiveContextPanel';

export const WorldPanel: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
    isInsideSubMap,
    setIsInsideSubMap
  } = useUIStore();

  const {
    partyLocation,
    partySubLocation,
    currentLocation,
    inspectedLocation,
    isTraveling,
    travelProgress,
    destination
  } = useWorldStore();

  // Spatial presentation context
  const displayLocation = inspectedLocation || currentLocation || partyLocation;

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

        {/* 3. ACTIVE CONTEXT: Active Context Panel Component */}
        <ActiveContextPanel
          displayLocation={displayLocation}
          loreContent={loreContent}
        />
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
