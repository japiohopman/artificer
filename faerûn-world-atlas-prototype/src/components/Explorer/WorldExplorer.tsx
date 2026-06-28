import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameIcon, GameIconName } from "../../game_icons";
import { REGION_METADATA } from "../../data/regions";
import { MapMarker } from "../../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAtlasStore } from "../../store/useAtlasStore";

interface NavigationContext {
  region?: string;
  subRegion?: string;
  location?: string;
  locationUrl?: string;
  categoryId?: string;
  targetLayer?: "surface" | "underdark";
}

interface WorldExplorerProps {
  markers: MapMarker[];
  hoveredId?: string | null;
  selectedId?: string | null;
}

import { ALL_CITIES } from "../../data/all_cities";
import { ALL_FORESTS } from "../../data/all_forests";

const REGIONS = [
  { id: "northwest_faerun", name: "Northwest Faerûn", parent: "faerun" },
  { id: "north_faerun", name: "North Faerûn", parent: "faerun" },
  { id: "northeast_faerun", name: "Northeast Faerûn", parent: "faerun" },
  { id: "west_faerun", name: "West Faerûn", parent: "faerun" },
  { id: "interior_faerun", name: "Interior Faerûn", parent: "faerun" },
  { id: "sea_of_the_fallen_stars", name: "Sea of Fallen Stars", parent: "faerun" },
  { id: "southeast_faerun", name: "Southeast Faerûn", parent: "faerun" },
  { id: "east_faerun", name: "East Faerûn", parent: "faerun" },
  { id: "south_faerun", name: "South Faerûn", parent: "faerun" },
  { id: "southwest_faerun", name: "Southwest Faerûn", parent: "faerun" },

  // Subregions for West Faerûn
  { id: "western_heartlands", name: "Western Heartlands", parent: "west_faerun" },
  { id: "lands_of_intrigue", name: "Lands of Intrigue", parent: "west_faerun" },
  { id: "moonshae_isles", name: "Moonshae Isles", parent: "west_faerun" },
  { id: "island_kingdoms", name: "Island Kingdoms", parent: "west_faerun" },

  // Subregions for Northwest Faerûn
  { id: "utter_north", name: "Utter North", parent: "northwest_faerun" },
  { id: "sword_coast_north", name: "Sword Coast North", parent: "northwest_faerun" },
  { id: "silver_marches", name: "Silver Marches", parent: "northwest_faerun" },
  { id: "savage_frontier", name: "Savage Frontier", parent: "northwest_faerun" },
  { id: "high_forest", name: "High Forest", parent: "northwest_faerun" },
  { id: "the_frozenfar", name: "The Frozenfar", parent: "northwest_faerun" },

  // Subregions for Northeast Faerûn
  { id: "damara", name: "Damara", parent: "northeast_faerun" },
  { id: "great_dale", name: "The Great Dale", parent: "northeast_faerun" },
  { id: "impiltur", name: "Impiltur", parent: "northeast_faerun" },
  { id: "narfell", name: "Narfell", parent: "northeast_faerun" },
  { id: "rashemen", name: "Rashemen", parent: "northeast_faerun" },

  // Subregions for North Faerûn
  { id: "anauroch", name: "Anauroch", parent: "north_faerun" },
  { id: "eastern_heartlands", name: "Eastern Heartlands", parent: "north_faerun" },
  { id: "moonsea_north", name: "Moonsea North", parent: "north_faerun" },
  { id: "the_vast", name: "The Vast", parent: "north_faerun" },

  // Eastern Heartlands tree
  { id: "dalelands", name: "The Dalelands", parent: "eastern_heartlands" },
  { id: "cormanthor", name: "Cormanthor", parent: "eastern_heartlands" },
  { id: "moonsea", name: "The Moonsea", parent: "eastern_heartlands" },
  { id: "the_ride", name: "The Ride", parent: "eastern_heartlands" },

  // Moonsea North tree
  { id: "thar", name: "Thar", parent: "moonsea_north" },
  { id: "tortured_land", name: "Tortured Land", parent: "moonsea_north" },
  { id: "vaasa", name: "Vaasa", parent: "moonsea_north" },

  // Subregions for Interior Faerûn
  { id: "cormyr", name: "Cormyr", parent: "interior_faerun" },
  { id: "sembia", name: "Sembia", parent: "interior_faerun" },
  { id: "dragon_coast", name: "Dragon Coast", parent: "interior_faerun" },
  { id: "pirate_isles", name: "Pirate Isles", parent: "interior_faerun" },
  { id: "shining_plains", name: "Shining Plains", parent: "interior_faerun" },
  { id: "vilhon_reach", name: "Vilhon Reach", parent: "interior_faerun" },

  // Vilhon Reach tree
  { id: "chondath", name: "Chondath", parent: "vilhon_reach" },
  { id: "sespech", name: "Sespech", parent: "vilhon_reach" },
  { id: "turmish", name: "Turmish", parent: "vilhon_reach" },

  // Subregions for Southwest Faerûn
  { id: "chult", name: "Chult", parent: "southwest_faerun" },

  // Subregions for Southeast Faerûn
  { id: "shaar", name: "The Shaar", parent: "southeast_faerun" },
  
  // Subregions for East Faerûn
  { id: "aglarond", name: "Aglarond", parent: "east_faerun" },
  { id: "altumbel", name: "Altumbel", parent: "east_faerun" },
  { id: "chessenta", name: "Chessenta", parent: "east_faerun" },
  { id: "mulhorand", name: "Mulhorand", parent: "east_faerun" },
  { id: "murghom", name: "Murghôm", parent: "east_faerun" },
  { id: "thay", name: "Thay", parent: "east_faerun" },
  { id: "thesk", name: "Thesk", parent: "east_faerun" },
  { id: "unther", name: "Unther", parent: "east_faerun" },
  { id: "rashemen_east", name: "Rashemen", parent: "east_faerun" },

  // Subregions for South Faerûn
  { id: "border_kingdoms", name: "Border Kingdoms", parent: "south_faerun" },
  { id: "shining_south", name: "Shining South", parent: "south_faerun" },
  { id: "lake_of_steam", name: "Lake of Steam", parent: "south_faerun" },
  { id: "land_of_the_lion", name: "Land of the Lion", parent: "south_faerun" },

  // Shining South Subregions
  { id: "dambrath", name: "Dambrath", parent: "shining_south" },
  { id: "estagund", name: "Estagund", parent: "shining_south" },
  { id: "halruaa", name: "Halruaa", parent: "shining_south" },
  { id: "luiren", name: "Luiren", parent: "shining_south" },
  { id: "var_the_golden", name: "Var the Golden", parent: "shining_south" },
  { id: "durpar", name: "Durpar", parent: "shining_south" },
  { id: "veldorn", name: "Veldorn", parent: "shining_south" },
  { id: "lapaliiya", name: "Lapaliiya", parent: "shining_south" },
  { id: "samarach", name: "Samarach", parent: "shining_south" },
  { id: "tashalar", name: "Tashalar", parent: "shining_south" },
  { id: "thindol", name: "Thindol", parent: "shining_south" },

  { id: "underdark", name: "The Underdark", parent: "underdark_root" },
];

