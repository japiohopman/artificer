import React from 'react';
import { EditorToolbar } from './components/EditorToolbar';
import { ToolPalette } from './components/ToolPalette';
import { MapViewport } from './components/MapViewport';
import { LayerPanel } from './components/LayerPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { useEditorStore } from './state/editorStore';
import { battleMapToCombatGrid } from './persistence/battleMapToCombatGrid';
import { useGameStore } from '../../../store/useGameStore';
import { useUIStore } from '../../../store/useUIStore';

export const BattleMapEditor: React.FC = () => {
  const { map } = useEditorStore();
  const setGameMode = useUIStore((state) => state.setGameMode);

  const handleBakeToRuntime = () => {
    const runtimeRep = battleMapToCombatGrid(map);
    
    // Dynamically patch run-time game store state with compiled battlemap data!
    useGameStore.setState((state) => ({
      combatState: {
        ...state.combatState,
        grid: runtimeRep.grid,
        monsters: runtimeRep.monsters,
        combatMapBackground: runtimeRep.background
      }
    }));

    // Seamlessly transition DM straight into the combat tester grid!
    setGameMode('combat');
    alert(`Successfully compiled BattleMap [${map.name}] to standard CombatGrid run-time and transitioned scene to Tactical Combat mode!`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111111] text-white font-sans overflow-hidden">
      {/* Top Main Toolbar */}
      <EditorToolbar />

      {/* Main split workarea */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left pane: drawing tools options */}
        <ToolPalette />

        {/* Center pane: interactive HTML Canvas viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <MapViewport />
        </div>

        {/* Right pane: element property inspectors, layers & cover calculations */}
        <div className="w-[280px] shrink-0 border-l border-white/5 bg-[#1a1a1a] flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
            <InspectorPanel />
            <div className="h-px bg-white/5 my-1" />
            <LayerPanel />
          </div>
          <button
            onClick={handleBakeToRuntime}
            className="m-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded transition-all shadow-lg shadow-purple-500/10 shrink-0 border border-purple-500/20"
            title="Deploy current layout parameters to live game engine runtime"
          >
            Deploy Map to Game
          </button>
        </div>
      </div>
    </div>
  );
};
