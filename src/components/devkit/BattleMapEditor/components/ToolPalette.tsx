import React from 'react';
import { useEditorStore } from '../state/editorStore';
import { GameIcon } from '../../../../game_icons';

export const ToolPalette: React.FC = () => {
  const {
    activeTool,
    selectedWallType,
    setSelectedWallType,
    selectedTerrainType,
    setSelectedTerrainType,
    selectedStampIndex,
    setSelectedStamp,
    map,
    updateMapDimensions
  } = useEditorStore();

  return (
    <div className="w-[240px] bg-[#1e1e1e] border-r border-white/5 p-4 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar select-none">
      {/* Tool Options dynamic render */}
      {activeTool === 'wall' && (
        <div className="space-y-3">
          <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Wall Configurations</label>
          <div className="flex flex-col gap-1.5">
            {[
              { id: 'wall', label: 'Solid Blockade' },
              { id: 'door', label: 'Standard Door' },
              { id: 'secret-door', label: 'Hidden Secret Door' }
            ].map((wt) => (
              <button
                key={wt.id}
                onClick={() => setSelectedWallType(wt.id as any)}
                className={`w-full p-2.5 rounded text-left text-[10px] font-bold transition-all border ${
                  selectedWallType === wt.id
                    ? 'bg-purple-600/15 border-purple-500 text-purple-300'
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                }`}
              >
                {wt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'terrain' && (
        <div className="space-y-3">
          <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Terrain Textures</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'stone', label: 'Dungeon Stone' },
              { id: 'wood', label: 'Wood Decking' },
              { id: 'water', label: 'Deep Water' },
              { id: 'grass', label: 'Lush Grass' },
              { id: 'lava', label: 'Molten Lava' },
              { id: 'sand', label: 'Grit Sand' }
            ].map((tt) => (
              <button
                key={tt.id}
                onClick={() => setSelectedTerrainType(tt.id)}
                className={`p-2 rounded text-center text-[9px] font-black uppercase tracking-tight transition-all border ${
                  selectedTerrainType === tt.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/5'
                }`}
              >
                {tt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'object' && (
        <div className="space-y-3">
          <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Prop Stamps</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'barrel', label: 'Wooden Barrel' },
              { id: 'chest', label: 'Treasure Chest' },
              { id: 'table', label: 'Dining Table' },
              { id: 'torch', label: 'Sconce Torch' }
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedStamp(o.id, 'Props')}
                className={`p-2.5 rounded flex flex-col items-center gap-1.5 text-center transition-all border ${
                  selectedStampIndex === o.id
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="p-1 bg-black/40 rounded-full">
                  <GameIcon name="package" size={12} />
                </div>
                <span className="text-[8px] font-bold uppercase">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'token' && (
        <div className="space-y-3">
          <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Spawns & Tokens</label>
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] text-white/40 uppercase font-bold">Select Active Spawn Class</span>
            <div className="grid grid-cols-2 gap-1.5">
              {['Orc Sentry', 'Skeleton Guard', 'Goblin Scout', 'Player Spawn'].map((tok) => (
                <button
                  key={tok}
                  onClick={() => setSelectedStamp(tok, 'Tokens')}
                  className={`p-2 rounded text-center text-[9px] font-bold uppercase transition-all border ${
                    selectedStampIndex === tok
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {tok}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Map Dimension Configs */}
      <div className="h-px bg-white/5 my-2" />
      
      <div className="space-y-3">
        <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Grid Boundaries</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/50 uppercase font-bold">Width</span>
            <input
              type="number"
              value={map.dimensions.width}
              onChange={(e) => updateMapDimensions(Math.max(4, parseInt(e.target.value) || 16), map.dimensions.height)}
              className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/50 uppercase font-bold">Height</span>
            <input
              type="number"
              value={map.dimensions.height}
              onChange={(e) => updateMapDimensions(map.dimensions.width, Math.max(4, parseInt(e.target.value) || 12))}
              className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
