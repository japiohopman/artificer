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
  } = useCharacterStore();

  React.useEffect(() => {
    if (!isInventoryMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInventoryMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInventoryMenuOpen, setIsInventoryMenuOpen]);

  if (!isInventoryMenuOpen) return null;

  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  const fullScreenContent = (
    <div className="fixed inset-0 w-full h-full bg-parchment-100 flex flex-col font-body overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full h-full flex flex-col relative overflow-hidden"
      >
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

        {/* Continuous Gear Interaction Workspace Surface */}
        <div className="flex-1 overflow-hidden relative z-0 min-h-0 flex flex-col">
          <EquipmentWorkspace forceCharacterId={activeChar?.id} standalone={true} />
        </div>

        {/* Context Menu Target */}
        <InventoryItemActionMenu />
      </motion.div>
    </div>
  );

  return createPortal(fullScreenContent, document.body);
};
