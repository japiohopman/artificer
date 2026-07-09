import { useMemo, useState, useEffect } from "react";
import { CloudRain, Layers, Loader2, Music, RefreshCw, Sparkles, Wand2, Folder, Map as MapIcon, History, Play, Repeat, Settings2, Hammer, Zap, MousePointer2 } from "lucide-react";
import { Environment } from "../../../types/audio_kit";
import { Howl } from 'howler';

interface GenerateSfxProps {
  activeEnvironment: Environment | null;
  onGenerate: (data: { prompt: string; category: string; filename: string; isLoop: boolean; duration: number; accountIndex?: number }) => Promise<void>;
}

// --- Dynamic Config Definitions ---

const REPO_MAPS = [
  { id: 'ambient', label: 'Ambient', autoLoop: true, icon: MapIcon },
  { id: 'sfx', label: 'SFX', autoLoop: false, icon: Zap },
  { id: 'weather', label: 'Weather', autoLoop: true, icon: CloudRain },
  { id: 'system', label: 'System', autoLoop: false, icon: MousePointer2 },
  { id: 'music', label: 'Music', autoLoop: true, icon: Music },
  { id: 'environment', label: 'Env', autoLoop: false, icon: Settings2 },
];

const CATEGORY_CONFIGS: Record<string, any> = {
  ambient: {
    fields: [
      { id: 'region', label: 'Region', options: ["Temperate wilderness", "Deep Dungeon", "Coastal", "Mountain Peaks", "Urban Hub", "Infernal Abyss", "Feywild"] },
      { id: 'time', label: 'Time', options: ["Dawn", "Day", "Dusk", "Night"] },
      { id: 'weather', label: 'Weather', options: ["Clear", "Light Rain", "Heavy Rain", "Snow", "Distant Thunder", "Windy"] },
      { id: 'event', label: 'Activity', options: ["Exploration", "Combat tension", "Magic surge", "Stealth", "Campfire rest"] }
    ]
  },
  sfx: {
    fields: [
      { id: 'material', label: 'Material', options: ["Metal / Blade", "Stone / Earth", "Wood / Bark", "Flesh / Impact", "Dragon-scale", "Adamantine"] },
      { id: 'impact', label: 'Impact Size', options: ["Small / Trivial", "Medium / Standard", "Large / Heavy", "Colossal / Earth-shattering"] },
      { id: 'energy', label: 'Energy Type', options: ["Physical", "Arcane / Magic", "Necrotic", "Divine / Radiant", "Elemental (Fire/Ice)"] },
      { id: 'distance', label: 'Distance', options: ["Close-up", "Moderate", "Distant Echo"] }
    ]
  },
  system: {
    fields: [
      { id: 'ui_type', label: 'UI Action', options: ["Button Click", "Hover / Focus", "Menu Open", "Success Sting", "Error / Warning", "Quest Update"] },
      { id: 'aesthetic', label: 'Aesthetic', options: ["Arcane / Crystal", "Mechanical / Clockwork", "Ethereal / Ghostly", "Minimal / Modern", "Gritty / Tactile"] },
      { id: 'weight', label: 'UI Weight', options: ["Light / Delicate", "Standard", "Heavy / Significant"] }
    ]
  },
  weather: {
    fields: [
      { id: 'type', label: 'Weather Type', options: ["Rain", "Wind", "Thunderstorm", "Blizzard", "Sandstorm", "Magical Flux"] },
      { id: 'intensity', label: 'Intensity', options: ["Subtle / Background", "Steady", "Intense / Stormy", "Extreme / Catastrophic"] },
      { id: 'setting', label: 'Environment', options: ["Open Field", "Thick Forest", "Inside Cave", "Inside Building", "Underground Complex"] }
    ]
  }
};

// --- Component Helpers ---

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600 ml-1">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-[11px] font-sans text-stone-400 focus:outline-none focus:border-stone-600 appearance-none cursor-pointer hover:bg-stone-900 transition-colors"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-700 text-[8px]">▼</div>
      </div>
    </label>
  );
}

// --- Main Component ---

