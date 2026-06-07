import React, { useState, useEffect } from 'react';
import { GameIcon } from '../../game_icons';
import { useStore, Character } from '../../store/useStore';
import { fetchCharacterList, fetchCharacterData, playSuccessSound, playFailSound, playClickSound, normalizeImageUrl } from '../../services/storageService';
import { cn } from '../../lib/utils';

export const NPCTester: React.FC = () => {
  const { characters, updateCharacter, addCharacter, deleteCharacter, setCharacters } = useStore();
  const [characterList, setCharacterList] = useState<{ name: string; index: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await fetchCharacterList();
      setCharacterList(list);
    } catch (err) {
      setErrorMessage("Failed to retrieve repository data index.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapSlot = async (charIndex: string, slotIndex: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const charData = await fetchCharacterData(charIndex);
      if (!charData || !charData.name) {
         throw new Error("Invalid or corrupted NPC data.");
      }

      // Ensure character has an ID compatible with the store
      const npcChar: Character = {
        ...charData,
        id: `npc-${charIndex}-${Date.now()}`,
        isNpc: true
      };

      const newCharacters = [...characters];
      
      // Slot 1 (index 0) is protected. Slots 2-6 (indices 1-5) are interchangeable.
      if (slotIndex >= 1 && slotIndex < 6) {
         // Replace at slotIndex
         // If party size is less than slotIndex, we should grow it
         if (newCharacters.length <= slotIndex) {
            // Grow with placeholders if needed (though usually we display 6 slots regardless of length)
            while (newCharacters.length <= slotIndex) {
               // Pad with a generic NPC based on character 0 if missing
               newCharacters.push({ ...newCharacters[0], id: `pad-${Date.now()}-${newCharacters.length}`, name: 'Empty Slot' });
            }
         }
         
         newCharacters[slotIndex] = npcChar;
         
         setCharacters(newCharacters);
         playSuccessSound();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(`Error loading character: ${charIndex}. Data may be corrupted.`);
      playFailSound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSlot = (index: number) => {
    if (index === 0) return; // Protected
    const newCharacters = [...characters];
    if (index < newCharacters.length) {
       // Replace with an "Empty" template or just remove?
       // The user implies these slots should stay as conceptual "slots".
       // We'll replace with a minimal placeholder
       newCharacters[index] = {
          ...characters[0],
          id: `empty-${Date.now()}-${index}`,
          name: 'Empty Slot',
          isNpc: true,
          imageUrl: '',
          avatarUrl: ''
       };
       setCharacters(newCharacters);
       playFailSound();
    }
  };

  const handleClearAllNPCs = () => {
    if (confirm("Reset Slots 2-6 to default empty state?")) {
      const leadChar = characters[0];
      const newChars = [leadChar];
      for (let i = 1; i < 6; i++) {
        newChars.push({
          ...leadChar,
          id: `empty-${Date.now()}-${i}`,
          name: 'Empty Slot',
          isNpc: true,
          imageUrl: '',
          avatarUrl: ''
        });
      }
      setCharacters(newChars);
      playSuccessSound();
    }
  };

  const filteredList = characterList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.index.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <GameIcon name="users" size={18} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Character_Matrix_Testing</div>
            <div className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
               NPC Slot Tester
               {isLoading && <GameIcon name="refresh" size={14} className="animate-spin text-purple-500" />}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearAllNPCs}
            className="px-4 py-2 bg-dragon-red/10 border border-dragon-red/20 rounded-md text-[10px] font-black text-dragon-red hover:bg-dragon-red/20 transition-all uppercase tracking-widest"
          >
            Purge NPC Cache
          </button>
          <button 
            onClick={loadList}
            className="p-2 text-white/40 hover:text-white transition-all bg-white/5 rounded-md border border-white/5"
          >
            <GameIcon name="refresh" size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-6 mt-4 p-3 bg-dragon-red/10 border border-dragon-red/20 rounded flex items-center gap-3 text-dragon-red animate-pulse">
           <GameIcon name="alert_triangle" size={16} />
           <span className="text-xs font-bold uppercase tracking-tight">{errorMessage}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Party Slot Overview */}
        <div className="w-[340px] border-r border-white/5 bg-[#1e1e1e] flex flex-col">
          <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active_Party_Configuration</span>
            <span className="text-[9px] font-black text-purple-500/60 uppercase">6_NODES_TOTAL</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {[0, 1, 2, 3, 4, 5].map(i => {
              const char = characters[i];
              const isSlot1 = i === 0;
              const isEmpty = char?.name === 'Empty Slot' || !char;

              return (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-xl border flex items-center gap-4 transition-all relative overflow-hidden group",
                    isSlot1 ? "bg-amber-500/5 border-amber-500/20" : 
                    isEmpty ? "bg-black/20 border-white/5 border-dashed" : 
                    "bg-purple-500/5 border-purple-500/20"
                  )}
                >
                  <div className="relative z-10 w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {char?.avatarUrl || char?.imageUrl ? (
                      <img src={normalizeImageUrl(char.avatarUrl || char.imageUrl, 'npc_character_profiles', char.id)} className="w-full h-full object-cover" />
                    ) : (
                      <GameIcon name="users" size={16} className="text-white/10" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-widest",
                         isSlot1 ? "text-amber-500/60" : "text-white/30"
                       )}>
                         Slot_{i + 1} {isSlot1 && "(LEAD)"}
                       </span>
                    </div>
                    <div className={cn(
                      "text-[13px] font-black truncate uppercase tracking-tight",
                      isEmpty ? "text-white/20 italic" : "text-white"
                    )}>
                      {char?.name || 'INITIALIZING_BUFFER'}
                    </div>
                    {!isEmpty && (
                      <div className="text-[9px] font-bold text-white/40 uppercase mt-0.5 flex gap-2">
                        <span>{char.race}</span>
                        <span className="text-white/20">|</span>
                        <span>{char.class}</span>
                      </div>
                    )}
                  </div>

                  {!isSlot1 && !isEmpty && (
                    <button 
                      onClick={() => handleClearSlot(i)}
                      className="relative z-10 p-2 text-white/10 hover:text-dragon-red transition-all hover:bg-dragon-red/10 rounded"
                      title="Clear NPC from slot"
                    >
                      <GameIcon name="trash" size={14} />
                    </button>
                  )}

                  {isSlot1 && (
                    <GameIcon name="shield" size={12} className="absolute top-2 right-2 text-amber-500/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: NPC Repository */}
        <div className="flex-1 flex flex-col bg-[#161616]">
          {/* List Search & Filter */}
          <div className="p-6 bg-black/20 border-b border-white/5 flex items-center gap-6">
             <div className="relative flex-1">
                <GameIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text"
                  placeholder="Filter_NPC_Profiles (Name or Index)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                />
             </div>
             {isLoading && <GameIcon name="ghost" size={20} className="animate-bounce text-purple-500/30 shrink-0" />}
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             {filteredList.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-20 text-white/10 opacity-50">
                  <GameIcon name="fingerprint" size={48} className="mb-4" />
                  <span className="text-sm font-black uppercase tracking-widest">No matching templates found</span>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                 {filteredList.map(npc => (
                   <div key={npc.index} className="group bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-purple-500/40 transition-all flex flex-col shadow-xl">
                      <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-purple-500/30 transition-all">
                               <GameIcon name="fingerprint" size={28} className={cn("transition-colors", npc.index.includes('nada') ? 'text-dragon-red' : 'text-purple-500/40')} />
                            </div>
                            <div className="flex flex-col min-w-0">
                               <span className="text-[14px] font-black text-white uppercase truncate tracking-tight">{npc.name}</span>
                               <span className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-0.5">{npc.index}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
                         <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Inject_Into_Matrix</div>
                         <div className="grid grid-cols-5 gap-2">
                            {[2, 3, 4, 5, 6].map(slotNum => (
                              <button 
                                key={slotNum}
                                onClick={() => handleSwapSlot(npc.index, slotNum - 1)}
                                className="flex flex-col items-center gap-1 py-2 bg-black/40 border border-white/5 rounded-lg text-[10px] font-black text-white/40 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300 transition-all uppercase"
                              >
                                <span>S{slotNum}</span>
                              </button>
                            ))}
                         </div>
                      </div>

                      {npc.index.includes('nada') && (
                        <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-dragon-red uppercase tracking-tighter opacity-70">
                           <GameIcon name="alert_triangle" size={10} />
                           Known_Issue: Corrupted_Buffer
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
