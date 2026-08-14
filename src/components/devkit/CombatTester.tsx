import React, { useState, useEffect, useMemo } from 'react';
import { GameIcon } from '../../game_icons';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useAtlasStore } from '../../store/useAtlasStore';
import {
  fetchMonsterData,
  fetchRecruitNPCList,
  fetchRecruitNPCData,
  playSuccessSound,
  playClickSound,
  normalizeImageUrl
} from '../../services/storageService';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const CombatTester: React.FC = () => {
  const { 
    gameMode, setGameMode, 
    setIsDevKitOpen
  } = useUIStore();

  const {
    activeCards, addToPreview, removeFromPreview, clearPreview,
    addLog, combatState, addMonsterToCombat, removeMonsterFromCombat,
    setCombatMapBackground
  } = useGameStore();
  
  const { characters, restoreSlots, restoreActionEconomy, updateCharacter, setCharacters } = useCharacterStore();
  const { monstersList, loadAllLists } = useAtlasStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCR, setSelectedCR] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'monsters' | 'heroes'>('heroes');
  const [recruitsList, setRecruitsList] = useState<{ name: string; index: string }[]>([]);
  const [customMaps, setCustomMaps] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCustomMapId, setSelectedCustomMapId] = useState<string>('');

  const terrainMaps = [
    { name: 'Fey Forest', file: 'fay_forest.png' },
    { name: 'Dungeon Crypt', file: 'dungeon1.png' },
    { name: 'Frozen Tundra', file: 'ice1.png' },
    { name: 'Temple Ruins', file: 'map_1766910770741.png' },
    { name: 'Abyssal Chasm', file: 'map_1766911166076.png' },
    { name: 'Forgotten Oasis', file: 'map_1766911325908.png' }
  ];

  useEffect(() => {
    if (monstersList.length === 0) {
      loadAllLists();
    }
    loadRecruits();
    loadCustomMaps();
  }, []);

  const loadCustomMaps = async () => {
    try {
      const res = await fetch('/api/combat-maps');
      if (res.ok) {
        const data = await res.json();
        setCustomMaps(data);
      }
    } catch (e) {
      console.error("Failed to load custom maps in CombatTester:", e);
    }
  };

  const handleLoadCustomMap = async (mapId: string) => {
    if (!mapId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/combat-maps/${mapId}`);
      if (res.ok) {
        const battleMap = await res.json();
        const { battleMapToCombatGrid } = await import('./BattleMapEditor/persistence/battleMapToCombatGrid');
        const runtimeRep = battleMapToCombatGrid(battleMap);

        // Deploy directly to the game store combatState
        useGameStore.setState((state) => ({
          combatState: {
            ...state.combatState,
            grid: runtimeRep.grid,
            monsters: runtimeRep.monsters,
            combatMapBackground: runtimeRep.background,
            walls: battleMap.walls // Pass boundary walls for exact LoS/Pathfinding!
          }
        }));

        setSelectedCustomMapId(mapId);
        addLog(`Loaded Battle Map: ${battleMap.name || mapId}`, 'success');
        playSuccessSound();
      } else {
        addLog(`Failed to load custom map: ${mapId}`, 'error');
      }
    } catch (err) {
      console.error("Failed to load custom map:", err);
      addLog(`Error loading custom map: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecruits = async () => {
    try {
      const list = await fetchRecruitNPCList();
      setRecruitsList(list);
    } catch (e) {
      console.error("Failed to load recruits list:", e);
    }
  };

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

  const handleAddHeroAsAlly = async (index: string) => {
    setIsLoading(true);
    try {
      const data = await fetchRecruitNPCData(index);
      if (data) {
        // Treat as allied summon/combatant on the board
        addMonsterToCombat({
          ...data,
          isAlly: true,
          imageUrl: data.avatarUrl || data.imageUrl
        });
        addLog(`Added Ally ${data.name} to board`, 'success');
        playSuccessSound();
      }
    } catch (error) {
      console.error("Failed to add recruit hero as ally:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapSlot = async (recruitIndex: string, slotIndex: number) => {
    setIsLoading(true);
    try {
      const heroData = await fetchRecruitNPCData(recruitIndex);
      if (heroData) {
        const newCharacters = [...characters];

        while (newCharacters.length < 6) {
          newCharacters.push({
            id: `empty-${Date.now()}-${newCharacters.length}`,
            name: 'Empty Slot',
            isNpc: true,
            class: '',
            race: '',
            gender: 'Male',
            level: 1,
            xp: 0,
            alignment: '',
            background: '',
            stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            proficiencies: [],
            traits: [],
            features: [],
            flaws: [],
            ideals: [],
            bonds: [],
            backstory: '',
            languages: [],
            appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
            inventory: {},
            backpack: [],
            knownSpells: [],
            preparedSpells: [],
            spellSlots: {},
            choices: {},
            hp: 10,
            maxHp: 10,
            money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
          });
        }

        newCharacters[slotIndex] = {
          ...heroData,
          id: `hero-${recruitIndex}-${Date.now()}`,
          isNpc: true,
          isRecruitable: true,
          hp: heroData.hp || heroData.maxHp || 10,
          maxHp: heroData.maxHp || 10
        };

        setCharacters(newCharacters);
        addLog(`Assigned ${heroData.name} to Slot ${slotIndex + 1}`, 'success');
        playSuccessSound();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSlot = (slotIndex: number) => {
    const newCharacters = [...characters];
    if (slotIndex < newCharacters.length) {
      newCharacters[slotIndex] = {
        id: `empty-${Date.now()}-${slotIndex}`,
        name: 'Empty Slot',
        isNpc: true,
        class: '',
        race: '',
        gender: 'Male',
        level: 1,
        xp: 0,
        alignment: '',
        background: '',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencies: [],
        traits: [],
        features: [],
        flaws: [],
        ideals: [],
        bonds: [],
        backstory: '',
        languages: [],
        appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
        inventory: {},
        backpack: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        choices: {},
        hp: 10,
        maxHp: 10,
        money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
      };
      setCharacters(newCharacters);
      playClickSound();
    }
  };

  const handleFullRestore = () => {
    characters.forEach(char => {
      if (char && char.name !== 'Empty Slot') {
        updateCharacter(char.id, { hp: char.maxHp });
        restoreActionEconomy(char.id, true);
      }
    });
    
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

  // Unique CR list for filtering dropdown
  const uniqueCRs = useMemo(() => {
    const crs = new Set<string>();
    monstersList.forEach(m => {
      if (m.challenge_rating !== undefined && m.challenge_rating !== null) {
        crs.add(String(m.challenge_rating));
      }
    });
    return Array.from(crs).sort((a, b) => {
      const numA = eval(a); // Handles fractions like 1/8, 1/4, 1/2
      const numB = eval(b);
      return numA - numB;
    });
  }, [monstersList]);

  const filteredMonsters = monstersList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.index.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCR = selectedCR === 'all' || String(m.challenge_rating) === selectedCR;
    return matchesSearch && matchesCR;
  }).slice(0, 50); // Increased slice to 50 for better usability with filters

  const filteredHeroes = recruitsList.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.index.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {customMaps.length > 0 && (
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Custom Map:</span>
              <select
                value={selectedCustomMapId}
                onChange={(e) => {
                  handleLoadCustomMap(e.target.value);
                  playClickSound();
                }}
                className="bg-transparent text-white text-[10px] font-bold focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                <option value="" className="bg-stone-900 text-white text-xs">-- Select Map --</option>
                {customMaps.map(m => (
                  <option key={m.id} value={m.id} className="bg-stone-900 text-white text-xs">
                    {m.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Terrain:</span>
            <select
              value={combatState.combatMapBackground || 'fay_forest.png'}
              onChange={(e) => {
                setCombatMapBackground(e.target.value);
                playClickSound();
              }}
              className="bg-transparent text-white text-[10px] font-bold focus:outline-none cursor-pointer uppercase tracking-widest"
            >
              {terrainMaps.map(t => (
                <option key={t.file} value={t.file} className="bg-stone-900 text-white text-xs">
                  {t.name}
                </option>
              ))}
            </select>
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
            {/* Party Members (Slots 1-6) */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Active Party Slots</label>
              {characters.map((char, i) => {
                const isEmpty = char?.name === 'Empty Slot' || !char;

                return (
                  <div key={char?.id || i} className={cn(
                    "p-3 rounded-xl flex items-center gap-3 relative group border",
                    isEmpty
                      ? "bg-black/20 border-white/5 border-dashed"
                      : "bg-blue-500/5 border-blue-500/20"
                  )}>
                    <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {!isEmpty && (char.avatarUrl || char.imageUrl) ? (
                        <img
                          src={normalizeImageUrl(char.avatarUrl || char.imageUrl, 'npc_character_profiles', char.id)}
                          className="w-full h-full object-cover"
                          alt={char.name}
                          title={char.name}
                        />
                      ) : (
                        <GameIcon name="users" size={14} className="text-white/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-white/30 uppercase">S_{i + 1}</span>
                      </div>
                      <div className={cn(
                        "text-[12px] font-black uppercase truncate",
                        isEmpty ? "text-white/20 italic" : "text-white"
                      )}>
                        {char?.name || 'Empty Node'}
                      </div>
                      {!isEmpty && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-bold text-white/40">{char.hp}/{char.maxHp}</span>
                        </div>
                      )}
                    </div>
                    {!isEmpty && (
                      <button
                        onClick={() => handleClearSlot(i)}
                        className="p-1.5 text-white/15 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all absolute right-2"
                        title="Clear Hero Slot"
                      >
                        <GameIcon name="close" size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Monsters on Board */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Enemy & Ally Manifestations</label>
              <AnimatePresence initial={false}>
                {combatState.monsters.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl text-white/10 italic text-[10px] uppercase">
                    No active tokens on combat grid
                  </div>
                ) : (
                  combatState.monsters.map((monster) => (
                    <motion.div 
                      key={monster.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "p-3 rounded-xl flex items-center gap-3 group border",
                        monster.isAlly
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      )}
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
                        <div className={cn(
                          "text-[8px] font-bold uppercase tracking-widest",
                          monster.isAlly ? "text-emerald-400/60" : "text-red-500/60"
                        )}>
                          HP {monster.hp}/{monster.maxHp} • {monster.isAlly ? 'ALLY' : 'FOE'} • {monster.type}
                        </div>
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

        {/* Right Side: Monster & Recruits Repository */}
        <div className="flex-1 flex flex-col bg-[#161616]">
          <div className="px-6 py-4 bg-black/10 border-b border-white/5 flex items-center justify-between">
             <div className="flex bg-black/40 rounded-lg border border-white/10 p-1">
                <button
                  onClick={() => { setRightPanelTab('heroes'); playClickSound(); }}
                  className={cn(
                    "px-4 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                    rightPanelTab === 'heroes' ? "bg-purple-600 text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  Recruitable Heroes (12 NPCs)
                </button>
                <button
                  onClick={() => { setRightPanelTab('monsters'); playClickSound(); }}
                  className={cn(
                    "px-4 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                    rightPanelTab === 'monsters' ? "bg-red-600 text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  Monsters Atlas
                </button>
             </div>

             <div className="flex items-center gap-3">
                {rightPanelTab === 'monsters' && (
                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">CR:</span>
                    <select
                      value={selectedCR}
                      onChange={(e) => setSelectedCR(e.target.value)}
                      className="bg-transparent text-white text-[10px] font-bold focus:outline-none cursor-pointer uppercase tracking-widest"
                    >
                      <option value="all" className="bg-stone-900 text-white text-xs">All CR</option>
                      {uniqueCRs.map((cr: string) => (
                        <option key={cr} value={cr} className="bg-stone-900 text-white text-xs">CR {cr}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="relative w-72">
                   <GameIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                   <input
                     type="text"
                     placeholder="Filter by name..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-9 pr-3 text-[10px] text-white focus:outline-none focus:border-red-500/50 transition-all font-mono"
                   />
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             {rightPanelTab === 'heroes' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredHeroes.map(hero => (
                     <div
                       key={hero.index}
                       className="group bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-all flex flex-col shadow-xl"
                     >
                        <div className="flex items-start gap-4 mb-4">
                           <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={hero.index.includes('akra')
                                  ? '/assets/atlas/enemies/tokens/heroes/ClericDragonborn.webp'
                                  : hero.index.includes('randal')
                                  ? '/assets/atlas/enemies/tokens/heroes/FighterShield.webp'
                                  : `/assets/atlas/enemies/tokens/heroes/${hero.index}.webp`}
                                onError={(e) => {
                                  // Standard fallback to mapped images
                                  const listMap: Record<string, string> = {
                                    'kfzBL0q1Y7LgGs2x': '/assets/atlas/enemies/tokens/heroes/ClericDragonborn.webp',
                                    'ZGDys30OS76uYaIO': '/assets/atlas/enemies/tokens/heroes/DruidStaff.webp',
                                    'xVmbM44RXyI2Eqq3': '/assets/atlas/enemies/tokens/heroes/BardLute.webp',
                                    'Dh1AA6w104V17V6w': '/assets/atlas/enemies/tokens/heroes/PaladinSword.webp',
                                    'irWonyO6ZLh47sN7': '/assets/atlas/enemies/tokens/heroes/BarbarianAxe.webp',
                                    'xT2C2Itv2XambDYp': '/assets/atlas/enemies/tokens/heroes/SorcererTiefling.webp',
                                    '125qFnXvT9z0iOic': '/assets/atlas/enemies/tokens/heroes/MonkUnarmed.webp',
                                    'cYD0wRXLW4B17aoY': '/assets/atlas/enemies/tokens/heroes/RangerBow.webp',
                                    '2Pdtnswo8Nj2nafY': '/assets/atlas/enemies/tokens/heroes/FighterShield.webp',
                                    'bzlxBO5km3zCQA8G': '/assets/atlas/enemies/tokens/heroes/RogueHuman.webp',
                                    'Jw8DeuPjt1qpusdB': '/assets/atlas/enemies/tokens/heroes/WarlockSword.webp',
                                    '4Jsv5vYaJ1atUEDV': '/assets/atlas/enemies/tokens/heroes/WizardTome.webp'
                                  };
                                  (e.target as HTMLImageElement).src = listMap[hero.index] || '/assets/atlas/enemies/tokens/heroes/FighterShield.webp';
                                }}
                                alt={hero.name}
                                className="w-full h-full object-cover"
                              />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-black text-white uppercase truncate tracking-tight">{hero.name}</div>
                              <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-1">HERO RECRUIT</div>
                           </div>
                        </div>

                        <div className="space-y-3 mt-auto pt-4 border-t border-white/5">
                           <div className="flex items-center justify-between">
                             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Setup Board</span>
                             <button
                               onClick={() => handleAddHeroAsAlly(hero.index)}
                               className="px-3 py-1 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all"
                             >
                               Spawn as Ally
                             </button>
                           </div>

                           <div className="space-y-1">
                              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Assign to Slot</span>
                              <div className="grid grid-cols-6 gap-1">
                                 {[0, 1, 2, 3, 4, 5].map(slotIdx => (
                                    <button
                                      key={slotIdx}
                                      onClick={() => handleSwapSlot(hero.index, slotIdx)}
                                      className="py-1 bg-black/40 border border-white/5 rounded text-[8px] font-black text-white/40 hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all"
                                      title={`Assign to Slot ${slotIdx + 1}`}
                                    >
                                      S{slotIdx + 1}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMonsters.map(monster => (
                    <button
                      key={monster.index}
                      onClick={() => handleAddMonster(monster.index)}
                      className="group bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center gap-4 text-left"
                    >
                       <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                         {(monster as any).imageUrl ? (
                           <img
                             src={normalizeImageUrl((monster as any).imageUrl, 'enemies', monster.index)}
                             alt={monster.name}
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <GameIcon name="identity" size={24} className="text-white/10 group-hover:text-red-500/40 transition-colors" />
                         )}
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
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
