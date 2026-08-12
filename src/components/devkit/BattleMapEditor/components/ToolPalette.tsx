import React, { useState, useEffect, useRef } from 'react';
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
  const [terrainImages, setTerrainImages] = useState<{ name: string; path: string; url: string }[]>([]);
  const backgroundFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeTool === 'token' && monstersList.length === 0) {
      loadList('enemies');
    }
  }, [activeTool, monstersList.length, loadList]);

  const fetchTerrainImages = async () => {
    try {
      const res = await fetch('/api/terrain-images/list');
      if (res.ok) {
        const data = await res.json();
        setTerrainImages(data);
      }
    } catch (e) {
      console.error("Error loading terrain images:", e);
    }
  };

  useEffect(() => {
    fetchTerrainImages();
  }, []);

  const updateBackground = (updates: Partial<typeof map.background>) => {
    const updatedMap = {
      ...map,
      background: {
        ...map.background,
        ...updates
      }
    };
    useEditorStore.getState().setMap(updatedMap);
  };

  const handleUploadBackgroundTerrain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const base64Content = rawContent.split(',')[1];
        if (!base64Content) return;

        const targetPath = `public/assets/atlas/combat/combat_map_terrain/${file.name}`;

        const res = await fetch('/api/commit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: targetPath,
            content: base64Content,
            isBase64: true,
            message: `Upload terrain background: ${file.name}`
          })
        });

        if (res.ok) {
          alert(`Successfully uploaded and saved terrain image: ${file.name}`);
          const virtualUrl = `/assets/atlas/combat/combat_map_terrain/${file.name}`;
          updateBackground({
            type: 'image',
            value: virtualUrl
          });
          fetchTerrainImages();
        } else {
          const errData = await res.json();
          alert(`Upload failed: ${errData.error || 'Server error'}`);
        }
      } catch (err: any) {
        alert(`Error reading file: ${err.message}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

      <div className="h-px bg-white/5 my-2" />

      <div className="space-y-3">
        <label className="text-[9px] font-black tracking-wider text-white/30 uppercase">Map Background</label>

        {/* Toggle Background Type */}
        <div className="flex gap-1 bg-black/40 p-1 rounded border border-white/5">
          <button
            onClick={() => updateBackground({ type: 'color' })}
            className={`flex-1 py-1 rounded text-[8px] font-black uppercase text-center transition-all ${
              map.background.type === 'color'
                ? 'bg-purple-600 text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => updateBackground({ type: 'image' })}
            className={`flex-1 py-1 rounded text-[8px] font-black uppercase text-center transition-all ${
              map.background.type === 'image'
                ? 'bg-purple-600 text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Terrain Image
          </button>
        </div>

        {map.background.type === 'color' ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] text-white/50 uppercase font-bold">Background Color</span>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={map.background.value.startsWith('#') ? map.background.value : '#151515'}
                onChange={(e) => updateBackground({ value: e.target.value })}
                className="bg-transparent border-none outline-none w-8 h-8 cursor-pointer shrink-0 rounded"
              />
              <input
                type="text"
                value={map.background.value}
                onChange={(e) => updateBackground({ value: e.target.value })}
                className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none w-full"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Image Upload Trigger */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => backgroundFileInputRef.current?.click()}
                className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-[9px] font-black uppercase tracking-wider rounded border border-purple-500/30 transition-all text-purple-300 flex items-center justify-center gap-1.5"
                title="Upload custom background terrain image"
              >
                <GameIcon name="package" size={10} color="currentColor" />
                Upload Terrain Image
              </button>
              <input
                type="file"
                ref={backgroundFileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUploadBackgroundTerrain}
              />
            </div>

            {/* Opacity slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] text-white/50 font-bold uppercase">
                <span>Opacity</span>
                <span>{Math.round((map.background.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={map.background.opacity ?? 1}
                onChange={(e) => updateBackground({ opacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Scrollable list of uploaded/available terrain backgrounds */}
            <div className="space-y-1.5">
              <span className="text-[8px] text-white/40 uppercase font-bold">Terrain Matrix</span>
              <div className="max-h-[140px] overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-1 space-y-1">
                {terrainImages.map((img) => {
                  const isSelected = map.background.value === img.url;
                  return (
                    <button
                      key={img.path}
                      onClick={() => updateBackground({ value: img.url })}
                      className={`w-full p-1.5 rounded text-left text-[9px] font-bold transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{img.name}</span>
                      {isSelected && <span className="text-[8px] text-purple-400 font-bold">ACTIVE</span>}
                    </button>
                  );
                })}
                {terrainImages.length === 0 && (
                  <div className="text-center py-4 text-[9px] text-white/20 italic">No custom images found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
