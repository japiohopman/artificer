import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
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
    activeCharacterId, 
    characters,
    equipItem,
    unequipItem,
    transferItem,
    removeFromBackpack,
    removeFromPartyInventory,
    setFocusedItem
  } = useStore();

  if (!inspectingItem) return null;

  const { item, sourceId, index, slot } = inspectingItem;
  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];
  const isEquipment = item._type === 'equipment';
  const isEquipped = !!slot;
  const isOurItem = sourceId === activeCharacterId;
  const isPartyItem = sourceId === 'party';

  const handleClose = () => setInspectingItem(null);

  const handleEquip = () => {
    if (isEquipment && item.slot) {
      const slots = Array.isArray(item.slot) ? item.slot : [item.slot as EquipmentSlotId];
      // Simple logic: if multiple slots, pick first available or first in general
      const targetSlot = slots[0];
      equipItem(item, targetSlot);
      handleClose();
    }
  };

  const handleUnequip = () => {
    if (slot) {
      unequipItem(slot as EquipmentSlotId);
      handleClose();
    }
  };

  const handleTransfer = () => {
    const targetId = isOurItem ? 'party' : activeCharacterId;
    transferItem({ sourceId, targetId, itemId: item.id });
    handleClose();
  };

  const handleDiscard = () => {
    if (window.confirm(`Discard ${item.name}? This cannot be undone.`)) {
      if (sourceId === 'party') {
        removeFromPartyInventory(item.id);
      } else if (index !== undefined) {
        removeFromBackpack(index);
      }
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-parchment-50 w-[85%] max-h-[85%] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-dragon-red overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full bg-parchment-50/90 backdrop-blur-sm p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-dragon-red/10 pb-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-parchment-400 uppercase tracking-widest leading-none mb-1">
                Relic Analysis
              </span>
              <h2 className="text-base font-header font-black text-dragon-darkRed uppercase tracking-tight leading-none">
                {item.name}
              </h2>
            </div>
            <button 
              onClick={handleClose}
              title="Close Analysis"
              aria-label="Close Analysis"
              className="p-1 hover:bg-parchment-200 rounded-full text-parchment-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {/* Main Visual - Larger preview */}
            <div className="aspect-square w-full max-w-[200px] mx-auto bg-white/50 rounded-lg border border-parchment-300 p-6 flex items-center justify-center relative overflow-hidden group shadow-inner">
               <img 
                 src={normalizeImageUrl(item.imageUrl, item._type || 'equipment', item.index || item.id)} 
                 alt={item.name} 
                 className="max-w-full max-h-full object-contain relative z-10 transition-transform group-hover:scale-110 drop-shadow-xl"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-40">
                  <span className="text-[6px] font-black uppercase text-parchment-400">UID:</span>
                  <span className="text-[6px] font-mono font-bold text-parchment-500">{item.id?.split('-')[0]}</span>
               </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-parchment-100/50 rounded p-2 flex items-center gap-2 border border-parchment-300">
                <WeightIcon size={12} className="text-dragon-red/60" />
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-parchment-500 uppercase">Weight</span>
                  <span className="text-xs font-cinzel text-parchment-900">{item.weight || '0'} lb</span>
                </div>
              </div>
              <div className="bg-parchment-100/50 rounded p-2 flex items-center gap-2 border border-parchment-300">
                <Info size={12} className="text-dragon-red/60" />
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-parchment-500 uppercase">Type</span>
                  <span className="text-xs font-cinzel text-parchment-900 uppercase">{item._type || 'Misc'}</span>
                </div>
              </div>
            </div>

            {/* Detailed Info (if available in JSON) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <ScrollIcon size={12} className="text-dragon-red" />
                 <span className="text-[8px] font-black text-dragon-darkRed uppercase tracking-widest">Description</span>
              </div>
              <p className="text-[10px] text-parchment-700 leading-relaxed italic border-l-2 border-dragon-red/20 pl-3">
                {item.description || item.desc?.[0] || 'Standard issue or found artifact. Details are scarce in the current archives.'}
              </p>
            </div>

            {/* Specific Combat Stats if equipment */}
            {isEquipment && item.armor_class && (
              <div className="bg-blue-50/50 rounded border border-blue-200 p-3 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase">Armor Class</span>
                 </div>
                 <span className="text-sm font-header font-black text-blue-900">{item.armor_class.base}</span>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="mt-4 pt-4 border-t border-parchment-300 space-y-2">
             <div className="grid grid-cols-2 gap-2">
                {isEquipment && (
                  <button 
                    onClick={isEquipped ? handleUnequip : handleEquip}
                    title={isEquipped ? 'Unequip Item' : 'Equip Item'}
                    aria-label={isEquipped ? 'Unequip Item' : 'Equip Item'}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                      isEquipped 
                        ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200" 
                        : "bg-dragon-red text-white hover:bg-red-700"
                    )}
                  >
                    {isEquipped ? <CornerUpLeft size={14} /> : <Shield size={14} />}
                    {isEquipped ? 'Unequip' : 'Equip Now'}
                  </button>
                )}
                
                <button 
                  onClick={handleTransfer}
                  title={isOurItem ? 'Transfer to Party' : 'Take Item'}
                  aria-label={isOurItem ? 'Transfer to Party' : 'Take Item'}
                  className="flex items-center justify-center gap-2 py-2.5 bg-parchment-200 text-parchment-700 border border-parchment-300 rounded text-[10px] font-black uppercase tracking-widest hover:bg-parchment-300 transition-all shadow-sm"
                >
                  {isOurItem ? <Share2 size={14} /> : <ArrowRight size={14} />}
                  {isOurItem ? 'To Party' : 'Take Item'}
                </button>
             </div>

             <button 
               onClick={() => {
                  setFocusedItem(item);
                  handleClose();
               }}
               title="Focus in Codex"
               aria-label="Focus in Codex"
               className="w-full py-2 bg-dragon-gold text-white rounded text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-sm"
             >
                <Zap size={14} /> Focus in Codex
             </button>

             <button 
               onClick={handleDiscard}
               title="Discard Item"
               aria-label="Discard Item"
               className="w-full py-2 text-red-600/60 hover:text-red-600 transition-colors text-[8px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-1"
             >
               <Trash2 size={10} /> Discard Permanently
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ScrollIcon = ({ size, className }: { size: number; className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2" />
    <path d="M15 21v-2a4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v2a2 2 0 0 0 2 2h11a3 3 0 0 0 3-3V4" />
    <path d="M15 6h4" />
    <path d="M15 10h4" />
  </svg>
);
