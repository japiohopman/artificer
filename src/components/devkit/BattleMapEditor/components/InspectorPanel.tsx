import React from 'react';
import { useEditorStore } from '../state/editorStore';
import { calculateGeometryCover, COVER_TYPES } from '../geometry/lineOfSight';
import { GameIcon } from '../../../../game_icons';

export const InspectorPanel: React.FC = () => {
  const {
    selection,
    map,
    removeObject,
    removeToken,
    updateObject,
    updateToken,
    coverAttacker,
    coverTarget,
    setCoverAttacker,
    setCoverTarget,
    activeTool,
    setActiveTool
  } = useEditorStore();

  const selectedId = selection.ids[0];
  
  // Resolve selected entity details
  const selectedObject = selectedId ? map.objects.find((o) => o.id === selectedId) : null;
  const selectedToken = selectedId ? map.tokens.find((t) => t.id === selectedId) : null;

  // Auto cover logic
  const calculatedCover = React.useMemo(() => {
    if (coverAttacker && coverTarget) {
      return calculateGeometryCover(coverAttacker, coverTarget, map.walls);
    }
    return null;
  }, [coverAttacker, coverTarget, map.walls]);

  return (
    <div className="w-[280px] bg-[#1e1e1e] border-l border-white/5 p-4 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar select-none text-white">
      {/* Property Editor */}
      <div className="space-y-3">
        <label className="text-[9px] font-black tracking-wider text-white/30 uppercase block border-b border-white/5 pb-1">
          Inspector Panel
        </label>

        {selectedObject && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-black/30 p-2.5 rounded border border-white/5">
              <span className="text-[8px] text-purple-400 font-mono block mb-0.5">{selectedObject.id}</span>
              <span className="text-[11px] font-bold uppercase">{selectedObject.name}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-white/40 uppercase font-black">Rotation (°)</span>
                  <input
                    type="number"
                    value={selectedObject.rotation}
                    onChange={(e) => updateObject(selectedObject.id, { rotation: parseInt(e.target.value) || 0 })}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-white/40 uppercase font-black">Scale</span>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObject.scale}
                    onChange={(e) => updateObject(selectedObject.id, { scale: parseFloat(e.target.value) || 1 })}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5">
                <span className="text-[9px] text-white/50 font-bold uppercase">Cast Shadow</span>
                <input
                  type="checkbox"
                  checked={selectedObject.hasShadow}
                  onChange={(e) => updateObject(selectedObject.id, { hasShadow: e.target.checked })}
                  className="rounded border-white/10 accent-purple-600 cursor-pointer"
                />
              </div>

              <button
                onClick={() => removeObject(selectedObject.id)}
                className="w-full py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider rounded transition-all"
              >
                Delete Object
              </button>
            </div>
          </div>
        )}

        {selectedToken && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-black/30 p-2.5 rounded border border-white/5">
              <span className="text-[8px] text-purple-400 font-mono block mb-0.5">{selectedToken.id}</span>
              <span className="text-[11px] font-bold uppercase">{selectedToken.name}</span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-white/40 uppercase font-black">Token Category</span>
                <select
                  value={selectedToken.type}
                  onChange={(e) => updateToken(selectedToken.id, { type: e.target.value as any })}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none cursor-pointer"
                >
                  <option value="player">Player character</option>
                  <option value="enemy">Hostile Enemy</option>
                  <option value="npc">Friendly NPC</option>
                  <option value="marker">Spawn / Landmark</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-white/40 uppercase font-black">Creature Size</span>
                <select
                  value={selectedToken.size}
                  onChange={(e) => updateToken(selectedToken.id, { size: e.target.value as any })}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none cursor-pointer"
                >
                  <option value="Medium">Medium (1x1)</option>
                  <option value="Large">Large (2x2)</option>
                </select>
              </div>

              <button
                onClick={() => removeToken(selectedToken.id)}
                className="w-full py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider rounded transition-all"
              >
                Banish Token
              </button>
            </div>
          </div>
        )}

        {!selectedObject && !selectedToken && (
          <div className="py-6 text-center text-[10px] text-white/20 italic bg-black/10 rounded border border-dashed border-white/5">
            Select an element on canvas to inspect credentials.
          </div>
        )}
      </div>

      <div className="h-px bg-white/5 my-1" />

      {/* Cover calculator integration */}
      <div className="space-y-3">
        <label className="text-[9px] font-black tracking-wider text-white/30 uppercase block border-b border-white/5 pb-1">
          LoS Cover Calculator
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTool('measure')} // Using measure tool state or trigger setting attacker
            className={`p-2 rounded border text-[8px] font-black uppercase tracking-widest transition-all ${
              activeTool === 'measure'
                ? 'bg-yellow-600 border-yellow-500 text-white'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Pin Attacker
          </button>
          <button
            onClick={() => setActiveTool('measure')}
            className={`p-2 rounded border text-[8px] font-black uppercase tracking-widest transition-all ${
              activeTool === 'measure'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Pin Target
          </button>
        </div>

        <div className="bg-black/40 border border-white/5 p-3 rounded-lg space-y-2.5">
          <div className="flex justify-between text-[9px] font-bold text-white/60">
            <span>Attacker grid:</span>
            <span className="text-yellow-400 font-mono">
              {coverAttacker ? `(${coverAttacker.x}, ${coverAttacker.y})` : 'Not Set'}
            </span>
          </div>
          <div className="flex justify-between text-[9px] font-bold text-white/60">
            <span>Target grid:</span>
            <span className="text-blue-400 font-mono">
              {coverTarget ? `(${coverTarget.x}, ${coverTarget.y})` : 'Not Set'}
            </span>
          </div>

          <div className="h-px bg-white/5 my-1" />

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Calculated:</span>
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                calculatedCover === COVER_TYPES.NO_COVER
                  ? 'bg-green-600/10 text-green-400'
                  : calculatedCover === COVER_TYPES.HALF_COVER
                  ? 'bg-yellow-600/10 text-yellow-400'
                  : calculatedCover === COVER_TYPES.THREE_QUARTERS_COVER
                  ? 'bg-orange-600/10 text-orange-400'
                  : calculatedCover === COVER_TYPES.FULL_COVER
                  ? 'bg-red-600/10 text-red-400'
                  : 'text-white/30'
              }`}
            >
              {calculatedCover || 'Awaiting Pin'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
