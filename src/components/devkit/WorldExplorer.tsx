import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { REGION_METADATA, REGION_PATH_REGISTRY } from '../../data/regions';
import { useWorldStore } from '../../store/useWorldStore';
import { playClickSound } from '../../services/storageService';

export const WorldExplorer: React.FC = () => {
  const { setInspectedLocation, savedLocations } = useWorldStore();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleRegionClick = (regionId: string) => {
    playClickSound();
    setSelectedRegion(regionId === selectedRegion ? null : regionId);

    const meta = REGION_METADATA[regionId];
    if (meta && meta.focalPoint) {
      // Create a virtual location for the region to center the map
      setInspectedLocation({
        id: `region-${regionId}`,
        name: meta.name,
        category: "Region",
        description: meta.description,
        coordinates: { y: meta.focalPoint[0], x: meta.focalPoint[1] },
        image: null
      });
    }
  };

  const handleLocationClick = (loc: any) => {
    playClickSound();
    setInspectedLocation(loc);
  };

  return (
    <div className="flex h-full bg-[#111] text-white overflow-hidden font-mono">
      {/* Regions Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-[#161616]">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-dragon-red flex items-center gap-2">
            <GameIcon name="map" size={14} /> World_Hierarchy_v2
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {Object.entries(REGION_METADATA).map(([id, meta]) => (
            <div key={id} className="space-y-1">
              <button
                onClick={() => handleRegionClick(id)}
                className={`w-full text-left px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between group ${
                  selectedRegion === id ? "bg-dragon-red text-white" : "hover:bg-white/5 text-white/40"
                }`}
              >
                <div className="flex items-center gap-2">
                   <GameIcon name="location" size={12} className={selectedRegion === id ? "text-white" : "text-dragon-red/50"} />
                   {meta.name}
                </div>
                <GameIcon
                  name="chevron_right"
                  size={10}
                  className={`transition-transform ${selectedRegion === id ? "rotate-90" : "opacity-20"}`}
                />
              </button>

              <AnimatePresence>
                {selectedRegion === id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 border-l border-white/5 ml-4 space-y-1"
                  >
                    {savedLocations
                      .filter(loc => loc.region === id || (id === 'west_faerun' && !loc.region)) // Fallback for uncategorized
                      .map(loc => (
                        <button
                          key={loc.id}
                          onClick={() => handleLocationClick(loc)}
                          className="w-full text-left px-3 py-1.5 rounded text-[9px] font-medium uppercase tracking-tight text-white/30 hover:text-white hover:bg-white/5 transition-all truncate"
                        >
                          • {loc.name}
                        </button>
                      ))}
                    {savedLocations.filter(loc => loc.region === id).length === 0 && (
                       <div className="px-3 py-2 text-[9px] italic text-white/10 uppercase">No registered locations</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Region Visualization Area */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0a] relative flex items-center justify-center p-12">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center space-y-2">
           <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Vector_Region_Overlay</div>
           <div className="h-px w-24 bg-gradient-to-r from-transparent via-dragon-red/50 to-transparent mx-auto" />
        </div>

        <div className="relative w-full aspect-square flex items-center justify-center">
           {/* SVG Map of Faerun Regions */}
           <svg viewBox="0 0 1600 1070" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {Object.entries(REGION_PATH_REGISTRY).map(([id, path]) => (
                 <path
                    key={id}
                    d={path}
                    onClick={() => handleRegionClick(id)}
                    className={`cursor-pointer transition-all duration-500 hover:fill-dragon-red/40 ${
                      selectedRegion === id ? 'fill-dragon-red/60 stroke-dragon-red stroke-2' : 'fill-white/5 stroke-white/10'
                    }`}
                 />
              ))}
           </svg>

           {/* Selected Region Info Overlay */}
           {selectedRegion && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent"
             >
               <h3 className="text-xl font-bold text-dragon-red uppercase tracking-tighter mb-2">
                 {REGION_METADATA[selectedRegion].name}
               </h3>
               <p className="text-[11px] text-white/50 leading-relaxed font-sans italic">
                 {REGION_METADATA[selectedRegion].description.split('\n')[0]}
               </p>
               <div className="mt-4 flex gap-4">
                  <div className="text-[9px] uppercase tracking-widest text-white/20">
                     Focal_Point: <span className="text-white/40">[{REGION_METADATA[selectedRegion].focalPoint?.join(', ')}]</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-white/20">
                     Target_Zoom: <span className="text-white/40">{REGION_METADATA[selectedRegion].zoom}x</span>
                  </div>
               </div>
             </motion.div>
           )}

           {!selectedRegion && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-4 opacity-10">
                   <GameIcon name="map" size={120} />
                   <div className="text-sm font-black uppercase tracking-[1em]">Select_Sector</div>
                </div>
             </div>
           )}
        </div>

        {/* Diagnostic Footer */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-[9px] text-white/10 font-mono">
           <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-dragon-red rounded-full animate-pulse" /> MAP_SYNC_ACTIVE</div>
           <div>COORD_SYS: HIGH_RES_PX</div>
        </div>
      </div>
    </div>
  );
};
