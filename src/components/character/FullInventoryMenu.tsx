import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { Inventory } from './Inventory';
import { PartyInventory } from './PartyInventory';
import { cn } from '../../lib/utils';
import { GameIcon, GameIconName } from '../../game_icons';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';

export const FullInventoryMenu: React.FC = () => {
  const { 
    isInventoryMenuOpen, 
    setIsInventoryMenuOpen, 
    characters,
    activeCharacterId,
    setActiveCharacter,
    transferItem
  } = useStore();

  if (!isInventoryMenuOpen) return null;

  const leftChars = characters.slice(0, 3);
  const rightChars = characters.slice(3, 6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-x-0 bottom-0 top-16 bg-parchment-100 z-50 overflow-hidden flex flex-col"
    >
      <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none" />
      
      {/* Header Area */}
      <div className="h-14 border-b border-dragon-red/20 bg-white/60 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-dragon-red flex items-center justify-center text-white shadow-lg rotate-3">
            <GameIcon name="dashboard" size={20} color="#FFFFFF" />
          </div>
          <div>
            <h2 className="font-header text-2xl text-dragon-darkRed uppercase tracking-[0.2em] leading-none">Party Armory</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-parchment-500 uppercase tracking-widest flex items-center gap-2">
                <GameIcon name="package" size={10} color="#8B4513" /> 6 Syncronized Biological Nodes
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsInventoryMenuOpen(false)}
          className="p-2.5 hover:bg-dragon-red hover:text-white text-dragon-red rounded-xl transition-all border-2 border-dragon-red/10 shadow-sm hover:rotate-90"
        >
          <GameIcon name="close" size={24} color="currentColor" />
        </button>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Panel: Characters 1-3 */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {leftChars.map((char) => (
            <CharacterMiniPanel 
              key={char.id} 
              char={char} 
              isActive={activeCharacterId === char.id}
              onClick={() => setActiveCharacter(char.id)}
            />
          ))}
        </div>

        {/* Middle Panel: Shared Party Inventory */}
        <div className="flex-1 flex flex-col min-w-0">
          <PartyInventory />
        </div>

        {/* Right Panel: Characters 4-6 */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {rightChars.map((char) => (
            <CharacterMiniPanel 
              key={char.id} 
              char={char} 
              isActive={activeCharacterId === char.id}
              onClick={() => setActiveCharacter(char.id)}
            />
          ))}
        </div>

      </div>

      {/* Footer */}
      <div className="h-10 bg-dragon-darkRed text-white/90 text-[9px] font-mono flex items-center justify-between px-8 z-10 border-t border-white/5">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 opacity-60">
            <span className="w-1 h-1 bg-white rounded-full" />
            SYSTEM_BOOT: SUCCESSFUL
          </span>
          <span className="flex items-center gap-2 opacity-60">
            <span className="w-1 h-1 bg-white rounded-full" />
            DATA_LINK: ENCRYPTED
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-white/10 rounded uppercase tracking-tighter">DRAG ITEMS TO SWAP</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-bold">REALTIME_SYNC: NOMINAL</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface CharacterMiniPanelProps {
  char: any;
  isActive: boolean;
  onClick: () => void;
}

const CharacterMiniPanel: React.FC<CharacterMiniPanelProps> = ({ char, isActive, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex flex-col rounded-2xl border-2 transition-all h-[380px] shrink-0 bg-white/80 backdrop-blur-md shadow-lg",
        isActive 
          ? "border-dragon-red shadow-dragon-red/10 ring-4 ring-dragon-red/5" 
          : "border-parchment-300 hover:border-parchment-400"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "p-3 border-b flex items-center justify-between rounded-t-2xl px-4",
        isActive ? "bg-dragon-red text-white" : "bg-parchment-50 text-parchment-800"
      )}>
        <h3 
          className="font-header text-xs uppercase tracking-widest truncate cursor-pointer hover:underline decoration-white/40 underline-offset-4"
          onClick={(e) => {
            e.stopPropagation();
            onClick(); // Set active
            useStore.getState().setIsProfileMenuOpen(true);
          }}
        >
          {char.name}
        </h3>
        <div className={cn(
          "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
          isActive ? "bg-white/20" : "bg-dragon-red/10 text-dragon-red text-[7px]"
        )}>
          {(char.saveVersion === 2 
            ? Object.values(char.items || {}).length 
            : char.backpack.length + Object.keys(char.inventory || {}).length
          )} ITEMS
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden p-3 pt-4">
        <Inventory 
          forceCharacterId={char.id}
          showCategoryTabs={true} 
          compactEquipped={true}
        />
      </div>
    </motion.div>
  );
};
