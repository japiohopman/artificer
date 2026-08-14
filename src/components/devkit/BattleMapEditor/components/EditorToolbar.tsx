import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../state/editorStore';
import { EditorTool } from '../types/battleMap';
import { GameIcon } from '../../../../game_icons';
import {
  saveBattleMap,
  loadBattleMap,
  importBattleMap,
  exportBattleMap,
  saveBattleMapToServer,
  loadBattleMapFromServer,
  listBattleMapsFromServer,
  deleteBattleMapFromServer
} from '../persistence/battleMapStorage';
import { validateBattleMap } from '../persistence/battleMapValidator';

export const EditorToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    historyIndex,
    history,
    map,
    clearMap,
    loadMapData,
    setMap
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // UX Menu & Modal State
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [loadMapModalOpen, setLoadMapModalOpen] = useState(false);
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false);
  const [serverMaps, setServerMaps] = useState<Array<{ id: string; name: string }>>([]);
  const [saveAsName, setSaveAsName] = useState('');
  
  // Track modified/dirty state
  const [isDirty, setIsDirty] = useState(false);
  const prevMapJsonRef = useRef<string>('');

  // Update dirty state whenever map structural content changes
  useEffect(() => {
    const currentJson = JSON.stringify({
      dimensions: map.dimensions,
      grid: map.grid,
      background: map.background,
      walls: map.walls,
      terrain: map.terrain,
      objects: map.objects,
      tokens: map.tokens
    });

    if (!prevMapJsonRef.current) {
      prevMapJsonRef.current = currentJson;
      return;
    }

    if (currentJson !== prevMapJsonRef.current) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [map]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportJSON = () => {
    exportBattleMap(map);
    setFileMenuOpen(false);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedMap = await importBattleMap(file);
      loadMapData(importedMap);
      prevMapJsonRef.current = JSON.stringify({
        dimensions: importedMap.dimensions,
        grid: importedMap.grid,
        background: importedMap.background,
        walls: importedMap.walls,
        terrain: importedMap.terrain,
        objects: importedMap.objects,
        tokens: importedMap.tokens
      });
      setIsDirty(false);
      alert('Successfully imported Battle Map JSON!');
    } catch (err: any) {
      alert(err.message || 'Failed to import JSON file.');
    } finally {
      e.target.value = '';
      setFileMenuOpen(false);
    }
  };

  const handleSaveMap = async () => {
    try {
      const mapId = map.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
      if (!mapId) {
        alert('Please specify a valid map name first.');
        return;
      }
      
      // Save locally as backup & to server as canonical authoring asset
      saveBattleMap(map);
      await saveBattleMapToServer(mapId, map.name, map);
      prevMapJsonRef.current = JSON.stringify({
        dimensions: map.dimensions,
        grid: map.grid,
        background: map.background,
        walls: map.walls,
        terrain: map.terrain,
        objects: map.objects,
        tokens: map.tokens
      });
      setIsDirty(false);
      alert(`Map "${map.name}" saved successfully to server!`);
    } catch (err: any) {
      alert(err.message || 'Failed to save map.');
    } finally {
      setFileMenuOpen(false);
    }
  };

  const handleSaveAsMap = async () => {
    if (!saveAsName.trim()) {
      alert('Please enter a valid map name.');
      return;
    }
    try {
      const newId = saveAsName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
      const clonedMap = {
        ...map,
        name: saveAsName,
        metadata: {
          ...map.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      await saveBattleMapToServer(newId, saveAsName, clonedMap);
      setMap(clonedMap);
      
      prevMapJsonRef.current = JSON.stringify({
        dimensions: clonedMap.dimensions,
        grid: clonedMap.grid,
        background: clonedMap.background,
        walls: clonedMap.walls,
        terrain: clonedMap.terrain,
        objects: clonedMap.objects,
        tokens: clonedMap.tokens
      });
      setIsDirty(false);
      setSaveAsModalOpen(false);
      alert(`Cloned and saved as "${saveAsName}" successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to clone map.');
    }
  };

  const handleOpenLoadModal = async () => {
    try {
      const maps = await listBattleMapsFromServer();
      setServerMaps(maps);
      setLoadMapModalOpen(true);
      setFileMenuOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to retrieve saved maps from server.');
    }
  };

  const handleLoadMapSelection = async (mapId: string) => {
    try {
      const loadedMap = await loadBattleMapFromServer(mapId);
      loadMapData(loadedMap);
      prevMapJsonRef.current = JSON.stringify({
        dimensions: loadedMap.dimensions,
        grid: loadedMap.grid,
        background: loadedMap.background,
        walls: loadedMap.walls,
        terrain: loadedMap.terrain,
        objects: loadedMap.objects,
        tokens: loadedMap.tokens
      });
      setIsDirty(false);
      setLoadMapModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to load map.');
    }
  };

  const handleDeleteMap = async (mapId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete map: "${name}"?`)) return;
    try {
      await deleteBattleMapFromServer(mapId);
      const updatedList = await listBattleMapsFromServer();
      setServerMaps(updatedList);
    } catch (err: any) {
      alert(err.message || 'Failed to delete map.');
    }
  };

  const handleValidateMap = () => {
    const result = validateBattleMap(map);
    if (!result.isValid) {
      alert(`Map Validation Report:\n\n⚠️ Warnings:\n${result.errors.map(e => `• ${e}`).join('\n')}`);
    } else {
      alert('Map Validation Report:\n\n✅ Map structure is valid and healthy! All constraints pass.');
    }
    setFileMenuOpen(false);
  };

  const handleNewMap = () => {
    if (isDirty && !confirm('You have unsaved changes. Create a new map anyway?')) return;
    clearMap();
    prevMapJsonRef.current = '';
    setIsDirty(false);
    setFileMenuOpen(false);
  };

  // Auto-load last saved map from local storage if available on mount
  useEffect(() => {
    try {
      const savedMap = loadBattleMap();
      if (savedMap) {
        loadMapData(savedMap);
        prevMapJsonRef.current = JSON.stringify({
          dimensions: savedMap.dimensions,
          grid: savedMap.grid,
          background: savedMap.background,
          walls: savedMap.walls,
          terrain: savedMap.terrain,
          objects: savedMap.objects,
          tokens: savedMap.tokens
        });
        setIsDirty(false);
      }
    } catch (e) {}
  }, [loadMapData]);

  return (
    <div className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-4 shrink-0 select-none">
      {/* File & Maps Dropdown Menu */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <span className="text-[10px] font-black tracking-widest text-white/10 uppercase mr-1 hidden lg:inline">BATTLE_MAP_EDITOR</span>
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setFileMenuOpen(!fileMenuOpen)}>
          <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase">FILE / MAPS</span>
          <GameIcon name="adjust" size={10} color="#a855f7" className={`transition-transform duration-200 ${fileMenuOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Map Name Display with Dirty State Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/80 max-w-[140px] truncate">{map.name}</span>
          {isDirty && (
            <span className="text-[9px] text-amber-500 font-black animate-pulse flex items-center gap-1">
              ● <span className="hidden sm:inline">MODIFIED</span>
            </span>
          )}
        </div>

        {/* Floating Menu Popover */}
        {fileMenuOpen && (
          <div className="absolute left-0 top-9 w-48 bg-[#151515] border border-white/10 rounded shadow-2xl py-1.5 z-[1000] text-[10px] font-bold uppercase tracking-wider text-white/80">
            <button onClick={handleNewMap} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="plus" size={10} /> New Map
            </button>
            <button onClick={handleOpenLoadModal} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="search" size={10} /> Open Map
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button onClick={handleSaveMap} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="save_data" size={10} /> Save Map
            </button>
            <button onClick={() => { setSaveAsName(map.name); setSaveAsModalOpen(true); setFileMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="save_data" size={10} /> Save As...
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="panel" size={10} /> Import JSON
            </button>
            <button onClick={handleExportJSON} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="package" size={10} /> Export JSON
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button onClick={handleValidateMap} className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2">
              <GameIcon name="adjust" size={10} /> Validate
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleImportJSON}
        />
      </div>

      {/* Primary Tool Selectors */}
      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
        {[
          { id: 'select', label: 'Select (V)', icon: 'search' },
          { id: 'pan', label: 'Pan (Space)', icon: 'panel' },
          { id: 'wall', label: 'Walls (W)', icon: 'panel' },
          { id: 'door', label: 'Doors (D)', icon: 'location' },
          { id: 'room', label: 'Room (R)', icon: 'panel' },
          { id: 'terrain', label: 'Terrain (T)', icon: 'panel' },
          { id: 'object', label: 'Stamps (O)', icon: 'package' },
          { id: 'token', label: 'Tokens (S)', icon: 'identity' },
          { id: 'measure', label: 'Measure (M)', icon: 'adjust' },
          { id: 'eraser', label: 'Eraser (E)', icon: 'close' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id as EditorTool)}
            className={`p-1.5 px-2.5 rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 transition-all ${
              activeTool === t.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            }`}
            title={t.label}
          >
            <GameIcon name={t.icon} size={11} color="currentColor" />
            <span className="hidden md:inline">{t.id}</span>
          </button>
        ))}
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-1.5 px-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-[10px] font-bold uppercase rounded border border-white/5 transition-all text-white/80"
          title="Undo Action (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 px-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-[10px] font-bold uppercase rounded border border-white/5 transition-all text-white/80"
          title="Redo Action (Ctrl+Y)"
        >
          Redo
        </button>
      </div>

      {/* --- Load/Open Map Dialog --- */}
      {loadMapModalOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-lg p-5 w-full max-w-md flex flex-col gap-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">Load Map from Server</span>
              <button onClick={() => setLoadMapModalOpen(false)} className="text-white/40 hover:text-white">
                <GameIcon name="close" size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
              {serverMaps.map(m => (
                <div key={m.id} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/5">
                  <button onClick={() => handleLoadMapSelection(m.id)} className="flex-1 text-left text-[11px] font-bold uppercase text-white/80 hover:text-white">
                    {m.name}
                  </button>
                  <button onClick={() => handleDeleteMap(m.id, m.name)} className="text-white/20 hover:text-red-500 p-1 rounded transition-colors">
                    <GameIcon name="trash" size={12} />
                  </button>
                </div>
              ))}
              {serverMaps.length === 0 && (
                <div className="text-center py-6 text-[10px] text-white/30 italic">No saved maps found on server.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Save As Dialog --- */}
      {saveAsModalOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-lg p-5 w-full max-w-sm flex flex-col gap-4 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">Save Map As...</span>
              <button onClick={() => setSaveAsModalOpen(false)} className="text-white/40 hover:text-white">
                <GameIcon name="close" size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold text-white/40 uppercase">Map Name</label>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="e.g. Castle Keep"
                className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSaveAsModalOpen(false)} className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-wider border border-white/5 text-white/70">
                Cancel
              </button>
              <button onClick={handleSaveAsMap} className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-[9px] font-black uppercase tracking-wider text-white">
                Clone & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
