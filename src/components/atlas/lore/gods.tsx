import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../../lib/utils';
import { GameIcon, GameIconName } from '../../../game_icons';
import {
  commitFile,
  normalizeImageUrl,
  playClickSound,
  playSuccessSound,
  playFailSound
} from '../../../services/storageService';

export interface God {
  index: string;
  name: string;
  alignment: any;
  domains: string[];
  portfolio: string;
  symbol: string;
  lore: string;
  imageUrl?: string;
  symbolUrl?: string;
}

export const GodsLore: React.FC = () => {
  const [gods, setGods] = useState<God[]>([]);
  const [selectedGod, setSelectedGod] = useState<God | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loreContent, setLoreContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editMarkdown, setEditMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load gods on mount
  useEffect(() => {
    const loadGods = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/assets/atlas/gods/all_gods.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setGods(data);
            if (data.length > 0) {
              setSelectedGod(data[0]);
            }
          }
        }
      } catch (e) {
        console.error("Error loading gods index:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadGods();
  }, []);

  // Fetch lore markdown for selected god
  useEffect(() => {
    if (!selectedGod) return;

    const fetchLore = async () => {
      setIsLoading(true);
      setIsEditing(false);
      try {
        // Resolve path to local asset path
        // e.g. "public/assets/atlas/lore/gods/akadi.md" -> "/assets/atlas/lore/gods/akadi.md"
        const lorePath = selectedGod.lore.startsWith('public/')
          ? selectedGod.lore.substring(6)
          : selectedGod.lore;
        const cleanPath = lorePath.startsWith('/') ? lorePath : '/' + lorePath;

        const res = await fetch(cleanPath);
        if (res.ok) {
          const text = await res.text();
          setLoreContent(text);
          setEditMarkdown(text);
        } else {
          setLoreContent(`# ${selectedGod.name}\n\nNo lore chronicle found in the repository.`);
          setEditMarkdown(`# ${selectedGod.name}\n\nNo lore chronicle found in the repository.`);
        }
      } catch (e) {
        console.error("Error fetching god lore:", e);
        setLoreContent(`# ${selectedGod.name}\n\nFailed to load lore from chronicle.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLore();
  }, [selectedGod]);

  const handleSaveLore = async () => {
    if (!selectedGod) return;
    setIsSaving(true);
    playClickSound();

    try {
      // Clean path for committing (should start with public/)
      let commitPath = selectedGod.lore;
      if (!commitPath.startsWith('public/')) {
        commitPath = 'public/' + (commitPath.startsWith('/') ? commitPath.substring(1) : commitPath);
      }

      const success = await commitFile(commitPath, editMarkdown);
      if (success) {
        setLoreContent(editMarkdown);
        setIsEditing(false);
        playSuccessSound();
        alert(`Chronicle for ${selectedGod.name} has been baked successfully!`);
      } else {
        playFailSound();
        alert("Failed to save chronicle. Please check server logs.");
      }
    } catch (e) {
      console.error("Error saving god lore markdown:", e);
      playFailSound();
      alert("Error saving lore chronicle.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGods = gods.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.index.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.portfolio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAlignment = (alignment: any) => {
    if (!alignment) return 'Unknown';
    if (typeof alignment === 'string') return alignment;
    return alignment.name || alignment.index || 'Unknown';
  };

  return (
    <div className="flex h-full bg-[#111] text-white select-none">
      {/* Sidebar: Pantheon Selection */}
      <div className="w-64 border-r border-white/10 flex flex-col bg-[#161616]">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-dragon-red flex items-center gap-1.5">
            <GameIcon name="scroll" size={14} className="text-dragon-red" />
            Pantheon_Registry
          </h2>
        </div>
        <div className="p-3">
          <input
            type="text"
            placeholder="Filter deities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-dragon-red text-white/80"
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredGods.map((god, idx) => (
            <button
              key={`${god.index}-${idx}`}
              onClick={() => {
                setSelectedGod(god);
                playClickSound();
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                selectedGod?.index === god.index
                  ? "bg-dragon-red text-white shadow-[0_0_8px_rgba(139,0,0,0.3)]"
                  : "hover:bg-white/5 text-white/40"
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold shrink-0 opacity-50" />
              <span className="truncate">{god.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: D&D Parchment Scroll & Meta */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] flex flex-col lg:flex-row gap-8 justify-center items-start custom-scrollbar">
        {selectedGod ? (
          <>
            {/* Parchment Scroll (D&D Style) */}
            <div
              className="flex-1 max-w-2xl bg-parchment-100 border-[12px] border-amber-900/60 rounded-[24px] p-8 relative shadow-2xl flex flex-col min-h-[550px]"
              style={{
                backgroundImage: `url('/assets/ui/old_paper.webp'), url('/assets/ui/parchment.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#3d2516' // Sepia tone
              }}
            >
              {/* Texture Overlays */}
              <div className="absolute inset-0 bg-[#e6d5b0]/20 mix-blend-multiply pointer-events-none rounded-[12px]" />

              <div className="relative z-10 flex flex-col flex-1">
                {/* Scroll Header */}
                <div className="border-b-2 border-amber-950/20 pb-3 mb-6 flex justify-between items-center">
                  <h1 className="font-serif text-3xl font-black uppercase tracking-tight text-red-900 drop-shadow-sm">
                    {selectedGod.name}
                  </h1>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveLore}
                          disabled={isSaving}
                          className="px-3 py-1 bg-red-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-red-950 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isSaving ? "SAVING..." : "SAVE CHRONICLE"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditMarkdown(loreContent);
                            playClickSound();
                          }}
                          className="px-3 py-1 bg-amber-900/10 text-amber-900 border border-amber-900/30 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-amber-900/20 transition-colors"
                        >
                          CANCEL
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          playClickSound();
                        }}
                        className="px-3 py-1 bg-amber-900/20 text-amber-900 border border-amber-900/40 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-amber-900/30 transition-colors shadow-sm"
                      >
                        EDIT CHRONICLE
                      </button>
                    )}
                  </div>
                </div>

                {/* Scroll Body */}
                <div className="flex-1 flex flex-col">
                  {isLoading ? (
                    <div className="flex-1 flex justify-center items-center opacity-30 py-12">
                      <GameIcon name="refresh" className="animate-spin text-amber-950" size={32} />
                    </div>
                  ) : isEditing ? (
                    <textarea
                      value={editMarkdown}
                      onChange={(e) => setEditMarkdown(e.target.value)}
                      className="w-full flex-1 bg-white/40 border border-amber-950/20 rounded p-4 text-[13px] font-mono text-amber-950 focus:outline-none focus:border-red-900/40 resize-none custom-scrollbar leading-relaxed"
                      placeholder="Write your chronicle here using markdown..."
                      title="Edit Chronicle Textarea"
                    />
                  ) : (
                    <div className="text-[14px] leading-relaxed font-serif text-amber-950 text-justify space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
                      <div className="markdown-body select-text">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {loreContent}
                        </Markdown>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seal / Footer Signature */}
                <div className="mt-8 pt-4 border-t border-amber-950/10 flex justify-between items-center text-[10px] font-serif italic text-amber-950/60 uppercase tracking-widest">
                  <span>Pantheon Lore-Master File</span>
                  <span>Index: {selectedGod.index}</span>
                </div>
              </div>

              {/* Decorative Corners */}
              <div className="absolute top-2 right-2 w-10 h-12 border-t-2 border-r-2 border-amber-950/20 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-10 h-12 border-b-2 border-l-2 border-amber-950/20 rounded-bl-xl pointer-events-none" />
            </div>

            {/* Sidebar Details: Portrait, Symbol & Portfolio */}
            <div className="w-80 space-y-6 shrink-0">
              {/* Portrait */}
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <GameIcon name="identity" size={12} color="#C2A36B" />
                  Deity_Visualization
                </div>
                <div className="aspect-[3/4] w-full bg-black/40 border border-white/5 rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center">
                  {selectedGod.imageUrl ? (
                    <img
                      src={normalizeImageUrl(selectedGod.imageUrl, 'gods', selectedGod.index)}
                      alt={selectedGod.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        // Fallback portrait
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedGod.index}/400/600`;
                      }}
                    />
                  ) : (
                    <div className="text-center p-6 text-white/20">
                      <GameIcon name="identity" size={48} className="mx-auto mb-2 opacity-20 animate-pulse-slow" />
                      <span className="text-[10px] uppercase tracking-widest block">No portrait rendered</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Details Card */}
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl text-xs text-white/70">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <GameIcon name="save_data" size={12} color="#C2A36B" />
                  Deity_Attributes
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Alignment</span>
                    <span className="font-bold text-dragon-gold text-[13px]">{renderAlignment(selectedGod.alignment)}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Domains</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedGod.domains.map((domain, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/80 font-bold uppercase tracking-wider">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Portfolio</span>
                    <p className="italic text-white/90 leading-relaxed font-serif">{selectedGod.portfolio}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex gap-4 items-center">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Sacred Symbol</span>
                      <p className="text-[11px] text-white/60 leading-tight font-sans mt-0.5">{selectedGod.symbol}</p>
                    </div>
                    {selectedGod.symbolUrl && (
                      <div className="w-12 h-12 bg-black/40 border border-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={normalizeImageUrl(selectedGod.symbolUrl, 'gods', selectedGod.index)}
                          alt="Deity Sacred Symbol"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-24">
            <GameIcon name="scroll" size={128} />
            <p className="text-sm font-black uppercase tracking-[0.5em]">No_Deity_Selected</p>
          </div>
        )}
      </div>
    </div>
  );
};
