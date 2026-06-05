import React from 'react';
import { motion } from 'motion/react';
import { useStore, Character } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';

interface SlotStepProps {
  selectedSlot: number | null;
  onSelect: (slot: number) => void;
}

export const SlotStep: React.FC<SlotStepProps> = ({ selectedSlot, onSelect }) => {
  const { mainCharacterSlots } = useStore();
  
  const slots = [1, 2, 3];
  
  const getCharacterBySlot = (slot: number) => {
    return mainCharacterSlots[slot - 1];
  };

  return (
    <div id="slot-step" className="max-w-4xl mx-auto flex flex-col items-center space-y-12 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Select Save Manifest</h2>
        <p className="text-parchment-600 font-medium italic max-w-xl">
          "The Codex has three sanctums of memory. To create anew where data dwells, the old must be overwritten."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {slots.map(slot => {
          const character = getCharacterBySlot(slot);
          const isSelected = selectedSlot === slot;

          return (
            <motion.button
              key={slot}
              whileHover={{ y: -5 }}
              onClick={() => onSelect(slot)}
              className={cn(
                "relative flex flex-col overflow-hidden border-2 rounded-sm transition-all text-left h-96 group",
                isSelected 
                  ? "border-dragon-red ring-4 ring-dragon-red/10 shadow-2xl" 
                  : "border-dragon-gold/20 hover:border-dragon-gold/40 shadow-lg bg-parchment-50/50"
              )}
            >
              {/* Header */}
              <div className={cn(
                "px-4 py-2 border-b flex items-center justify-between",
                isSelected ? "bg-dragon-red border-dragon-red/10" : "bg-dragon-red/5 border-dragon-gold/10"
              )}>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  isSelected ? "text-white" : "text-dragon-red"
                )}>Slot_0{slot}</span>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </div>

              {/* Slot Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 relative">
                {character ? (
                  <>
                      <div className="w-32 h-32 bg-white rounded-sm border-2 border-dragon-gold/20 overflow-hidden relative shadow-sm group-hover:scale-105 transition-transform">
                        {character ? (
                          <img 
                            src={character.avatarUrl || `https://raw.githubusercontent.com/japiohopman/artificer/main/data/character_save/images/slot${slot}/slot${slot}_avatar.webp`} 
                            alt={character.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const slotId = `slot${slot}`;
                              if (!target.src.includes('raw.githubusercontent.com')) {
                                target.src = `https://raw.githubusercontent.com/japiohopman/artificer/main/data/character_save/images/${slotId}/${slotId}_avatar.webp`;
                              } else {
                                // If already raw and still fail, use placeholder
                                target.src = `https://picsum.photos/seed/${slotId}/200/200`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dragon-red/20">
                             <GameIcon name="user" size={48} color="currentColor" />
                          </div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                    
                    <div className="text-center space-y-1">
                      <h3 className="font-header font-black text-dragon-darkRed truncate max-w-[150px]">{character.name}</h3>
                      <div className="flex items-center justify-center gap-2 text-[9px] font-black text-parchment-400 uppercase tracking-widest">
                        <span>Lvl {character.level}</span>
                        <div className="w-1 h-1 rounded-full bg-dragon-gold/40" />
                        <span>{character.class}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col items-center gap-2">
                       <div className="flex items-center gap-1.5 text-dragon-red font-black text-[9px] uppercase tracking-widest opacity-60">
                          <GameIcon name="alert" size={10} color="currentColor" />
                          <span>Will be overwritten</span>
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 bg-dragon-red/5 border-2 border-dashed border-dragon-gold/20 rounded-sm flex items-center justify-center text-dragon-red/20 group-hover:text-dragon-red/40 group-hover:border-dragon-red/20 transition-all">
                       <GameIcon name="save_data" size={48} color="currentColor" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-header font-black text-dragon-red/40 uppercase tracking-widest">Empty Slot</h3>
                      <p className="text-[10px] font-bold text-parchment-400 uppercase tracking-tight">Ready for Manifestation</p>
                    </div>
                  </>
                )}

                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-paper-texture opacity-[0.03] pointer-events-none" />
              </div>

              {/* Footer Background */}
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-dragon-gold/5 pointer-events-none" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
