
import { motion } from "motion/react";
import { Sun, Thermometer, Palette, Zap, Wand2 } from "lucide-react";
import { HueLight } from "../../../types/audio_kit";
import { SPELLS } from "./data";
import { ColorWheel } from "./ColorWheel";
import { hexToXy, xyToHex, hexToHsv } from "./colorUtils";

interface LampControlsProps {
    light: HueLight;
    onUpdate: (settings: any) => void;
}

export function LampControls({ light, onUpdate }: LampControlsProps) {
    const hasDimming = !!light.dimming;
    const hasColor = !!light.color;
    const hasTemp = !!light.color_temperature;

    return (
        <div className="flex h-full bg-stone-950 text-stone-200 overflow-hidden border border-stone-800 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Panel: Service Meta */}
            <aside className="w-64 flex-shrink-0 border-r border-stone-800 bg-stone-900/20 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${light.on?.on ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-stone-800"}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${light.on?.on ? "text-emerald-500" : "text-stone-600"}`}>
                            {light.on?.on ? "Active" : "Dormant"}
                        </span>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold uppercase tracking-tight text-stone-100 leading-tight">
                            {light.metadata.name}
                        </h3>
                        <p className="text-[10px] font-mono text-stone-600 uppercase tracking-tighter">
                            ID: {light.id}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-stone-800/50 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-stone-600 uppercase tracking-widest">Archetype</p>
                            <p className="text-[11px] text-stone-400 capitalize">{light.metadata.archetype?.replace('_', ' ') || 'Standard Light'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/50 border border-stone-800">
                    <p className="text-[8px] font-mono text-stone-700 uppercase mb-1">Local Network Protocol</p>
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">HUE CLIP V2 / HTTPS</p>
                </div>
            </aside>

            {/* Center Panel: Visualization */}
            <main className="flex-1 min-w-0 flex items-center justify-center relative bg-stone-950">
                {light.on?.on && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        className="absolute w-64 h-64 rounded-full blur-[100px] bg-stone-100/10 pointer-events-none"
                    />
                )}
                <div className={`text-9xl transition-all duration-1000 ${light.on?.on ? "scale-110 opacity-100 drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]" : "scale-100 opacity-10 grayscale"}`}>
                    {light.metadata.name.toLowerCase().includes("playstation") ? "🎮" : 
                     light.metadata.archetype?.toLowerCase().includes("candle") ? "🕯️" : 
                     light.metadata.archetype?.toLowerCase().includes("lamp") ? "🏮" : "💡"}
                </div>
            </main>

            {/* Right Panel: Functional Controls */}
            <aside className="w-[440px] flex-shrink-0 border-l border-stone-800 bg-stone-900/10 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-stone-600" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Manual Interface</h2>
                </div>

                <div className="space-y-6">
                    {/* Brightness Control */}
                    {hasDimming && (
                        <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
                            <div className="flex items-center gap-3 text-stone-400">
                                <Sun className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Luminance</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={light.dimming?.brightness || 0}
                                aria-label="Brightness"
                                onChange={(e) => onUpdate({ dimming: { brightness: parseFloat(e.target.value) } })}
                                className="w-full accent-stone-200 bg-stone-800 rounded-lg h-1 appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-stone-600 uppercase">
                                <span>0%</span>
                                <span className="text-stone-300 font-bold">{Math.round(light.dimming?.brightness || 0)}%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    )}

                    {/* Temperature Control */}
                    {hasTemp && (
                        <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
                            <div className="flex items-center gap-3 text-stone-400">
                                <Thermometer className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Aura Warmth</span>
                            </div>
                            <input 
                                type="range" 
                                min={light.color_temperature?.mirek_schema?.mirek_minimum || 153} 
                                max={light.color_temperature?.mirek_schema?.mirek_maximum || 500} 
                                value={light.color_temperature?.mirek || 300}
                                aria-label="Color temperature"
                                onChange={(e) => onUpdate({ color_temperature: { mirek: parseInt(e.target.value) } })}
                                className="w-full bg-gradient-to-r from-blue-200 via-stone-100 to-orange-200 rounded-lg h-1 appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-stone-600 uppercase">
                                <span>Cold</span>
                                <span className="text-stone-300 font-bold">{light.color_temperature?.mirek} mireds</span>
                                <span>Warm</span>
                            </div>
                        </div>
                    )}

                    {/* Color Control */}
                    {hasColor && (
                        <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-5">
                            <div className="flex items-center gap-3 text-stone-400">
                                <Palette className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Chromatic Essence</span>
                            </div>
                            <ColorWheel 
                                color={light.color?.xy ? xyToHex(light.color.xy.x, light.color.xy.y, light.dimming?.brightness || 100) : "#FFFFFF"}
                                onChange={(hex) => onUpdate({ color: { xy: hexToXy(hex) } })}
                            />
                        </div>
                    )}
                </div>

                {/* Targeted Spellbook Integration */}
                <div className="space-y-4 pt-4 border-t border-stone-800/50">
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-3 h-3 text-stone-600" />
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-stone-600">Arcane Overrides</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {SPELLS.map((spell) => (
                            <motion.button
                                key={spell.id}
                                whileHover={{ y: -2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onUpdate(spell.hueSettings)}
                                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-800 bg-stone-950/40 py-3 group hover:bg-stone-800 transition-all"
                            >
                                <div className="text-xl group-hover:scale-110 transition-transform">{spell.icon}</div>
                                <span className="text-[8px] font-bold uppercase tracking-tighter text-stone-500 group-hover:text-stone-300 text-center px-1">
                                    {spell.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={() => onUpdate({ on: { on: !light.on?.on } })}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-sans font-bold text-xs tracking-[0.2em] uppercase transition-all border ${
                            light.on?.on 
                            ? "bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700 shadow-inner" 
                            : "bg-stone-200 text-stone-950 border-stone-200 hover:bg-white shadow-xl"
                        }`}
                    >
                        <Zap className={`w-4 h-4 ${light.on?.on ? "" : "fill-stone-950"}`} />
                        {light.on?.on ? "Extinguish" : "Ignite Source"}
                    </button>
                </div>
            </aside>
        </div>
    );
}
