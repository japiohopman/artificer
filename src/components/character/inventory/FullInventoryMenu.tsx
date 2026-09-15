import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { EquipmentWorkspace } from '../equipment/EquipmentWorkspace';
import { GameIcon } from '../../../game_icons';
import { InventoryItemActionMenu } from './InventoryItemActionMenu';

export const FullInventoryMenu: React.FC = () => {
  const {
    isInventoryMenuOpen,
    setIsInventoryMenuOpen,
  } = useInventoryStore();

  const {
    characters,
    activeCharacterId,
    setActiveCharacter
  } = useCharacterStore();

  if (!isInventoryMenuOpen) return null;

  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 font-body">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full h-full max-w-6xl max-h-[92vh] bg-parchment-100 rounded-2xl border-2 border-dragon-gold shadow-2xl overflow-hidden flex flex-col relative z-[10000]"
      >
        {/* Texture Overlays */}
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

        {/* Header */}
        <div className="shrink-0 bg-dragon-darkRed h-12 sm:h-14 border-b-2 border-dragon-gold flex items-center justify-between px-4 sm:px-6 relative z-10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <GameIcon name="package" size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 className="font-header text-base sm:text-lg text-white uppercase tracking-[0.15em] leading-none">
                Gear & Equipment Workspace
              </h1>
              <p className="text-[8px] sm:text-[9px] text-white/60 uppercase font-mono tracking-widest mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-dragon-gold rounded-full animate-pulse" />
                Active Character: <span className="text-dragon-gold font-bold">{activeChar?.name || 'Unassigned'}</span> (Lvl {activeChar?.level || 1} {activeChar?.class || 'Adventurer'})
              </p>
            </div>
          </div>

          {/* Party Member Switcher Toolbar */}
          {characters.length > 1 && (
            <div className="hidden md:flex items-center gap-1.5 bg-black/30 p-1 rounded-lg border border-white/10">
              {characters.map(char => (
                <button
                  key={char.id}
                  onClick={() => setActiveCharacter(char.id)}
                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all tracking-wider ${
                    char.id === activeCharacterId
                      ? 'bg-dragon-gold text-stone-950 font-black shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {char.name}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsInventoryMenuOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-dragon-red hover:rotate-90 transition-all flex items-center justify-center border border-white/20 group"
            title="Close Gear Workspace"
            aria-label="Close Gear Workspace"
          >
            <GameIcon name="close" size={18} color="currentColor" />
          </button>
        </div>

        {/* Continuous Gear Interaction Workspace Surface */}
        <div className="flex-1 overflow-hidden p-3 relative z-0 min-h-0 flex flex-col">
          <EquipmentWorkspace forceCharacterId={activeChar?.id} standalone={true} />
        </div>

        {/* Context Menu Target */}
        <InventoryItemActionMenu />
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
