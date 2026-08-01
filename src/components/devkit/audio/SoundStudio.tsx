import { useState, useMemo, useEffect } from "react";
import { Mic, Music, SlidersHorizontal, Activity, FolderSearch, Lightbulb, RefreshCw, Layers } from "lucide-react";
import { GenerateVoice } from "./generate_voice";
import { GenerateSfx } from "./generate_sfx";
import { SpectralManipulation } from "./SoundEventEditor";
import { SoundExplorer } from "./SoundExplorer";
import { AudioEditor } from "./AudioEditor";
import { LampCard } from "./LampCard";
import { LampControls } from "./LampControls";
import { useHueStore } from "../../../store/useHueStore";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { playClickSound, playSuccessSound } from "../../../services/storageService";

type VoiceModel = {
  id: string;
  label: string;
  accountIndex: number;
};

const VOICE_PRESETS: VoiceModel[] = [
  { id: 'pNInz6obpg7j9YtY5yJJ', label: 'Adam (Narrator - Deep Male)', accountIndex: 0 },
  { id: '2EiwX7pgAlM7u9f7MwsY', label: 'Clyde (Antagonist - Gritty Male)', accountIndex: 0 },
  { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (Warm Female)', accountIndex: 0 },
  { id: 'ErXwobaYiN019vkySvjV', label: 'Antoni (Energetic Male)', accountIndex: 0 },
  { id: 'EXAVITQu4vr4xnSDgMaL', label: 'Bella (Soft Female)', accountIndex: 0 },
  { id: 'custom', label: 'Custom Voice ID...', accountIndex: 0 }
];

type SoundStudioTab = "voice" | "sfx" | "events";
type LeftPanelTab = "explorer" | "lamps";

const TABS: { id: SoundStudioTab; label: string; icon: any }[] = [
  { id: "sfx", label: "SFX Forge", icon: Music },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "events", label: "Events", icon: Activity }
];

