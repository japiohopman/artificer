import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { LampCard } from '../audio/LampCard';
import { LampControls } from '../audio/LampControls';
import { useHueStore } from '../../../store/useHueStore';
import { playClickSound, playSuccessSound } from '../../../services/storageService';

export const HueStudio: React.FC = () => {
  const hue = useHueStore();
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const selectedLight = hue.lights.find(l => l.id === selectedLightId);

  const [localIp, setLocalIp] = useState(hue.credentials.ip);
  const [localUsername, setLocalUsername] = useState(hue.credentials.username);
  const [showConfig, setShowConfig] = useState(!hue.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 bg-stone-950 overflow-y-auto custom-scrollbar">
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20 text-yellow-500">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">LUMINESCENT_SPECTRUM</div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Philips Hue Controller</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
            hue.isConnected
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : hue.status === 'connecting'
              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {hue.isConnected ? 'ONLINE' : hue.status === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
          </span>
          <button
            onClick={() => {
              setShowConfig(!showConfig);
              playClickSound();
            }}
            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-[10px] text-white font-bold rounded uppercase tracking-wider transition-all"
          >
            {showConfig ? 'Hide Config' : 'Configure Bridge'}
          </button>
        </div>
      </div>

      {/* Setup Credentials Panel */}
      {showConfig && (
        <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Bridge Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-stone-500 tracking-wider">Bridge IP Address</label>
              <input
                type="text"
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                placeholder="e.g. 192.168.178.59"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-stone-700 transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-stone-500 tracking-wider">Bridge Username / App Key</label>
              <input
                type="password"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Key..."
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-stone-700 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                hue.setCredentials(localIp, localUsername);
                playSuccessSound();
                alert("Credentials saved locally!");
              }}
              className="px-4 py-2 border border-stone-800 text-stone-400 hover:text-stone-200 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-stone-900/50 transition-all"
            >
              Save Credentials
            </button>
            <button
              disabled={isConnecting || !localIp || !localUsername}
              onClick={async () => {
                setIsConnecting(true);
                playClickSound();
                hue.setCredentials(localIp, localUsername);
                const success = await hue.connect();
                setIsConnecting(false);
                if (success) {
                  playSuccessSound();
                  setShowConfig(false);
                } else {
                  alert("Hue Connection failed! Check IP, App Key and network status.");
                }
              }}
              className="px-5 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-stone-950 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]"
            >
              {isConnecting ? 'CONNECTING...' : 'Establish Connection'}
            </button>
          </div>
        </div>
      )}

      {selectedLight ? (
        <div className="flex-1 flex flex-col min-h-0">
          <button
            onClick={() => setSelectedLightId(null)}
            className="mb-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-300 flex items-center gap-2 self-start"
          >
            ← Back to Lamp List
          </button>
          <div className="flex-1 min-h-0">
            <LampControls
              light={selectedLight}
              onUpdate={(settings) => hue.triggerHue(settings, selectedLight.id)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hue.lights.map(light => (
            <LampCard
              key={light.id}
              light={light}
              isSelected={false}
              onSelect={() => setSelectedLightId(light.id)}
              onToggle={(e) => {
                e.stopPropagation();
                hue.triggerHue({ on: { on: !light.on?.on } }, light.id);
              }}
              onBrightnessChange={(val) => hue.triggerHue({ dimming: { brightness: val } }, light.id)}
            />
          ))}
          {hue.lights.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-600 border border-dashed border-stone-800 rounded-3xl">
              <Lightbulb className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">No Luminaries Detected</p>
              <p className="text-[10px] uppercase tracking-tighter mt-1">Configure your Hue Bridge credentials above to scan and link active lamps.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
