import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { useAtlasStore } from '../../store/useAtlasStore';
import { useUIStore } from '../../store/useUIStore';
import { playModalCloseSound, playClickSound } from '../../services/storageService';
import { audioEngine } from '../../services/audio/audioEngine';
import { soundService } from '../../services/soundService';
import { GameIcon } from '../../game_icons';

import { AssetExplorer } from './AssetExplorer';
import { WorldExplorer } from './WorldExplorer';
import { FlagManager } from './FlagManager';

import { EntityWorkbench } from './generators/EntityWorkbench';
import { HabitatGenerator } from './generators/HabitatGenerator';
import { NPCGenerator } from './npc_generator';
import { Jane } from './Jane';
import { GodsLore } from '../atlas/lore/gods';
import { BattleMapEditor } from './BattleMapEditor/index';

import { NPCTester } from './npc_tester';
import { CombatTester } from './CombatTester';
import { Simulator } from './Simulator';

import { SoundStudio } from './audio/SoundStudio';
import { Mixer } from '../audio/Mixer';
import { HueStudio } from './hardware/HueStudio';

interface DevKitProps {
  isOpen: boolean;
  onClose: () => void;
  onMonsterUpdated?: (monster: any) => void;
  initialMonster?: any | null;
  initialLocation?: any | null;
  currentExplorerTab?: string;
}

