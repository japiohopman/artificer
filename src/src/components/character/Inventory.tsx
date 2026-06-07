import React from 'react';
import { useStore } from '../../store/useStore';
import { Package, Trash2, Weight, Shield, ArrowRight, Sparkles, Book, Key, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
}

type BackpackCategory = 'all' | 'equipment' | 'materials' | 'key' | 'books';

export const Inventory: React.FC<InventoryProps> = ({ 
  onEquipRequest, 
  forceCharacterId, 
  showCategoryTabs = true, 
  compactEquipped = false,
  gridCols = 1 
}) => {
  const { characters, activeCharacterId, unequipItem, removeFromBackpack } = useStore();
  const [activeCategory, setActiveCategory] = React.useState<BackpackCategory>('all');
  
  const targetId = forceCharacterId || activeCharacterId;
  const activeCharacter = characters.find(c => c.id === targetId) || characters[0];

  if (!activeCharacter) {
    return (
      <div className="py-8 text-center space-y-1.5 opacity-30">
        <Package size={32} className="mx-auto text-parchment-400" />
        <p className="text-[9px] font-bold uppercase tracking-widest">No Character</p>
      </div>
    );
  }

  const inventory = activeCharacter.inventory;
  const backpack = activeCharacter.backpack;
  const equippedItems = Object.entries(inventory).filter(([_, item]) => item !== null);

  const filteredBackpack = backpack.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'equipment') return item._type === 'equipment';
    if (activeCategory === 'materials') return item._type === 'materials' || item._type === 'material';
    if (activeCategory === 'key') return item.isKeyItem || item.category?.index === 'key-items' || item._type === 'key';
    if (activeCategory === 'books') return item.isBook || item.category?.index === 'books' || item._type === 'books';
    return true;
  });

  const categories: { id: BackpackCategory; icon: any; label: string }[] = [
    { id: 'all', icon: Filter, label: 'All' },
    { id: 'equipment', icon: Shield, label: 'Gear' },
    { id: 'materials', icon: Sparkles, label: 'Mats' },
    { id: 'key', icon: Key, label: 'Key' },
    { id: 'books', icon: Book, label: 'Books' }
  ];

  return (
    <div className="space-y-8">
      {/* Equipped Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-dragon-red/20 pb-2">
          <h3 className="text-xs font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} /> Currently Equipped
          </h3>
          <span className="text-[10px] text-parchment-500 font-mono">{equippedItems.length} Slots</span>
        </div>

        <div className="space-y-2">
          {equippedItems.length > 0 ? (
            equippedItems.map(([slot, item]) => (
              <motion.div
                key={slot}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-dragon-red/5 border border-dragon-red/10 rounded-lg p-1.5 flex items-center gap-2 group"
              >
                <div className="w-8 aspect-[9/16] bg-black/10 rounded border border-dragon-red/5 overflow-hidden flex-none">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-bold text-dragon-red uppercase tracking-tighter truncate">{item.name}</div>
                  <div className="text-[6px] text-parchment-500 uppercase font-bold">{slot.replace('-', ' ')}</div>
                </div>
                <button 
                  onClick={() => unequipItem(slot)}
                  className="p-1.5 text-parchment-400 hover:text-dragon-red transition-colors"
                  title="Unequip to Backpack"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-[9px] text-parchment-400 italic text-center py-2">No items equipped</p>
          )}
        </div>
      </div>

      {/* Backpack Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-dragon-red/20 pb-1.5">
          <h3 className="text-[10px] font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
            <Package size={12} /> Backpack
          </h3>
          <span className="text-[9px] text-parchment-500 font-mono">{backpack.length}</span>
        </div>

        {/* Backpack Categories */}
        <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                activeCategory === cat.id 
                  ? "bg-dragon-red text-white border-dragon-red shadow-sm" 
                  : "bg-white/40 text-parchment-600 border-parchment-300 hover:bg-parchment-200"
              )}
            >
              <cat.icon size={10} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1.5">
          <AnimatePresence mode="popLayout">
            {filteredBackpack.length > 0 ? (
              filteredBackpack.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/40 border border-dragon-red/10 rounded-lg p-2 flex items-center gap-2 group hover:bg-white/60 transition-colors"
                >
                  <div className="w-10 aspect-[9/16] bg-black/10 rounded border border-dragon-red/5 overflow-hidden flex-none">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold text-dragon-red uppercase tracking-tighter truncate">{item.name}</div>
                    <div className="text-[7px] text-parchment-500 uppercase font-bold flex items-center gap-1.5">
                      {item.weight && (
                        <span className="flex items-center gap-0.5">
                          <Weight size={7} /> {item.weight}
                        </span>
                      )}
                      <span className="text-dragon-red/40">•</span>
                      <span>{item._type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {item._type === 'equipment' && (
                      <button 
                        onClick={() => onEquipRequest?.(item)}
                        className="flex items-center gap-1 px-1.5 py-1 bg-dragon-red text-white rounded hover:bg-red-700 transition-colors shadow-sm group/btn"
                        title="Equip Item"
                      >
                        <span className="text-[7px] font-bold uppercase tracking-tighter">Equip</span>
                        <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                    <button 
                      onClick={() => removeFromBackpack(index)}
                      className="p-1.5 text-parchment-400 hover:text-red-600 transition-colors"
                      title="Discard Item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center space-y-1.5 opacity-30">
                <Package size={32} className="mx-auto text-parchment-400" />
                <p className="text-[9px] font-bold uppercase tracking-widest">Empty</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
