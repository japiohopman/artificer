import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Database, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck,
  Search,
  ArrowRight
} from 'lucide-react';

interface RegistryItem {
  category: string;
  name: string;
  status: string;
  location: string;
  notes: string;
}

interface RequestItem {
  date: string;
  requester: string;
  asset: string;
  description: string;
  priority: string;
  status: string;
  prompt?: string;
}

interface CommunicationBridgeProps {
  onGenerateAudio: (data: { 
    prompt: string; 
    category: string; 
    filename: string; 
    isLoop: boolean; 
    duration: number; 
    accountIndex?: number 
  }) => Promise<void>;
}

export function CommunicationBridge({ onGenerateAudio }: CommunicationBridgeProps) {
  const [activeTab, setActiveTab] = useState<'registry' | 'requests' | 'consult'>('registry');
  const [registry, setRegistry] = useState<RegistryItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSunnyThinking, setIsSunnyThinking] = useState(false);
  const [processingMode, setProcessingMode] = useState<'manual' | 'auto'>('auto');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      console.log("[Bridge] Fetching requests from /api/bridge/requests...");
      const res = await fetch('/api/bridge/requests');
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("[Bridge] Expected JSON but got:", text.slice(0, 100));
        throw new Error("Server returned non-JSON response. Ensure the backend server is running and the route is registered.");
      }
      const data = await res.json();
      console.log("[Bridge] Successfully fetched requests:", data.length);
      setRequests(data);
    } catch (err) {
      console.error("[Bridge] Failed to fetch requests:", err);
    }
  };

  const handleProcessRequest = async (req: RequestItem) => {
    setProcessingId(req.asset);
    setIsSunnyThinking(true);
    
    try {
      let finalPrompt = req.prompt || req.description;
      
      // Step 1: Optimize the prompt if it doesn't look like a Sunny prompt (missing technical tags)
      if (!req.prompt && !req.description.includes('[Sunny Prompt]')) {
        const optimizeRes = await fetch("/api/gemini/optimize-sound-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: req.description, 
            category: req.asset.toLowerCase().includes('ui') || req.asset.toLowerCase().includes('dice') ? 'sfx' : 'ambient' 
          })
        });
        
        const data = await optimizeRes.json();
        finalPrompt = data.optimizedPrompt;
      }
      
      if (processingMode === 'manual') {
        setActiveTab('consult');
        setChatInput(`Professional analysis complete for ${req.asset}.` + 
          `\n\nOptimized Prompt: "${finalPrompt}"` +
          `\n\nPipeline parameters set: OGG Optimization enabled, category set to SFX.` +
          `\n\nClick "Process" again in Auto mode to execute forge, or consult with the User.`);
      } else {
        // Step 2: Directly trigger the generation pipeline
        await onGenerateAudio({
          prompt: finalPrompt,
          category: req.asset.toLowerCase().includes('ui') || req.asset.toLowerCase().includes('dice') ? 'sfx' : 'ambient',
          filename: req.asset.toLowerCase(),
          isLoop: req.asset.toLowerCase().includes('loop'),
          duration: req.asset.toLowerCase().includes('loop') ? 10 : 3,
          accountIndex: 0 
        });
      }
    } catch (error) {
      console.error("Pipeline failure:", error);
    } finally {
      setIsSunnyThinking(false);
      setProcessingId(null);
    }
  };

  const handleProcessAll = async () => {
    const readyRequests = requests.filter(r => r.status === 'Ready' || r.status === 'Pending');
    if (readyRequests.length === 0) return;
    
    setProcessingMode('auto');
    for (const req of readyRequests) {
      await handleProcessRequest(req);
    }
  };

  // Note: In a real implementation, we would fetch these from the server/GitHub
  useEffect(() => {
    fetchRequests();

    setRegistry([
      { category: 'Ambient', name: 'amb_forge_fire.wav', status: 'Stored', location: 'public/assets/sounds/ambient/', notes: 'Verified' },
      { category: 'SFX', name: 'fireball.mp3', status: 'Missing', location: 'public/assets/sounds/sfx/', notes: 'Required for spell manifest' },
      { category: 'Weather', name: 'weather_rain_heavy.mp3', status: 'Stored', location: 'public/assets/sounds/weather/', notes: 'Verified' }
    ]);
  }, []);

  return (
    <div className="h-full flex flex-col bg-stone-950 font-sans border-l border-stone-800">
      {/* Header */}
      <div className="p-6 border-b border-stone-800 bg-stone-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dragon-red/10 rounded-lg border border-dragon-red/20">
              <Network className="w-5 h-5 text-dragon-red" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-stone-200">Communication Bridge</h2>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Professional Agent Collaboration</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Pipeline Secure</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800">
        <button 
          onClick={() => setActiveTab('registry')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'registry' ? 'text-stone-200 border-b-2 border-dragon-gold bg-stone-900/20' : 'text-stone-500 hover:text-stone-400'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Database className="w-3.5 h-3.5" />
            Asset Registry
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'text-stone-200 border-b-2 border-dragon-gold bg-stone-900/20' : 'text-stone-500 hover:text-stone-400'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Request Map
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('consult')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'consult' ? 'text-stone-200 border-b-2 border-dragon-gold bg-stone-900/20' : 'text-stone-500 hover:text-stone-400'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowRight className="w-3.5 h-3.5" />
            Consult Sunny
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'registry' && (
          <div className="h-full flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Inventory Status</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-600" />
                <input type="text" placeholder="Filter registry..." className="bg-stone-900 border border-stone-800 rounded-lg py-1 pl-8 pr-3 text-[10px] focus:outline-none focus:border-stone-700" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {registry.map((item, i) => (
                <div key={i} className="p-3 rounded-xl border border-stone-800 bg-stone-900/20 hover:border-stone-700 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-stone-200">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${item.status === 'Stored' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-stone-500 font-mono">
                    <span className="text-dragon-gold/50">{item.category}</span>
                    <span>•</span>
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="h-full flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Active Commissions</span>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => setProcessingMode('manual')}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border transition-all ${processingMode === 'manual' ? 'bg-dragon-gold text-stone-950 border-dragon-gold' : 'bg-stone-950 text-stone-600 border-stone-800'}`}
                  >
                    Manual
                  </button>
                  <button 
                    onClick={() => setProcessingMode('auto')}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border transition-all ${processingMode === 'auto' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-950 text-stone-600 border-stone-800'}`}
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleProcessAll}
                  disabled={isSunnyThinking}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  Process All
                </button>
                <button className="text-[9px] font-bold text-dragon-red uppercase tracking-widest hover:text-rose-500 transition-colors">New Request +</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {requests.map((req, i) => (
                <div key={i} className={`p-4 rounded-xl border transition-all ${processingId === req.asset ? 'border-dragon-gold bg-dragon-gold/5 animate-pulse' : 'border-stone-800 bg-stone-900/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-stone-500" />
                      <span className="text-[9px] font-bold text-stone-500 uppercase">{req.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${req.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {req.priority}
                    </span>
                  </div>
                  <h3 className="text-[12px] font-bold text-stone-200 mb-1">{req.asset}</h3>
                  <p className="text-[10px] text-stone-500 font-serif leading-relaxed mb-3">{req.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-stone-600 font-bold uppercase tracking-tighter">By {req.requester}</span>
                    <button 
                      onClick={() => handleProcessRequest(req)}
                      disabled={isSunnyThinking}
                      className="px-4 py-1.5 bg-stone-200 text-stone-950 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-all disabled:opacity-50"
                    >
                      {processingId === req.asset ? 'Processing...' : 'Process'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'consult' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0 border border-stone-700">
                  <span className="text-[10px] font-bold text-stone-400">S</span>
                </div>
                <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-2xl rounded-tl-none">
                  <p className="text-[11px] text-stone-300 font-serif leading-relaxed">
                    Good day. I am **Sunny**, your Professional Audio Generator. I have audited the repository and identified several missing assets referenced in the manifest. 
                    How shall we proceed with the current commission queue?
                  </p>
                </div>
              </div>
              {chatInput && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0 border border-stone-700">
                    <span className="text-[10px] font-bold text-stone-400">S</span>
                  </div>
                  <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-2xl rounded-tl-none">
                    <p className="text-[11px] text-stone-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {chatInput}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-stone-800 bg-stone-900/20">
              <div className="relative">
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Consult with Sunny..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 pr-12 text-[11px] focus:outline-none focus:border-dragon-red/50 min-h-[44px] max-h-32 resize-none"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-600 hover:text-dragon-red transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