export function GenerateSfx({ activeEnvironment, onGenerate }: GenerateSfxProps) {
  const [category, setCategory] = useState('ambient');
  const [contextState, setContextState] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState(10);
  const [loopMode, setLoopMode] = useState(true);
  const [accountIndex, setAccountIndex] = useState(0);
  
  const [prompt, setPrompt] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Initialize context state when category changes
  useEffect(() => {
    const config = CATEGORY_CONFIGS[category];
    if (config) {
      const newState: Record<string, string> = {};
      config.fields.forEach((f: any) => newState[f.id] = f.options[0]);
      setContextState(newState);
    }
  }, [category]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/audio/history?accountIndex=${accountIndex}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history?.length > 0) {
            console.log("[ElevenLabs] SFX Tab History Sample:", data.history.slice(0, 3));
        }
        // Be more aggressive in filtering: Only show if it's explicitly sound effects or lacks voice_id
        // We'll refine this once we see the log output
        const sfxHistory = (data.history || []).filter((item: any) => {
           // If we don't know yet, let's just log and filter by lack of voice_id for now
           return !item.voice_id && item.source !== 'TTS';
        });
        setHistory(sfxHistory);
      }
    } catch (error) {
      console.error("Failed to fetch ElevenLabs history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [accountIndex]);

  const playHistoryItem = async (itemId: string) => {
    if (playingId === itemId) { setPlayingId(null); return; }
    setPlayingId(itemId);
    try {
      const res = await fetch(`/api/audio/history/${itemId}/audio?accountIndex=${accountIndex}`);
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

  const handleCategoryChange = (id: string) => {
    const map = REPO_MAPS.find(m => m.id === id);
    if (map) {
      setCategory(id);
      setLoopMode(map.autoLoop);
    }
  };

  const environmentName = activeEnvironment?.name || "Unselected Scene";

  const contextPrompt = useMemo(() => {
    const config = CATEGORY_CONFIGS[category];
    if (!config) return prompt;

    let parts: string[] = [];

    if (category === 'system') {
      parts = [
        `High-quality fantasy UI ${contextState.ui_type} sound:`,
        `Aesthetic: ${contextState.aesthetic}, ${contextState.weight} impact`,
        "Technical: clean transient, crystalline clarity, no reverb tail unless arcane, minimal and satisfying."
      ];
    } else if (category === 'sfx') {
      parts = [
        `Cinematic fantasy sound effect:`,
        `Action: impact on ${contextState.material}, ${contextState.impact} magnitude`,
        `Energy: ${contextState.energy}, Heard from ${contextState.distance}`,
        "Technical: punchy dynamics, detailed textures, high-fidelity production."
      ];
    } else if (category === 'ambient' || category === 'weather') {
      parts = [
        `Immersive fantasy ${category} loop:`,
        `Environment: ${environmentName}`,
        `Context: ${Object.values(contextState).join(", ")}`,
        "Technical: deep layering, immersive field recording style, seamless loop points, no speech, no music."
      ];
    } else {
      parts = [`Fantasy ${category} audio for ${environmentName}.`];
    }

    if (loopMode) parts.push("Seamless loop synthesis.");
    return parts.join("\n");
  }, [category, contextState, environmentName, loopMode, prompt]);

  const activePrompt = prompt || contextPrompt;

  const optimizePrompt = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/gemini/optimize-sound-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt, category })
      });
      const data = await res.json();
      if (data.optimizedPrompt) setPrompt(data.optimizedPrompt);
    } catch (error) {
      console.error("SFX prompt optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const generate = async () => {
    setIsGenerating(true);
    try {
      const filename = slugify(`${environmentName}_${category}_${Date.now()}`);
      await onGenerate({
        prompt: activePrompt,
        category,
        filename,
        isLoop: loopMode,
        duration,
        accountIndex
      });
      setTimeout(fetchHistory, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-200">
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_320px] overflow-hidden">
        
        {/* LEFT: SETTINGS (DYNAMIC) */}
        <section className="border-r border-stone-800 bg-stone-900/20 p-5 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2">
            <Hammer className="w-3.5 h-3.5 text-stone-600" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Forge Config</h2>
          </div>

          <div className="space-y-3">
             <span className="text-[9px] font-bold uppercase text-stone-600 ml-1">Asset Category</span>
             <div className="grid grid-cols-2 gap-1.5">
              {REPO_MAPS.map((map) => {
                const Icon = map.icon;
                return (
                  <button
                    key={map.id}
                    onClick={() => handleCategoryChange(map.id)}
                    className={`px-2 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                      category === map.id 
                      ? "bg-stone-200 text-stone-950 border-stone-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                      : "bg-stone-950 border-stone-800 text-stone-600 hover:border-stone-700 hover:text-stone-400"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {map.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800 space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-stone-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Forge Context</h2>
            </div>
            
            <div className="space-y-4">
              {/* Common Environment Info */}
              {(category === 'ambient' || category === 'weather') && (
                <div className="p-3 rounded-xl border border-stone-800 bg-stone-950/40">
                  <span className="text-[9px] font-bold uppercase text-stone-700 block mb-1">Target Environment</span>
                  <span className="text-[11px] text-stone-400 truncate block">{environmentName}</span>
                </div>
              )}

              {/* Dynamic Fields based on config */}
              {CATEGORY_CONFIGS[category]?.fields.map((field: any) => (
                <SelectField 
                  key={field.id}
                  label={field.label} 
                  value={contextState[field.id] || ""} 
                  options={field.options} 
                  onChange={(v) => setContextState(prev => ({ ...prev, [field.id]: v }))} 
                />
              ))}

              <div className="space-y-2 p-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600 ml-1">Length</span>
                  <span className="text-[10px] font-mono text-stone-400 font-bold">{duration}s</span>
                </div>
                <input 
                  type="range" min="1" max="25" step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full accent-stone-200 bg-stone-900 rounded-lg h-1 appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setLoopMode(!loopMode)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${loopMode ? "bg-stone-800 border-stone-600 text-stone-200" : "bg-stone-950/40 border-stone-800 text-stone-600"}`}
                >
                  <span className="text-[10px] uppercase font-bold">Seamless Loop</span>
                  <div className={`w-3 h-3 rounded-full ${loopMode ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-stone-800"}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CENTER: FORGE */}
        <section className="flex flex-col bg-stone-950 p-8 gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-stone-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Synthesis Instruction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono uppercase p-1 px-2 rounded bg-stone-900 border border-stone-800 ${loopMode ? 'text-emerald-500' : 'text-stone-600'}`}>
                  {loopMode ? 'Looping' : 'One-Shot'}
                </span>
              </div>
            </div>
            
            <textarea
              value={activePrompt}
              onChange={(e) => { setPrompt(e.target.value); }}
              placeholder="Describe the magical properties of your sound..."
              className="flex-1 bg-stone-900/40 border border-stone-800 rounded-2xl p-6 text-sm font-sans text-stone-300 focus:outline-none focus:border-stone-700 resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 rounded-xl bg-stone-900/20 border border-stone-800 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                   <Folder className="w-3 h-3 text-stone-700" />
                   <span className="text-[9px] font-bold uppercase text-stone-600">Target Path</span>
                </div>
                <span className="text-[9px] font-mono text-stone-500">assets/sounds/{category}/[filename].wav</span>
             </div>
             
             <div className="p-4 rounded-xl bg-stone-900/20 border border-stone-800">
                <SelectField 
                  label="Synthesis Account" 
                  value={["Account 1", "Account 2", "Account 3"][accountIndex]} 
                  options={["Account 1", "Account 2", "Account 3"]} 
                  onChange={(v) => {
                    if (v.includes("1")) setAccountIndex(0);
                    else if (v.includes("2")) setAccountIndex(1);
                    else setAccountIndex(2);
                  }} 
                />
             </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={optimizePrompt}
              disabled={isOptimizing}
              className="flex-1 py-4 rounded-2xl border border-stone-800 bg-stone-900/40 text-stone-400 hover:text-stone-200 hover:border-stone-700 transition-all text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Optimize Prompt
            </button>
            <button
              onClick={generate}
              disabled={isGenerating}
              className="flex-[2] py-4 rounded-2xl bg-stone-200 text-stone-950 hover:bg-white transition-all text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-40 shadow-xl"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Ignite Forge
            </button>
          </div>
        </section>

        {/* RIGHT: HISTORY */}
        <aside className="border-l border-stone-800 bg-stone-900/20 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Spectral Feedback</h2>
            </div>
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
               <p className="text-[10px] text-stone-500 leading-relaxed italic">
                 The forge is calibrated for {category} assets. Higher duration allows for more detailed textures.
               </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 pt-6 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-stone-600" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Echoes (History)</h2>
              </div>
              {isLoadingHistory && <Loader2 className="w-3 h-3 animate-spin text-stone-600" />}
            </div>
            {history.length === 0 ? (
              <p className="text-[10px] text-stone-700 italic">No arcane echoes detected.</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.history_item_id}
                    className="w-full text-left rounded-lg border border-stone-800 bg-stone-950/40 p-3 hover:border-stone-700 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-mono text-stone-600 group-hover:text-stone-400">{new Date(item.date_unix * 1000).toLocaleTimeString()}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => playHistoryItem(item.history_item_id)}
                          className={`p-1 rounded bg-stone-900 border border-stone-800 transition-all ${
                            playingId === item.history_item_id ? "text-emerald-500 border-emerald-500/30" : "text-stone-500 hover:text-stone-200"
                          }`}
                        >
                          {playingId === item.history_item_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => setPrompt(item.text)}
                          className="p-1 rounded bg-stone-900 border border-stone-800 text-stone-500 hover:text-stone-200"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">{item.text || "(SFX)"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
