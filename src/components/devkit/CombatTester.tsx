import React, { useState, useEffect } from 'react';
import { GameIcon } from '../../game_icons';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useAtlasStore } from '../../store/useAtlasStore';
import { fetchMonsterData, playSuccessSound, playClickSound, normalizeImageUrl } from '../../services/storageService';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const CombatTester: React.FC = () => {
  const { 
    gameMode, setGameMode, 
    setIsDevKitOpen
  } = useUIStore();

  const {
    activeCards, addToPreview, removeFromPreview, clearPreview,
    addLog, combatState, addMonsterToCombat, removeMonsterFromCombat
  } = useGameStore();
  
  const { characters, restoreSlots, restoreActionEconomy, updateCharacter } = useCharacterStore();
  const { monstersList, loadAllLists } = useAtlasStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (monstersList.length === 0) {
      loadAllLists();
    }
  }, []);

  const handleAddMonster = async (index: string) => {
    setIsLoading(true);
    try {
      const data = await fetchMonsterData(index);
      if (data) {
        addMonsterToCombat(data);
        addLog(`Added ${data.name} to tactical combat`, 'info');
        playSuccessSound();
      }
    } catch (error) {
      console.error("Failed to add monster:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullRestore = () => {
    characters.forEach(char => {
      // Restore HP
      updateCharacter(char.id, { hp: char.maxHp });
      // Restore Action Economy
      restoreActionEconomy(char.id, true);
      // Restore Spell Slots (Long Rest)
      // Note: restoreSlots in useCharacterStore depends on activeCharacterId
      // We might need to loop or handle it differently if we want to restore all
    });
    
    // For now, restore slots uses activeCharacterId from store
    restoreSlots(true);
    
    addLog("Party fully restored and actions reset", "success");
    playSuccessSound();
  };

  const handleLaunchCombat = () => {
    setGameMode('combat');
    setIsDevKitOpen(false);
    addLog("Tactical Combat Matrix Initialized", "info");
    playSuccessSound();
  };

  const filteredMonsters = monstersList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.index.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
            <GameIcon name="attack" size={18} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Combat_Engine_Debugger</div>
            <div className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
               Tactical Combat Tester
               {isLoading && <GameIcon name="refresh" size={14} className="animate-spin text-red-500" />}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-black/40 rounded-lg border border-white/10 p-1">
            <button 
              onClick={() => { setGameMode('exploration'); playClickSound(); }}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                gameMode === 'exploration' ? "bg-dragon-gold text-stone-900" : "text-white/40 hover:text-white"
              )}
            >
              Exploration
            </button>
            <button 
              onClick={() => { setGameMode('combat'); playClickSound(); }}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                gameMode === 'combat' ? "bg-dragon-red text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]" : "text-white/40 hover:text-white"
              )}
            >
              Combat
            </button>
          </div>
          <button 
            onClick={handleFullRestore}
            className="px-4 py-2 bg-green-600/10 border border-green-600/30 rounded-md text-[10px] font-black text-green-500 hover:bg-green-600/20 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <GameIcon name="vitality" size={12} />
            Full Party Restore
          </button>
          <button 
            onClick={handleLaunchCombat}
            className="px-6 py-2 bg-dragon-red border border-dragon-gold/30 rounded-md text-[10px] font-black text-white hover:brightness-110 transition-all uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_20px_rgba(139,0,0,0.3)] animate-pulse"
          >
            <GameIcon name="dice" size={14} />
            Launch Tactical Combat
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Combatants List */}
        <div className="w-[380px] border-r border-white/5 bg-[#1e1e1e] flex flex-col">
          <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active_Combatants</span>
            <button 
              onClick={() => { clearPreview(); playClickSound(); }}
              className="text-[9px] font-black text-red-500/60 uppercase hover:text-red-500 transition-colors"
            >
              Clear Board
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Party Members */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Party Nodes</label>
              {characters.map(char => (
                <div key={char.id} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={char.avatarUrl || char.imageUrl}
                      className="w-full h-full object-cover"
                      alt={char.name}
                      title={char.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-black text-white uppercase truncate">{char.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-bold text-white/40">{char.hp}/{char.maxHp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Monsters on Board */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Enemy Manifestations</label>
              <AnimatePresence initial={false}>
                {combatState.monsters.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl text-white/10 italic text-[10px] uppercase">
                    No enemies on tactical board
                  </div>
                ) : (
                  combatState.monsters.map((monster) => (
                    <motion.div 
                      key={monster.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                        {monster.imageUrl && (
                          <img
                            src={monster.imageUrl}
                            className="w-full h-full object-cover"
                            alt={monster.name}
                            title={monster.name}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-black text-white uppercase truncate">{monster.name}</div>
                        <div className="text-[8px] font-bold text-red-500/60 uppercase tracking-widest">HP {monster.hp}/{monster.maxHp} • {monster.type}</div>
                      </div>
                      <button 
                        onClick={() => removeMonsterFromCombat(monster.id)}
                        className="p-2 text-white/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <GameIcon name="trash" size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Monster Repository */}
        <div className="flex-1 flex flex-col bg-[#161616]">
          <div className="p-6 bg-black/20 border-b border-white/5 flex items-center gap-6">
             <div className="relative flex-1">
                <GameIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text"
                  placeholder="Summon_Entity_From_Atlas (Name or Index)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-red-500/50 transition-all font-mono"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {filteredMonsters.map(monster => (
                 <button
                   key={monster.index}
                   onClick={() => handleAddMonster(monster.index)}
                   className="group bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center gap-4 text-left"
                 >
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                       <GameIcon name="identity" size={24} className="text-white/10 group-hover:text-red-500/40 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="text-[13px] font-black text-white uppercase truncate tracking-tight">{monster.name}</div>
                       <div className="text-[9px] text-white/30 uppercase font-bold mt-0.5">CR {monster.challenge_rating} • {monster.type}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                       <GameIcon name="plus" size={14} className="text-white" />
                    </div>
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
