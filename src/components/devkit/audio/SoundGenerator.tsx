
import { Wand2, Mic, Music, Loader2, Sparkles, X, Save, Folder, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SoundGeneratorProps {
    initialPrompt?: string;
    onClose: () => void;
    onGenerate: (data: { 
        prompt: string, 
        category: string, 
        filename: string, 
        isLoop: boolean,
        accountIndex: number
    }) => Promise<void>;
}

const CATEGORIES = [
    { id: 'ambient', label: 'Ambient', autoLoop: true },
    { id: 'environment', label: 'Environment', autoLoop: false },
    { id: 'music', label: 'Music', autoLoop: true },
    { id: 'npc_voice', label: 'NPC Voice', autoLoop: false },
    { id: 'sfx', label: 'SFX', autoLoop: false },
    { id: 'system', label: 'System', autoLoop: false },
    { id: 'weather', label: 'Weather', autoLoop: true }
];

export function SoundGenerator({ initialPrompt, onClose, onGenerate }: SoundGeneratorProps) {
    const [prompt, setPrompt] = useState(initialPrompt || "");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [category, setCategory] = useState('sfx');
    const [filename, setFilename] = useState("");
    const [isLoop, setIsLoop] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [accountIndex, setAccountIndex] = useState(0);

    // Auto-loop and filename logic
    useEffect(() => {
        const cat = CATEGORIES.find(c => c.id === category);
        if (cat) {
            setIsLoop(cat.autoLoop);
        }
    }, [category]);

    useEffect(() => {
        if (!filename && initialPrompt) {
            setFilename(initialPrompt.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20));
        }
    }, [initialPrompt]);

    const handleOptimize = async () => {
        if (!prompt) return;
        setIsOptimizing(true);
        try {
            const res = await fetch("/api/gemini/optimize-sound-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, category })
            });
            const data = await res.json();
            if (data.optimizedPrompt) {
                setPrompt(data.optimizedPrompt);
            }
        } catch (e) {
            console.error("Optimization failed:", e);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await onGenerate({ prompt, category, filename, isLoop, accountIndex });
        } finally {
            setIsGenerating(false);
        }
    };

    const githubPath = `public/assets/sounds/${category}/${filename || '[name]'}.wav`;

    return (
        <div className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-850">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-800 rounded-lg">
                            <Wand2 className="w-5 h-5 text-stone-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-200">Asset Generation Engine</h3>
                            <p className="text-[10px] text-stone-500 font-sans">Automated Audio Synthesis Suite</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close sound generator" className="p-2 hover:bg-white/5 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Prompt Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-widest">Synthesis Instruction</label>
                            <button 
                                onClick={handleOptimize}
                                disabled={isOptimizing || !prompt}
                                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-tighter text-stone-400 hover:text-stone-200 transition-colors disabled:opacity-30"
                            >
                                {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Optimize for ElevenLabs
                            </button>
                        </div>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the audio properties in technical detail..."
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-[13px] font-sans h-24 focus:outline-none focus:border-stone-600 focus:ring-1 focus:ring-stone-600 transition-all text-stone-300 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Category & Loop */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="category-select" className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-widest">Target Category</label>
                                <select 
                                    id="category-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-[12px] font-sans focus:outline-none focus:border-stone-600 text-stone-300"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 px-1">
                                <input 
                                    type="checkbox" 
                                    id="loop-toggle"
                                    checked={isLoop}
                                    onChange={(e) => setIsLoop(e.target.checked)}
                                    className="w-4 h-4 rounded bg-stone-950 border-stone-800 text-stone-200 focus:ring-stone-800"
                                />
                                <label htmlFor="loop-toggle" className="text-[11px] font-sans text-stone-400 cursor-pointer select-none">
                                    Enable seamless temporal looping
                                </label>
                            </div>
                        </div>

                        {/* Filename & Account */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="account-select" className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-widest">Synthesis Account</label>
                                <select 
                                    id="account-select"
                                    value={accountIndex}
                                    onChange={(e) => setAccountIndex(parseInt(e.target.value))}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-[12px] font-sans focus:outline-none focus:border-stone-600 text-stone-300"
                                >
                                    <option value={0}>Account 1 (Dicerisk)</option>
                                    <option value={1}>Account 2 (Artificer)</option>
                                    <option value={2}>Account 3 (Alternate)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-widest">Resource Identifier</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                        placeholder="asset_name"
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 pr-12 text-[12px] font-mono focus:outline-none focus:border-stone-600 text-stone-400"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-700">.wav</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Path Preview */}
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-3">
                        <Folder className="w-4 h-4 text-stone-700" />
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-stone-700 tracking-tighter leading-none mb-1">Destination Path</span>
                            <span className="text-[10px] font-mono text-stone-500 break-all">{githubPath}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-stone-950 border-t border-stone-800">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt || !filename}
                        className="w-full py-4 bg-stone-200 text-stone-950 font-sans font-bold text-[11px] tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        INITIALIZE SYNTHESIS
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