export function SoundStudio() {
  const [activeTab, setActiveTab] = useState<SoundStudioTab>("sfx");
  const [leftTab, setLeftTab] = useState<LeftPanelTab>("explorer");

  // Audio refine/editor state
  const [editingBlob, setEditingBlob] = useState<Blob | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>("");
  const [editingFileCategory, setEditingFileCategory] = useState<string>("sfx");

  // Trigger SoundExplorer refresh by changing key
  const [explorerKey, setExplorerKey] = useState<number>(0);

  // Hue lamps states
  const { lights, triggerHue } = useHueStore();
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const selectedLight = useMemo(() => lights.find(l => l.id === selectedLightId), [lights, selectedLightId]);

  // Voice configurations
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('pNInz6obpg7j9YtY5yJJ');

  const handleFileSelect = async (file: { name: string; path: string; category: string }) => {
    try {
      playClickSound();
      const res = await fetch(file.path);
      if (!res.ok) {
        throw new Error("Failed to fetch audio file binary.");
      }
      const blob = await res.blob();
      setEditingBlob(blob);
      setEditingFileName(file.name.replace(/\.[^/.]+$/, ""));
      setEditingFileCategory(file.category);
    } catch (err: any) {
      console.error("Failed to load selected file:", err);
      alert(`Could not load audio file: ${err.message}`);
    }
  };

  const handleGenerateVoice = async (text: string, voiceId?: string) => {
    try {
      playClickSound();
      const settings = useSettingsStore.getState();
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const activeVoice = VOICE_PRESETS.find(v => v.id === (voiceId || selectedVoiceId)) || VOICE_PRESETS[0];
      const accountIdx = activeVoice.accountIndex;

      if (settings.elevenlabs_key_1) headers["x-elevenlabs-key-1"] = settings.elevenlabs_key_1;
      if (settings.elevenlabs_key_2) headers["x-elevenlabs-key-2"] = settings.elevenlabs_key_2;
      if (settings.elevenlabs_key_3) headers["x-elevenlabs-key-3"] = settings.elevenlabs_key_3;

      const res = await fetch("/api/audio/generate-voice", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text,
          voice_id: activeVoice.id === "custom" ? (voiceId || "") : activeVoice.id,
          accountIndex: accountIdx,
          voice_name: activeVoice.label,
          output_format: "mp3_44100_128"
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(errorData.detail || errorData.error || "Generation failed");
      }

      const blob = await res.blob();
      setEditingBlob(blob);
      const fileSlug = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_');
      setEditingFileName(fileSlug || "voice_generation");
      setEditingFileCategory("voice");
      playSuccessSound();
    } catch (err: any) {
      console.error("Voice generation failed:", err);
      alert(`Voice generation failed: ${err.message}`);
    }
  };

  const handleGenerateAudio = async (data: { prompt: string; category: string; filename: string; isLoop: boolean; duration: number; accountIndex?: number }) => {
    try {
      playClickSound();
      const settings = useSettingsStore.getState();
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      if (settings.elevenlabs_key_1) headers["x-elevenlabs-key-1"] = settings.elevenlabs_key_1;
      if (settings.elevenlabs_key_2) headers["x-elevenlabs-key-2"] = settings.elevenlabs_key_2;
      if (settings.elevenlabs_key_3) headers["x-elevenlabs-key-3"] = settings.elevenlabs_key_3;

      const res = await fetch("/api/audio/generate-sfx", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: data.prompt,
          duration_seconds: data.duration,
          loop: data.isLoop,
          accountIndex: data.accountIndex || 0,
          output_format: "mp3_44100_128"
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "SFX Generation failed" }));
        throw new Error(errorData.detail || errorData.error || "SFX Generation failed");
      }

      const blob = await res.blob();
      setEditingBlob(blob);
      setEditingFileName(data.filename || "sfx_generation");
      setEditingFileCategory(data.category || "sfx");
      playSuccessSound();
    } catch (err: any) {
      console.error("SFX generation failed:", err);
      alert(`SFX generation failed: ${err.message}`);
    }
  };

  const handleBakeAudio = async (editedBlob: Blob, finalName: string, category: string) => {
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
            message: `Bake refined sound from editor: ${finalName}`
          })
        });

        if (res.ok) {
          playSuccessSound();
          alert(`Sound asset '${finalName}' successfully baked and deployed under '${category}'!`);

          // Clear active editor
          setEditingBlob(null);
          setEditingFileName("");

          // Refresh sound explorer list automatically
          setExplorerKey(prev => prev + 1);
        } else {
          throw new Error("Failed to commit file on server.");
        }
      };
    } catch (err: any) {
      console.error("Baking refined sound failed:", err);
      alert(`Baking failed: ${err.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-200 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="border-b border-stone-800 bg-stone-900/30 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 py-3 pr-6 border-r border-stone-800">
          <SlidersHorizontal className="w-4 h-4 text-stone-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Audio Laboratory</span>
        </div>
        <div className="flex items-center flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-stone-200 text-stone-200"
                    : "border-transparent text-stone-500 hover:text-stone-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Panel: Sidebar Tab Switcher */}
        <div className="w-80 flex-shrink-0 border-r border-stone-800 flex flex-col h-full bg-stone-950">
          {/* Left panel tabs */}
          <div className="grid grid-cols-2 border-b border-stone-850 shrink-0">
            <button
              onClick={() => { setLeftTab("explorer"); playClickSound(); }}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                leftTab === "explorer"
                  ? "border-purple-500 text-white bg-white/2"
                  : "border-transparent text-stone-500 hover:text-stone-400"
              }`}
            >
              <FolderSearch className="w-3.5 h-3.5" />
              Explorer
            </button>
            <button
              onClick={() => { setLeftTab("lamps"); playClickSound(); }}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                leftTab === "lamps"
                  ? "border-purple-500 text-white bg-white/2"
                  : "border-transparent text-stone-500 hover:text-stone-400"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Lamps ({lights.length})
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {leftTab === "explorer" ? (
              <SoundExplorer
                key={explorerKey}
                onSelectFile={handleFileSelect}
                activeFileName={editingFileName ? `${editingFileName}.${editingFileCategory === 'voice' ? 'mp3' : 'wav'}` : null}
              />
            ) : (
              <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {selectedLight ? (
                  <div className="flex flex-col h-full min-h-0">
                    <button
                      onClick={() => setSelectedLightId(null)}
                      className="mb-3 text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-300 flex items-center gap-1 shrink-0"
                    >
                      ← Back to Lamps
                    </button>
                    <div className="flex-1 min-h-0">
                      <LampControls
                        light={selectedLight}
                        onUpdate={(settings) => triggerHue(settings, selectedLight.id)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lights.map(light => (
                      <LampCard
                        key={light.id}
                        light={light}
                        isSelected={false}
                        onSelect={() => setSelectedLightId(light.id)}
                        onToggle={(e) => {
                          e.stopPropagation();
                          triggerHue({ on: { on: !light.on?.on } }, light.id);
                        }}
                        onBrightnessChange={(val) => triggerHue({ dimming: { brightness: val } }, light.id)}
                      />
                    ))}
                    {lights.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center text-stone-600 border border-dashed border-stone-800 rounded-2xl text-center">
                        <Lightbulb className="w-8 h-8 mb-2 opacity-25" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No Hue Lamps Found</p>
                        <p className="text-[8px] uppercase tracking-tighter text-stone-700 mt-1">Check settings or bridge connection</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Split Pane (Top Workspace, Bottom Editor) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-stone-950">
          {/* Top Pane: Generators */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {activeTab === "voice" && (
              <GenerateVoice
                voiceOptions={VOICE_PRESETS}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={setSelectedVoiceId}
                onGenerate={handleGenerateVoice}
              />
            )}
            {activeTab === "sfx" && (
              <GenerateSfx activeEnvironment={null} onGenerate={handleGenerateAudio} />
            )}
            {activeTab === "events" && <SpectralManipulation />}
          </div>

          {/* Bottom Pane: Embed AudioEditor or Placeholder */}
          <div className="h-[360px] shrink-0 border-t border-stone-800 bg-[#0a0a0a] p-3 flex flex-col min-h-0 overflow-hidden relative">
            {editingBlob ? (
              <AudioEditor
                key={editingFileName}
                fileBlob={editingBlob}
                fileName={editingFileName}
                initialCategory={editingFileCategory}
                onClose={() => {
                  setEditingBlob(null);
                  setEditingFileName("");
                }}
                onBake={handleBakeAudio}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-600 border border-dashed border-stone-900 rounded-xl p-6 text-center select-none bg-black/10">
                <Music className="w-8 h-8 mb-3 text-stone-700 animate-pulse" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Refining Studio Empty</h3>
                <p className="text-[8px] uppercase tracking-tight text-stone-700 mt-1.5 max-w-sm leading-relaxed">
                  Select a sound file from the repository explorer on the left or generate a new sfx/voice above to mount and edit the waveform canvas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
