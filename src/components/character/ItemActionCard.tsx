import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { 
  X, Shield, Package, ArrowRight, ArrowLeft, Trash2, 
  Weight as WeightIcon, ShieldCheck, Sword, Zap, Info, Share2, CornerUpLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { normalizeImageUrl } from '../../services/storageService';
import { EquipmentSlotId } from '../../lib/equipmentConstants';

export const ItemActionCard: React.FC = () => {
  const { 
    inspectingItem, 
    setInspectingItem, 
    setFocusedItem
  } = useCharacterStore();

  const {
    activeCharacterId, 
    characters
  } = useCharacterStore();

  const {
    equipItem,
    unequipItem,
    transferItem,
    removeFromBackpack,
    removeFromPartyInventory
  } = useInventoryStore();

  if (!inspectingItem) return null;

  const { item, sourceId, index, slot } = inspectingItem;
  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];
  const isEquipment = item._type === 'equipment';
  
  const handleEquip = (slotId: string) => {
    equipItem(item, slotId);
    setInspectingItem(null);
  };

  const handleUnequip = () => {
    if (slot) {
      unequipItem(slot);
      setInspectingItem(null);
    }
  };

  const handleDiscard = () => {
    if (sourceId === 'party') {
      removeFromPartyInventory(item.id);
    } else {
      removeFromBackpack(index !== undefined ? index : item.id);
    }
    setInspectingItem(null);
  };

  const handleTransfer = (targetId: string) => {
    transferItem({ sourceId, targetId, itemId: item.id });
    setInspectingItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-sm bg-parchment-100 rounded-2xl border-2 border-dragon-red overflow-hidden shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="bg-dragon-darkRed p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
             <Package size={18} />
          </div>
          <span className="font-header uppercase tracking-widest text-sm">Item Manifest</span>
        </div>
        <button onClick={() => setInspectingItem(null)} className="hover:rotate-90 transition-transform">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Item Preview */}
        <div className="flex gap-4">
           <div className="w-24 aspect-[9/16] bg-black/5 rounded-lg border border-dragon-red/10 overflow-hidden shrink-0">
             <img 
               src={normalizeImageUrl(item.imageUrl, item._type || 'equipment', item.index || item.id)} 
               alt={item.name}
               className="w-full h-full object-contain p-2"
               referrerPolicy="no-referrer"
             />
           </div>
           <div className="flex-1">
             <h3 className="font-header text-xl text-dragon-darkRed uppercase tracking-tight leading-none mb-2">{item.name}</h3>
             <div className="flex flex-wrap gap-2">
               <span className="px-2 py-0.5 bg-dragon-red/10 text-dragon-red text-[8px] font-black uppercase rounded border border-dragon-red/20">{item._type || 'item'}</span>
               {item.weight && (
                 <span className="flex items-center gap-1 text-[9px] text-parchment-500 font-bold uppercase">
                   <WeightIcon size={10} /> {item.weight} lbs
                 </span>
               )}
             </div>
             <p className="mt-3 text-[10px] text-parchment-600 italic leading-relaxed">
               {Array.isArray(item.desc) ? item.desc[0] : (item.desc || 'No description available.')}
             </p>
           </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 gap-2">
          {/* Equip Actions */}
          {isEquipment && !slot && (
             <div className="space-y-2">
               <p className="text-[8px] font-black text-parchment-400 uppercase tracking-widest px-1">Available Slots</p>
               <div className="flex flex-wrap gap-2">
                 {(Array.isArray(item.slot) ? item.slot : [item.slot]).map((s: string) => (
                   <button
                     key={s}
                     onClick={() => handleEquip(s)}
                     className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-dragon-red text-white rounded-lg text-[10px] font-black uppercase hover:bg-dragon-darkRed transition-all shadow-md group"
                   >
                     <ShieldCheck size={14} />
                     Equip to {s.replace('_', ' ')}
                   </button>
                 ))}
               </div>
             </div>
          )}

          {/* Unequip */}
          {slot && (
            <button
              onClick={handleUnequip}
              className="flex items-center justify-center gap-2 py-2.5 bg-parchment-200 text-dragon-darkRed rounded-lg text-[10px] font-black uppercase hover:bg-parchment-300 transition-all border border-dragon-red/20"
            >
              <CornerUpLeft size={14} />
              Return to Backpack
            </button>
          )}

          {/* Transfer Actions */}
          <div className="pt-2 border-t border-dragon-red/10 space-y-2">
             <p className="text-[8px] font-black text-parchment-400 uppercase tracking-widest px-1">Logistics</p>
             <div className="grid grid-cols-2 gap-2">
                {sourceId !== 'party' && (
                  <button 
                    onClick={() => handleTransfer('party')}
                    className="flex items-center justify-center gap-2 py-2 bg-white border border-dragon-red/20 text-dragon-red rounded text-[9px] font-bold uppercase hover:bg-dragon-red hover:text-white transition-all"
                  >
                    <Share2 size={12} /> Party Armory
                  </button>
                )}
                {sourceId !== activeChar.id && (
                  <button 
                    onClick={() => handleTransfer(activeChar.id)}
                    className="flex items-center justify-center gap-2 py-2 bg-white border border-dragon-red/20 text-dragon-red rounded text-[9px] font-bold uppercase hover:bg-dragon-red hover:text-white transition-all"
                  >
                    <ArrowLeft size={12} /> To {activeChar.name.split(' ')[0]}
                  </button>
                )}
                <button 
                  onClick={handleDiscard}
                  className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-[9px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={12} /> Discard
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-parchment-200 p-2 text-[8px] text-parchment-400 font-mono text-center border-t border-parchment-300">
         ITEM_INSTANCE_ID: {item.id}
      </div>
    </motion.div>
  );
};
