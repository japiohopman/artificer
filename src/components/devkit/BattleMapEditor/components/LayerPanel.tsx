import React from 'react';
import { useEditorStore } from '../state/editorStore';
import { GameIcon } from '../../../../game_icons';

export const LayerPanel: React.FC = () => {
  const {
    map,
    selectedLayerId,
    setSelectedLayerId,
    toggleLayerVisibility,
    toggleLayerLock
  } = useEditorStore();

  return (
    <div className="bg-[#1a1a1a] border-t border-white/5 p-4 select-none shrink-0">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[9px] font-black tracking-widest text-white/30 uppercase">Operational Layers</label>
        <span className="text-[8px] text-white/20 font-mono">Z_INDEX</span>
      </div>

      <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
        {map.layers.map((l) => {
          const isSelected = selectedLayerId === l.id;
          return (
            <div
              key={l.id}
              onClick={() => setSelectedLayerId(l.id)}
              className={`flex items-center justify-between p-2 rounded transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-600/15 border border-purple-500/20 text-white'
                  : 'bg-white/[0.01] border border-transparent text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GameIcon name="panel" size={10} color={isSelected ? '#c084fc' : '#ffffff'} className="opacity-60" />
                <span className="text-[10px] font-bold uppercase tracking-tight">{l.name}</span>
              </div>

              <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleLayerVisibility(l.id)}
                  className={`text-[9px] font-bold hover:text-white transition-colors ${
                    l.visible ? 'text-purple-400' : 'text-white/20'
                  }`}
                  title="Toggle Visibility"
                >
                  {l.visible ? 'VISIBLE' : 'HIDDEN'}
                </button>
                <span className="text-white/10">|</span>
                <button
                  onClick={() => toggleLayerLock(l.id)}
                  className={`text-[9px] font-bold hover:text-white transition-colors ${
                    l.locked ? 'text-red-400' : 'text-white/20'
                  }`}
                  title="Toggle Lock State"
                >
                  {l.locked ? 'LOCKED' : 'FREE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
