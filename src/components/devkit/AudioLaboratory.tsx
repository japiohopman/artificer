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
  RefreshCw, Music, Mic, Sparkles, Send, Save, ArrowRight, Volume2, Scissors, History
} from 'lucide-react';
import { AudioEditor } from './audio/AudioEditor';

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

interface ElevenLabsHistoryPanelProps {
  accountIndex: number;
  onDeploy: (blob: Blob, name: string, category: string) => Promise<void>;
}

const ElevenLabsHistoryPanel: React.FC<ElevenLabsHistoryPanelProps> = ({ accountIndex, onDeploy }) => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [playingHistoryId, setPlayingHistoryId] = useState<string | null>(null);
  const [historyAudio, setHistoryAudio] = useState<HTMLAudioElement | null>(null);
  const [deployingHistoryId, setDeployingHistoryId] = useState<string | null>(null);
  const [deployName, setDeployName] = useState<string>('');
  const [deployCategory, setDeployCategory] = useState<string>('sfx');

  useEffect(() => {
    fetchHistory();
    return () => {
      if (historyAudio) {
        historyAudio.pause();
      }
    };
  }, [accountIndex]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/audio/history?accountIndex=${accountIndex}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.history || data;
        setHistoryItems(Array.isArray(items) ? items : []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePlayHistory = async (item: any) => {
    playClickSound();
    if (playingHistoryId === item.history_item_id && historyAudio) {
      historyAudio.pause();
      setPlayingHistoryId(null);
      setHistoryAudio(null);
    } else {
      if (historyAudio) {
        historyAudio.pause();
      }
      const url = `/api/audio/history/${item.history_item_id}/audio?accountIndex=${accountIndex}`;
      const audio = new Audio(url);
      audio.play().catch(err => console.error("Playback error:", err));
      audio.onended = () => {
        setPlayingHistoryId(null);
        setHistoryAudio(null);
      };
      setHistoryAudio(audio);
      setPlayingHistoryId(item.history_item_id);
    }
  };

  const handleDeployHistoryItem = async (item: any) => {
    if (!deployName.trim()) {
      alert("Please enter a name for the asset.");
      return;
    }
    playClickSound();
    try {
      const audioUrl = `/api/audio/history/${item.history_item_id}/audio?accountIndex=${accountIndex}`;
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error("Failed to fetch historical audio data.");
      const blob = await response.blob();

      const cleanName = deployName.trim().toLowerCase().replace(/\s+/g, '_').replace(/\.[^/.]+$/, "");
      await onDeploy(blob, cleanName + ".mp3", deployCategory);
      setDeployingHistoryId(null);
      setDeployName('');
    } catch (err: any) {
      console.error("Failed to deploy history item:", err);
      alert(`Deployment failed: ${err.message}`);
    }
  };

  return (
    <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4 shadow-xl text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400 shrink-0" />
          <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] shrink-0">Account History</h3>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loadingHistory}
          className="p-1 text-white/30 hover:text-purple-400 transition-colors rounded disabled:opacity-30"
          title="Refresh History"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingHistory ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-30">
          <div className="w-4 h-4 border border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Syncing Account Logs...</span>
        </div>
      ) : historyItems.length === 0 ? (
        <p className="text-[10px] text-white/20 italic text-center py-4">No recent logs found.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {historyItems.map((item, idx) => {
            const isPlaying = playingHistoryId === item.history_item_id;
            const isDeploying = deployingHistoryId === item.history_item_id;
            return (
              <div key={item.history_item_id || idx} className="bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl p-2.5 space-y-2 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/70 italic leading-normal line-clamp-2" title={item.text}>
                      "{item.text}"
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-white/30 uppercase">
                      <span>{item.voice_name || 'Sound FX'}</span>
                      <span>•</span>
                      <span>{new Date(item.date_unix * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePlayHistory(item)}
                      className={`p-1.5 rounded-full ${isPlaying ? 'bg-purple-600 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                      title="Play Log"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => {
                        setDeployingHistoryId(isDeploying ? null : item.history_item_id);
                        if (!isDeploying) {
                          const textSlug = item.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_');
                          setDeployName(textSlug || 'history_audio');
                        }
                        playClickSound();
                      }}
                      className={`p-1.5 rounded-full ${isDeploying ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                      title="Deploy to Repository"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isDeploying && (
                  <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-2.5 space-y-2.5 animate-in fade-in slide-in-from-top-1 text-left">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Deploy Name</label>
                      <input
                        value={deployName}
                        onChange={(e) => setDeployName(e.target.value)}
                        placeholder="e.g. dragon_breathe_fire"
                        className="w-full bg-black/60 border border-emerald-500/30 rounded p-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Target Category</label>
                      <select
                        value={deployCategory}
                        onChange={(e) => setDeployCategory(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-500/30 rounded p-1 text-[10px] text-white focus:outline-none focus:border-emerald-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleDeployHistoryItem(item)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase rounded transition-colors"
                    >
                      Commit to Repository
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AudioLaboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forge' | 'voice' | 'history'>('forge');
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
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

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: any;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
    playClickSound();
  };

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // SFX Forge State
  const [forgePrompt, setForgePrompt] = useState('');
  const [assetName, setAssetName] = useState('');
  const [duration, setDuration] = useState(5);
  const [isLoop, setIsLoop] = useState(false);
  const [accountIndex, setAccountIndex] = useState(0);
  const [forgeCategory, setForgeCategory] = useState('sfx');
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

  // WaveSurfer Audio Editing State
  const [editingFileBlob, setEditingFileBlob] = useState<Blob | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>('');
  const [editingFileCategory, setEditingFileCategory] = useState<string>('');
  const [isOpeningEditor, setIsOpeningEditor] = useState(false);

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

  const handleOpenRefineStudio = async (file: any) => {
    playClickSound();
    setIsOpeningEditor(true);
    try {
      const response = await fetch(file.path);
      if (!response.ok) throw new Error("Failed to fetch audio file binary.");
      const blob = await response.blob();
      setEditingFileBlob(blob);
      // Strip extension for the baseline name
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setEditingFileName(baseName);
      setEditingFileCategory(file.category);
    } catch (err: any) {
      console.error("Failed to load audio for refining:", err);
      alert(`Could not load audio file: ${err.message}`);
    } finally {
      setIsOpeningEditor(false);
    }
  };

  const handleBakeEditedAudio = async (editedBlob: Blob, finalName: string, category: string) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(editedBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const path = `public/assets/sounds/${category}/${finalName}`;

        const res = await fetch("/api/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path,
            content: base64data,
            isBase64: true,
            message: `Refined / Trimmed audio: ${finalName}`
          })
        });

        if (res.ok) {
          playSuccessSound();
          alert(`Refined sound '${finalName}' successfully baked to repository under '${category}'!`);
          setEditingFileBlob(null);
          setEditingFileName('');
          fetchAudioFiles();
        } else {
          const errData = await res.json().catch(() => ({ error: "Commit failed on backend server." }));
          throw new Error(errData.error || "Commit failed on backend server.");
        }
      };
    } catch (err: any) {
      console.error("Failed to bake audio:", err);
      alert(`Bake failed: ${err.message}`);
    }
  };

  const handleDeployBlob = async (blob: Blob, finalName: string, category: string) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const path = `public/assets/sounds/${category}/${finalName}`;

        const res = await fetch("/api/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path,
            content: base64data,
            isBase64: true,
            message: `Deploy ElevenLabs asset: ${finalName}`
          })
        });

        if (res.ok) {
          playSuccessSound();
          alert(`Asset '${finalName}' successfully deployed to repository under '${category}'!`);
          fetchAudioFiles();
        } else {
          throw new Error("Commit failed on server");
        }
      };
    } catch (err: any) {
      console.error("Deploy blob failed:", err);
      alert(`Deploy failed: ${err.message}`);
    }
  };

  const toggleFolder = (category: string) => {
    setExpandedFolders(prev => ({ ...prev, [category]: !prev[category] }));
    playClickSound();
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

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0">
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
                              onContextMenu={(e) => handleContextMenu(e, file)}
                              className="group flex items-center justify-between p-1.5 rounded hover:bg-white/5 transition-all text-left cursor-context-menu"
                              title="Right click for tools menu"
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
                                    onClick={() => handleOpenRefineStudio(file)}
                                    disabled={isOpeningEditor}
                                    className="p-1 text-white/30 hover:text-purple-400 transition-colors rounded disabled:opacity-30"
                                    title="Refine / Edit Sound Wave"
                                  >
                                    <Scissors className="w-3 h-3" />
                                  </button>
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

        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 relative overflow-hidden flex flex-col bg-[#0a0a0a] min-h-0">
          {editingFileBlob ? (
            <div className="flex-1 w-full h-full relative shadow-2xl rounded-2xl overflow-hidden border border-white/5 flex flex-col min-h-0">
              <AudioEditor
                fileBlob={editingFileBlob}
                fileName={editingFileName}
                initialCategory={editingFileCategory}
                onClose={() => {
                  setEditingFileBlob(null);
                  setEditingFileName('');
                  setEditingFileCategory('');
                }}
                onBake={handleBakeEditedAudio}
              />
            </div>
          ) : (
            <div className="flex-1 border border-white/5 bg-white/2 rounded-2xl flex flex-col items-center justify-center text-white/30 italic text-[11px] gap-3">
              <Scissors className="w-6 h-6 opacity-50 text-purple-400" />
              Select a file from the explorer or generate new audio to open the workspace editor.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: GENERATOR */}
      <aside className="w-[450px] bg-[#121212] flex flex-col h-full shrink-0 border-l border-white/5">
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center shrink-0">
          <div className="flex bg-white/5 rounded p-0.5 border border-white/10 w-full">
            <button
              onClick={() => { setActiveTab('forge'); playClickSound(); }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all flex justify-center items-center gap-1.5 ${activeTab === 'forge' ? 'bg-purple-600 text-white shadow' : 'text-white/40 hover:text-white/60'}`}
            >
              <Sparkles className="w-3 h-3" />
              SFX_FORGE
            </button>
            <button
              onClick={() => { setActiveTab('voice'); playClickSound(); }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all flex justify-center items-center gap-1.5 ${activeTab === 'voice' ? 'bg-purple-600 text-white shadow' : 'text-white/40 hover:text-white/60'}`}
            >
              <Mic className="w-3 h-3" />
              VOICE
            </button>
            <button
              onClick={() => { setActiveTab('history'); playClickSound(); }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all flex justify-center items-center gap-1.5 ${activeTab === 'history' ? 'bg-purple-600 text-white shadow' : 'text-white/40 hover:text-white/60'}`}
            >
              <History className="w-3 h-3" />
              HISTORY
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'forge' ? (
              <motion.div
                key="forge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
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
                        className="py-3.5 bg-purple-600 text-white font-bold text-xs rounded-xl uppercase hover:bg-purple-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg active:scale-95 animate-pulse"
                      >
                        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Synthesizing...' : 'Ignite Forge'}
                      </button>

                      <div className="flex gap-2">
                        {previewUrl && (
                          <button
                            onClick={() => {
                              const audio = new Audio(previewUrl);
                              audio.play();
                              playClickSound();
                            }}
                            className="flex-1 py-3.5 bg-white/5 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl uppercase hover:bg-purple-600/25 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                          >
                            <Play className="w-4 h-4" />
                            Preview Echo
                          </button>
                        )}
                        {previewUrl && (
                          <button
                            onClick={() => {
                              playClickSound();
                              setEditingFileBlob(generatedBlob);
                              setEditingFileName(assetName || 'generated_sfx');
                              setEditingFileCategory(forgeCategory);
                            }}
                            className="flex-1 py-3.5 bg-purple-500/10 border border-purple-500/40 text-purple-400 font-bold text-xs rounded-xl uppercase hover:bg-purple-600/25 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                          >
                            <Scissors className="w-4 h-4" />
                            Refine / Trim
                          </button>
                        )}
                      </div>
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
                              const path = `public/assets/sounds/${forgeCategory}/${safeName}.mp3`;

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

                <div className="space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-6 shadow-xl">
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

                    {/* Target Folder Category Selection */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Target Repository Category</label>
                      <select
                        value={forgeCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setForgeCategory(cat);
                          if (cat === 'sfx') {
                            setDuration(2);
                            setIsLoop(false);
                          } else if (cat === 'system' || cat === 'ui') {
                            setDuration(1);
                            setIsLoop(false);
                          } else if (cat === 'ambient') {
                            setDuration(15);
                            setIsLoop(true);
                          }
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

                    {/* Account Selector */}
                    <div className="pt-4 border-t border-white/5 space-y-3">
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
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
                        className="py-3.5 bg-purple-600 text-white font-bold text-xs rounded-xl uppercase hover:bg-purple-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg active:scale-95 animate-pulse"
                      >
                        <Mic className={`w-4 h-4 ${isGeneratingVoice ? 'animate-pulse' : ''}`} />
                        {isGeneratingVoice ? 'Synthesizing...' : 'Ignite Voice Forge'}
                      </button>

                      <div className="flex gap-2">
                        {voicePreviewUrl && (
                          <button
                            onClick={() => {
                              const audio = new Audio(voicePreviewUrl);
                              audio.play();
                              playClickSound();
                            }}
                            className="flex-1 py-3.5 bg-white/5 border border-purple-500/30 text-purple-400 font-bold text-xs rounded-xl uppercase hover:bg-purple-600/25 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                          >
                            <Play className="w-4 h-4" />
                            Preview Voice
                          </button>
                        )}
                        {voicePreviewUrl && (
                          <button
                            onClick={() => {
                              playClickSound();
                              setEditingFileBlob(voiceGeneratedBlob);
                              setEditingFileName(voiceAssetName || 'generated_voice');
                              setEditingFileCategory(voiceCategory);
                            }}
                            className="flex-1 py-3.5 bg-purple-500/10 border border-purple-500/40 text-purple-400 font-bold text-xs rounded-xl uppercase hover:bg-purple-600/25 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                          >
                            <Scissors className="w-4 h-4" />
                            Refine / Trim
                          </button>
                        )}
                      </div>
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

                <div className="space-y-6">
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-6 shadow-xl">
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
            ) : activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6 h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-purple-400" />
                    <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">ElevenLabs Generation History</h3>
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 shadow-xl">
                    <ElevenLabsHistoryPanel accountIndex={accountIndex} onDeploy={handleDeployBlob} />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </aside>

      {/* Floating Windows-Style Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[21000] bg-stone-900 border border-stone-800 rounded-xl p-1.5 shadow-2xl min-w-[160px] flex flex-col font-mono text-left animate-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[8px] font-black text-stone-500 uppercase tracking-widest border-b border-stone-850 truncate max-w-[160px]" title={contextMenu.file.name}>
            {contextMenu.file.name}
          </div>
          <button
            onClick={() => {
              handleOpenRefineStudio(contextMenu.file);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-3 py-2 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
          >
            <Scissors className="w-3.5 h-3.5" />
            Refine / Trim Wave
          </button>
          <button
            onClick={() => {
              setRenameTarget(contextMenu.file.path);
              setRenameValue(getFileDisplayName(contextMenu.file));
              setContextMenu(null);
              playClickSound();
            }}
            className="flex items-center gap-2 px-3 py-2 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Rename File
          </button>
          <div className="h-px bg-stone-850 my-1" />
          <button
            onClick={() => {
              handleDeleteFile(contextMenu.file);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 px-3 py-2 text-[10px] text-red-400 hover:bg-red-500/15 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete File
          </button>
        </div>
      )}
    </div>
  );
};
