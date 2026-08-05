import React from 'react';
import { useAudioStore } from '../../../store/useAudioStore';
import { LAYER_NAMES, AudioLayer } from '../../../types/audio';
import { playClickSound } from '../../../services/storageService';

export const AudioOptions: React.FC = () => {
  const { layerStates, updateLayerVolume, toggleLayerMute } = useAudioStore();

  const sortedLayers = (Object.keys(layerStates) as unknown as string[])
    .map(key => parseInt(key) as AudioLayer)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
        Mixer Channel Calibrations
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedLayers.map((layerId) => {
          const state = layerStates[layerId];
          if (!state) return null;
          return (
            <div
              key={layerId}
              className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-3 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-300 truncate max-w-[150px]">
                    {LAYER_NAMES[layerId]}
                  </span>
                  <span className="text-[9px] text-zinc-500 tabular-nums font-mono font-bold">
                    {Math.round(state.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.volume}
                  onChange={(e) => updateLayerVolume(layerId, parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-dragon-red"
                />
              </div>
              <button
                onClick={() => { toggleLayerMute(layerId); playClickSound(); }}
                className={`px-2 py-1 text-[9px] font-black rounded border transition-all shrink-0 ${
                  state.isMuted
                    ? 'bg-red-950/40 border-red-500 text-red-500 shadow-lg animate-pulse'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {state.isMuted ? 'MUTED' : 'MUTE'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
