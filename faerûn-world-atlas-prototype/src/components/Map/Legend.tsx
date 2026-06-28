import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon, GameIconName } from '../../game_icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface LegendCategory {
  id: string;
  label: string;
  icon: GameIconName;
  color: string;
}

export const ATlAS_CATEGORIES: LegendCategory[] = [
  { id: 'cities', label: 'Cities', icon: 'cities', color: '#D4AF37' },
  { id: 'towns_settlements', label: 'Towns & Settlements', icon: 'towns', color: '#C0C0C0' },
  { id: 'fortresses_keeps', label: 'Fortresses & Keeps', icon: 'shield', color: '#A9A9A9' },
  { id: 'ruins', label: 'Ruins', icon: 'ruins', color: '#8B4513' },
  { id: 'poi', label: 'Points of Interest', icon: 'points_of_interest', color: '#4169E1' },
  { id: 'hills_mountains', label: 'Hills & Mountains', icon: 'hills_mountains', color: '#2F4F4F' },
  { id: 'peaks_cliffs', label: 'Peaks & Cliffs', icon: 'peaks', color: '#708090' },
  { id: 'forests', label: 'Forests', icon: 'forests', color: '#228B22' },
  { id: 'water', label: 'Water Features', icon: 'water', color: '#1E90FF' },
  { id: 'wetlands', label: 'Wetlands', icon: 'wetlands', color: '#556B2F' },
  { id: 'islands', label: 'Islands', icon: 'islands', color: '#FFD700' },
  { id: 'deserts_wastelands', label: 'Deserts & Wastelands', icon: 'deserts', color: '#EDC9AF' },
  { id: 'plains_grasslands', label: 'Plains & Grasslands', icon: 'plains', color: '#9ACD32' },
  { id: 'glaciers_tundras', label: 'Glaciers & Tundras', icon: 'glaciers', color: '#F0FFFF' },
  { id: 'oases', label: 'Oases', icon: 'oases', color: '#40E0D0' },
  { id: 'roads_trails', label: 'Roads & Trails', icon: 'roads', color: '#696969' },
];

export const CITY_CATEGORIES: Record<string, LegendCategory> = {
  districts: { id: 'districts', label: 'Districts & Quarters', icon: 'cities', color: '#F87171' },
  government: { id: 'government', label: 'Government & Law', icon: 'shield', color: '#3B82F6' },
  estates: { id: 'estates', label: 'Manors & Estates', icon: 'estates', color: '#F472B6' },
  inns: { id: 'inns', label: 'Inns & Loging', icon: 'inns_taverns', color: '#FA5D00' },
  taverns_eateries: { id: 'taverns_eateries', label: 'Taverns & Eateries', icon: 'inns_taverns', color: '#FA5D00' },
  temples_shrines: { id: 'temples_shrines', label: 'Temples & Shrines', icon: 'temples_shrines', color: '#FAC600' },
  shops: { id: 'shops', label: 'Shops & Markets', icon: 'shops', color: '#10B981' },
  landmarks: { id: 'landmarks', label: 'Landmarks', icon: 'landmarks', color: '#A78BFA' },
  points_of_interest: { id: 'points_of_interest', label: 'Points of Interest', icon: 'points_of_interest', color: '#021EBB' },
  gates: { id: 'gates', label: 'Gates & Walls', icon: 'shield', color: '#94A3B8' },
  roads: { id: 'roads', label: 'Streets & Roads', icon: 'roads', color: '#64748B' },
  water: { id: 'water', label: 'Waterways', icon: 'water', color: '#38BDF8' },
  docks: { id: 'docks', label: 'Docks & Wharves', icon: 'water', color: '#0EA5E9' },
  geographical: { id: 'geographical', label: 'Geographical Features', icon: 'hills_mountains', color: '#10B981' },
  sewers: { id: 'sewers', label: 'Sewers', icon: 'underdark', color: '#4B5563' },
  dungeons: { id: 'dungeons', label: 'Dungeons', icon: 'underdark', color: '#7C3AED' },
};

export const CITY_CATEGORIES_LIST = Object.values(CITY_CATEGORIES);

interface LegendProps {
  activeCategories: string[];
  onToggleCategory: (id: string) => void;
  isLoading?: boolean;
  loadedCategories: string[];
  customCategories?: LegendCategory[];
}

const Legend: React.FC<LegendProps> = ({ 
  activeCategories = [], 
  onToggleCategory = (_id: string) => {}, 
  isLoading = false, 
  loadedCategories = [], 
  customCategories 
}) => {
  const displayedCategories = customCategories || ATlAS_CATEGORIES;

  return (
    <div className="flex flex-row items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-2 max-w-full">
      {displayedCategories.map((cat) => {
        const isActive = activeCategories.includes(cat.id);
        const isLoaded = loadedCategories.includes(cat.id);
        
        return (
          <div key={cat.id}>
            <Tooltip>
              <TooltipTrigger
                onClick={() => onToggleCategory(cat.id)}
                className={`
                  relative group h-9 w-9 rounded-md border flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0
                  ${isActive 
                    ? 'bg-[#1a1f26] border-[#D4AF37]/60 shadow-[0_0_10px_rgba(212,175,55,0.15)] scale-105 z-10' 
                    : 'bg-[#12141a]/60 border-white/10 hover:border-white/30'}
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-full h-full relative"
                >
                  <GameIcon 
                    name={cat.icon} 
                    size={18} 
                    color={isActive ? cat.color : '#94a3b8'}
                    className={`transition-colors duration-300 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}
                  />
                  
                  {!isLoaded && isActive && (
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5">
                      <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                      <div className="absolute inset-0 bg-blue-500 rounded-full scale-75" />
                    </div>
                  )}
                  
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1a1f26] border-[#2D3139] text-[10px] font-bold uppercase tracking-wider py-1 px-2">
                <p>{cat.label}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;
