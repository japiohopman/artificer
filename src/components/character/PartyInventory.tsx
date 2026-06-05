import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { cn } from '../../lib/utils';
import { GameIcon, GameIconName } from '../../game_icons';

export const PartyInventory: React.FC = () => {
  const { partyInventory, removeFromPartyInventory } = useStore();
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: 'party',
  });

  const categories = [
    { id: 'all', icon: 'filter', label: 'All' },
    { id: 'equipment', icon: 'shield', label: 'Gear' },
    { id: 'materials', icon: 'sparkles', label: 'Materials' },
    { id: 'key', icon: 'key', label: 'Keys' },
    { id: 'books', icon: 'book', label: 'Books' }
  ];

  const filteredItems = partyInventory.filter(item => {
    const matchesCategory = activeCategory === 'all' || 
      (activeCategory === 'equipment' && item._type === 'equipment') ||
      (activeCategory === 'materials' && (item._type === 'materials' || item._type === 'material')) ||
      (activeCategory === 'key' && (item.isKeyItem || item._type === 'key')) ||
      (activeCategory === 'books' && (item.isBook || item._type === 'books'));
    
    const matchesSearch = !searchQuery || 
      (item.name?.name || item.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white/40 backdrop-blur-sm rounded-2xl border-2 border-dragon-red/20 overflow-hidden shadow-2xl">
      {/* Header Area */}
      <div className="bg-dragon-darkRed p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <GameIcon name="package" size={24} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="font-header text-lg uppercase tracking-widest leading-none">Shared Party Armory</h2>
              <p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter mt-1">Cross-Party Storage Shard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-white/40 uppercase">Capacity</div>
            <div className="text-xl font-header tracking-widest">{partyInventory.length} <span className="text-[10px] text-white/40">ITEMS</span></div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <GameIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} color="currentColor" />
          <input 
            type="text"
            placeholder="Search Armory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs font-medium placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-dragon-red/40 transition-all"
          />
        </div>
      </div>

      {/* Tabs Area */}
      <div className="flex border-b border-dragon-red/10 bg-parchment-100/50 p-1 gap-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
              activeCategory === cat.id 
                ? "bg-dragon-red text-white shadow-md shadow-dragon-red/20 scale-[1.02]" 
                : "text-parchment-600 hover:bg-parchment-200"
            )}
          >
            <GameIcon name={cat.icon as any} size={12} color="currentColor" />
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-4 overflow-y-auto custom-scrollbar transition-colors relative",
          isOver ? "bg-dragon-red/5" : "bg-transparent"
        )}
      >
        {isOver && (
          <div className="absolute inset-0 border-4 border-dashed border-dragon-red/20 z-10 pointer-events-none rounded-xl m-2 animate-pulse" />
        )}

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <DraggableInventoryItem 
                  key={item.id}
                  item={item}
                  index={index}
                  sourceId="party"
                  onRemove={() => removeFromPartyInventory(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-parchment-400 opacity-30 select-none">
            <GameIcon name="layout" size={48} className="mb-4" color="currentColor" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Armory Bay Empty</p>
            <p className="text-[8px] mt-1 italic">Drag items here to store</p>
          </div>
        )}
      </div>

      {/* Decorative Grid Floor */}
      <div className="h-1 bg-dragon-red/10 overflow-hidden">
        <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(196,30,58,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
};
