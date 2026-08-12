import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../state/editorStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';
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

  const { monstersList, loadList } = useAtlasStore();
  const [tokenSearch, setTokenSearch] = useState('');

  useEffect(() => {
    if (activeTool === 'token' && monstersList.length === 0) {
      loadList('enemies');
    }
  }, [activeTool, monstersList.length, loadList]);

  const filteredMonsters = monstersList
    .filter((m) => m.name.toLowerCase().includes(tokenSearch.toLowerCase()))
    .slice(0, 30); // Limit to top 30 search results for smooth UI

  return (
    <div className="w-[240px] bg-[#1e1e1e] border-r border-white/5 p-4 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar select-none">
      {/* Tool Options dynamic render */}
      {activeTool === 'room' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Room Floor Terrain</label>
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

          <div className="space-y-3">
            <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Perimeter Walls</label>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'wall', label: 'Solid Blockade' },
                { id: 'door', label: 'Standard Door' },
                { id: 'secret-door', label: 'Hidden Secret Door' },
                { id: 'none', label: 'None (No Walls)' }
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
        </div>
      )}

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
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Quick Placeholders</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['Orc Sentry', 'Skeleton Guard', 'Goblin Scout', 'Player Spawn'].map((tok) => (
                <button
                  key={tok}
                  onClick={() => setSelectedStamp(tok, 'Tokens')}
                  className={`p-1.5 rounded text-center text-[9px] font-bold uppercase transition-all border ${
                    selectedStampIndex === tok
                      ? 'bg-purple-600/35 border-purple-500 text-purple-200'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {tok}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-2">
            <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Bestiary database</label>
            <input
              type="text"
              placeholder="Search Bestiary..."
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 outline-none"
            />

            <div className="max-h-[160px] overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-1 space-y-1">
              {filteredMonsters.map((monster) => (
                <button
                  key={monster.index}
                  onClick={() => setSelectedStamp(monster.name, 'Tokens')}
                  className={`w-full p-1.5 px-2 rounded text-left text-[9px] font-bold transition-all border flex items-center justify-between ${
                    selectedStampIndex === monster.name
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{monster.name.toUpperCase()}</span>
                  <span className="text-[7px] text-white/30 font-mono">CR {monster.challenge_rating || '?'}/type {monster.type || 'unknown'}</span>
                </button>
              ))}
              {filteredMonsters.length === 0 && (
                <div className="text-center py-4 text-[9px] text-white/20 italic">No creatures found</div>
              )}
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
              onChange={(e) => updateMapDimensions(Math.max(4, parseInt(e.target.value) || 24), map.dimensions.height)}
              className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/50 uppercase font-bold">Height</span>
            <input
              type="number"
              value={map.dimensions.height}
              onChange={(e) => updateMapDimensions(map.dimensions.width, Math.max(4, parseInt(e.target.value) || 16))}
              className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none w-full"
            />
          </div>
        </div>

        {/* 3:2 Ratio Presets */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[8px] text-white/40 uppercase font-bold">3:2 Tactical Presets</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { w: 18, h: 12, label: '18 x 12 (Small)' },
              { w: 24, h: 16, label: '24 x 16 (Standard)' },
              { w: 30, h: 20, label: '30 x 20 (Medium)' },
              { w: 36, h: 24, label: '36 x 24 (Large)' }
            ].map((p) => (
              <button
                key={`${p.w}x${p.h}`}
                onClick={() => updateMapDimensions(p.w, p.h)}
                className={`p-1.5 text-[8px] font-black tracking-tight rounded border transition-all text-center ${
                  map.dimensions.width === p.w && map.dimensions.height === p.h
                    ? 'bg-purple-600/25 border-purple-500 text-purple-300'
                    : 'bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
