import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Eye, FileJson, Lightbulb, Plus, Trash2, Zap, Palette, Activity, Sun, Thermometer, Play, Loader2, Waves, Clock, Target, Trash, MousePointer2, PlusCircle, Undo2, Layers, Repeat, Link2, Ghost, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useHueStore } from "../../../store/useHueStore";
import WaveSurfer from 'wavesurfer.js';
import { hexToXy, xyToHex, hexToHsv } from './colorUtils';
import { SporeType } from '../../../types/audio_kit';
import { ColorWheel } from './ColorWheel';

type InterpolationType = "linear" | "hold" | "ease-in" | "ease-out";

type Spore = {
  id: string;
  name: string;
  type: SporeType;
  targets: string[]; // Lamp IDs
  priority: number;
  loop: boolean;
  muted: boolean;
  timeline: LightNode[];
};

interface LightNode {
  time: number;
  brightness: number;
  color: { xy: { x: number; y: number } }; // Changed to Hue XY format
  interpolation: InterpolationType;
}

type SoundEvent = {
  event: string;
  sound: string;
  category?: string;
  loop: boolean;
  spores: Spore[];
};

const STARTER_EVENTS: SoundEvent[] = [
  {
    event: "explosion",
    sound: "explosion_large.wav",
    category: "sfx",
    loop: false,
    spores: [
      {
        id: "exp_flash",
        name: "Primary Blast",
        type: "action",
        targets: [],
        priority: 100,
        loop: false,
        muted: false,
        timeline: [ // Converted HEX to XY
          { time: 0.0, brightness: 100, color: { xy: { x: 0.57, y: 0.39 } }, interpolation: "linear" }, // Orange
          { time: 0.8, brightness: 0, color: { xy: { x: 0.3127, y: 0.329 } }, interpolation: "linear" } // White
        ]
      },
      {
        id: "exp_ambient",
        name: "Room Shock",
        type: "ambient",
        targets: [],
        priority: 50,
        loop: false,
        muted: false,
        timeline: [ // Converted HEX to XY
          { time: 0.0, brightness: 20, color: { xy: { x: 0.3127, y: 0.329 } }, interpolation: "linear" }, // Dark Grey (approx white)
          { time: 0.1, brightness: 0, color: { xy: { x: 0.3127, y: 0.329 } }, interpolation: "linear" }, // Black (approx white)
          { time: 1.2, brightness: 20, color: { xy: { x: 0.3127, y: 0.329 } }, interpolation: "linear" } // Dark Grey (approx white)
        ]
      }
    ]
  },
  {
    event: "Vuurbal",
    sound: "fireball.wav",
    loop: false,
    category: "sfx",
    spores: [
      {
        id: "fb_main",
        name: "Fire Core",
        type: "action",
        targets: [],
        priority: 80,
        loop: false,
        muted: false,
        timeline: [ // Converted HEX to XY
          { time: 0.0, brightness: 100, color: { xy: { x: 0.57, y: 0.39 } }, interpolation: "linear" }, // Orange
          { time: 1.65, brightness: 0, color: { xy: { x: 0.7006, y: 0.2993 } }, interpolation: "linear" } // Dark Red
        ]
      }
    ]
  },
  {
    event: "Blikseminslag",
    sound: "lightning.wav",
    category: "sfx",
    loop: false,
    spores: [
      {
        id: "lightning_core",
        name: "Main Bolt",
        type: "action",
        targets: [],
        priority: 100,
        loop: false,
        muted: false,
        timeline: [ // Converted HEX to XY
          { time: 0.0, brightness: 100, color: { xy: { x: 0.3127, y: 0.329 } }, interpolation: "linear" }, // White
          { time: 1.16, brightness: 0, color: { xy: { x: 0.15, y: 0.06 } }, interpolation: "linear" } // Blue
        ]
      }
    ]
  },
  {
    event: "Magische genezing",
    sound: "healing.wav",
    category: "sfx",
    loop: false,
    spores: [
      {
        id: "heal_aura",
        name: "Healing Aura",
        type: "action",
        targets: [],
        priority: 60,
        loop: false,
        muted: false,
        timeline: [ // Converted HEX to XY
          { time: 0.0, brightness: 50, color: { xy: { x: 0.21, y: 0.71 } }, interpolation: "linear" }, // Green
          { time: 1.8, brightness: 0, color: { xy: { x: 0.4448, y: 0.4066 } }, interpolation: "linear" } // Warm White
        ]
      }
    ]
  },
  {
    event: "hit",
    sound: "hit_short.wav",
    category: "sfx",
    loop: false,
    spores: [
      {
        id: "hit_flash",
        name: "Impact",
        type: "action",
        targets: [],
        priority: 100,
        loop: false,
        muted: false,
        timeline: [ // Converted HEX to XY
          { time: 0.0, brightness: 80, color: { xy: { x: 0.675, y: 0.322 } }, interpolation: "linear" }, // Red
          { time: 0.2, brightness: 0, color: { xy: { x: 0.675, y: 0.322 } }, interpolation: "linear" } // Red
        ]
      }
    ]
  }
];

