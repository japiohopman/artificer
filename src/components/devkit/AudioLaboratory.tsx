import React, { useState, useEffect } from 'react';
import { GameIcon } from '../../game_icons';
import { audioEngine } from '../../services/audio/audioEngine';
import { playClickSound, playSuccessSound } from '../../services/storageService';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioStore } from '../../store/useAudioStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  Play, Pause, Trash2, Edit2, Check, X,
  Folder, FolderOpen, ChevronDown, ChevronRight,
  RefreshCw, Music, Mic, Sparkles, Send, Save, ArrowRight, Volume2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ambient', label: 'Ambient' },
  { id: 'environment', label: 'Environment' },
  { id: 'music', label: 'Music' },
  { id: 'npc_voice', label: 'NPC Voice' },
  { id: 'sfx', label: 'SFX' },
  { id: 'system', label: 'System' },
  { id: 'voice', label: 'Voice' },
  { id: 'weather', label: 'Weather' }
];

const VOICE_PRESETS = [
  { id: 'pNInz6obpg7j9YtY5yJJ', label: 'Adam (Narrator - Deep Male)' },
  { id: '2EiwX7pgAlM7u9f7MwsY', label: 'Clyde (Antagonist - Gritty Male)' },
  { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (Warm Female)' },
  { id: 'ErXwobaYiN019vkySvjV', label: 'Antoni (Energetic Male)' },
  { id: 'EXAVITQu4vr4xnSDgMaL', label: 'Bella (Soft Female)' },
  { id: 'custom', label: 'Custom Voice ID...' }
];

export const AudioLaboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forge' | 'voice' | 'requester'>('forge');
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [requestData, setRequestData] = useState({
    assetName: '',
    description: '',
    priority: 'Medium'
  });
  
  // Left Sidebar Explorer state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    ambient: true,
    environment: true,
    music: true,
    npc_voice: true,
    sfx: true,
    system: true,
    voice: true,
    weather: true
  });
  const [playingPath, setPlayingPath] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // SFX Forge State
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

  // Voice State
  const [voiceAssetName, setVoiceAssetName] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('pNInz6obpg7j9YtY5yJJ');
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [voiceAccountIndex, setVoiceAccountIndex] = useState(0);
  const [voiceCategory, setVoiceCategory] = useState('voice');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isDeployingVoice, setIsDeployingVoice] = useState(false);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const [voiceGeneratedBlob, setVoiceGeneratedBlob] = useState<Blob | null>(null);

  const { hueState } = useAudioStore();

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  // Stop sound when unmounting
  useEffect(() => {
    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, [activeAudio]);

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

  const handleTogglePlay = (path: string) => {
    playClickSound();
    if (playingPath === path && activeAudio) {
      activeAudio.pause();
      setPlayingPath(null);
      setActiveAudio(null);
    } else {
      if (activeAudio) {
        activeAudio.pause();
      }
      const audio = new Audio(path);
      audio.play().catch(err => {
        console.error("Failed to play audio:", err);
      });
      audio.onended = () => {
        setPlayingPath(null);
        setActiveAudio(null);
      };
      setActiveAudio(audio);
      setPlayingPath(path);
    }
  };

  const handleRenameFile = async (file: any, newRelativeName: string) => {
    if (!newRelativeName.trim()) return;
    try {
      const oldPath = `public${file.path}`;
      const newPath = `public/assets/sounds/${file.category}/${newRelativeName.trim()}`;

      const res = await fetch("/api/audio/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath, newPath })
      });

      if (res.ok) {
        playSuccessSound();
        setRenameTarget(null);
        fetchAudioFiles();
      } else {
        const data = await res.json();
        alert(`Rename failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Failed to rename file:", err);
      alert(`Error renaming file: ${err.message}`);
    }
  };

  const handleDeleteFile = async (file: any) => {
    if (!window.confirm(`Are you sure you want to delete '${getFileDisplayName(file)}'?`)) return;
    try {
      const filePath = `public${file.path}`;
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          message: `Delete audio: ${file.name}`
        })
      });

      if (res.ok) {
        playSuccessSound();
        fetchAudioFiles();
      } else {
        const data = await res.json();
        alert(`Delete failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Failed to delete file:", err);
      alert(`Error deleting file: ${err.message}`);
    }
  };

  const getFileDisplayName = (file: any) => {
    const prefix = `/assets/sounds/${file.category}/`;
    if (file.path.startsWith(prefix)) {
      return file.path.substring(prefix.length);
    }
    return file.name;
  };

  const toggleFolder = (category: string) => {
    setExpandedFolders(prev => ({ ...prev, [category]: !prev[category] }));
    playClickSound();
  };

  const handleSubmitRequest = async () => {
    if (!requestData.assetName || !requestData.description) return;
    
    console.log("[AudioLab] Submitting request:", requestData);
    playSuccessSound();
    setRequestData({ assetName: '', description: '', priority: 'Medium' });
    alert("Audio request queued for Sunny!");
  };

  return (
    <div className="flex-1 flex flex-row bg-[#121212] overflow-hidden h-full">
      {/* LEFT SIDEBAR: PERSISTENT EXPLORER */}
      <aside className="w-80 bg-black/40 border-r border-white/5 flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sound Explorer</span>
          </div>
          <button
            onClick={fetchAudioFiles}
            className="p-1 text-white/30 hover:text-purple-400 transition-colors rounded"
            title="Refresh Files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {isLoadingFiles ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Scanning Sounds...</span>
            </div>
          ) : (
            CATEGORIES.map(cat => {
              const categoryFiles = audioFiles.filter(f => f.category === cat.id);
              const isExpanded = !!expandedFolders[cat.id];
              return (
                <div key={cat.id} className="bg-white/2 border border-white/5 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFolder(cat.id)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 text-white/40" />
                      )}
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isExpanded ? 'text-white' : 'text-white/60'}`}>
                        {cat.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-white/5 text-white/40 rounded-full font-mono">
                        {categoryFiles.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-1 bg-black/20 border-t border-white/5 space-y-1">
                      {categoryFiles.length === 0 ? (
                        <div className="px-3 py-2 text-[10px] text-white/20 italic">
                          No audio files
                        </div>
                      ) : (
                        categoryFiles.map((file, idx) => {
                          const isPlaying = playingPath === file.path;
                          const isRenaming = renameTarget === file.path;
                          return (
                            <div
                              key={`${file.path}-${idx}`}
                              className="group flex items-center justify-between p-1.5 rounded hover:bg-white/5 transition-all text-left"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button
                                  onClick={() => handleTogglePlay(file.path)}
                                  className={`p-1.5 rounded-full transition-all shrink-0 ${
                                    isPlaying
                                      ? 'bg-purple-600 text-white animate-pulse'
                                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                </button>

                                {isRenaming ? (
                                  <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameFile(file, renameValue);
                                        if (e.key === 'Escape') setRenameTarget(null);
                                      }}
                                      className="w-full bg-black/50 border border-purple-500/50 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleRenameFile(file, renameValue)}
                                      className="p-1 text-emerald-400 hover:bg-emerald-500/15 rounded"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setRenameTarget(null)}
                                      className="p-1 text-rose-400 hover:bg-rose-500/15 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-white/70 truncate font-mono select-none">
                                    {getFileDisplayName(file)}
                                  </span>
                                )}
                              </div>

                              {!isRenaming && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={() => {
                                      setRenameTarget(file.path);
                                      setRenameValue(getFileDisplayName(file));
                                      playClickSound();
                                    }}
                                    className="p-1 text-white/30 hover:text-purple-400 transition-colors rounded"
                                    title="Rename File"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(file)}
                                    className="p-1 text-white/30 hover:text-rose-400 transition-colors rounded"
                                    title="Delete File"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Diagnostics block */}
        <div className="p-3 border-t border-white/5 bg-black/30 space-y-2">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Diagnostics</span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/2 p-2 rounded border border-white/5">
              <span className="block text-white/20 uppercase font-black text-[8px]">Hue Bridge</span>
              <span className={`font-mono font-bold ${hueState.connected ? 'text-emerald-500' : 'text-white/30'}`}>
                {hueState.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="bg-white/2 p-2 rounded border border-white/5">
              <span className="block text-white/20 uppercase font-black text-[8px]">Assets</span>
              <span className="font-mono font-bold text-purple-400">{audioFiles.length} files</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: WORKSPACES */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Workspace Header */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ARCANE_AUDIO_ENGINE</div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">Audio Laboratory</div>
            </div>
          </div>

          <div className="flex bg-white/5 rounded p-0.5 border border-white/10">
            <button
              onClick={() => { setActiveTab('forge'); playClickSound(); }}
              className={`px-4 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1.5 ${activeTab === 'forge' ? 'bg-purple-600 text-white shadow' : 'text-white/40 hover:text-white/60'}`}
            >
              <Sparkles className="w-3 h-3" />
              SFX_FORGE
            </button>
            <button
              onClick={() => { setActiveTab('voice'); playClickSound(); }}
              className={`px-4 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1.5 ${activeTab === 'voice' ? 'bg-purple-600 text-white shadow' : 'text-white/40 hover:text-white/60'}`}
            >
              <Mic className="w-3 h-3" />
              VOICE
            </button>
            <button
              onClick={() => { setActiveTab('requester'); playClickSound(); }}
              className={`px-4 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1.5 ${activeTab === 'requester' ? 'bg-purple-600 text-white shadow' : 'text-white/40 hover:text-white/60'}`}
            >
              <Send className="w-3 h-3" />
              REQUESTER
            </button>
          </div>
        </div>

        {/* Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'forge' ? (
              <motion.div
                key="forge"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column: Instruction & Optimization */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Asset_Identifier</label>
                        <input
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          placeholder="e.g. Arcane_Impact_Heavy"
                          className="w-full bg-black/45 border border-white/10 p-3 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500/50 transition-all font-mono"
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
                            const settings = useSettingsStore.getState();
                            const headers: Record<string, string> = { "Content-Type": "application/json" };
                            if (settings.gemini_key) {
                              headers["x-gemini-key"] = settings.gemini_key;
                            }
                            const res = await fetch("/api/ai/optimize-sound-prompt", {
                              method: "POST",
                              headers,
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
                        <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin text-purple-400' : ''}`} />
                        {isOptimizing ? 'Optimizing...' : 'AI_Optimize'}
                      </button>
                    </div>
                    <textarea
                      value={forgePrompt}
                      onChange={(e) => setForgePrompt(e.target.value)}
                      placeholder="Describe the sonic essence (e.g. 'Heavy iron gate creaking slowly in a damp stone corridor')..."
                      className="w-full h-44 bg-black/45 border border-white/10 p-4 text-sm text-white/80 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all leading-relaxed custom-scrollbar font-mono italic"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={async () => {
                          setIsGenerating(true);
                          playClickSound();
                          try {
                            const settings = useSettingsStore.getState();
                            const headers: Record<string, string> = { "Content-Type": "application/json" };
                            if (settings.elevenlabs_key_1) headers["x-elevenlabs-key-1"] = settings.elevenlabs_key_1;
                            if (settings.elevenlabs_key_2) headers["x-elevenlabs-key-2"] = settings.elevenlabs_key_2;
                            if (settings.elevenlabs_key_3) headers["x-elevenlabs-key-3"] = settings.elevenlabs_key_3;

                            console.log("[AudioLaboratory] Generating sound effect. State check:", {
                              accountIndex,
                              hasKey1: !!settings.elevenlabs_key_1,
                              hasKey2: !!settings.elevenlabs_key_2,
                              hasKey3: !!settings.elevenlabs_key_3,
                              sendingHeaders: Object.keys(headers)
                            });

                            const res = await fetch("/api/audio/generate-sfx", {
                              method: "POST",
                              headers,
                              body: JSON.stringify({
                                text: forgePrompt,
                                duration_seconds: duration,
                                loop: isLoop,
                                accountIndex,
                                output_format: "mp3_44100_128"
                              })
                            });

                            if (!res.ok) {
                              let errMsg = "Generation failed";
                              try {
                                const errData = await res.json();
                                errMsg = errData.detail || errData.error || errMsg;
                              } catch (_) {
                                try {
                                  errMsg = await res.text() || errMsg;
                                } catch (_) {}
                              }
                              throw new Error(errMsg);
                            }

                            const blob = await res.blob();
                            setGeneratedBlob(blob);
                            const url = URL.createObjectURL(blob);
                            setPreviewUrl(url);
                            playSuccessSound();
                          } catch (err: any) {
                            console.error("Generation failed:", err);
                            alert(`Arcane synthesis failed: ${err.message || "Check ElevenLabs credentials, credits, or limits."}`);
                          } finally {
                            setIsGenerating(false);
                          }
                        }}
                        disabled={isGenerating || !forgePrompt}
                        className="py-3.5 bg-purple-600 text-white font-bold text-xs rounded-xl uppercase hover:bg-purple-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg active:scale-95"
                      >
                        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Synthesizing...' : 'Ignite Forge'}
                      </button>

                      {previewUrl && (
                        <button
                          onClick={() => {
                            const audio = new Audio(previewUrl);
                            audio.play();
                            playClickSound();
                          }}
                          className="py-3.5 bg-white/5 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl uppercase hover:bg-purple-600/25 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                        >
                          <Play className="w-4 h-4" />
                          Preview Echo
                        </button>
                      )}
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded text-emerald-500">
                          <Save className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Spectral_Output_Captured</div>
                          <div className="text-[11px] text-emerald-500/80 font-mono">ready_for_deployment.mp3</div>
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
                              const path = `public/assets/sounds/sfx/${safeName}.mp3`;

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
                                fetchAudioFiles();
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
                        className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded uppercase hover:bg-emerald-500 transition-all disabled:opacity-30 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isDeploying ? 'Deploying...' : 'Deploy to Repo'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Forge Context */}
                <div className="space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-purple-400" />
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
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoop ? 'text-purple-400 animate-spin-slow' : 'text-white/20'}`} />
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
            ) : activeTab === 'voice' ? (
              <motion.div
                key="voice"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left: Input fields */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="space-y-4">
                      {/* Asset identifier */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Asset_Identifier (File Name)</label>
                        <input
                          value={voiceAssetName}
                          onChange={(e) => setVoiceAssetName(e.target.value)}
                          placeholder="e.g. Alchemist_Greeting"
                          className="w-full bg-black/45 border border-white/10 p-3 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                        />
                      </div>

                      {/* Script Dialogue */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">Voice Dialogue Script</label>
                        <textarea
                          value={voiceText}
                          onChange={(e) => setVoiceText(e.target.value)}
                          placeholder="Enter dialogue to synthesize (e.g. 'I have traveled across the Shining Sea to find this ancient tome of alchemy...')"
                          className="w-full h-40 bg-black/45 border border-white/10 p-4 text-sm text-white/80 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all leading-relaxed custom-scrollbar font-mono italic"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={async () => {
                          if (!voiceText.trim()) return;
                          setIsGeneratingVoice(true);
                          playClickSound();
                          try {
                            const settings = useSettingsStore.getState();
                            const headers: Record<string, string> = { "Content-Type": "application/json" };
                            if (settings.elevenlabs_key_1) headers["x-elevenlabs-key-1"] = settings.elevenlabs_key_1;
                            if (settings.elevenlabs_key_2) headers["x-elevenlabs-key-2"] = settings.elevenlabs_key_2;
                            if (settings.elevenlabs_key_3) headers["x-elevenlabs-key-3"] = settings.elevenlabs_key_3;

                            const activeVoiceId = selectedVoiceId === 'custom' ? customVoiceId.trim() : selectedVoiceId;
                            if (!activeVoiceId) {
                              throw new Error("Please specify a Voice ID.");
                            }

                            const res = await fetch("/api/audio/generate-voice", {
                              method: "POST",
                              headers,
                              body: JSON.stringify({
                                text: voiceText,
                                voice_id: activeVoiceId,
                                accountIndex: voiceAccountIndex,
                                output_format: "mp3_44100_128"
                              })
                            });

                            if (!res.ok) {
                              let errMsg = "Voice generation failed";
                              try {
                                const errData = await res.json();
                                errMsg = errData.detail || errData.error || errMsg;
                              } catch (_) {
                                try {
                                  errMsg = await res.text() || errMsg;
                                } catch (_) {}
                              }
                              throw new Error(errMsg);
                            }

                            const blob = await res.blob();
                            setVoiceGeneratedBlob(blob);
                            const url = URL.createObjectURL(blob);
                            setVoicePreviewUrl(url);
                            playSuccessSound();
                          } catch (err: any) {
                            console.error("Voice generation failed:", err);
                            alert(`Voice synthesis failed: ${err.message || "Check credentials or parameters."}`);
                          } finally {
                            setIsGeneratingVoice(false);
                          }
                        }}
                        disabled={isGeneratingVoice || !voiceText.trim()}
                        className="py-3.5 bg-purple-600 text-white font-bold text-xs rounded-xl uppercase hover:bg-purple-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg active:scale-95"
                      >
                        <Mic className={`w-4 h-4 ${isGeneratingVoice ? 'animate-pulse' : ''}`} />
                        {isGeneratingVoice ? 'Synthesizing...' : 'Ignite Voice Forge'}
                      </button>

                      {voicePreviewUrl && (
                        <button
                          onClick={() => {
                            const audio = new Audio(voicePreviewUrl);
                            audio.play();
                            playClickSound();
                          }}
                          className="py-3.5 bg-white/5 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl uppercase hover:bg-purple-600/25 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                        >
                          <Play className="w-4 h-4" />
                          Preview Voice
                        </button>
                      )}
                    </div>
                  </div>

                  {voicePreviewUrl && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded text-emerald-500">
                          <Save className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Voice_Output_Captured</div>
                          <div className="text-[11px] text-emerald-500/80 font-mono">ready_for_deployment.mp3</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!voiceGeneratedBlob || !voiceAssetName) {
                            alert("Please specify an Asset Name before deploying.");
                            return;
                          }
                          setIsDeployingVoice(true);
                          playClickSound();
                          try {
                            const reader = new FileReader();
                            reader.readAsDataURL(voiceGeneratedBlob);
                            reader.onloadend = async () => {
                              const base64data = (reader.result as string).split(',')[1];
                              const safeName = voiceAssetName.toLowerCase().replace(/\s+/g, '_');
                              // Save under selected folder/category
                              const path = `public/assets/sounds/${voiceCategory}/${safeName}.mp3`;

                              const res = await fetch("/api/commit", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  path,
                                  content: base64data,
                                  isBase64: true,
                                  message: `Bake generated voice: ${voiceAssetName}`
                                })
                              });

                              if (res.ok) {
                                playSuccessSound();
                                alert(`Voice '${voiceAssetName}' successfully baked to repository!`);
                                setVoicePreviewUrl(null);
                                setVoiceGeneratedBlob(null);
                                setVoiceAssetName('');
                                fetchAudioFiles();
                              } else {
                                throw new Error("Deployment failed");
                              }
                            };
                          } catch (err) {
                            console.error("Deployment failed:", err);
                            alert("Deployment failed. check server logs.");
                          } finally {
                            setIsDeployingVoice(false);
                          }
                        }}
                        disabled={isDeployingVoice || !voiceAssetName}
                        className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded uppercase hover:bg-emerald-500 transition-all disabled:opacity-30 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isDeployingVoice ? 'Deploying...' : 'Deploy to Repo'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Context configuration */}
                <div className="space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Voice Context</h3>
                    </div>

                    {/* Pre-made Voice Selector */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Select Character / Voice</label>
                      <select
                        value={selectedVoiceId}
                        onChange={(e) => {
                          setSelectedVoiceId(e.target.value);
                          playClickSound();
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                      >
                        {VOICE_PRESETS.map(preset => (
                          <option key={preset.id} value={preset.id} className="bg-[#121212] text-white">
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Voice ID input */}
                    {selectedVoiceId === 'custom' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">ElevenLabs Voice ID</label>
                        <input
                          value={customVoiceId}
                          onChange={(e) => setCustomVoiceId(e.target.value)}
                          placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                          className="w-full bg-black/45 border border-white/10 p-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500/50 font-mono"
                        />
                      </div>
                    )}

                    {/* Target Folder Category Selection */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Target Repository Category</label>
                      <select
                        value={voiceCategory}
                        onChange={(e) => {
                          setVoiceCategory(e.target.value);
                          playClickSound();
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#121212] text-white">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Account Index Selection */}
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">ElevenLabs_Account</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((num, idx) => (
                          <button
                            key={num}
                            onClick={() => { setVoiceAccountIndex(idx); playClickSound(); }}
                            className={`py-2 rounded-lg border text-[9px] font-bold transition-all ${voiceAccountIndex === idx ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}
                          >
                            ACC {num}
                          </button>
                        ))}
                      </div>
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
                    <Send className="w-4 h-4" />
                    Queue Request for Sunny
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
