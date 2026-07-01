import React from 'react';
import { motion } from 'motion/react';
import { GameIcon, GameIconName } from '../../../game_icons';

export interface LegendCategory {
  id: string;
  label: string;
  icon: GameIconName;
  color: string;
}

export const ATLAS_CATEGORIES: LegendCategory[] = [
  { id: 'city', label: 'Cities', icon: 'city', color: '#D4AF37' },
  { id: 'village', label: 'Towns & Villages', icon: 'village', color: '#C0C0C0' },
  { id: 'castle', label: 'Forts & Castles', icon: 'castle', color: '#A9A9A9' },
  { id: 'ruins', label: 'Ruins', icon: 'ruins', color: '#8B4513' },
  { id: 'poi', label: 'Points of Interest', icon: 'poi', color: '#4169E1' },
  { id: 'mountains', label: 'Hills & Mountains', icon: 'mountains', color: '#2F4F4F' },
  { id: 'forest', label: 'Forests', icon: 'forest', color: '#228B22' },
  { id: 'seas_oceans', label: 'Seas & Oceans', icon: 'sea', color: '#1E90FF' },
  { id: 'rivers', label: 'Rivers & Flows', icon: 'waters', color: '#1E90FF' },
  { id: 'lakes', label: 'Lakes & Ponds', icon: 'lake', color: '#1E90FF' },
  { id: 'bays', label: 'Bays & Inlets', icon: 'waters', color: '#1E90FF' },
  { id: 'coasts', label: 'Coasts & Reefs', icon: 'coast', color: '#1E90FF' },
  { id: 'islands', label: 'Islands', icon: 'islands', color: '#FFD700' },
  { id: 'roads', label: 'Roads & Trails', icon: 'roads', color: '#696969' },
  { id: 'graveyard', label: 'Cemeteries', icon: 'graveyard', color: '#696969' },
];

interface MapLegendProps {
  currentZoom: number;
}

export const MapLegend: React.FC<MapLegendProps> = ({ currentZoom }) => {
  return (
    <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar py-2 px-3 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl">
      {ATLAS_CATEGORIES.map((cat) => {
        // Synchronized with WorldMap.tsx tiers
        let isVisible = false;
        let zoomReq = 0;

        if (cat.id === 'city' || cat.id === 'seas_oceans') {
          isVisible = true;
          zoomReq = 0;
        } else if (['mountains', 'forest', 'rivers', 'lakes', 'bays', 'coasts', 'islands'].includes(cat.id)) {
          isVisible = currentZoom >= 2.5;
          zoomReq = 2.5;
        } else if (['village', 'castle', 'roads'].includes(cat.id)) {
          isVisible = currentZoom >= 3.5;
          zoomReq = 3.5;
        } else if (['ruins', 'poi', 'graveyard'].includes(cat.id)) {
          isVisible = currentZoom >= 5;
          zoomReq = 5;
        }

        return (
          <div key={cat.id} className="relative group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`
                h-8 w-8 rounded bg-parchment-100/10 border flex items-center justify-center transition-all duration-300
                ${isVisible ? 'border-dragon-gold/40 opacity-100 shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'border-white/5 opacity-20'}
              `}
            >
              <GameIcon 
                name={cat.icon} 
                size={16} 
                color={isVisible ? cat.color : '#475569'}
              />
            </motion.div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-parchment-900 text-parchment-100 text-[9px] font-bold uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[2000] border border-dragon-gold/30 shadow-xl">
              {cat.label} {!isVisible && `(Requires Zoom ${zoomReq})`}
            </div>
          </div>
        );
      })}
    </div>
  );
};
