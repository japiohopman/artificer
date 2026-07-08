import React, { useState } from 'react';
import { GameIcon } from '../../game_icons';
import { SOUND_MANIFEST } from '../../services/audio/audioManifest';
import { audioEngine } from '../../services/audio/audioEngine';
import { playClickSound, playSuccessSound } from '../../services/storageService';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioStore } from '../../store/useAudioStore';
import { LAYER_NAMES } from '../../types/audio';

export const AudioLaboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'forge' | 'requester'>('explorer');
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [requestData, setRequestData] = useState({
    assetName: '',
    description: '',
    priority: 'Medium'
  });

  // Forge State
  const [forgePrompt, setForgePrompt] = useState('');
  const [assetName, setAssetName] = useState('');
  const [duration, setDuration] = useState(5);
  const [isLoop, setIsLoop] = useState(false);
  const [accountIndex, setAccountIndex] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  const { hueState } = useAudioStore();

  useEffect(() => {
    if (activeTab === 'explorer') {
      fetchAudioFiles();
    }
  }, [activeTab]);

  const fetchAudioFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch('/api/audio/list');
      if (res.ok) {
        const data = await res.json();
        setAudioFiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch audio files:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleTriggerSound = (path: string) => {
    audioEngine.play(path, 6); // Play on SFX layer
    playClickSound();
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
            onClick={() => { setActiveTab('explorer'); playClickSound(); }}
            className={`px-4 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'explorer' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            EXPLORER
          </button>
          <button 
            onClick={() => { setActiveTab('forge'); playClickSound(); }}
            className={`px-4 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'forge' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            SFX_FORGE
          </button>
          <button
            onClick={() => { setActiveTab('requester'); playClickSound(); }}
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
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Direct_Asset_Bridge // public/assets/sounds/</div>
                <button
                  onClick={fetchAudioFiles}
                  className="p-2 text-white/20 hover:text-purple-400 transition-colors"
                  title="Refresh File List"
                >
                  <GameIcon name="refresh" size={14} className={isLoadingFiles ? 'animate-spin' : ''} />
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                  <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Scanning Repositories...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {audioFiles.map((file, idx) => (
                    <div key={`${file.path}-${idx}`} className="bg-black/30 border border-white/5 rounded-lg p-4 group hover:border-purple-500/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter mb-1">{file.category.replace(/_/g, ' ')}</div>
                          <div className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ')}</div>
                        </div>
                        <button
                          onClick={() => handleTriggerSound(file.path)}
                          className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600 hover:text-white transition-all shadow-lg group-hover:scale-110"
                        >
                          <GameIcon name="play" size={14} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono">
                          <GameIcon name="save_data" size={10} />
                          <span className="truncate">{file.path}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
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
                       <span className="text-[9px] text-white/20 uppercase font-black">Live_Repository_Size</span>
                       <div className="text-white/60 font-bold text-[10px]">{audioFiles.length} FILES_DETECTED</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : activeTab === 'forge' ? (
            <motion.div
              key="forge"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Instruction & Optimization */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Asset_Identifier</label>
                      <input
                        type="text"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                        placeholder="e.g. Arcane_Impact_Heavy"
                        className="w-full bg-black/40 border border-white/10 p-3 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Synthesis_Instruction</label>
                    <button
                      onClick={async () => {
                        if (!forgePrompt) return;
                        setIsOptimizing(true);
                        playClickSound();
                        try {
                          const res = await fetch("/api/ai/optimize-sound-prompt", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ prompt: forgePrompt, category: 'sfx' })
                          });
                          const data = await res.json();
                          if (data.optimizedPrompt) setForgePrompt(data.optimizedPrompt);
                        } catch (err) {
                          console.error("Optimization failed:", err);
                        } finally {
                          setIsOptimizing(false);
                        }
                      }}
                      disabled={isOptimizing || !forgePrompt}
                      className="text-[10px] font-bold text-white/40 hover:text-purple-400 transition-all flex items-center gap-2 uppercase"
                    >
                      <GameIcon name="magic_effect" size={12} className={isOptimizing ? 'animate-spin' : ''} />
                      {isOptimizing ? 'Optimizing...' : 'AI_Optimize'}
                    </button>
                  </div>
                  <textarea
                    value={forgePrompt}
                    onChange={(e) => setForgePrompt(e.target.value)}
                    placeholder="Describe the sonic essence (e.g. 'Heavy iron gate creaking slowly in a damp stone corridor')..."
                    className="w-full h-48 bg-black/40 border border-white/10 p-4 text-sm text-white/80 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all leading-relaxed custom-scrollbar font-mono italic"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={async () => {
                        setIsGenerating(true);
                        playClickSound();
                        try {
                          const res = await fetch("/api/audio/generate-sfx", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              text: forgePrompt,
                              duration_seconds: duration,
                              loop: isLoop,
                              accountIndex
                            })
                          });

                          if (!res.ok) throw new Error("Generation failed");

                          const blob = await res.blob();
                          setGeneratedBlob(blob);
                          const url = URL.createObjectURL(blob);
                          setPreviewUrl(url);
                          playSuccessSound();
                        } catch (err) {
                          console.error("Generation failed:", err);
                          alert("Arcane synthesis failed. Check ElevenLabs credits.");
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      disabled={isGenerating || !forgePrompt}
                      className="py-4 bg-purple-600 text-white font-bold rounded-xl uppercase hover:bg-purple-500 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg active:scale-95"
                    >
                      <GameIcon name="magic_effect" size={18} className={isGenerating ? 'animate-spin' : ''} />
                      {isGenerating ? 'Synthesizing...' : 'Ignite Forge'}
                    </button>

                    {previewUrl && (
                      <button
                        onClick={() => {
                          const audio = new Audio(previewUrl);
                          audio.play();
                          playClickSound();
                        }}
                        className="py-4 bg-white/5 border border-purple-500/30 text-purple-400 font-bold rounded-xl uppercase hover:bg-purple-600/20 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
                      >
                        <GameIcon name="play" size={18} />
                        Preview Echo
                      </button>
                    )}
                  </div>
                </div>

                {previewUrl && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded text-emerald-500">
                        <GameIcon name="save_data" size={14} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Spectral_Output_Captured</div>
                        <div className="text-[11px] text-emerald-500/80 font-mono">ready_for_deployment.wav</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!generatedBlob || !assetName) {
                          alert("Please specify an Asset Name before deploying.");
                          return;
                        }
                        setIsDeploying(true);
                        playClickSound();
                        try {
                          const reader = new FileReader();
                          reader.readAsDataURL(generatedBlob);
                          reader.onloadend = async () => {
                            const base64data = (reader.result as string).split(',')[1];
                            const safeName = assetName.toLowerCase().replace(/\s+/g, '_');
                            const path = `public/assets/sounds/sfx/${safeName}.wav`;

                            const res = await fetch("/api/commit", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                path,
                                content: base64data,
                                isBase64: true,
                                message: `Bake generated SFX: ${assetName}`
                              })
                            });

                            if (res.ok) {
                              playSuccessSound();
                              alert(`SFX '${assetName}' successfully baked to repository!`);
                              setPreviewUrl(null);
                              setGeneratedBlob(null);
                              setAssetName('');
                            } else {
                              throw new Error("Deployment failed");
                            }
                          };
                        } catch (err) {
                          console.error("Deployment failed:", err);
                          alert("Deployment failed. check server logs.");
                        } finally {
                          setIsDeploying(false);
                        }
                      }}
                      disabled={isDeploying || !assetName}
                      className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded uppercase hover:bg-emerald-500 transition-all disabled:opacity-30"
                    >
                      {isDeploying ? 'Deploying...' : 'Deploy to Repo'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Forge Context */}
              <div className="space-y-6">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <GameIcon name="adjust" size={14} className="text-purple-400" />
                    <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Forge Context</h3>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Duration</label>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">{duration}s</span>
                    </div>
                    <input
                      type="range" min="1" max="22" step="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Loop Toggle */}
                  <button
                    onClick={() => { setIsLoop(!isLoop); playClickSound(); }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isLoop ? 'bg-purple-600/10 border-purple-500/50 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <GameIcon name="adjust" size={14} className={isLoop ? 'text-purple-400' : 'text-white/20'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Seamless Loop</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full transition-all ${isLoop ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-white/10'}`} />
                  </button>

                  {/* Account Selector */}
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">ElevenLabs_Account</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((num, idx) => (
                        <button
                          key={num}
                          onClick={() => { setAccountIndex(idx); playClickSound(); }}
                          className={`py-2 rounded-lg border text-[9px] font-bold transition-all ${accountIndex === idx ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}
                        >
                          ACC {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                  <p className="text-[9px] text-purple-400/60 leading-relaxed italic">
                    Note: High-fidelity synthesis consumes credits on your chosen ElevenLabs account. Optimize your prompt first for best results.
                  </p>
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