const WorldExplorer: React.FC<WorldExplorerProps> = ({ markers, hoveredId, selectedId }) => {
  const { currentHierarchy, currentMapId, setMapId, setHierarchy, setLayer, layer } = useAtlasStore();
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["toril", "faerun"]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return [];
    const search = searchTerm.toLowerCase();
    
    const matchedCities = ALL_CITIES.filter(c => c.replace(/_/g, ' ').includes(search)).map(c => ({ id: c, type: 'city' }));
    const matchedForests = ALL_FORESTS.filter(f => f.replace(/_/g, ' ').includes(search)).map(f => ({ id: f, type: 'forest' }));
    
    return [...matchedCities, ...matchedForests].slice(0, 20);
  }, [searchTerm]);

  const onNavigate = (id: string, context: NavigationContext) => {
    setMapId(id);
    setHierarchy(context);
    if (context.targetLayer) {
      setLayer(context.targetLayer);
    }
  };

  // Auto-expand nodes when selection or hierarchy changes
  useEffect(() => {
    const nodesToExpand = new Set(expandedNodes);
    let changed = false;

    const checkId = (id?: string | null) => {
      if (!id) return;
      // If it's a marker ID, find the region parents
      const marker = markers.find(m => m.id === id || m.subMapId === id);
      if (marker) {
        if (marker.region && !nodesToExpand.has(marker.region)) {
          nodesToExpand.add(marker.region);
          changed = true;
        }
        if (marker.subRegion && !nodesToExpand.has(marker.subRegion)) {
          nodesToExpand.add(marker.subRegion);
          changed = true;
        }
        if (marker.location && !nodesToExpand.has(marker.location)) {
          nodesToExpand.add(marker.location);
          changed = true;
        }
      } else {
        // If it's a region ID, it might be a subregion
        const reg = REGIONS.find(r => r.id === id);
        if (reg && reg.parent !== "faerun" && !nodesToExpand.has(reg.parent)) {
          nodesToExpand.add(reg.parent);
          changed = true;
        }
      }
    };

    checkId(selectedId);
    
    if (currentHierarchy.region) {
      if (!nodesToExpand.has(currentHierarchy.region)) {
        nodesToExpand.add(currentHierarchy.region);
        changed = true;
      }
    }
    
    if (currentHierarchy.subRegion) {
      if (!nodesToExpand.has(currentHierarchy.subRegion)) {
        nodesToExpand.add(currentHierarchy.subRegion);
        changed = true;
      }
    }

    if (changed) {
      setExpandedNodes(Array.from(nodesToExpand));
    }
  }, [currentHierarchy.region, currentHierarchy.subRegion, selectedId, markers]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const isActive = (id: string) => {
    if (selectedId === id) return true;
    if (id === 'toril') return currentMapId === 'world' && !currentHierarchy.region;
    if (id === 'faerun') return currentMapId === 'world' && !currentHierarchy.region;
    
    // Check if it's the current region or subregion in focus
    if (id === currentHierarchy.region && !currentHierarchy.subRegion && !currentHierarchy.location) return true;
    if (id === currentHierarchy.subRegion && !currentHierarchy.location) return true;
    if (id === currentHierarchy.location) return true;
    
    return currentMapId === id;
  };

  const isHovered = (id: string) => hoveredId === id;

  const renderItem = (label: string, id: string, level: number, icon: GameIconName, onClick: () => void, hasChildren: boolean = false) => {
    const isNodeExpanded = expandedNodes.includes(id);
    const active = isActive(id);
    const hovered = isHovered(id);

    return (
      <div key={id} className="flex flex-col">
        <div 
          onClick={() => {
            if (hasChildren) toggleNode(id);
            onClick();
          }}
          className={`
            group flex items-center gap-2 px-3 py-1 cursor-pointer transition-all duration-200 border-l-2
            ${active ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : hovered ? 'bg-blue-500/5 border-blue-500/30' : 'hover:bg-[#1C2026] border-transparent'}
          `}
          style={{ paddingLeft: `${(level * 14) + 8}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 h-7 text-xs font-medium">
             {hasChildren ? (
                <motion.div
                  animate={{ rotate: isNodeExpanded ? 90 : 0 }}
                  className={`${active ? 'text-[#D4AF37]' : hovered ? 'text-blue-400' : 'text-slate-600'}`}
                >
                  <GameIcon name="chevron_right" size={10} />
                </motion.div>
             ) : (
                <div className="w-[10px]" />
             )}
             
             <GameIcon 
                name={hasChildren ? (isNodeExpanded ? 'folder_open' : 'folder') : icon} 
                size={14} 
                className={`shrink-0 ${active ? 'text-[#D4AF37]' : hovered ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} 
             />
             
             <span className={`
                truncate tracking-wide
                ${active ? 'text-[#FDFAF3]' : hovered ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-200'}
                ${level === 0 ? 'uppercase font-black text-[10px] tracking-widest text-[#D4AF37]' : ''}
                ${level === 1 ? 'uppercase font-bold text-[10px] tracking-widest' : ''}
             `}>
                {label.replace(/_/g, ' ')}
             </span>
          </div>

          {(active || hovered) && level > 0 && (
            <div className={`w-1 h-1 rounded-full ${active ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`} />
          )}
        </div>
      </div>
    );
  };

  const renderMarkerTree = (parentLocId: string, level: number) => {
    const children = markers.filter(m => m.location === parentLocId && m.id !== parentLocId);
    if (children.length === 0) return null;

    return children.sort((a, b) => a.popup.title.localeCompare(b.popup.title)).map(loc => {
      const hasChildren = markers.some(m => m.location === loc.id || (loc.subMapId && m.location === loc.subMapId));
      return (
        <div key={loc.id}>
          {renderItem(loc.popup.title, loc.subMapId || loc.id, level, loc.subMapId ? "location" : "map_pin", () => {
            onNavigate(loc.subMapId || loc.id, {
              region: loc.region,
              subRegion: loc.subRegion,
              location: loc.location || loc.id,
              locationUrl: loc.locationUrl,
              categoryId: loc.categoryId,
              targetLayer: layer
            });
          }, hasChildren)}

          {hasChildren && expandedNodes.includes(loc.subMapId || loc.id) && (
            <div 
              className="flex flex-col border-l border-slate-800/40"
              style={{ marginLeft: `${level * 4 + 12}px` }}
            >
              {renderMarkerTree(loc.subMapId || loc.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderRegionTree = (parentId: string, level: number) => {
    return REGIONS.filter(r => r.parent === parentId).map(region => {
      const hasSubRegions = REGIONS.some(r => r.parent === region.id);
      const hasMarkers = markers.some(m => m.region === region.id || m.subRegion === region.id);
      const hasChildren = hasSubRegions || hasMarkers;

      return (
        <div key={region.id}>
          {renderItem(region.name, region.id, level, region.parent === "faerun" ? "map_pin" : "location", () => {
             // Find path to root to build context
             const path: string[] = [];
             let current: any = region;
             while(current && current.parent !== 'faerun' && current.parent !== 'underdark' && current.parent !== 'underdark_root') {
               path.unshift(current.id);
               current = REGIONS.find(r => r.id === current.parent);
             }
             
             onNavigate(region.id, { 
                region: current?.id || region.id,
                subRegion: path[0],
                location: path[1],
                targetLayer: parentId === 'underdark' || parentId === 'underdark_root' ? 'underdark' : 'surface'
             });
          }, hasChildren)}

          {expandedNodes.includes(region.id) && (
            <div 
              className="flex flex-col border-l border-slate-800/40"
              style={{ marginLeft: `${level * 4 + 12}px` }}
            >
              {/* Render nested sub-regions */}
              {renderRegionTree(region.id, level + 1)}

              {/* Render markers for this specific level */}
              {markers
                .filter(m => (level === 2 ? m.region === region.id && !m.subRegion : m.subRegion === region.id && !m.location))
                .sort((a, b) => a.popup.title.localeCompare(b.popup.title))
                .map(loc => {
                  const hasChildren = markers.some(m => m.location === loc.id || (loc.subMapId && m.location === loc.subMapId));
                  return (
                    <div key={loc.id}>
                      {renderItem(loc.popup.title, loc.subMapId || loc.id, level + 1, loc.subMapId ? "location" : "map_pin", () => {
                        onNavigate(loc.subMapId || loc.id, {
                          region: loc.region,
                          subRegion: loc.subRegion,
                          location: loc.location || loc.id,
                          locationUrl: loc.locationUrl,
                          categoryId: loc.categoryId,
                          targetLayer: parentId === 'underdark' || parentId === 'underdark_root' ? "underdark" : "surface"
                        });
                      }, hasChildren)}

                      {hasChildren && expandedNodes.includes(loc.subMapId || loc.id) && (
                        <div 
                          className="flex flex-col border-l border-slate-800/40"
                          style={{ marginLeft: `${(level + 1) * 4 + 12}px` }}
                        >
                          {renderMarkerTree(loc.subMapId || loc.id, level + 2)}
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <ScrollArea className="flex-1 min-h-0 bg-[#16191E]/50">
      <div className="p-3 border-b border-white/5">
        <div className="relative group">
          <GameIcon name="search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search 300+ cities & forests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F1115] border border-white/5 rounded-md py-2 pl-8 pr-3 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500/50 focus:bg-[#12151A] transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="py-2 flex flex-col gap-px">
        {searchTerm && filteredNodes.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/70">
              <GameIcon name="location" size={10} />
              Search Results
            </div>
            {filteredNodes.map(node => 
              renderItem(node.id, node.id, 1, node.type === "city" ? "location" : "forests", () => {
                onNavigate(node.id, {
                  location: node.id,
                  categoryId: node.type === "city" ? "cities" : "forest"
                });
                setSearchTerm("");
              }, false)
            )}
            <div className="h-px bg-white/5 my-2 mx-4" />
          </div>
        )}
        {/* Root: Toril */}
        {renderItem("Abeir-Toril", "toril", 0, "globe", () => onNavigate("world", { targetLayer: "surface" }), true)}
        
        <AnimatePresence>
          {expandedNodes.includes("toril") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col border-l border-slate-800/50 ml-[18px]">
                {/* Surface Continent */}
                {renderItem("Faerûn", "faerun", 1, "layers", () => onNavigate("world", { targetLayer: "surface" }), true)}

                {expandedNodes.includes("faerun") && (
                  <div className="flex flex-col border-l border-slate-700/30 ml-[20px]">
                    {renderRegionTree("faerun", 2)}
                  </div>
                )}

                {/* Underdark Continent */}
                {renderItem("Underdark", "underdark_root", 1, "underdark", () => onNavigate("world", { targetLayer: "underdark" }), true)}
                {expandedNodes.includes("underdark_root") && (
                   <div className="flex flex-col border-l border-slate-700/30 ml-[20px]">
                    {renderRegionTree("underdark", 2)}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};

export default WorldExplorer;
