import React, { useState } from 'react';
import { GameIcon } from '../../game_icons';
import { SOUND_MANIFEST } from '../../services/audio/audioManifest';
import { audioEngine } from '../../services/audio/audioEngine';
import { playClickSound, playSuccessSound } from '../../services/storageService';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioStore } from '../../store/useAudioStore';
import { LAYER_NAMES } from '../../types/audio';

export const AudioLaboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'requester'>('explorer');
  const [requestData, setRequestData] = useState({
    assetName: '',
    description: '',
    priority: 'Medium'
  });
  const { hueState } = useAudioStore();

  const handleTriggerSound = (id: string) => {
    const entry = SOUND_MANIFEST[id];
    if (entry) {
      audioEngine.play(entry.sound, entry.layer);
      playClickSound();
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestData.assetName || !requestData.description) return;
    
    console.log("[AudioLab] Submitting request:", requestData);
    
    // Placeholder for actual file append logic
    playSuccessSound();
    setRequestData({ assetName: '', description: '', priority: 'Medium' });
    alert("Audio request queued for Sunny!");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
            <GameIcon name="adjust" size={16} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ARCANE_AUDIO_ENGINE</div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Audio Laboratory</div>
          </div>
        </div>
        
        <div className="flex bg-white/5 rounded p-0.5 border border-white/10">
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'explorer' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            EXPLORER
          </button>
          <button 
            onClick={() => setActiveTab('requester')}
            className={`px-4 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'requester' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            REQUESTER
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'explorer' ? (
            <motion.div 
              key="explorer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(SOUND_MANIFEST).map(([id, entry]) => (
                  <div key={id} className="bg-black/30 border border-white/5 rounded-lg p-4 group hover:border-purple-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter mb-1">{LAYER_NAMES[entry.layer]}</div>
                        <div className="text-sm font-bold text-white uppercase tracking-tight">{id.replace(/_/g, ' ')}</div>
                      </div>
                      <button 
                        onClick={() => handleTriggerSound(id)}
                        className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600 hover:text-white transition-all shadow-lg group-hover:scale-110"
                      >
                        <GameIcon name="play" size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono">
                        <GameIcon name="save_data" size={10} />
                        <span className="truncate">{entry.sound}</span>
                      </div>
                      {entry.lighting && (
                        <div className="flex items-center gap-2 text-[10px] text-amber-500/60 font-bold uppercase tracking-widest">
                          <GameIcon name="magic_effect" size={10} />
                          <span>Lighting: {entry.lighting.pattern} ({entry.lighting.duration}ms)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-6 bg-black/40 border border-purple-500/10 rounded-xl">
                 <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Diagnostics & Status</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                       <span className="text-[9px] text-white/20 uppercase font-black">Howler_Ready</span>
                       <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px]">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          OPERATIONAL
                       </div>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] text-white/20 uppercase font-black">Hue_Bridge</span>
                       <div className={`flex items-center gap-2 font-bold text-[10px] ${hueState.connected ? 'text-emerald-500' : 'text-white/20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${hueState.connected ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                          {hueState.connected ? 'CONNECTED' : 'OFFLINE'}
                       </div>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] text-white/20 uppercase font-black">Manifest_Size</span>
                       <div className="text-white/60 font-bold text-[10px]">{Object.keys(SOUND_MANIFEST).length} ASSETS_LOADED</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="requester"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Signal Sunny</h3>
                <p className="text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">Request new professional audio assets for the Artificer project.</p>
              </div>
              
              <div className="bg-black/30 border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Asset_Identifier</label>
                  <input 
                    type="text" 
                    value={requestData.assetName}
                    onChange={(e) => setRequestData({...requestData, assetName: e.target.value})}
                    placeholder="e.g. Arcane_Whirlwind_Loop"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white rounded-lg focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Context_And_Texture</label>
                  <textarea 
                    value={requestData.description}
                    onChange={(e) => setRequestData({...requestData, description: e.target.value})}
                    placeholder="Describe the mood, duration, and context (e.g. 'Low-pitched humming with occasional electrical sparks, 5s loop')..."
                    className="w-full h-32 bg-white/5 border border-white/10 p-4 text-sm text-white rounded-lg focus:outline-none focus:border-purple-500/50 transition-all leading-relaxed custom-scrollbar"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Priority_Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button
                        key={p}
                        onClick={() => setRequestData({...requestData, priority: p})}
                        className={`py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          requestData.priority === p 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                            : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={handleSubmitRequest}
                  disabled={!requestData.assetName || !requestData.description}
                  className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl uppercase hover:bg-purple-500 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(147,51,234,0.2)] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <GameIcon name="magic_effect" size={18} />
                  Queue Request for Sunny
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
