import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../state/editorStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';
import { GameIcon } from '../../../../game_icons';

export const ToolPalette: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
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

  // UI states for tree directory expansions
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    maps: true,
    assets: true,
    assets_objects: false,
    assets_terrain: false,
    assets_tokens: false,
    assets_walls: false,
    atlas: true,
  });

  const [tokenSearch, setTokenSearch] = useState('');
  const [terrainImages, setTerrainImages] = useState<{ name: string; path: string; url: string }[]>([]);
  const backgroundFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (monstersList.length === 0) {
      loadList('enemies');
    }
  }, [monstersList.length, loadList]);

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

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [node]: !prev[node]
    }));
  };

  const handleSelectSubAsset = (tool: EditorTool, subNode: string) => {
    setActiveTool(tool);
    // Expand requested tool subnode
    setExpandedNodes(prev => ({
      ...prev,
      [subNode]: true
    }));
  };

  return (
    <div className="w-[240px] bg-[#1a1a1a] border-r border-white/5 p-3 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar select-none text-white/80">

      {/* Root Node: COMBAT */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 px-1 py-1 border-b border-white/5">
          <GameIcon name="panel" size={10} color="#a855f7" />
          <span className="text-[10px] font-black tracking-widest text-white uppercase">COMBAT DIRECTORY</span>
        </div>

        {/* 1. MAPS Node */}
        <div className="flex flex-col pl-2 mt-2">
          <div className="flex items-center justify-between py-1 cursor-pointer hover:text-white" onClick={() => toggleNode('maps')}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40">{expandedNodes.maps ? '▼' : '►'}</span>
              <GameIcon name="location" size={10} color="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-wider">MAPS</span>
            </div>
          </div>

          {expandedNodes.maps && (
            <div className="pl-4 flex flex-col gap-1.5 py-1 border-l border-white/5 ml-1.5 mt-0.5">
              <div className="text-[9px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded flex items-center justify-between">
                <span className="truncate">{map.name.toUpperCase()}</span>
                <span className="text-[7px] text-purple-400 font-bold">ACTIVE</span>
              </div>

              {/* Grid Boundaries inside Maps Node */}
              <div className="space-y-2 mt-2 bg-black/20 p-2 rounded border border-white/5">
                <span className="text-[8px] text-white/40 uppercase font-black block">Grid Dimensions</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] text-white/30 uppercase font-bold">Width</span>
                    <input
                      type="number"
                      value={map.dimensions.width}
                      onChange={(e) => updateMapDimensions(Math.max(4, parseInt(e.target.value) || 24), map.dimensions.height)}
                      className="bg-black/40 border border-white/10 rounded px-1 py-1 text-[9px] font-bold text-white outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] text-white/30 uppercase font-bold">Height</span>
                    <input
                      type="number"
                      value={map.dimensions.height}
                      onChange={(e) => updateMapDimensions(map.dimensions.width, Math.max(4, parseInt(e.target.value) || 16))}
                      className="bg-black/40 border border-white/10 rounded px-1 py-1 text-[9px] font-bold text-white outline-none w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-1">
                  {[
                    { w: 18, h: 12, label: '18x12' },
                    { w: 24, h: 16, label: '24x16' }
                  ].map(p => (
                    <button
                      key={`${p.w}x${p.h}`}
                      onClick={() => updateMapDimensions(p.w, p.h)}
                      className="text-[8px] bg-white/5 border border-white/5 hover:bg-white/10 rounded py-0.5"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. ASSETS Node */}
        <div className="flex flex-col pl-2 mt-2">
          <div className="flex items-center justify-between py-1 cursor-pointer hover:text-white" onClick={() => toggleNode('assets')}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40">{expandedNodes.assets ? '▼' : '►'}</span>
              <GameIcon name="package" size={10} color="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-wider">ASSETS</span>
            </div>
          </div>

          {expandedNodes.assets && (
            <div className="pl-4 flex flex-col gap-2 py-1 border-l border-white/5 ml-1.5 mt-0.5">

              {/* 2.1 Stamps / Objects */}
              <div className="flex flex-col">
                <button
                  onClick={() => handleSelectSubAsset('object', 'assets_objects')}
                  className={`flex items-center justify-between text-left py-1 text-[9px] font-bold hover:text-white transition-colors ${activeTool === 'object' ? 'text-purple-400' : 'text-white/60'}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{expandedNodes.assets_objects ? '▼' : '►'}</span>
                    <GameIcon name="package" size={9} />
                    <span>OBJECTS & PROPS</span>
                  </span>
                </button>

                {expandedNodes.assets_objects && (
                  <div className="pl-4 py-1.5 grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'barrel', label: 'Barrel' },
                      { id: 'chest', label: 'Chest' },
                      { id: 'table', label: 'Table' },
                      { id: 'torch', label: 'Torch' }
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedStamp(o.id, 'Props')}
                        className={`p-1.5 rounded flex flex-col items-center gap-1 text-center transition-all border text-[8px] uppercase ${
                          selectedStampIndex === o.id && activeTool === 'object'
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                        }`}
                      >
                        <span className="font-bold">{o.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2.2 Terrain */}
              <div className="flex flex-col">
                <button
                  onClick={() => handleSelectSubAsset('terrain', 'assets_terrain')}
                  className={`flex items-center justify-between text-left py-1 text-[9px] font-bold hover:text-white transition-colors ${activeTool === 'terrain' || activeTool === 'room' ? 'text-purple-400' : 'text-white/60'}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{expandedNodes.assets_terrain ? '▼' : '►'}</span>
                    <GameIcon name="panel" size={9} />
                    <span>TERRAIN & BRUSH</span>
                  </span>
                </button>

                {expandedNodes.assets_terrain && (
                  <div className="pl-4 py-1.5 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'stone', label: 'Stone' },
                        { id: 'wood', label: 'Wood' },
                        { id: 'water', label: 'Water' },
                        { id: 'grass', label: 'Grass' },
                        { id: 'lava', label: 'Lava' },
                        { id: 'sand', label: 'Sand' }
                      ].map((tt) => (
                        <button
                          key={tt.id}
                          onClick={() => { setSelectedTerrainType(tt.id); if (activeTool !== 'room') setActiveTool('terrain'); }}
                          className={`p-1 rounded text-center text-[8px] font-black uppercase tracking-tight transition-all border ${
                            selectedTerrainType === tt.id
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                              : 'bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/5'
                          }`}
                        >
                          {tt.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-white/5 my-1" />

                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black text-white/30 uppercase block">Map BG Style</span>
                      <div className="flex gap-1 bg-black/40 p-0.5 rounded border border-white/5">
                        <button
                          onClick={() => updateBackground({ type: 'color' })}
                          className={`flex-1 py-1 rounded text-[7px] font-black uppercase text-center transition-all ${
                            map.background.type === 'color' ? 'bg-purple-600 text-white' : 'text-white/40'
                          }`}
                        >
                          Color
                        </button>
                        <button
                          onClick={() => updateBackground({ type: 'image' })}
                          className={`flex-1 py-1 rounded text-[7px] font-black uppercase text-center transition-all ${
                            map.background.type === 'image' ? 'bg-purple-600 text-white' : 'text-white/40'
                          }`}
                        >
                          Image
                        </button>
                      </div>

                      {map.background.type === 'image' && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => backgroundFileInputRef.current?.click()}
                            className="w-full py-1 bg-purple-600/20 hover:bg-purple-600/30 text-[8px] font-black uppercase tracking-wider rounded border border-purple-500/30 text-purple-300 flex items-center justify-center gap-1"
                          >
                            Upload Terrain Image
                          </button>
                          <input
                            type="file"
                            ref={backgroundFileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleUploadBackgroundTerrain}
                          />

                          <div className="max-h-[90px] overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-1 space-y-1">
                            {terrainImages.map((img) => (
                              <button
                                key={img.path}
                                onClick={() => updateBackground({ value: img.url })}
                                className={`w-full p-1 rounded text-left text-[8px] font-bold truncate ${
                                  map.background.value === img.url ? 'text-purple-300 bg-purple-500/10' : 'text-white/50 hover:bg-white/5'
                                }`}
                              >
                                {img.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2.3 Tokens */}
              <div className="flex flex-col">
                <button
                  onClick={() => handleSelectSubAsset('token', 'assets_tokens')}
                  className={`flex items-center justify-between text-left py-1 text-[9px] font-bold hover:text-white transition-colors ${activeTool === 'token' ? 'text-purple-400' : 'text-white/60'}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{expandedNodes.assets_tokens ? '▼' : '►'}</span>
                    <GameIcon name="identity" size={9} />
                    <span>TOKENS & SPAWNS</span>
                  </span>
                </button>

                {expandedNodes.assets_tokens && (
                  <div className="pl-4 py-1.5 flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1">
                      {['Orc Sentry', 'Skeleton Guard', 'Player Spawn'].map((tok) => (
                        <button
                          key={tok}
                          onClick={() => setSelectedStamp(tok, 'Tokens')}
                          className={`p-1 rounded text-center text-[8px] font-bold uppercase transition-all border ${
                            selectedStampIndex === tok && activeTool === 'token'
                              ? 'bg-purple-600/35 border-purple-500 text-purple-200'
                              : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                          }`}
                        >
                          {tok}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2.4 Walls & Doors */}
              <div className="flex flex-col">
                <button
                  onClick={() => handleSelectSubAsset('wall', 'assets_walls')}
                  className={`flex items-center justify-between text-left py-1 text-[9px] font-bold hover:text-white transition-colors ${activeTool === 'wall' || activeTool === 'door' ? 'text-purple-400' : 'text-white/60'}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{expandedNodes.assets_walls ? '▼' : '►'}</span>
                    <GameIcon name="panel" size={9} />
                    <span>WALLS & DOORS</span>
                  </span>
                </button>

                {expandedNodes.assets_walls && (
                  <div className="pl-4 py-1.5 flex flex-col gap-1">
                    {[
                      { id: 'wall', label: 'Solid Wall', tool: 'wall' },
                      { id: 'door', label: 'Door Segment', tool: 'door' }
                    ].map((wt) => (
                      <button
                        key={wt.id}
                        onClick={() => { setSelectedWallType(wt.id as any); setActiveTool(wt.tool as any); }}
                        className={`w-full p-1.5 rounded text-left text-[8px] uppercase tracking-tight transition-all border ${
                          selectedWallType === wt.id && (activeTool === 'wall' || activeTool === 'door')
                            ? 'bg-purple-600/15 border-purple-500 text-purple-300'
                            : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {wt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* 3. ATLAS Node */}
        <div className="flex flex-col pl-2 mt-2">
          <div className="flex items-center justify-between py-1 cursor-pointer hover:text-white" onClick={() => toggleNode('atlas')}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40">{expandedNodes.atlas ? '▼' : '►'}</span>
              <GameIcon name="adjust" size={10} color="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-wider">ATLAS</span>
            </div>
          </div>

          {expandedNodes.atlas && (
            <div className="pl-4 flex flex-col gap-2 py-1 border-l border-white/5 ml-1.5 mt-0.5">
              <input
                type="text"
                placeholder="Search Bestiary..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] text-white placeholder-white/20 outline-none"
              />

              <div className="max-h-[120px] overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-1 space-y-0.5">
                {filteredMonsters.map((monster) => (
                  <button
                    key={monster.index}
                    onClick={() => { setSelectedStamp(monster.name, 'Tokens'); setActiveTool('token'); }}
                    className={`w-full p-1 rounded text-left text-[8px] font-bold flex items-center justify-between ${
                      selectedStampIndex === monster.name && activeTool === 'token'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{monster.name.toUpperCase()}</span>
                    <span className="text-[6px] text-white/30 font-mono">CR {monster.challenge_rating || '?'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
