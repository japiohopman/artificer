import React, { useState, useEffect } from 'react';
import { Folder, Music, Play, StopCircle, ChevronRight, ChevronDown, Search, FolderSearch, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'ambient', label: 'Ambient', icon: Folder },
  { id: 'environment', label: 'Environment', icon: Folder },
  { id: 'music', label: 'Music', icon: Folder },
  { id: 'npc_voice', label: 'NPC Voice', icon: Folder },
  { id: 'sfx', label: 'SFX', icon: Folder },
  { id: 'system', label: 'System', icon: Folder },
  { id: 'weather', label: 'Weather', icon: Folder }
];

export function SoundExplorer() {
  const [expanded, setExpanded] = useState<string[]>(['sfx']);
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategory = async (id: string) => {
    if (categoryData[id]) return; // Cache check
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/audio/list/${id}`);
      const data = await res.json();
      setCategoryData(prev => ({ ...prev, [id]: data }));
    } catch (e) {
      console.error('Failed to sync repository data:', e);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleFolder = (id: string) => {
    const isExpanding = !expanded.includes(id);
    setExpanded(prev => isExpanding ? [...prev, id] : prev.filter(i => i !== id));
    if (isExpanding) fetchCategory(id);
  };

  useEffect(() => {
    fetchCategory('sfx'); // Initial sync for default expanded folder
  }, []);

  const filteredFiles = (id: string) => {
    const list = categoryData[id] || [];
    if (!searchTerm) return list;
    return list.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <aside className="w-64 border-r border-stone-800 bg-stone-950 flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-stone-900 bg-stone-900/20">
        <div className="flex items-center gap-2 mb-4">
          <FolderSearch className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Repository</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-600" />
          <input 
            type="text" 
            placeholder="Filter assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-800 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-stone-400 focus:outline-none focus:border-stone-700 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
        <div className="px-3 mb-2">
          <span className="text-[9px] font-mono text-stone-700 uppercase">public/assets/sounds/</span>
        </div>
        
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="space-y-0.5">
            <button 
              onClick={() => toggleFolder(cat.id)}
              className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-white/5 transition-colors group"
            >
              {expanded.includes(cat.id) ? (
                <ChevronDown className="w-3 h-3 text-stone-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-stone-600" />
              )}
              <Folder className={`w-3.5 h-3.5 ${expanded.includes(cat.id) ? 'text-stone-400' : 'text-stone-600'}`} />
              <span className={`text-xs font-sans ${expanded.includes(cat.id) ? 'text-stone-200' : 'text-stone-500'}`}>
                {cat.label}
              </span>
            </button>

            {expanded.includes(cat.id) && (
              <div className="ml-4 pl-4 border-l border-stone-900 space-y-0.5 mb-2">
                {loading[cat.id] ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-stone-600 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Syncing...</span>
                  </div>
                ) : (
                  filteredFiles(cat.id).map((file: any) => (
                    <SoundFileItem key={file.path || file.name} name={file.name} url={file.url} />
                  ))
                )}
                {!loading[cat.id] && categoryData[cat.id] && filteredFiles(cat.id).length === 0 && (
                  <div className="px-3 py-2 text-[10px] text-stone-700 italic">
                    No assets found
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function SoundFileItem({ name, url }: { name: string; url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio());

  useEffect(() => {
    audio.src = url;
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url, audio]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div className="group flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-stone-900/50 cursor-pointer">
      <div className="flex items-center gap-2 overflow-hidden">
        <Music className={`w-3 h-3 transition-colors ${isPlaying ? 'text-emerald-400' : 'text-stone-700 group-hover:text-emerald-500/50'}`} />
        <span className={`text-[11px] truncate font-mono transition-colors ${isPlaying ? 'text-emerald-300' : 'text-stone-500 group-hover:text-stone-300'}`}>
          {name}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handlePlay}
          className={`p-1 transition-colors ${isPlaying ? 'text-emerald-400' : 'hover:text-emerald-400 text-stone-600'}`}
        >
          {isPlaying ? <StopCircle className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
        </button>
        {isPlaying && (
          <button onClick={handleStop} className="p-1 hover:text-red-400 text-stone-600">
            <StopCircle className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}