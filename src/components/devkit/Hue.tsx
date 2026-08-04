import React, { useState, useEffect } from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { Link as LinkIcon, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Hue: React.FC = () => {
  const { hueState, setHueState } = useAudioStore();
  
  const [ip, setIp] = useState(() => localStorage.getItem("hue_ip") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("hue_username") || "");
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>(hueState.connected ? 'connected' : 'disconnected');
  const [errorMsg, setErrorMsg] = useState("");

  const handleConnect = async () => {
    if (!ip || !username) {
        setErrorMsg("IP and Username are required");
        return;
    }
    
    setStatus('connecting');
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/hue/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "GET",
          path: "/resource/light",
          manual: { ip, username }
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.error || "Connection failed");
      }
      
      setStatus('connected');
      setHueState({ connected: true });
      localStorage.setItem("hue_ip", ip);
      localStorage.setItem("hue_username", username);
      
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || "Failed to connect");
      setHueState({ connected: false });
    }
  };

  const handleDisconnect = () => {
      setStatus('disconnected');
      setHueState({ connected: false });
  };

  return (
    <div className="p-3 border-t border-white/5 bg-black/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[9px] font-bold text-white uppercase tracking-widest">Hue Bridge</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : status === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-white/10 text-white/50'}`}>
          {status}
        </span>
      </div>

      {status !== 'connected' && (
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Bridge IP Address" 
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-purple-500 font-mono"
          />
          <input 
            type="text" 
            placeholder="Username (Token)" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-purple-500 font-mono"
          />
          {errorMsg && (
              <div className="flex items-center gap-1 text-rose-400 text-[9px]">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errorMsg}</span>
              </div>
          )}
          <button 
            onClick={handleConnect}
            disabled={status === 'connecting'}
            className="w-full py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 rounded text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {status === 'connecting' ? 'Connecting...' : 'Connect to Bridge'}
          </button>
        </div>
      )}

      {status === 'connected' && (
          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[9px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Connected to {ip}</span>
              </div>
              <button 
                onClick={handleDisconnect}
                className="w-full py-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded text-[9px] uppercase transition-colors"
              >
                  Disconnect
              </button>
          </div>
      )}
    </div>
  );
};
