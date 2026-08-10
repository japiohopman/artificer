import React from 'react';
import { useEditorStore } from '../state/editorStore';
import { EditorTool } from '../types/battleMap';
import { GameIcon } from '../../../../game_icons';

export const EditorToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    historyIndex,
    history,
    map,
    clearMap
  } = useEditorStore();

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${map.name.toLowerCase().replace(/\s+/g, '_')}.battlemap.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-4 shrink-0 select-none">
      {/* File Controls */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black tracking-widest text-white/30 uppercase mr-2">BATTLE_MAP_EDITOR</span>
        <button
          onClick={clearMap}
          className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase rounded border border-white/5 transition-all text-white/80"
          title="Create New Map"
        >
          New Map
        </button>
        <button
          onClick={handleExportJSON}
          className="p-1.5 px-3 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-[10px] font-bold uppercase rounded transition-all text-purple-300"
          title="Export Map to JSON File"
        >
          Export JSON
        </button>
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
    </div>
  );
};
