import React, { useState, useEffect } from 'react';
import { useJournalStore } from '../../../store/useJournalStore';
import { fetchMonsterData } from '../../../services/storageService';
import { MonsterCard } from '../../atlas/MonsterCard';
import { GameIcon } from '../../../game_icons';
import { motion, AnimatePresence } from 'motion/react';

export const BestiaryTab: React.FC = () => {
  const { encounteredEnemies } = useJournalStore();
  const [selectedEnemy, setSelectedEnemy] = useState<any>(null);
  const [enemyData, setEnemyData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data: Record<string, any> = {};
      await Promise.all(encounteredEnemies.map(async (index) => {
        if (!enemyData[index]) {
          const fetched = await fetchMonsterData(index);
          if (fetched) data[index] = fetched;
        }
      }));
      setEnemyData(prev => ({ ...prev, ...data }));
      setIsLoading(false);
    };

    if (encounteredEnemies.length > 0) {
      loadData();
    }
  }, [encounteredEnemies]);

  if (encounteredEnemies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-parchment-600 italic space-y-4">
        <GameIcon name="sword" size={48} className="opacity-20" />
        <p>Geen vijanden in het bestiarium.</p>
        <p className="text-sm">Verslagen of ontmoette wezens verschijnen hier.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4 pr-2 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
        {encounteredEnemies.map(index => {
          const data = enemyData[index];
          if (!data) return (
            <div key={index} className="aspect-[2/3] bg-parchment-200 animate-pulse rounded border border-dragon-gold/10" />
          );

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedEnemy(data)}
              className="group cursor-pointer aspect-[2/3] bg-parchment-200 rounded-lg overflow-hidden border-2 border-dragon-gold/20 shadow-sm hover:border-dragon-red/50 hover:shadow-md transition-all relative"
            >
               <img
                 src={data.imageUrl}
                 alt={data.name}
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                  <span className="text-white font-header text-sm tracking-tight leading-tight">{data.name}</span>
                  <span className="text-dragon-gold text-[10px] uppercase font-bold tracking-widest">{data.type}</span>
               </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedEnemy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedEnemy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MonsterCard monster={selectedEnemy} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
