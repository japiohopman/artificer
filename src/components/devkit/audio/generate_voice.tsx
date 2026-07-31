import { useMemo, useState, useEffect } from "react";
import { Loader2, Mic, Play, Sparkles, Wand2, History as HistoryIcon } from "lucide-react";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { Howl } from 'howler';

type VoiceModel = {
  id: string;
  label: string;
  accountIndex: number;
};

interface GenerateVoiceProps {
  voiceOptions: VoiceModel[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onGenerate: (text: string, voiceId?: string) => Promise<void>;
}

const VOICE_STYLE_PRESETS = [
  {
    id: "narrator",
    label: "Narrator",
    prompt: "Measured fantasy narrator voice, clear diction, calm authority, warm pacing."
  },
  {
    id: "villain",
    label: "Villain",
    prompt: "Low, controlled antagonist voice with restrained menace and deliberate pauses."
  },
  {
    id: "wounded",
    label: "Wounded",
    prompt: "Breathless, strained delivery with fatigue, urgency, and fragile emotion."
  },
  {
    id: "merchant",
    label: "Merchant",
    prompt: "Lively shopkeeper voice, bright tone, quick rhythm, playful confidence."
  }
];

export function GenerateVoice({ voiceOptions, selectedVoiceId, onSelectVoice, onGenerate }: GenerateVoiceProps) {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [stylePreset, setStylePreset] = useState(VOICE_STYLE_PRESETS[0].id);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const selectedVoice = useMemo(
    () => voiceOptions.find(v => v.id === selectedVoiceId) || voiceOptions[0],
    [voiceOptions, selectedVoiceId]
  );

  const selectedStyle = useMemo(
    () => VOICE_STYLE_PRESETS.find((style) => style.id === stylePreset) || VOICE_STYLE_PRESETS[0],
    [stylePreset]
  );

  const activePrompt = enhancedPrompt || prompt;

  const fetchHistory = async () => {
    if (!selectedVoice) return;
    setIsLoadingHistory(true);
    try {
      const settings = useSettingsStore.getState();
      const headers: Record<string, string> = {};
      if (settings.elevenlabs_key_1) headers["x-elevenlabs-key-1"] = settings.elevenlabs_key_1;
      if (settings.elevenlabs_key_2) headers["x-elevenlabs-key-2"] = settings.elevenlabs_key_2;
      if (settings.elevenlabs_key_3) headers["x-elevenlabs-key-3"] = settings.elevenlabs_key_3;

      const res = await fetch(`/api/audio/history?accountIndex=${selectedVoice.accountIndex}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.history?.length > 0) {
            console.log("[ElevenLabs] History Item Sample:", data.history[0]);
        }
        // Only show items that have a voice_id (TTS items)
        const ttsHistory = (data.history || []).filter((item: any) => item.voice_id);
        setHistory(ttsHistory);
      }
    } catch (error) {
      console.error("Failed to fetch ElevenLabs history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedVoice?.accountIndex]);

  const playHistoryItem = async (itemId: string) => {
    if (playingId === itemId) {
      setPlayingId(null);
      return;
    }
    
    setPlayingId(itemId);
    try {
      const settings = useSettingsStore.getState();
      const headers: Record<string, string> = {};
      if (settings.elevenlabs_key_1) headers["x-elevenlabs-key-1"] = settings.elevenlabs_key_1;
      if (settings.elevenlabs_key_2) headers["x-elevenlabs-key-2"] = settings.elevenlabs_key_2;
      if (settings.elevenlabs_key_3) headers["x-elevenlabs-key-3"] = settings.elevenlabs_key_3;

      const res = await fetch(`/api/audio/history/${itemId}/audio?accountIndex=${selectedVoice?.accountIndex}`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        console.log(`[ElevenLabs] Playing history item ${itemId}, type: ${blob.type}, size: ${blob.size}`);
        
        if (blob.size === 0) throw new Error("Empty audio");
        
        const url = URL.createObjectURL(blob);
        const sound = new Howl({
          src: [url],
          format: ['mp3'],
          html5: false,
          onend: () => {
            setPlayingId(null);
            URL.revokeObjectURL(url);
          },
          onloaderror: (id, err) => {
            console.error("Howl load error:", err);
            setPlayingId(null);
            URL.revokeObjectURL(url);
          },
          onplayerror: (id, err) => {
            console.error("Howl play error:", err);
            setPlayingId(null);
            URL.revokeObjectURL(url);
          }
        });
        
        sound.play();
      } else {
        console.error("History audio fetch failed:", res.status);
        setPlayingId(null);
      }
    } catch (error) {
      console.error("Playback failed:", error);
      setPlayingId(null);
    }
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/gemini/enhance-voice-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedStyle.prompt,
          voiceModel: selectedVoiceId
        })
      });
      const data = await res.json();
      if (data.enhancedPrompt) setEnhancedPrompt(data.enhancedPrompt);
    } catch (error) {
      console.error("Voice prompt enhancement failed:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const generate = async () => {
    if (!activePrompt.trim()) return;
    setIsGenerating(true);
    try {
      const activeId = selectedVoiceId === 'custom' ? customVoiceId.trim() : selectedVoiceId;
      await onGenerate(activePrompt, activeId);
      // Refresh history after generation
      setTimeout(fetchHistory, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-200">
      <div className="border-b border-stone-800 p-6 bg-stone-900/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <Mic className="w-5 h-5 text-stone-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide">Generate Voice</h1>
            <p className="text-xs text-stone-500 uppercase tracking-tight">NPC speech and narration workflow</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 p-6 overflow-hidden">
        <section className="min-h-0 bg-stone-900/50 border border-stone-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Voice Model</span>
              <select
                value={selectedVoiceId}
                onChange={(event) => onSelectVoice(event.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-stone-600"
              >
                {voiceOptions.map((voice) => (
                  <option key={`${voice.label}-${voice.accountIndex}`} value={voice.id}>
                    {voice.label}{voice.id ? ` (${voice.id.slice(0, 6)}...)` : " - unconfigured"}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Style Preset</span>
              <select
                value={stylePreset}
                onChange={(event) => setStylePreset(event.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-stone-600"
              >
                {VOICE_STYLE_PRESETS.map((style) => (
                  <option key={style.id} value={style.id}>{style.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 flex-1 min-h-0 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Prompt</span>
            <textarea
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                setEnhancedPrompt("");
              }}
              placeholder="Write the line, character context, emotion, and delivery notes..."
              className="flex-1 min-h-[170px] bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm font-sans text-stone-300 focus:outline-none focus:border-stone-600 resize-none"
            />
          </label>

          {enhancedPrompt && (
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Enhanced Prompt</span>
              <textarea
                value={enhancedPrompt}
                onChange={(event) => setEnhancedPrompt(event.target.value)}
                className="w-full min-h-[130px] bg-stone-950 border border-emerald-900/50 rounded-xl p-4 text-sm font-sans text-stone-300 focus:outline-none focus:border-emerald-700 resize-none"
              />
            </label>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={enhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              className="flex-1 py-3 rounded-xl border border-stone-700 text-stone-300 bg-stone-800/60 hover:bg-stone-800 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Prompt Enhancer
            </button>
            <button
              onClick={generate}
              disabled={isGenerating || !activePrompt.trim() || !selectedVoiceId}
              className="flex-1 py-3 rounded-xl bg-stone-200 text-stone-950 hover:bg-white transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </section>

        <aside className="min-h-0 flex flex-col gap-6">
          <section className="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-stone-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Preview</h2>
            </div>
            <div className="rounded-xl border border-stone-800 bg-stone-950 p-4">
              {previewUrl ? (
                <audio controls src={previewUrl} className="w-full" />
              ) : (
                <div className="h-16 flex items-center justify-center text-[10px] uppercase tracking-widest text-stone-700">
                  Generated audio opens in the editor
                </div>
              )}
            </div>
          </section>

          <section className="flex-1 min-h-0 bg-stone-900/50 border border-stone-800 rounded-2xl p-5 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-3.5 h-3.5 text-stone-500" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Generation History</h2>
              </div>
              {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin text-stone-600" />}
            </div>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-[10px] text-stone-600 italic">No previous generations found for this account.</p>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.history_item_id}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950/60 p-3 hover:border-stone-700 transition-all group flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">{item.voice_name}</span>
                         <span className="text-[8px] font-mono text-stone-700">{new Date(item.date_unix * 1000).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => playHistoryItem(item.history_item_id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            playingId === item.history_item_id 
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" 
                              : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          {playingId === item.history_item_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setPrompt(item.text)}
                          className="p-1.5 rounded-lg border bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 transition-all"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{item.text || "(SFX or other)"}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