export const DevKit: React.FC<DevKitProps> = ({
  isOpen,
  onClose,
  onMonsterUpdated,
  initialMonster,
  initialLocation,
  currentExplorerTab
}) => {
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const { loadAllLists, loadMissingAssets, materialsList, equipmentList } = useAtlasStore();

  const [activeTab, setActiveTab] = useState<'inspectors' | 'generators' | 'testers' | 'audio_lab' | 'hue_lamps'>('inspectors');
  const [activeInspector, setActiveInspector] = useState<'codex' | 'world' | 'flags'>('codex');
  const [activeGenerator, setActiveGenerator] = useState<'npcs' | 'monsters' | 'materials' | 'equipment' | 'gods' | 'jane' | 'backgrounds' | 'map_editor'>('npcs');
  const [activeTester, setActiveTester] = useState<'npcs' | 'combat' | 'simulator'>('npcs');

  // Fade background audio when DevKit opens over 1.5s
  useEffect(() => {
    if (isOpen) {
      const fadeDuration = 1500;
      const layersToFade: (1 | 2 | 3 | 4 | 11)[] = [1, 2, 3, 4, 11];

      layersToFade.forEach(layer => {
        audioEngine.fadeOut(layer, fadeDuration);
        soundService.fadeOutLayer(layer, fadeDuration);
      });

      loadAllLists();
      loadMissingAssets();
      
      // Context-aware tab selection
      if (initialMonster) {
        setActiveTab('generators');
        if (initialMonster.challenge_rating !== undefined || initialMonster.type) {
          setActiveGenerator('monsters');
        } else if (initialMonster.material_category) {
          setActiveGenerator('materials');
        } else {
          setActiveGenerator('equipment');
        }
      } else if (initialLocation) {
        setActiveTab('generators');
        setActiveGenerator('jane');
      } else if (currentExplorerTab) {
        setActiveTab('generators');
        if (currentExplorerTab === 'enemies') setActiveGenerator('monsters');
        else if (currentExplorerTab === 'materials') setActiveGenerator('materials');
        else setActiveGenerator('equipment');
      }
    }
  }, [isOpen]);

  // Handle updates to initialLocation while open
  useEffect(() => {
    if (isOpen && initialLocation) {
      setActiveTab('generators');
      setActiveGenerator('jane');
    }
  }, [initialLocation, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] w-screen h-screen border-t border-white/10 shadow-2xl overflow-hidden flex flex-col font-mono selection:bg-dragon-red/30"
        >
          {/* Top Bar / Window Header */}
          <div className="bg-[#252525] px-4 py-2 flex items-center justify-between border-b border-white/5 select-none">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2">
                <GameIcon name="devkit" size={18} className="text-dragon-red" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2 text-white/50 text-[11px] uppercase tracking-widest font-bold">
                <GameIcon name="console" size={14} color="#8B0000" />
                <span>ARCANE_OS // DM_TOOLKIT.v2</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsMixerOpen(!isMixerOpen);
                  playClickSound();
                }}
                className={`p-2 rounded border transition-all ${
                  isMixerOpen 
                    ? 'bg-dragon-red border-dragon-red text-white' 
                    : 'bg-black/30 border-white/5 text-white/40 hover:text-white'
                }`}
                title="Audio Mixer"
                aria-label="Toggle Audio Mixer"
              >
                <GameIcon name="adjust" size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-1 bg-black/30 rounded border border-white/5 text-[10px] text-dragon-red/80 font-bold">
                <div className="w-1.5 h-1.5 bg-dragon-red rounded-full animate-pulse" />
                LIVE_SESSION_ACTIVE
              </div>
              <button 
                onClick={() => {
                  onClose();
                  playModalCloseSound();
                }}
                className="text-white/40 hover:text-white transition-colors"
                title="Close DevKit"
                aria-label="Close DevKit"
              >
                <GameIcon name="close" size={18} />
              </button>
            </div>
          </div>

          {/* Secondary Header: Tab Manager */}
          <div className="bg-[#1e1e1e] flex items-center border-b border-white/5 overflow-x-auto scrollbar-none">
            {[
              { id: 'inspectors', icon: (props: any) => <GameIcon name="save_data" {...props} />, label: 'INSPECTORS' },
              { id: 'generators', icon: (props: any) => <GameIcon name="magic_effect" {...props} />, label: 'GENERATORS' },
              { id: 'testers', icon: (props: any) => <GameIcon name="users" {...props} />, label: 'TESTERS' },
              { id: 'audio_lab', icon: (props: any) => <GameIcon name="adjust" {...props} />, label: 'AUDIO LAB' },
              { id: 'hue_lamps', icon: (props: any) => <span className={props.className}><Lightbulb size={12} /></span>, label: 'HUE LAMPS' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playClickSound();
                }}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-widest border-r border-white/5 transition-all relative ${
                  activeTab === tab.id 
                    ? 'bg-[#1a1a1a] text-white' 
                    : 'text-white/30 hover:bg-white/5 hover:text-white/50'
                }`}
                title={tab.label}
              >
                <tab.icon size={12} className={activeTab === tab.id ? 'text-dragon-red' : 'opacity-50'} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dragon-red" />
                )}
              </button>
            ))}
          </div>

          {/* Sub-Header for Inspectors, Generators or Testers */}
          {(activeTab === 'inspectors' || activeTab === 'generators' || activeTab === 'testers') && (
            <div className="bg-[#161616] flex items-center border-b border-white/5 px-4 h-10 gap-6">
               {activeTab === 'inspectors' ? (
                 <>
                   {[
                     { id: 'codex', label: 'Codex' },
                     { id: 'world', label: 'World' },
                     { id: 'flags', label: 'Flags' }
                   ].map(insp => (
                     <button
                       key={insp.id}
                       onClick={() => { setActiveInspector(insp.id as any); playClickSound(); }}
                       className={`text-[9px] font-black uppercase tracking-tighter transition-all ${activeInspector === insp.id ? 'text-dragon-red underline underline-offset-4' : 'text-white/20 hover:text-white/40'}`}
                     >
                       {insp.label}
                     </button>
                   ))}
                 </>
               ) : activeTab === 'generators' ? (
                 <>
                   {[
                     { id: 'npcs', label: 'NPC' },
                     { id: 'monsters', label: 'Enemy' },
                     { id: 'materials', label: 'Material' },
                     { id: 'equipment', label: 'Equipment' },
                     { id: 'gods', label: 'Gods' },
                     { id: 'jane', label: 'Jane (World)' },
                     { id: 'backgrounds', label: 'Habitat' },
                     { id: 'map_editor', label: 'Battle Map' }
                   ].map(gen => (
                     <button
                       key={gen.id}
                       onClick={() => { setActiveGenerator(gen.id as any); playClickSound(); }}
                       className={`text-[9px] font-black uppercase tracking-tighter transition-all ${activeGenerator === gen.id ? 'text-dragon-red underline underline-offset-4' : 'text-white/20 hover:text-white/40'}`}
                     >
                       {gen.label}
                     </button>
                   ))}
                 </>
               ) : (
                 <>
                   {[
                     { id: 'npcs', label: 'NPC Slots' },
                     { id: 'combat', label: 'Tactical Combat' },
                     { id: 'simulator', label: 'Simulator' }
                   ].map(test => (
                     <button
                       key={test.id}
                       onClick={() => { setActiveTester(test.id as any); playClickSound(); }}
                       className={`text-[9px] font-black uppercase tracking-tighter transition-all ${activeTester === test.id ? 'text-dragon-red underline underline-offset-4' : 'text-white/20 hover:text-white/40'}`}
                     >
                       {test.label}
                     </button>
                   ))}
                 </>
               )}
            </div>
          )}

          {/* Main Space */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'inspectors' && activeInspector === 'codex' ? (
              <AssetExplorer />
            ) : activeTab === 'inspectors' && activeInspector === 'world' ? (
              <WorldExplorer />
            ) : activeTab === 'inspectors' && activeInspector === 'flags' ? (
              <div className="flex-1 p-8">
                 <div className="max-w-2xl mx-auto h-full">
                    <FlagManager />
                 </div>
              </div>
            ) : activeTab === 'audio_lab' ? (
              <SoundStudio />
            ) : activeTab === 'hue_lamps' ? (
              <div className="flex-1 overflow-hidden bg-stone-950 text-stone-200">
                <HueStudio />
              </div>
            ) : activeTab === 'testers' ? (
              <>
                {activeTester === 'npcs' && <NPCTester />}
                {activeTester === 'combat' && <CombatTester />}
                {activeTester === 'simulator' && <Simulator />}
              </>
            ) : activeTab === 'generators' && activeGenerator === 'npcs' ? (
              <NPCGenerator onSave={() => loadAllLists()} />
            ) : activeTab === 'generators' && activeGenerator === 'jane' ? (
              <Jane initialData={initialLocation} />
            ) : activeTab === 'generators' && activeGenerator === 'gods' ? (
              <GodsLore />
            ) : activeTab === 'generators' && activeGenerator === 'map_editor' ? (
              <BattleMapEditor />
            ) : activeTab === 'generators' && activeGenerator === 'backgrounds' ? (
              <HabitatGenerator editingItem={initialMonster} />
            ) : (
              <EntityWorkbench
                activeGenerator={activeGenerator as 'monsters' | 'materials' | 'equipment'}
                initialMonster={initialMonster}
                onMonsterUpdated={onMonsterUpdated}
              />
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-[#0a0a0a] px-4 py-2 text-[9px] text-white/30 font-mono flex justify-between items-center border-t border-white/5">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" /> SYSTEM_V1.4.2_READY</span>
              <span className="text-white/10">|</span>
              <span>ENVIRONMENT_STABLE</span>
              <span className="text-white/10">|</span>
              <span>LOC: {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-dragon-red font-bold uppercase">DevKit_Subroutines</span>
              <span className="text-white/10">|</span>
              <span>© {new Date().getFullYear()} ARCANE_CORE</span>
            </div>
          </div>
          {/* Datalists for autocomplete */}
          <datalist id="materials-datalist">
            {materialsList.map(m => (
              <option key={m.index} value={m.name} />
            ))}
          </datalist>
          <datalist id="equipment-datalist">
            {equipmentList.map(e => (
              <option key={e.index} value={e.name} />
            ))}
          </datalist>
        </motion.div>

        {/* Mixer Overlay */}
        <AnimatePresence>
          {isMixerOpen && (
            <div className="absolute right-8 bottom-8 z-[110]">
              <Mixer onClose={() => setIsMixerOpen(false)} />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
