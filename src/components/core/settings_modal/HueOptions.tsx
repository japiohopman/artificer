import React, { useState } from 'react';
import { useHueStore } from '../../../store/useHueStore';
import { playClickSound, playSuccessSound } from '../../../services/storageService';

export const HueOptions: React.FC = () => {
  const hue = useHueStore();

  const [localIp, setLocalIp] = useState(hue.credentials.ip);
  const [localUsername, setLocalUsername] = useState(hue.credentials.username);
  const [isTestingHue, setIsTestingHue] = useState(false);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
        Philips Hue Bridge & Luminaries Configuration
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
        hue.isConnected
          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
          : hue.status === 'connecting'
          ? "bg-yellow-950/20 border-yellow-500/30 text-yellow-400 animate-pulse"
          : "bg-red-950/20 border-red-500/30 text-red-400"
      }`}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest">Connection Status:</span>
          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
            hue.isConnected
              ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_#10b981]"
              : hue.status === 'connecting'
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-red-500/20 text-red-300"
          }`}>
            {hue.isConnected ? "CONNECTED" : hue.status === 'connecting' ? "CONNECTING..." : "DISCONNECTED"}
          </span>
        </div>
        {hue.error && (
          <p className="text-[10px] font-mono text-red-400 bg-black/40 p-2 rounded border border-red-500/10 mt-1">
            ERR: {hue.error}
          </p>
        )}
        {hue.isConnected && (
          <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-tight">
            Detected {hue.lights.length} lights connected to the bridge.
          </p>
        )}
      </div>

      {/* Hue IP */}
      <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
          Bridge IP Address
        </label>
        <input
          type="text"
          value={localIp}
          onChange={(e) => setLocalIp(e.target.value)}
          placeholder="e.g. 192.168.178.59"
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
        />
      </div>

      {/* Hue Username / Application Key */}
      <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
          Bridge Username / Application Key
        </label>
        <input
          type="password"
          value={localUsername}
          onChange={(e) => setLocalUsername(e.target.value)}
          placeholder="e.g. 1b-t-3QlLC4cRGwai9knsfWItpR5Q17iyMt6NwTj"
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
        />
      </div>

      {/* Connection Trigger Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            hue.setCredentials(localIp, localUsername);
            playSuccessSound();
            alert("Credentials saved locally!");
          }}
          className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded font-sans font-bold text-xs tracking-wider uppercase text-zinc-300 hover:text-white transition-all"
        >
          Save Credentials
        </button>
        <button
          type="button"
          disabled={isTestingHue || !localIp || !localUsername}
          onClick={async () => {
            setIsTestingHue(true);
            playClickSound();
            // First save the credentials so we test with what's on screen
            hue.setCredentials(localIp, localUsername);
            const success = await hue.connect();
            setIsTestingHue(false);
            if (success) {
              playSuccessSound();
              alert("Connected successfully to the Philips Hue Bridge!");
            } else {
              alert("Failed to establish Hue connection. Please verify IP, key, and network.");
            }
          }}
          className="flex-1 py-2.5 bg-dragon-red hover:bg-red-700 border border-zinc-800 rounded font-sans font-bold text-xs tracking-wider uppercase text-white shadow-lg disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          {isTestingHue ? "CONNECTING..." : "Test Connection"}
        </button>
      </div>
    </div>
  );
};
