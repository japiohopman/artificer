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
    ZoomIn, ZoomOut, Mic, MicOff, Sliders, Layers, RefreshCw
} from 'lucide-react';
import { audioBufferToWav } from './audioUtils';

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
    const [loading, setLoading] = useState(true);
    const [baking, setBaking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [finalName, setFinalName] = useState(fileName);
    const [optimizeForUI, setOptimizeForUI] = useState(false);
    const [targetCategory, setTargetCategory] = useState(initialCategory || 'sfx');

    // UI Controls for optional plugin layers
    const [showSpectrogram, setShowSpectrogram] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [activeBlob, setActiveBlob] = useState<Blob>(fileBlob);

    // Precise numeric trim settings
    const [trimStart, setTrimStart] = useState<number>(0);
    const [trimEnd, setTrimEnd] = useState<number>(0);

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

    useEffect(() => {
        if (!containerRef.current) return;

        const url = URL.createObjectURL(activeBlob);
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
            height: 60,
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

        ws.load(url);

        ws.on('ready', () => {
            setLoading(false);
            const totalDur = ws.getDuration();
            setDuration(totalDur);
            setTrimStart(0);
            setTrimEnd(totalDur);

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
            URL.revokeObjectURL(url);
        };
    }, [activeBlob]);

    const handleTrim = async () => {
        const ws = wavesurferRef.current;
        const regions = regionsRef.current;
        if (!ws || !regions) return;

        const region = regions.getRegions().find((r: any) => r.id === 'trim-region') || regions.getRegions()[0];
        if (!region) return;

        setBaking(true);
        try {
            const arrayBuffer = await activeBlob.arrayBuffer();
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const fullBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            const start = region.start;
            const end = region.end;
            const sampleRate = fullBuffer.sampleRate;
            const startSample = Math.floor(start * sampleRate);
            const endSample = Math.floor(end * sampleRate);
            const frameCount = endSample - startSample;

            const trimmedBuffer = audioCtx.createBuffer(
                fullBuffer.numberOfChannels,
                frameCount,
                sampleRate
            );

            for (let i = 0; i < fullBuffer.numberOfChannels; i++) {
                trimmedBuffer.getChannelData(i).set(
                    fullBuffer.getChannelData(i).subarray(startSample, endSample)
                );
            }

            const wavBuffer = audioBufferToWav(trimmedBuffer);
            let finalBlob = new Blob([wavBuffer], { type: 'audio/wav' });
            let finalExt = '';

            if (optimizeForUI) {
                // Professional Low-Latency Conversion (Ogg/Opus via MediaRecorder)
                const streamDest = audioCtx.createMediaStreamDestination();
                const bufferSource = audioCtx.createBufferSource();
                bufferSource.buffer = trimmedBuffer;
                bufferSource.connect(streamDest);

                const mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') 
                    ? 'audio/ogg;codecs=opus' 
                    : 'audio/webm;codecs=opus';
                
                const recorder = new MediaRecorder(streamDest.stream, { mimeType });
                const chunks: Blob[] = [];

                await new Promise<void>((resolve) => {
                    recorder.ondataavailable = (e) => chunks.push(e.data);
                    recorder.onstop = () => resolve();
                    recorder.start();
                    bufferSource.start(0);
                    bufferSource.onended = () => recorder.stop();
                });

                finalBlob = new Blob(chunks, { type: mimeType });
                finalExt = mimeType.includes('ogg') ? '.ogg' : '.webm';
            }

            await onBake(finalBlob, finalName + finalExt, targetCategory);
        } catch (error) {
            console.error('Bake failed:', error);
            alert('Failed to bake sound asset');
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

    return (
        <div className="bg-black/35 border border-white/5 rounded-2xl w-full overflow-hidden shadow-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-purple-400" />
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Audio Refining Studio</h3>
                </div>
                <button onClick={onClose} aria-label="Close audio editor" className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-600 uppercase tracking-tighter ml-1">Final Resource Identifier</label>
                        <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-xl p-2 px-4">
                            <input value={finalName} onChange={(e) => setFinalName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className="bg-transparent text-[12px] font-mono text-stone-300 focus:outline-none flex-1" placeholder="enter_filename" />
                            <span className="text-[10px] font-mono text-stone-700">{optimizeForUI ? '.ogg' : '.wav'}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-600 uppercase tracking-tighter ml-1">Professional Optimization</label>
                        <button
                            onClick={() => setOptimizeForUI(!optimizeForUI)}
                            className={`w-full flex items-center justify-between p-2.5 px-4 rounded-xl border transition-all ${optimizeForUI ? 'bg-purple-900/20 border-purple-500/50 text-purple-400' : 'bg-stone-950 border-stone-800 text-stone-600'}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest">Low Latency (OGG)</span>
                            <div className={`w-3 h-3 rounded-full ${optimizeForUI ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-stone-800'}`} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-stone-600 uppercase tracking-tighter ml-1">Save Folder Map</label>
                        <select
                            value={targetCategory}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 px-4 text-xs text-stone-300 focus:outline-none focus:border-purple-500 font-sans h-[38px]"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-stone-900 text-white">
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Manual Trim Controls & Toolbar */}
                <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between items-center bg-black/40 border border-stone-800 p-3 px-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">Precise Trim:</span>
                        <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-lg p-1 px-2.5">
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
                        <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-lg p-1 px-2.5">
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

                    <div className="flex flex-wrap gap-2.5 items-center">
                        <button
                            onClick={() => setShowSpectrogram(!showSpectrogram)}
                            className={`p-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                showSpectrogram ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' : 'bg-stone-900/50 border-stone-800 text-stone-500'
                            }`}
                            title="Toggle Spectrogram Visualization"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Spectrogram
                        </button>

                        <button
                            onClick={handleToggleRecord}
                            className={`p-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                                isRecording ? 'bg-red-600/10 border-red-500/40 text-red-400 animate-pulse' : 'bg-stone-900/50 border-stone-800 text-stone-500'
                            }`}
                            title="Record audio from microphone"
                        >
                            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            {isRecording ? 'Stop Recording' : 'Mic Record'}
                        </button>

                        <div className="h-4 w-px bg-stone-800 mx-1" />

                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 px-2.5 bg-stone-900/50 border border-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px]"
                            title="Zoom In Waveform"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 px-2.5 bg-stone-900/50 border border-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px]"
                            title="Zoom Out Waveform"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden relative p-4 space-y-4">
                    <div ref={containerRef} className="min-h-[90px]" />
                    <div ref={timelineRef} className="bg-stone-950 text-stone-400 text-[9px]" />

                    {showSpectrogram && (
                        <div ref={spectrogramRef} className="bg-stone-950 border-t border-stone-900 rounded-lg overflow-hidden min-h-[60px] relative animate-in fade-in duration-200" />
                    )}

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-950 z-10 text-stone-600">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Imaging Buffer...</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                    <div className="flex gap-4">
                        <span>DURATION: {duration.toFixed(2)}s</span>
                        <span className="text-stone-700">|</span>
                        <span className="text-stone-400">STATUS: READY FOR BAKE</span>
                    </div>
                    <span className="text-stone-600 italic">Drag anywhere on wavesurfer to draw trim region / envelope points</span>
                </div>
            </div>

            <div className="p-6 bg-stone-950 border-t border-stone-800 flex justify-between items-center">
                <div className="flex gap-3">
                    <button onClick={() => wavesurferRef.current?.playPause()} aria-label={isPlaying ? "Pause playback" : "Play audio"} className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200 hover:bg-stone-700 transition-all">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={() => wavesurferRef.current?.stop()} aria-label="Stop playback" className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-200 transition-all">
                        <Square className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="px-5 py-3 bg-stone-900 border border-stone-850 hover:bg-stone-800 text-stone-300 font-mono text-[10px] font-bold uppercase rounded-xl transition-all flex items-center gap-2" title="Go back to generator to regenerate">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                        Adjust & Re-Generate
                    </button>
                </div>
                <button onClick={handleTrim} disabled={loading || baking} className="px-8 py-3 bg-stone-200 text-stone-950 font-sans font-bold text-[11px] tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-xl flex items-center gap-3 disabled:opacity-50">
                    {baking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    BAKE TO REPOSITORY
                </button>
            </div>
        </div>
    );
}
