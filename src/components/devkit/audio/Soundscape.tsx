
import { Sliders, Volume2, VolumeX, Music, CloudRain, Zap, Mic, Wind } from "lucide-react";
import { AudioLayer, LayerState, LAYER_NAMES } from "../../../types/audio";

interface SoundscapeProps {
    masterVolume: number;
    layerStates: Record<AudioLayer, LayerState>;
    onMasterVolumeChange: (v: number) => void;
    onLayerVolumeChange: (layer: AudioLayer, v: number) => void;
    onToggleMute: (layer: AudioLayer) => void;
    onPanic: () => void;
}

export function Soundscape({ 
    masterVolume, 
    layerStates, 
    onMasterVolumeChange, 
    onLayerVolumeChange, 
    onToggleMute,
    onPanic 
}: SoundscapeProps) {
    
    const layerIcons: Record<AudioLayer, any> = {
        1: Music,      // Master Theme
        2: Wind,       // Atmosphere
        3: Wind,       // Environment
        4: Zap,        // Combat / Action
        5: Mic,        // Narrator / NPC
        6: Zap,        // Ability SFX
        7: Zap,        // Equipment SFX
        8: Music,      // UI Feedback
        9: Zap,        // Aux 1 (Magic)
        10: Wind,      // Aux 2 (Technical)
        11: CloudRain, // Weather
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Master Gain</span>
                </div>
                <button 
                    onClick={onPanic}
                    className="px-2 py-1 rounded bg-red-900/20 border border-red-900/50 text-red-500 text-[8px] font-bold uppercase tracking-widest hover:bg-red-900/40 transition-all"
                >
                    Panic
                </button>
            </div>

            <div className="px-4 py-3 rounded-xl bg-stone-900/50 border border-stone-800/50 space-y-3">
                <div className="flex items-center gap-4">
                    <Volume2 className="w-3.5 h-3.5 text-stone-600" />
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={masterVolume}
                        aria-label="Master volume"
                        onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 accent-stone-200 bg-stone-800 rounded-lg h-1 appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-stone-500 w-6 text-right">{Math.round(masterVolume * 100)}%</span>
                </div>
            </div>

            <div className="space-y-2">
                {(Object.keys(layerStates).map(Number) as AudioLayer[]).map((layer) => {
                    const Icon = layerIcons[layer] || Sliders;
                    const state = layerStates[layer];
                    const label = LAYER_NAMES[layer];
                    return (
                        <div key={layer} className="px-4 py-3 rounded-xl bg-stone-900/30 border border-stone-800/30 flex flex-col gap-3 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-3 h-3 ${state.isMuted ? "text-stone-700" : "text-stone-500"}`} />
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${state.isMuted ? "text-stone-700" : "text-stone-400"}`}>
                                        {label}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => onToggleMute(layer)}
                                    aria-label={state.isMuted ? `Unmute ${label}` : `Mute ${label}`}
                                    className={`p-1 rounded transition-colors ${state.isMuted ? "text-red-500 bg-red-500/10" : "text-stone-600 hover:text-stone-400"}`}
                                >
                                    {state.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01"
                                disabled={state.isMuted}
                                value={state.volume}
                                aria-label={`${label} volume`}
                                onChange={(e) => onLayerVolumeChange(layer, parseFloat(e.target.value))}
                                className={`w-full accent-stone-400 bg-stone-800 rounded-lg h-0.5 appearance-none cursor-pointer ${state.isMuted ? "opacity-20" : "opacity-60 group-hover:opacity-100 transition-opacity"}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