const COLOR_COORD_MAP: Record<string, { xy: { x: number, y: number } }> = {
  // This map is no longer directly used for node color storage, but can be for initial defaults
  // or specific named colors. The editor now stores HEX and converts to XY on export/playback.
};

export function SpectralManipulation() {
  const { triggerHue, lights } = useHueStore();
  const [events, setEvents] = useState<SoundEvent[]>(STARTER_EVENTS);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio());

  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const [timelineRefs] = useState<Record<string, HTMLDivElement | null>>({});
  
  const [waveformLoading, setWaveformLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playProgress, setPlayProgress] = useState(0); // 0 to 100 percentage
  const [selectedSporeId, setSelectedSporeId] = useState<string | null>(STARTER_EVENTS[0].spores[0]?.id || null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "add">("select");
  const [isDragging, setIsDragging] = useState(false);

  // Undo History State
  const [history, setHistory] = useState<SoundEvent[][]>([STARTER_EVENTS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushToHistory = useCallback((newEvents: SoundEvent[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newEvents)));
    if (newHistory.length > 50) newHistory.shift(); // Limit history
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setEvents(JSON.parse(JSON.stringify(history[prevIndex])));
      setHistoryIndex(prevIndex);
      setSelectedNodeIndex(null);
    }
  }, [history, historyIndex]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.key === 'v') setActiveTool('select');
      if (e.key === 'a') setActiveTool('add');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);
  
  const selectedEvent = events[selectedIndex] || events[0];

  const jsonPreview = useMemo(() => JSON.stringify(selectedEvent, null, 2), [selectedEvent]);

  const [currentHexColor, setCurrentHexColor] = useState<string>('#FFFFFF');

  const activeSpore = useMemo(() => 
    selectedEvent.spores.find(s => s.id === selectedSporeId) || selectedEvent.spores[0],
    [selectedEvent, selectedSporeId]
  );

  const updateSelected = useCallback((patch: Partial<SoundEvent>) => {
    const nextEvents = events.map((event, index) => index === selectedIndex ? { ...event, ...patch } : event);
    setEvents(nextEvents);
  }, [events, selectedIndex]);

  const updateNode = useCallback((index: number, patch: Partial<LightNode>) => {
    if (!selectedSporeId) return;
    const nextSpores = selectedEvent.spores.map(s => {
      if (s.id !== selectedSporeId) return s;
      const timeline = [...s.timeline];
    timeline[index] = { ...timeline[index], ...patch };
    if (patch.time !== undefined) {
      timeline.sort((a, b) => a.time - b.time);
    }
      return { ...s, timeline };
    });
    updateSelected({ spores: nextSpores });
  }, [selectedEvent, updateSelected, selectedSporeId]);

  const deleteNode = (index: number) => {
    if (!selectedSporeId) return;
    const nextSpores = selectedEvent.spores.map(s => {
      if (s.id !== selectedSporeId) return s;
      return { ...s, timeline: s.timeline.filter((_, i) => i !== index) };
    });
    const nextEvents = events.map((event, idx) => idx === selectedIndex ? { ...event, spores: nextSpores } : event);
    setEvents(nextEvents);
    pushToHistory(nextEvents);
    setSelectedNodeIndex(null);
  };

  useEffect(() => {
    if (selectedNodeIndex !== null && activeSpore?.timeline[selectedNodeIndex]) {
      const color = activeSpore.timeline[selectedNodeIndex].color.xy;
      setCurrentHexColor(xyToHex(color.x, color.y, 100));
    }
  }, [selectedNodeIndex, activeSpore]);

  // Synchronization Guard: Ensure timeline nodes always fit within the audio duration
  useEffect(() => {
    if (totalDuration > 0 && selectedEvent.spores) {
      let hasChanged = false;
      const nextSpores = selectedEvent.spores.map(s => {
        const needsClamping = s.timeline.some(node => node.time > totalDuration);
        if (!needsClamping) return s;
        
        hasChanged = true;
        const clamped = s.timeline.map(node => ({
            ...node,
            time: Math.min(node.time, totalDuration)
          })).sort((a, b) => a.time - b.time).filter((n, i, self) => i === 0 || n.time !== self[i-1].time);
        return { ...s, timeline: clamped };
      });

      if (hasChanged) {
        updateSelected({ spores: nextSpores });
      }
    }
    // Only re-run when the duration or the specific event ID changes, 
    // NOT on the spores array itself to prevent loops.
  }, [totalDuration, selectedEvent.event, updateSelected]);

  useEffect(() => {
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audio]);

  // WaveSurfer initialization and loading
  useEffect(() => {
    if (!waveformContainerRef.current || !selectedEvent.sound) return;

    setWaveformLoading(true);
    const category = selectedEvent.category || "sfx";
    const rawUrl = `https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/sounds/${category}/${selectedEvent.sound}`;

    const ws = WaveSurfer.create({
      container: waveformContainerRef.current,
      waveColor: '#444',
      progressColor: '#888',
      cursorColor: '#fff',
      barWidth: 2,
      barRadius: 3,
      height: 80, // Smaller height for timeline
      url: rawUrl,
    });

    wavesurferRef.current = ws;
    ws.on('ready', () => {
      setWaveformLoading(false);
      setTotalDuration(ws.getDuration());
    });
    
    ws.on('audioprocess', (time) => {
      const dur = ws.getDuration();
      setPlayProgress((time / dur) * 100);
    });

    ws.on('finish', () => setPlayProgress(0));
    ws.on('error', (err) => { console.error("WaveSurfer error:", err); setWaveformLoading(false); });

    return () => { ws.destroy(); };
  }, [selectedEvent.sound, selectedEvent.category]); // Re-initialize when sound changes

  const handlePlay = async () => {
    if (!selectedEvent) return;
    setIsPlaying(true);

    try {
      // 1. Resolve Source (Point to GitHub raw to match Explorer success)
      const category = selectedEvent.category || "sfx";
      const rawUrl = `https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/sounds/${category}/${selectedEvent.sound}`;
      
      audio.src = rawUrl;
      audio.load();

      // 2. Buffer Sync (The 'Loader' support - wait for audio to be ready)
      await new Promise((resolve, reject) => {
        const onReady = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          resolve(true);
        };
        const onError = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          reject(new Error("Audio failed to load from repository"));
        };
        audio.addEventListener('canplaythrough', onReady);
        audio.addEventListener('error', onError);
        // Timeout if GitHub takes too long
        setTimeout(() => reject(new Error("Audio timeout")), 8000);
      });

      // 3. Synchronized Start
      audio.play().catch(e => console.warn("Audio playback blocked", e));

      if (wavesurferRef.current) {
        wavesurferRef.current.play();
      }

      const playSpore = async (spore: Spore) => {
        if (spore.muted || spore.timeline.length === 0) return;
        const timeline = spore.timeline;
        const targetIds = spore.targets;
        
        if (targetIds.length === 0) return;

        // Execute Initial State
        const initialState = {
          color: timeline[0].color, // Already in XY format
          dimming: { brightness: timeline[0].brightness }, 
          on: { on: timeline[0].brightness > 0 }, 
          dynamics: { duration: 0 } 
        };
        
        // Batch parallel requests for the bridge
        await Promise.all(targetIds.map(id => triggerHue(initialState, id)));

        // Execute Transitions
        for (let i = 0; i < timeline.length - 1; i++) {
          const curr = timeline[i];
          const next = timeline[i + 1];
          const durationMs = (next.time - curr.time) * 1000;

          await new Promise(r => setTimeout(r, durationMs));
          
          const transitionState = { 
            color: next.color, // Already in XY format
            dimming: { brightness: next.brightness }, 
            on: { on: next.brightness > 0 }, 
            dynamics: { duration: next.interpolation === 'hold' ? 0 : durationMs } 
          };

          // Fire and forget transitions to maintain timeline timing
          targetIds.forEach(id => triggerHue(transitionState, id));
        }
      };

      // Run all spores concurrently
      await Promise.all(selectedEvent.spores.map(playSpore));

      // Wait for audio completion
      await new Promise(resolve => {
        if (audio.ended) resolve(true);
        else audio.onended = () => resolve(true);
        setTimeout(resolve, (totalDuration * 1000) + 100); // Safety timeout
      });
    } catch (error) {
      console.error("Execution failed:", error);
      alert("Sequence synchronization failed. Check if audio exists in the repository.");
    } finally {
      setIsPlaying(false);
      setPlayProgress(0);
      if (wavesurferRef.current) {
        wavesurferRef.current.stop();
      }
    }
  };

  // Mouse Logic for Dragging and Adding
  const handleTimelineMouseDown = (e: React.MouseEvent, sporeId: string) => {
    const trackEl = timelineRefs[sporeId];
    if (!trackEl || isPlaying || waveformLoading) return;
    
    setSelectedSporeId(sporeId);
    
    const rect = trackEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = Number(((x / rect.width) * (totalDuration || 5)).toFixed(2));
    const brightness = Math.round(100 - (y / rect.height) * 100);

    if (activeTool === 'add') {
      const newNode: LightNode = {
        time,
        brightness: Math.max(0, Math.min(100, brightness)),
        color: { xy: hexToXy(currentHexColor) }, // Store as XY
        interpolation: "linear"
      };
      
      const nextSpores = selectedEvent.spores.map(s => {
        if (s.id !== sporeId) return s;
        return { ...s, timeline: [...s.timeline, newNode].sort((a, b) => a.time - b.time) };
      });

      const nextEvents = events.map((ev, i) => i === selectedIndex ? { ...ev, spores: nextSpores } : ev);
      setEvents(nextEvents);
      pushToHistory(nextEvents);
      setSelectedNodeIndex(nextSpores.find(s => s.id === sporeId)!.timeline.findIndex(n => n.time === time));
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || selectedNodeIndex === null || !selectedSporeId) return;
    const trackEl = timelineRefs[selectedSporeId];
    if (!trackEl) return;
    
    const rect = trackEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const time = Math.max(0, Math.min(totalDuration || 5, (x / rect.width) * (totalDuration || 5)));
    const brightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));

    updateNode(selectedNodeIndex, { time: Number(time.toFixed(2)), brightness: Math.round(brightness) });
  }, [isDragging, selectedNodeIndex, totalDuration, updateNode, selectedSporeId, timelineRefs]);

  useEffect(() => {
      const handleMouseUpGlobal = () => {
        if (isDragging) {
          setIsDragging(false);
          pushToHistory(events);
        }
      };

      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUpGlobal);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
  }, [isDragging, handleMouseMove, events, pushToHistory]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    // handleTimelineClick is redundant as we now use handleTimelineMouseDown for tool logic
    // keeping empty to satisfy legacy JSX if any, but logic is moved to mouseDown
  };

  const addEvent = () => {
    const next: SoundEvent = {
      event: "new_event",
      sound: "new_sound.wav",
      category: "sfx",
      loop: false,
      spores: [
        {
          id: `spore_${Date.now()}`,
          name: "Default Track",
          type: "action",
          targets: [],
          priority: 50,
          loop: false,
          muted: false,
          timeline: [{ time: 0, brightness: 50, color: { xy: hexToXy("#FFFFFF") }, interpolation: "linear" }] // Store as XY
        }
      ]
    };
    const nextEvents = [...events, next];
    setEvents(nextEvents);
    pushToHistory(nextEvents);
    setSelectedIndex(events.length);
  };

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-200 overflow-hidden">
      <div className="border-b border-stone-800 p-4 bg-stone-900/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
              <Activity className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-widest">Spectral Manipulation</h1>
              <p className="text-[9px] text-stone-500 uppercase font-mono">V2 Trigger Synthesis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Tool Selection */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button 
                onClick={() => setActiveTool('select')}
                className={`p-2 rounded-lg transition-all ${activeTool === 'select' ? "bg-stone-200 text-stone-950" : "text-stone-500 hover:text-stone-300"}`}
                title="Select Tool (V)"
              >
                <MousePointer2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setActiveTool('add')}
                className={`p-2 rounded-lg transition-all ${activeTool === 'add' ? "bg-stone-200 text-stone-950" : "text-stone-500 hover:text-stone-300"}`}
                title="Add Node Tool (A)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-8 w-px bg-stone-800" />

            {/* Global Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-all disabled:opacity-20"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </div>

            <button
                onClick={handlePlay}
                disabled={isPlaying}
                className={`p-2 rounded-lg transition-all ${
                    isPlaying 
                    ? "bg-emerald-500/20 text-emerald-500 cursor-wait" 
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200 shadow-inner"
                }`}
                title="Execute Spectral Sequence"
            >
                {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>
            <button
                onClick={addEvent}
                className="p-2 rounded-lg bg-stone-200 text-stone-950 hover:bg-white transition-all shadow-lg active:scale-95"
            >
                <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Surface */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-600 ml-1">Sequence Registry</span>
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {events.map((event, index) => (
                <button
                  key={`${event.event}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedIndex === index ? "bg-stone-200 text-stone-950 border-stone-200 shadow-xl" : "border-stone-800 text-stone-600 hover:border-stone-600 hover:text-stone-400"
                  }`}
                >
                  {event.event}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <TextField label="Arcane Trigger ID" value={selectedEvent.event} onChange={(value) => updateSelected({ event: value })} />
            <TextField label="Map" value={selectedEvent.category || "sfx"} onChange={(value) => updateSelected({ category: value })} />
            <TextField label="Master Audio" value={selectedEvent.sound} onChange={(value) => updateSelected({ sound: value })} />
          </div>
          
          {/* Waveform Timeline */}
          <div className="space-y-4">
            {/* Audio Track Header */}
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-1">
                <div className="flex items-center gap-2 p-3">
                    <Waves className="w-3.5 h-3.5 text-stone-600" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Audio Master</span>
                </div>
                <div ref={waveformContainerRef} className="h-20 bg-stone-950/50 rounded-xl overflow-hidden relative">
                {waveformLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 z-10">
                        <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                    </div>
                )}
                    <div className="absolute top-0 bottom-0 w-px bg-emerald-500 z-40" style={{ left: `${playProgress}%` }} />
                </div>
            </div>

            {/* Spore Tracks */}
            <div className="space-y-3">
                {selectedEvent.spores.map((spore) => (
                    <div key={spore.id} className={`rounded-2xl border transition-all ${selectedSporeId === spore.id ? 'border-stone-500 bg-stone-900/40' : 'border-stone-800 bg-stone-900/10'}`}>
                        <div className="flex items-center justify-between p-3 border-b border-stone-800/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${spore.type === 'action' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">{spore.name}</span>
                                <span className="text-[8px] font-mono text-stone-600 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">PRIORITY: {spore.priority}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setSelectedSporeId(spore.id)}
                                    className={`p-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${selectedSporeId === spore.id ? 'bg-stone-200 text-stone-950' : 'text-stone-500 hover:text-stone-300'}`}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => {
                                        const nextSpores = selectedEvent.spores.map(s => s.id === spore.id ? { ...s, muted: !s.muted } : s);
                                        updateSelected({ spores: nextSpores });
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${spore.muted ? 'bg-rose-500/20 text-rose-500' : 'text-stone-600'}`}
                                >
                                    <VolumeX className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div 
                            className={`relative h-[120px] bg-stone-950/30 overflow-hidden ${activeTool === 'add' ? 'cursor-crosshair' : 'cursor-default'}`}
                            ref={(el) => { timelineRefs[spore.id] = el; }}
                            onMouseDown={(e) => handleTimelineMouseDown(e, spore.id)}
                        >
                            {/* Linear Path */}
                            <svg className="absolute inset-0 pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                    d={spore.timeline.map((node, i, arr) => {
                                        const x = (node.time / (totalDuration || 5)) * 100;
                                        const y = 100 - node.brightness;
                                        if (i === 0) return `M ${x} ${y}`;
                                        const prev = arr[i-1];
                                        if (node.interpolation === 'hold') return `L ${x} ${100 - prev.brightness} L ${x} ${y}`;
                                        return `L ${x} ${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke={spore.type === 'action' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}
                                    strokeWidth="1.5"
                                />
                            </svg>

                            {/* Playhead */}
                            <div className="absolute top-0 bottom-0 w-px bg-emerald-500/20 z-10" style={{ left: `${playProgress}%` }} />

                            {/* Nodes */}
                            {spore.timeline.map((node, i) => (
                                <motion.div
                                    key={`${spore.id}-node-${i}`}
                                    className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 z-30 transition-shadow ${selectedSporeId === spore.id && selectedNodeIndex === i ? 'border-white shadow-[0_0_12px_white]' : 'border-stone-700 shadow-lg'}`}
                                    style={{ 
                                        left: `${(node.time / (totalDuration || 5)) * 100}%`, 
                                        top: `${100 - node.brightness}%`,
                                        backgroundColor: xyToHex(node.color.xy.x, node.color.xy.y, 100)
                                    }}
                                    onMouseDown={(e) => {
                                        if (activeTool !== 'select') return;
                                        e.stopPropagation();
                                        setSelectedSporeId(spore.id);
                                        setSelectedNodeIndex(i);
                                        setIsDragging(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => {
                        const newSpore: Spore = {
                            id: `spore_${Date.now()}`,
                            name: "New Spore Track",
                            type: "action",
                            targets: [],
                            priority: 50,
                            loop: false,
                            muted: false,
                            timeline: [{ time: 0, brightness: 50, color: { xy: hexToXy("#FFFFFF") }, interpolation: "linear" }]
                        };
                        updateSelected({ spores: [...selectedEvent.spores, newSpore] });
                    }}
                    className="w-full py-3 rounded-2xl border border-dashed border-stone-800 text-stone-600 hover:border-stone-600 hover:text-stone-400 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Spore Track
                </button>
            </div>
        </div>
      </div>

        {/* Right Aside: Spore & Node Meta */}
        <aside className="w-[380px] flex-shrink-0 border-l border-stone-800 bg-stone-900/10 flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Spore-Level Configuration */}
            {activeSpore && (
              <section className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Spore Settings</span>
                  </div>
                  <button 
                    onClick={() => {
                        const next = selectedEvent.spores.filter(s => s.id !== activeSpore.id);
                        updateSelected({ spores: next });
                        setSelectedSporeId(next[0]?.id || null);
                    }}
                    className="text-stone-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <TextField label="Spore Name" value={activeSpore.name} onChange={(v) => {
                    const next = selectedEvent.spores.map(s => s.id === activeSpore.id ? { ...s, name: v } : s);
                    updateSelected({ spores: next });
                  }} />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        const next = selectedEvent.spores.map(s => s.id === activeSpore.id ? { ...s, type: 'ambient' as SporeType } : s);
                        updateSelected({ spores: next });
                      }}
                      className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${activeSpore.type === 'ambient' ? 'bg-stone-200 text-stone-950 border-stone-200' : 'bg-stone-950 border-stone-800 text-stone-600'}`}
                    >
                      Ambient
                    </button>
                    <button 
                      onClick={() => {
                        const next = selectedEvent.spores.map(s => s.id === activeSpore.id ? { ...s, type: 'action' as SporeType } : s);
                        updateSelected({ spores: next });
                      }}
                      className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${activeSpore.type === 'action' ? 'bg-stone-200 text-stone-950 border-stone-200' : 'bg-stone-950 border-stone-800 text-stone-600'}`}
                    >
                      Action
                    </button>
                  </div>

                  <NumberField label="Priority (0-100)" value={activeSpore.priority} min={0} max={100} step={1} onChange={(v) => {
                    const next = selectedEvent.spores.map(s => s.id === activeSpore.id ? { ...s, priority: v } : s);
                    updateSelected({ spores: next });
                  }} />
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-800/50">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-600 ml-1 flex items-center gap-2">
                    <Link2 className="w-3 h-3" /> Assigned Targets
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {lights.map(light => (
                      <button 
                        key={light.id} 
                        onClick={() => {
                            const targets = activeSpore.targets.includes(light.id) 
                                ? activeSpore.targets.filter(id => id !== light.id)
                                : [...activeSpore.targets, light.id];
                            const next = selectedEvent.spores.map(s => s.id === activeSpore.id ? { ...s, targets } : s);
                            updateSelected({ spores: next });
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg border text-[10px] font-medium transition-all ${activeSpore.targets.includes(light.id) ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200' : 'bg-stone-950 border-stone-800 text-stone-700'}`}
                      >
                        <span>{light.metadata.name}</span>
                        {activeSpore.targets.includes(light.id) && <Zap className="w-3 h-3 fill-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-6">
              <div className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Layer Logic</span>
              </div>
              
              <button 
                onClick={() => updateSelected({ loop: !selectedEvent.loop })}
                className={`w-full py-3 rounded-xl border flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedEvent.loop ? "bg-blue-500/10 border-blue-500/50 text-blue-400" : "bg-stone-950 border-stone-800 text-stone-600"}`}
              >
                <Repeat className={`w-3.5 h-3.5 ${selectedEvent.loop ? "animate-spin-slow" : ""}`} />
                {selectedEvent.loop ? "Looping Enabled" : "One-Shot Effect"}
              </button>
            </section>

            {selectedNodeIndex !== null && activeSpore?.timeline[selectedNodeIndex] && (
              <section className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{activeSpore.type.toUpperCase()} NODE META</span>
                  </div>
                  <button onClick={() => deleteNode(selectedNodeIndex)} className="text-stone-600 hover:text-rose-400 transition-colors">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <NumberField label="Timestamp" value={activeSpore.timeline[selectedNodeIndex].time} min={0} max={totalDuration || 5} step={0.01} onChange={(v) => updateNode(selectedNodeIndex, { time: v })} />
                  <NumberField label="Brightness %" value={activeSpore.timeline[selectedNodeIndex].brightness} min={0} max={100} step={1} onChange={(v) => updateNode(selectedNodeIndex, { brightness: v })} />
                </div>
                
                <div className="flex flex-col gap-4">
                  <ColorWheel 
                    color={xyToHex(activeSpore.timeline[selectedNodeIndex].color.xy.x, activeSpore.timeline[selectedNodeIndex].color.xy.y, 100)} // Convert XY to HEX for ColorWheel
                    onChange={(hex) => updateNode(selectedNodeIndex, { color: { xy: hexToXy(hex) } })} // Convert HEX to XY for storage
                  />
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-600 ml-1">Transition</label>
                    <select 
                      value={activeSpore.timeline[selectedNodeIndex].interpolation || "linear"}
                      onChange={(e) => updateNode(selectedNodeIndex, { interpolation: e.target.value as InterpolationType })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none"
                    >
                      <option value="linear">Linear (Smooth Fade)</option>
                      <option value="hold">Hold (Instant Step)</option>
                      <option value="ease-in">Ease In</option>
                      <option value="ease-out">Ease Out</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            <div className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-inner">
              <div className="p-4 border-b border-stone-900 flex items-center justify-between bg-stone-900/40">
                <div className="flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5 text-stone-600" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Source Registry</span>
                </div>
                <button 
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 disabled:opacity-50 transition-all"
                >
                    {isPlaying ? "Syncing..." : "Bake Test"}
                </button>
              </div>
              <pre className="p-5 text-[10px] leading-relaxed text-emerald-500/60 font-mono whitespace-pre-wrap h-64 overflow-y-auto custom-scrollbar">{jsonPreview}</pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-sans text-stone-300 focus:outline-none focus:border-stone-600"
      />
    </label>
  );
}

function NumberField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-sans text-stone-300 focus:outline-none focus:border-stone-600"
      />
    </label>
  );
}
