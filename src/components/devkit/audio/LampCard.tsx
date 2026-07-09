
import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { HueLight } from "../../../types/audio_kit";

interface LampCardProps {
    key?: string;
    light: HueLight;
    isSelected: boolean;
    onSelect: () => void;
    onToggle: (e: React.MouseEvent) => void;
    onBrightnessChange: (value: number) => void;
}

export function LampCard({ light, isSelected, onSelect, onToggle, onBrightnessChange }: LampCardProps) {
    const isPlaystation = light.metadata.name.toLowerCase().includes("playstation");
    
    // Determine archetype icon
    const getIcon = () => {
        if (isPlaystation) return "🎮";
        const archetype = light.metadata.archetype?.toLowerCase();
        if (archetype?.includes("candle")) return "🕯️";
        if (archetype?.includes("lamp")) return "🏮";
        if (archetype?.includes("ceiling")) return "🏠";
        return light.on?.on ? "💡" : "🌑";
    };

    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col group ${
                isSelected 
                ? "bg-stone-800 border-stone-400 shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
                : "bg-stone-900/40 border-stone-800 hover:border-stone-700"
            }`}
            onClick={onSelect}
        >
            {isPlaystation && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse z-10" />
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${light.on?.on ? "bg-stone-100 shadow-[0_0_8px_white]" : "bg-stone-700"}`} />
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${light.on?.on ? "text-stone-100" : "text-stone-500"}`}>
                            {light.metadata.name}
                        </h3>
                    </div>
                    <span className="text-[9px] font-mono text-stone-600 uppercase tracking-tighter">
                        CID: {light.id.slice(0, 8)}
                    </span>
                </div>
                
                <button 
                  onClick={onToggle}
                  aria-label={`Toggle ${light.metadata.name} power`}
                  className={`p-2 rounded-lg border transition-all ${
                    light.on?.on 
                    ? "bg-stone-200 text-stone-950 border-stone-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                    : "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
                  }`}
                >
                    <Zap className={`w-3.5 h-3.5 ${light.on?.on ? "fill-stone-950" : ""}`} />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center py-6">
                <div className={`text-4xl transition-all duration-700 ${light.on?.on ? "scale-110 opacity-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "scale-100 opacity-20 grayscale"}`}>
                    {getIcon()}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-stone-800/50 flex flex-col gap-2 bg-stone-900/50 -mx-5 -mb-5 px-5 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-stone-600 font-sans uppercase tracking-tight">Brightness</span>
                        <span className="text-[10px] text-stone-400 font-mono font-bold">{Math.round(light.dimming?.brightness || 0)}%</span>
                    </div>
                    {isSelected && (
                        <div className="text-[8px] uppercase tracking-[0.2em] font-bold text-stone-200 bg-stone-700 px-2 py-1 rounded shadow-inner">
                            Focused
                        </div>
                    )}
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1"
                    value={Math.round(light.dimming?.brightness || 0)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        e.stopPropagation();
                        onBrightnessChange(parseFloat(e.target.value));
                    }}
                    className="w-full accent-stone-200 bg-stone-800 rounded-lg h-1 appearance-none cursor-pointer"
                />
            </div>
        </motion.div>
    );
}
