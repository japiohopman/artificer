
import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store/useStore.ts';
import { AudioLayer, LAYER_NAMES } from '../../types/audio.ts';
import { GameIcon } from '../../game_icons.tsx';
import { soundService } from '../../services/soundService.ts';

const LAYER_ICONS: Record<AudioLayer, React.ReactNode> = {
  1: <GameIcon name="music" size={16} />,
  2: <GameIcon name="wind" size={16} />,
  3: <GameIcon name="cloud" size={16} />,
  4: <GameIcon name="energy" size={16} />,
  5: <GameIcon name="user" size={16} />,
  6: <GameIcon name="energy" size={16} />,
  7: <GameIcon name="shield" size={16} />,
  8: <GameIcon name="display" size={16} />,
  9: <GameIcon name="music" size={16} />,
  10: <GameIcon name="display" size={16} />,
  11: <GameIcon name="wind" size={16} />,
};

interface MixerProps {
  onClose?: () => void;
}

export const Mixer: React.FC<MixerProps> = ({ onClose }) => {
  const { 
    layerStates, 
    updateLayerVolume, 
    toggleLayerMute, 
    toggleLayerSolo, 
    stopAllAudio,
    isMusicPlaying
  } = useStore();

  const sortedLayers = (Object.keys(layerStates) as unknown as string[])
    .map(key => parseInt(key) as AudioLayer)
    .sort((a, b) => a - b);

  return (
    <div className="flex flex-col h-[400px] bg-zinc-950 text-zinc-300 font-mono text-xs select-none border-t border-dragon-red/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-black/40">
        <div className="flex items-center gap-3">
          <GameIcon name="adjust" className="text-dragon-red" size={18} />
          <h2 className="text-sm font-header uppercase tracking-widest text-white">Master Control Console</h2>
          <div className="px-2 py-0.5 bg-dragon-red/10 border border-dragon-red/20 rounded text-[8px] text-dragon-red font-black">SYSTEM_OVR</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 px-4 border-l border-zinc-800/50">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">Active Playlist</span>
              <div className="flex items-center gap-2">
                <GameIcon name="music" size={12} className={isMusicPlaying ? 'text-dragon-red animate-pulse' : 'text-zinc-600'} />
                <span className="text-[10px] uppercase font-bold text-zinc-300">Archives of the Elder</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded border border-zinc-800 shadow-inner">
              <button 
                onClick={() => soundService.stopMusic()}
                className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-600 hover:text-red-500"
                title="Stop"
              >
                <GameIcon name="stop" size={10} />
              </button>
              <button 
                onClick={() => soundService.playMusic()}
                className={`p-1.5 px-4 rounded-sm transition-all flex items-center gap-2 ${isMusicPlaying ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-dragon-red text-white hover:bg-dragon-red/80'}`}
                title="Play"
              >
                {isMusicPlaying ? <div className="flex gap-0.5 h-2.5 items-end"><div className="w-0.5 h-full bg-white animate-[bounce_1s_infinite]" /><div className="w-0.5 h-2/3 bg-white animate-[bounce_1.2s_infinite]" /><div className="w-0.5 h-full bg-white animate-[bounce_0.8s_infinite]" /></div> : <GameIcon name="play" size={10} />}
                <span className="text-[9px] font-black uppercase">{isMusicPlaying ? 'LIVE' : 'PLAY'}</span>
              </button>
              <button 
                onClick={() => soundService.skipMusic()}
                className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-600 hover:text-dragon-red"
                title="Skip"
              >
                <GameIcon name="skip_forward" size={10} />
              </button>
            </div>
          </div>

          <button 
            onClick={stopAllAudio}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-950/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/30 rounded transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <GameIcon name="volume_x" size={14} />
            <span>Panic_Kill</span>
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white border border-zinc-800"
            >
              <GameIcon name="minimize" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 flex gap-2 items-stretch custom-scrollbar bg-black/20">
        {sortedLayers.map((layerId) => {
          const state = layerStates[layerId];
          return (
            <div key={layerId} className="flex flex-col w-20 shrink-0 bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden group/layer">
              <div className="p-2 border-b border-zinc-800 bg-black/40 flex flex-col items-center gap-1 group-hover/layer:bg-zinc-800/50 transition-colors">
                <div className="text-dragon-red/50 group-hover/layer:text-dragon-red transition-colors">
                  {LAYER_ICONS[layerId]}
                </div>
                <span className="text-[8px] text-zinc-600 font-black tracking-widest">BUS_{layerId.toString().padStart(2, '0')}</span>
                <div className="text-[10px] text-zinc-400 font-bold tabular-nums">
                  {Math.round(state.volume * 100)}%
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center gap-2 p-4 justify-center relative bg-gradient-to-b from-transparent to-black/20 overflow-hidden">
                <div className="h-[120px] w-full flex items-center justify-center relative">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={state.volume}
                    onChange={(e) => updateLayerVolume(layerId, parseFloat(e.target.value))}
                    className="mixer-slider vertical"
                    title={`${LAYER_NAMES[layerId]} Volume`}
                  />
                  <div className="absolute left-1 top-0 bottom-0 w-1 bg-black/40 rounded-full pointer-events-none" />
                </div>
              </div>

              <div className="p-2 bg-black/60 border-t border-zinc-800 mt-auto flex flex-col gap-2">
                <div className="text-center text-[7px] uppercase tracking-tighter text-zinc-500 font-black truncate px-1 group-hover/layer:text-zinc-300 transition-colors">
                  {LAYER_NAMES[layerId]}
                </div>
                <div className="flex gap-1 justify-center">
                  <button 
                    onClick={() => toggleLayerSolo(layerId)}
                    className={`w-6 h-6 flex items-center justify-center rounded border text-[8px] font-black transition-all ${state.isSolo ? 'bg-amber-500 border-amber-400 text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                  >
                    S
                  </button>
                  <button 
                    onClick={() => toggleLayerMute(layerId)}
                    className={`w-6 h-6 flex items-center justify-center rounded border text-[8px] font-black transition-all ${state.isMuted ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                  >
                    M
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Master Fader */}
        <div className="ml-auto flex flex-col w-28 shrink-0 bg-stone-900 border-2 border-dragon-red/30 rounded-xl overflow-hidden shadow-2xl">
           <div className="p-2 border-b-2 border-dragon-red/20 bg-stone-950 flex flex-col items-center gap-1">
              <GameIcon name="energy" className="text-dragon-red" size={16} />
              <span className="text-[8px] text-dragon-red font-black tracking-[0.2em] uppercase">Master_Out</span>
              <div className="text-lg text-white font-black tabular-nums tracking-tight">100<span className="text-[8px] opacity-50 ml-0.5">%</span></div>
           </div>
           
           <div className="flex-1 flex flex-col items-center p-4 relative bg-stone-950/50">
              <div className="h-[120px] w-full flex items-center justify-center relative">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  defaultValue="1"
                  disabled
                  className="mixer-slider vertical master"
                />
              </div>
              <div className="mt-auto w-full flex flex-col gap-1">
                <div className="flex justify-between text-[7px] font-black text-zinc-600">
                  <span>L</span>
                  <span>R</span>
                </div>
                <div className="h-1 bg-black rounded-full overflow-hidden flex">
                  <div className="h-full w-1/2 bg-dragon-red/40 animate-pulse border-r border-black" />
                  <div className="h-full w-1/2 bg-dragon-red/40 animate-pulse" />
                </div>
              </div>
           </div>

           <div className="p-2 bg-stone-950 border-t-2 border-dragon-red/20 mt-auto text-center">
              <div className="text-[8px] font-black text-dragon-red uppercase tracking-widest">Main_Stereo</div>
           </div>
        </div>
      </div> 
      
      <style>{`
        .mixer-slider.vertical {
          appearance: none;
          width: 8px;
          height: 140px;
          background: #111114;
          border-radius: 9999px;
          cursor: pointer;
          /* Critical for vertical orientation */
          writing-mode: vertical-lr;
          direction: rtl;
        }
        
        /* Modern browsers vertical slider hack */
        @supports not (appearance: slider-vertical) {
          /* Fallback for browsers that don't support writing-mode on input[range] */
          .mixer-slider.vertical {
            transform: rotate(-90deg) translate(-65px, 0); 
            width: 140px;
            height: 8px;
          }
        }

        .mixer-slider::-webkit-slider-thumb {
          appearance: none;
          width: 32px;
          height: 16px;
          background: #ef4444;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .mixer-slider.vertical::-webkit-slider-thumb {
          cursor: pointer;
        }

        .mixer-slider.master::-webkit-slider-thumb {
          background: #ffffff;
          width: 40px;
          height: 20px;
          border-color: #ef4444;
        }
      `}</style>
    </div>
  );
};
