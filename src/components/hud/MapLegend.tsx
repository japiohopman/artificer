import React from 'react';
import { useWorldStore, CategoryIcons } from '../../store/useWorldStore';
import { GameIcon } from '../../game_icons';
import { WORLD_ATLAS_ICONS } from '../../assets/icons/world_atlas';
import { cn } from '../../lib/utils';

export const MapLegend: React.FC = () => {
  const { savedLocations } = useWorldStore();

  const tiers = [
    { level: 'Tier 0', label: 'Metropolis', zoom: 'Z0+', description: 'Major hubs and legendary cities.' },
    { level: 'Tier 1', label: 'Major Towns', zoom: 'Z2+', description: 'Significant settlements and trade ports.' },
    { level: 'Tier 2', label: 'Strongholds', zoom: 'Z4+', description: 'Fortresses, keeps, and mountain peaks.' },
    { level: 'Tier 3', label: 'Landmarks', zoom: 'Z5.5+', description: 'Dungeons, ruins, and points of interest.' },
    { level: 'Tier 4', label: 'Discovery', zoom: 'Z6.5+', description: 'Roads, small shrines, and local geography.' }
  ];

  const categories = [
    { id: 'city', label: 'City', icon: 'city', color: CategoryIcons.city.color },
    { id: 'village', label: 'Village', icon: 'village', color: CategoryIcons.village.color },
    { id: 'castle', label: 'Fortress', icon: 'castle', color: CategoryIcons.castle.color },
    { id: 'dungeon', label: 'Dungeon', icon: 'dungeon', color: CategoryIcons.dungeon.color },
    { id: 'ruins', label: 'Ruins', icon: 'ruins', color: '#8B4513' },
    { id: 'mountains', label: 'Peaks', icon: 'mountains', color: CategoryIcons.mountain.color },
    { id: 'forest', label: 'Woods', icon: 'forest', color: CategoryIcons.forest.color },
    { id: 'waters', label: 'Waters', icon: 'waters', color: CategoryIcons.wetlands.color }
  ];

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-md text-parchment-100 p-4 border-t border-x border-white/5 rounded-t-md overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-6 border-b border-dragon-gold/20 pb-2">
        <GameIcon name="map" size={20} color="#D4AF37" />
        <div>
          <h3 className="font-header text-lg uppercase tracking-widest text-dragon-gold leading-none">Cartographic Legend</h3>
          <p className="text-[8px] font-black uppercase text-white/40 tracking-tighter mt-1">Faerûn Atlas Visibility Matrix</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h4 className="text-[10px] font-black uppercase text-dragon-red tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-dragon-red" />
            Visibility Tiers
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {tiers.map((tier) => (
              <div key={tier.level} className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-10 text-center">
                  <span className="text-[9px] font-black text-dragon-gold block leading-none">{tier.zoom}</span>
                  <span className="text-[7px] font-bold text-white/30 uppercase">{tier.level}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-tight group-hover:text-dragon-gold transition-colors">{tier.label}</p>
                  <p className="text-[8px] text-white/40 italic leading-tight truncate">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-[10px] font-black uppercase text-dragon-red tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1 h-3 bg-dragon-red" />
            Iconography
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 p-1.5 bg-white/5 rounded border border-white/5">
                <div className="w-6 h-6 flex items-center justify-center">
                   <GameIcon name={cat.icon as any} size={14} color={cat.color} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter text-white/60">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between opacity-40">
         <span className="text-[7px] font-bold uppercase tracking-widest">Atlas_v4.2.0_Sync</span>
         <div className="flex gap-1">
            <div className="w-1 h-1 bg-dragon-gold rounded-full" />
            <div className="w-1 h-1 bg-dragon-gold rounded-full" />
            <div className="w-1 h-1 bg-dragon-gold rounded-full" />
         </div>
      </div>
    </div>
  );
};
