import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugins/minimap.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
import {
    Play, Pause, Square, Scissors, X, Loader2, Save,
    ZoomIn, ZoomOut, Mic, MicOff, Sliders, Layers, RefreshCw,
    Undo, Trash2, VolumeX, TrendingUp, TrendingDown, Eye
} from 'lucide-react';
import { audioBufferToWav } from './audioUtils';
import { playClickSound, playSuccessSound } from '../../../services/storageService';

// Monkey-patch HTMLMediaElement.prototype.volume to prevent finite floating-point value crashes in Wavesurfer/Envelope plugins
if (typeof window !== 'undefined') {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
    if (descriptor && descriptor.set) {
        const originalSet = descriptor.set;
        Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
            set: function (val) {
                if (typeof val === 'number' && isFinite(val) && !isNaN(val)) {
                    originalSet.call(this, Math.max(0, Math.min(1, val)));
                } else {
                    // Quietly handle non-finite volume assignments
                    originalSet.call(this, 1.0);
                }
            },
            configurable: true
        });
    }
}

interface AudioEditorProps {
    fileBlob: Blob;
    fileName: string;
    onClose: () => void;
    onBake: (editedBlob: Blob, finalName: string, category: string) => Promise<void>;
    initialCategory?: string;
}

export function AudioEditor({ fileBlob, fileName, onClose, onBake, initialCategory }: AudioEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const spectrogramRef = useRef<HTMLDivElement>(null);

    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const regionsRef = useRef<any>(null);
    const recordRef = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [baking, setBaking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [finalName, setFinalName] = useState(fileName);
    const [optimizeForUI, setOptimizeForUI] = useState(false);
    const [targetCategory, setTargetCategory] = useState(initialCategory || 'sfx');

    // UI Controls for optional plugin layers
    const [showSpectrogram, setShowSpectrogram] = useState(false); // Default to false to save vertical space
    const [isRecording, setIsRecording] = useState(false);

    // Stateful audio content and history
    const [activeBlob, setActiveBlob] = useState<Blob>(fileBlob);
    const [history, setHistory] = useState<Blob[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    // Precise numeric trim settings
    const [trimStart, setTrimStart] = useState<number>(0);
    const [trimEnd, setTrimEnd] = useState<number>(0);

    // Custom Context Menu Popup
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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

    // Maintain a ref for looping to prevent stale closure in Wavesurfer finish listener
    const isLoopingRef = useRef(isLooping);
    useEffect(() => {
        isLoopingRef.current = isLooping;
    }, [isLooping]);

    // Initialize WaveSurfer exactly ONCE on mount
    useEffect(() => {
        if (!containerRef.current) return;

        const regionsPlugin = RegionsPlugin.create();

        const timelinePlugin = TimelinePlugin.create({
            container: timelineRef.current || undefined,
            height: 25,
            timeInterval: 1,
            primaryLabelInterval: 5,
            style: {
                color: '#a855f7',
                fontSize: '9px',
                fontFamily: 'monospace'
            }
        });

        const spectrogramPlugin = SpectrogramPlugin.create({
            container: spectrogramRef.current || undefined,
            labels: true,
            height: 40, // More compact spectrogram to fit screens perfectly
            splitChannels: false
        });

        const minimapPlugin = MinimapPlugin.create({
            height: 20,
            waveColor: 'rgba(147, 51, 234, 0.12)',
            progressColor: 'rgba(147, 51, 234, 0.35)'
        });

        const hoverPlugin = HoverPlugin.create({
            lineWidth: '1px',
            labelColor: '#ffffff',
            labelBackground: '#a855f7',
            labelSize: '10px'
        });

        const zoomPlugin = ZoomPlugin.create({
            scale: 0.5,
            maxZoom: 100
        });

        const recordPlugin = RecordPlugin.create({
            scrollingWaveform: true,
            renderRecordedAudio: true
        });
        recordRef.current = recordPlugin;

        const envelopePlugin = EnvelopePlugin.create({
            points: [
                { time: 0, volume: 1.0 },
                { time: 10, volume: 1.0 }
            ],
            lineWidth: '2px',
            lineColor: '#a855f7',
            dragLine: true
        });

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: 'rgba(147, 51, 234, 0.25)',
            progressColor: '#a855f7',
            cursorColor: '#c084fc',
            cursorWidth: 2,
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 90,
            autoCenter: true,
            normalize: true,
            plugins: [
                regionsPlugin,
                timelinePlugin,
                spectrogramPlugin,
                minimapPlugin,
                hoverPlugin,
                zoomPlugin,
                recordPlugin,
                envelopePlugin
            ]
        });

        wavesurferRef.current = ws;
        regionsRef.current = regionsPlugin;

        ws.on('ready', () => {
            setLoading(false);
            const totalDur = ws.getDuration();
            setDuration(totalDur);
            setTrimStart(0);
            setTrimEnd(totalDur);

            // Initialize Envelope points perfectly spanning the duration
            try {
                envelopePlugin.setPoints([
                    { time: 0, volume: 1.0 },
                    { time: totalDur, volume: 1.0 }
                ]);
            } catch (err) {
                console.warn("Failed to set envelope points:", err);
            }

            regionsPlugin.clearRegions();
            regionsPlugin.addRegion({
                id: 'trim-region',
                start: 0,
                end: totalDur,
                color: 'rgba(168, 85, 247, 0.18)',
                drag: true,
                resize: true
            });
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        ws.on('finish', () => {
            if (isLoopingRef.current) {
                ws.play();
            }
        });

        // Enable dragging to select regions on the wave
        regionsPlugin.enableDragSelection({
            color: 'rgba(168, 85, 247, 0.18)'
        });

        // Ensure exactly one active region exists
        regionsPlugin.on('region-created', (region: any) => {
            const allRegions = regionsPlugin.getRegions();
            allRegions.forEach((r: any) => {
                if (r !== region) {
                    r.remove();
                }
            });
            region.setOptions({
                id: 'trim-region',
                drag: true,
                resize: true
            });
            setTrimStart(region.start);
            setTrimEnd(region.end || ws.getDuration());
        });

        regionsPlugin.on('region-updated', (region: any) => {
            setTrimStart(region.start);
            setTrimEnd(region.end || ws.getDuration());
        });

        // When record completes, load the newly recorded sound
        recordPlugin.on('record-end', (blob: Blob) => {
            setActiveBlob(blob);
            setIsRecording(false);
        });

        return () => {
            try {
                ws.destroy();
            } catch (e) {
                console.warn("WaveSurfer cleanup warning:", e);
            }
        };
    }, []); // Runs exactly once on mount!

    // Load activeBlob URL dynamically when it changes
    useEffect(() => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        setLoading(true);
        const url = URL.createObjectURL(activeBlob);
        ws.load(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [activeBlob]);

    // Close right-click menu automatically when clicking anywhere else
    useEffect(() => {
        const handleClose = () => setContextMenu(null);
        window.addEventListener('click', handleClose);
        return () => window.removeEventListener('click', handleClose);
    }, []);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY
        });
        playClickSound();
    };

    // Buffer Operations
    const processBuffer = async (operation: (buffer: AudioBuffer, audioCtx: AudioContext, startSample: number, endSample: number) => AudioBuffer | void) => {
        const ws = wavesurferRef.current;
        const regions = regionsRef.current;
        if (!ws || !regions) return;

        const region = regions.getRegions().find((r: any) => r.id === 'trim-region') || regions.getRegions()[0];
        if (!region) return;

        setLoading(true);
        try {
            const arrayBuffer = await activeBlob.arrayBuffer();
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const fullBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            const sampleRate = fullBuffer.sampleRate;
            const startSample = Math.floor(region.start * sampleRate);
            const endSample = Math.min(fullBuffer.length, Math.floor((region.end || ws.getDuration()) * sampleRate));

            const result = operation(fullBuffer, audioCtx, startSample, endSample);
            const finalBuffer = result || fullBuffer;

            const wavBuffer = audioBufferToWav(finalBuffer);
            const newBlob = new Blob([wavBuffer], { type: 'audio/wav' });

            // Push to history
            setHistory(prev => [...prev.slice(0, historyIndex + 1), activeBlob]);
            setHistoryIndex(prev => prev + 1);

            setActiveBlob(newBlob);
            playSuccessSound();
        } catch (error) {
            console.error('Buffer processing failed:', error);
            alert('Failed to process audio wave operation');
        } finally {
            setLoading(false);
        }
    };

    const handleTrim = () => {
        processBuffer((fullBuffer, audioCtx, startSample, endSample) => {
            const frameCount = endSample - startSample;
            const trimmedBuffer = audioCtx.createBuffer(
                fullBuffer.numberOfChannels,
                frameCount,
                fullBuffer.sampleRate
            );

            for (let i = 0; i < fullBuffer.numberOfChannels; i++) {
                trimmedBuffer.getChannelData(i).set(
                    fullBuffer.getChannelData(i).subarray(startSample, endSample)
                );
            }
            return trimmedBuffer;
        });
    };

    const handleDeleteSegment = () => {
        processBuffer((fullBuffer, audioCtx, startSample, endSample) => {
            const deletedSamples = endSample - startSample;
            const newLength = fullBuffer.length - deletedSamples;
            if (newLength <= 0) {
                alert("Cannot delete the entire audio!");
                return;
            }

            const newBuffer = audioCtx.createBuffer(
                fullBuffer.numberOfChannels,
                newLength,
                fullBuffer.sampleRate
            );

            for (let channel = 0; channel < fullBuffer.numberOfChannels; channel++) {
                const channelData = fullBuffer.getChannelData(channel);
                const newChannelData = newBuffer.getChannelData(channel);
                newChannelData.set(channelData.subarray(0, startSample));
                newChannelData.set(channelData.subarray(endSample), startSample);
            }
            return newBuffer;
        });
    };

    const handleFadeIn = () => {
        processBuffer((fullBuffer, audioCtx, startSample, endSample) => {
            const fadeDurationSamples = Math.min(Math.floor(1.0 * fullBuffer.sampleRate), endSample - startSample);
            for (let channel = 0; channel < fullBuffer.numberOfChannels; channel++) {
                const channelData = fullBuffer.getChannelData(channel);
                for (let i = 0; i < fadeDurationSamples; i++) {
                    const progress = i / fadeDurationSamples;
                    channelData[startSample + i] *= progress;
                }
            }
        });
    };

    const handleFadeOut = () => {
        processBuffer((fullBuffer, audioCtx, startSample, endSample) => {
            const fadeDurationSamples = Math.min(Math.floor(1.0 * fullBuffer.sampleRate), endSample - startSample);
            const startFadeSample = endSample - fadeDurationSamples;
            for (let channel = 0; channel < fullBuffer.numberOfChannels; channel++) {
                const channelData = fullBuffer.getChannelData(channel);
                for (let i = 0; i < fadeDurationSamples; i++) {
                    const progress = 1.0 - (i / fadeDurationSamples);
                    channelData[startFadeSample + i] *= progress;
                }
            }
        });
    };

    const handleSilenceRegion = () => {
        processBuffer((fullBuffer, audioCtx, startSample, endSample) => {
            for (let channel = 0; channel < fullBuffer.numberOfChannels; channel++) {
                const channelData = fullBuffer.getChannelData(channel);
                for (let i = startSample; i < endSample; i++) {
                    channelData[i] = 0;
                }
            }
        });
    };

    const handleUndo = () => {
        if (historyIndex >= 0) {
            const prevBlob = history[historyIndex];
            setHistoryIndex(prev => prev - 1);
            setActiveBlob(prevBlob);
            playClickSound();
        }
    };

    const handleReset = () => {
        setHistory([]);
        setHistoryIndex(-1);
        setActiveBlob(fileBlob);
        playClickSound();
    };

    const handleBakeToDisk = async () => {
        setBaking(true);
        try {
            await onBake(activeBlob, finalName + (optimizeForUI ? '.ogg' : '.wav'), targetCategory);
        } catch (error) {
            console.error('Bake failed:', error);
            alert('Failed to bake sound asset to repository');
        } finally {
            setBaking(false);
        }
    };

    const handleZoomIn = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(wavesurferRef.current.options.minPxPerSec * 1.5);
        }
    };

    const handleZoomOut = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(wavesurferRef.current.options.minPxPerSec / 1.5);
        }
    };

    const handleToggleRecord = async () => {
        const recordPlugin = recordRef.current;
        if (!recordPlugin) return;

        if (isRecording) {
            recordPlugin.stopRecording();
            setIsRecording(false);
        } else {
            try {
                // Push current to history first
                setHistory(prev => [...prev.slice(0, historyIndex + 1), activeBlob]);
                setHistoryIndex(prev => prev + 1);

                await recordPlugin.startRecording();
                setIsRecording(true);
            } catch (err: any) {
                console.error("Microphone recording failed:", err);
                alert(`Microphone access failed: ${err.message}`);
            }
        }
    };

    const handleStartChange = (val: number) => {
        const start = Math.max(0, Math.min(val, duration));
        setTrimStart(start);

        const regions = regionsRef.current;
        if (regions) {
            const region = regions.getRegions().find((r: any) => r.id === 'trim-region') || regions.getRegions()[0];
            if (region) {
                region.setOptions({ start });
            }
        }
    };

    const handleEndChange = (val: number) => {
        const end = Math.max(trimStart, Math.min(val, duration));
        setTrimEnd(end);

        const regions = regionsRef.current;
        if (regions) {
            const region = regions.getRegions().find((r: any) => r.id === 'trim-region') || regions.getRegions()[0];
            if (region) {
                region.setOptions({ end });
            }
        }
    };

    const handlePlayPause = async () => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        try {
            const ctx = (ws as any).audioContext;
            if (ctx && ctx.state === 'suspended') {
                await ctx.resume();
            }
        } catch (err) {
            console.warn("Failed to resume AudioContext:", err);
        }

        ws.playPause();
    };

    return (
        <div className="bg-black/35 border border-white/5 rounded-2xl w-full h-full overflow-hidden shadow-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-300 relative text-left select-none">
            {/* Header - Fixed & Sticky */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/25 shrink-0 z-20">
                <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-purple-400 animate-pulse" />
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Audio Refining Studio</h3>
                </div>
                <button onClick={onClose} aria-label="Close audio editor" className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                    <X className="w-4.5 h-4.5" />
                </button>
            </div>

            {/* Scrollable Content Workspace */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-[#111]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase tracking-tighter ml-1">Final Resource Identifier</label>
                        <div className="flex items-center gap-2 bg-stone-950 border border-stone-850 rounded-xl p-2 px-3.5">
                            <input value={finalName} onChange={(e) => setFinalName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className="bg-transparent text-[12px] font-mono text-stone-300 focus:outline-none flex-1" placeholder="enter_filename" />
                            <span className="text-[10px] font-mono text-stone-600">{optimizeForUI ? '.ogg' : '.wav'}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase tracking-tighter ml-1">Professional Optimization</label>
                        <button
                            onClick={() => setOptimizeForUI(!optimizeForUI)}
                            className={`w-full flex items-center justify-between p-2 px-4 rounded-xl border transition-all h-[38px] ${optimizeForUI ? 'bg-purple-900/10 border-purple-500/40 text-purple-400 font-bold' : 'bg-stone-950 border-stone-850 text-stone-600'}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest">Low Latency (OGG)</span>
                            <div className={`w-2.5 h-2.5 rounded-full ${optimizeForUI ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-stone-800'}`} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-mono text-stone-500 uppercase tracking-tighter ml-1">Save Folder Map</label>
                        <select
                            value={targetCategory}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-850 rounded-xl p-2 px-4 text-[11px] text-stone-300 focus:outline-none focus:border-purple-500 font-sans h-[38px]"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-stone-900 text-white">
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Toolbar containing precise bounds + effects toolkits */}
                <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between items-center bg-stone-950/65 border border-stone-850 p-3 px-4 rounded-xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">Manual Bounds:</span>
                        <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-850 rounded-lg p-1 px-2.5">
                            <span className="text-[9px] text-stone-500 font-mono">START:</span>
                            <input
                                type="number"
                                value={trimStart.toFixed(2)}
                                step="0.1"
                                onChange={(e) => handleStartChange(parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-[11px] font-mono text-purple-300 focus:outline-none w-14"
                            />
                            <span className="text-[9px] text-stone-600">s</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-850 rounded-lg p-1 px-2.5">
                            <span className="text-[9px] text-stone-500 font-mono">END:</span>
                            <input
                                type="number"
                                value={trimEnd.toFixed(2)}
                                step="0.1"
                                onChange={(e) => handleEndChange(parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-[11px] font-mono text-purple-300 focus:outline-none w-14"
                            />
                            <span className="text-[9px] text-stone-600">s</span>
                        </div>
                    </div>

                    {/* Waveform Action Toolkit Buttons */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            onClick={handleTrim}
                            className="p-1.5 px-3 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-600/20 text-purple-400 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1"
                            title="Crop file to keep only selected segment"
                        >
                            <Scissors className="w-3 h-3" />
                            Trim Selection
                        </button>
                        <button
                            onClick={handleDeleteSegment}
                            className="p-1.5 px-3 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1"
                            title="Cut and stitch out selection"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete Segment
                        </button>
                        <button
                            onClick={handleFadeIn}
                            className="p-1.5 px-2.5 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-all text-[10px] flex items-center gap-1"
                            title="Fade In start of selection"
                        >
                            <TrendingUp className="w-3 h-3" />
                            Fade In
                        </button>
                        <button
                            onClick={handleFadeOut}
                            className="p-1.5 px-2.5 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-all text-[10px] flex items-center gap-1"
                            title="Fade Out end of selection"
                        >
                            <TrendingDown className="w-3 h-3" />
                            Fade Out
                        </button>
                        <button
                            onClick={handleSilenceRegion}
                            className="p-1.5 px-2.5 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-all text-[10px] flex items-center gap-1"
                            title="Silence selected audio"
                        >
                            <VolumeX className="w-3 h-3" />
                            Silence
                        </button>

                        <div className="h-4 w-px bg-stone-800 mx-1" />

                        {historyIndex >= 0 && (
                            <button
                                onClick={handleUndo}
                                className="p-1.5 px-2 bg-stone-900 border border-stone-800 text-purple-400 hover:text-purple-300 rounded-lg transition-colors flex items-center gap-1"
                                title="Undo last edit"
                            >
                                <Undo className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {(historyIndex >= 0 || activeBlob !== fileBlob) && (
                            <button
                                onClick={handleReset}
                                className="p-1.5 px-3 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-colors"
                                title="Reset all changes to original"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-toolbar for options */}
                <div className="flex gap-4 items-center bg-stone-950/30 p-2 px-4 rounded-xl border border-stone-850 text-[10px]">
                    <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mr-1">Display & Rec:</span>
                    <button
                        onClick={() => setShowSpectrogram(!showSpectrogram)}
                        className={`p-1 px-3 rounded border flex items-center gap-1 ${
                            showSpectrogram ? 'bg-purple-600/10 border-purple-500/25 text-purple-400' : 'bg-transparent border-stone-850 text-stone-500 hover:text-stone-300'
                        }`}
                    >
                        <Layers className="w-3 h-3" />
                        {showSpectrogram ? 'Hide Spectrogram' : 'Show Spectrogram'}
                    </button>
                    <button
                        onClick={handleToggleRecord}
                        className={`p-1 px-3 rounded border flex items-center gap-1 ${
                            isRecording ? 'bg-red-600/10 border-red-500/25 text-red-400 animate-pulse' : 'bg-transparent border-stone-850 text-stone-500 hover:text-stone-300'
                        }`}
                    >
                        {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        {isRecording ? 'Stop Rec' : 'Mic Rec'}
                    </button>

                    <div className="h-3 w-px bg-stone-800 ml-auto" />

                    <button onClick={handleZoomIn} className="p-1 hover:text-white text-stone-500 transition-colors" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
                    <button onClick={handleZoomOut} className="p-1 hover:text-white text-stone-500 transition-colors" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
                </div>

                {/* Waveform & Plugin Containers */}
                <div
                    onContextMenu={handleContextMenu}
                    className="bg-stone-950 border border-stone-850 rounded-xl overflow-hidden relative p-4 space-y-4 cursor-context-menu"
                    title="Right-click directly on the wave container for options menu!"
                >
                    <div ref={containerRef} className="min-h-[90px]" />
                    <div ref={timelineRef} className="bg-stone-950 text-stone-500 text-[9px] font-mono" />

                    {showSpectrogram && (
                        <div ref={spectrogramRef} className="bg-stone-950 border-t border-stone-900 rounded-lg overflow-hidden min-h-[40px] relative animate-in fade-in duration-200" />
                    )}

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-950/90 z-10 text-stone-600">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 animate-pulse">Processing Wave Buffer...</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-stone-500 select-none">
                    <div className="flex gap-4">
                        <span>DURATION: {duration.toFixed(2)}s</span>
                        <span className="text-stone-800">|</span>
                        <span className="text-stone-400">READY FOR BAKE</span>
                    </div>
                    <span className="text-stone-600 italic">Drag bounds or draw regions on wavesurfer for selection. Right-click wave container for tools popup.</span>
                </div>
            </div>

            {/* Footer Controls - Fixed & Sticky */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-between items-center shrink-0 z-20">
                <div className="flex gap-3">
                    <button onClick={handlePlayPause} aria-label={isPlaying ? "Pause playback" : "Play audio"} className="w-12 h-12 rounded-full bg-stone-850 border border-stone-750 flex items-center justify-center text-stone-200 hover:bg-stone-700 hover:text-white transition-all active:scale-95">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={() => wavesurferRef.current?.stop()} aria-label="Stop playback" className="w-12 h-12 rounded-full bg-stone-900 border border-stone-850 flex items-center justify-center text-stone-500 hover:text-stone-200 hover:border-stone-700 transition-all active:scale-95">
                        <Square className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setIsLooping(!isLooping);
                            playClickSound();
                        }}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-95 ${
                            isLooping
                                ? 'bg-purple-600/10 border-purple-500/40 text-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.15)] animate-spin-slow'
                                : 'bg-stone-900 border-stone-850 text-stone-500 hover:text-stone-300 hover:border-stone-700'
                        }`}
                        title="Toggle Loop Playback"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLooping ? 'animate-spin-slow' : ''}`} />
                    </button>
                    <button onClick={onClose} className="px-5 py-3 bg-stone-900 border border-stone-850 hover:bg-stone-800 hover:border-stone-700 text-stone-300 font-mono text-[10px] font-bold uppercase rounded-xl transition-all flex items-center gap-2 active:scale-95" title="Go back to generator to adjust settings and regenerate">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                        Adjust & Re-Generate
                    </button>
                </div>
                <button onClick={handleBakeToDisk} disabled={loading || baking} className="px-8 py-3 bg-stone-100 hover:bg-white text-stone-950 font-sans font-black text-[11px] tracking-[0.2em] rounded-xl transition-all shadow-xl flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
                    {baking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    BAKE TO REPOSITORY
                </button>
            </div>

            {/* Custom Windows-style right-click context menu popup inside the wave editor container */}
            {contextMenu && (
                <div
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    className="fixed z-[25000] bg-stone-950 border border-stone-800 rounded-xl p-1.5 shadow-2xl min-w-[170px] flex flex-col font-mono text-left animate-in zoom-in-95 duration-100"
                >
                    <div className="px-3 py-1 text-[8px] font-black text-stone-600 uppercase tracking-widest border-b border-stone-900 mb-1">
                        Wave Tools Menu
                    </div>
                    <button
                        onClick={() => { handleTrim(); setContextMenu(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
                    >
                        <Scissors className="w-3.5 h-3.5 text-purple-400" />
                        Trim Selection
                    </button>
                    <button
                        onClick={() => { handleDeleteSegment(); setContextMenu(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-stone-500" />
                        Delete Segment
                    </button>
                    <button
                        onClick={() => { handleFadeIn(); setContextMenu(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
                    >
                        <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
                        Fade In (1s)
                    </button>
                    <button
                        onClick={() => { handleFadeOut(); setContextMenu(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
                    >
                        <TrendingDown className="w-3.5 h-3.5 text-stone-400" />
                        Fade Out (1s)
                    </button>
                    <button
                        onClick={() => { handleSilenceRegion(); setContextMenu(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-stone-300 hover:bg-purple-600/15 hover:text-purple-400 rounded-lg transition-all"
                    >
                        <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                        Silence Selection
                    </button>

                    {historyIndex >= 0 && (
                        <>
                            <div className="h-px bg-stone-900 my-1" />
                            <button
                                onClick={() => { handleUndo(); setContextMenu(null); }}
                                className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-purple-400 hover:bg-purple-600/15 rounded-lg transition-all"
                            >
                                <Undo className="w-3.5 h-3.5" />
                                Undo Edit
                            </button>
                        </>
                    )}

                    {(historyIndex >= 0 || activeBlob !== fileBlob) && (
                        <button
                            onClick={() => { handleReset(); setContextMenu(null); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-stone-400 hover:text-stone-900 rounded-lg transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reset to Original
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
