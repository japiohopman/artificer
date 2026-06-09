import React from 'react';
import { motion } from 'framer-motion';
import { MonsterCard } from './MonsterCard';
import { MaterialCard } from './MaterialCard';
import { EquipmentCard } from './EquipmentCard';

interface DraggableCardProps {
  monster: any;
  initialX?: number;
  initialY?: number;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ monster, initialX = 0, initialY = 0 }) => {
  const type = monster._type || 'enemies';

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: initialX, y: initialY, opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileDrag={{ scale: 1.05, zIndex: 50, rotate: 2 }}
      className="absolute cursor-grab active:cursor-grabbing"
    >
      {type === 'enemies' && <MonsterCard monster={monster} />}
      {type === 'materials' && <MaterialCard material={monster} />}
      {type === 'equipment' && <EquipmentCard equipment={monster} />}
    </motion.div>
  );
};
