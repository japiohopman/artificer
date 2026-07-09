
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Play, Pause, Square, Scissors, X, Loader2, Save } from 'lucide-react';
import { audioBufferToWav } from './audioUtils';

interface AudioEditorProps {
    fileBlob: Blob;
    fileName: string;
    onClose: () => void;
    onBake: (editedBlob: Blob, finalName: string) => Promise<void>;
}

export function AudioEditor({ fileBlob, fileName, onClose, onBake }: AudioEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const regionsRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [baking, setBaking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [finalName, setFinalName] = useState(fileName);
    const [optimizeForUI, setOptimizeForUI] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const url = URL.createObjectURL(fileBlob);
        const regionsPlugin = RegionsPlugin.create();
        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#444',
            progressColor: '#888',
            cursorColor: '#fff',
            barWidth: 2,
            barRadius: 3,
            height: 120,
            plugins: [regionsPlugin]
        });

        wavesurferRef.current = ws;
        regionsRef.current = regionsPlugin;

        ws.load(url);

        ws.on('ready', () => {
            setLoading(false);
            setDuration(ws.getDuration());
            regionsPlugin.addRegion({
                start: 0,
                end: ws.getDuration(),
                color: 'rgba(255, 255, 255, 0.1)',
                drag: true,
                resize: true
            });
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        return () => {
            try {
                ws.destroy();
            } catch (e) {
                // Ignore AbortError which can happen during rapid unmount
                console.warn("WaveSurfer cleanup warning:", e);
            }
            URL.revokeObjectURL(url);
        };
    }, [fileBlob]);

    const handleTrim = async () => {
        const ws = wavesurferRef.current;
        const regions = regionsRef.current;
        if (!ws || !regions) return;

        const region = regions.getRegions()[0];
        if (!region) return;

        setBaking(true);
        try {
            const arrayBuffer = await fileBlob.arrayBuffer();
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

            await onBake(finalBlob, finalName + finalExt);
        } catch (error) {
            console.error('Bake failed:', error);
            alert('Failed to bake sound asset');
        } finally {
            setBaking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-850">
                    <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-stone-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-200">Audio Refining Studio</h3>
                    </div>
                    <button onClick={onClose} aria-label="Close audio editor" className="p-2 hover:bg-white/5 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className={`w-full flex items-center justify-between p-2 px-4 rounded-xl border transition-all ${optimizeForUI ? 'bg-dragon-red/10 border-dragon-red/50 text-dragon-red' : 'bg-stone-950 border-stone-800 text-stone-600'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest">Low Latency (OGG)</span>
                                <div className={`w-3 h-3 rounded-full ${optimizeForUI ? 'bg-dragon-red shadow-[0_0_8px_#8b0000]' : 'bg-stone-800'}`} />
                            </button>
                        </div>
                    </div>
                    <div ref={containerRef} className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden relative min-h-[120px]">
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
                        <span className="text-stone-600 italic">Drag boundaries to set temporal limits</span>
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
                    </div>
                    <button onClick={handleTrim} disabled={loading || baking} className="px-8 py-3 bg-stone-200 text-stone-950 font-sans font-bold text-[11px] tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-xl flex items-center gap-3 disabled:opacity-50">
                        {baking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        BAKE TO REPOSITORY
                    </button>
                </div>
            </div>
        </div>
    );
}
