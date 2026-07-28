import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
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

  // Build the correct symbolUrl if missing in record
  const getSymbolUrl = (god: God) => {
    if (god.symbolUrl && god.symbolUrl !== "/assets/atlas/gods/images/symbols/undefined.webp") {
      return normalizeImageUrl(god.symbolUrl, 'gods', god.index);
    }
    return `/assets/atlas/gods/images/symbols/${god.index}.webp`;
  };

  const currentSymbolUrl = selectedGod ? getSymbolUrl(selectedGod) : '';
  const currentImageUrl = selectedGod ? normalizeImageUrl(selectedGod.imageUrl || '', 'gods', selectedGod.index) : '';

  return (
    <div className="flex h-full bg-[#111] text-white select-none">
      {/* Sidebar: Pantheon Selection */}
      <div className="w-64 border-r border-white/10 flex flex-col bg-[#161616] shrink-0">
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

      {/* Main Content Area: D&D Book (A4 format) */}
      <div className="flex-1 overflow-y-auto p-12 bg-[#090909] flex flex-col items-center justify-start custom-scrollbar">
        {selectedGod ? (
          <div className="flex flex-col items-center gap-6 max-w-full">
            {/* Top Toolbar */}
            <div className="w-[820px] max-w-full flex justify-between items-center bg-[#161616] border border-white/10 rounded-lg p-3 px-6 shadow-md text-xs">
              <div className="flex items-center gap-2 text-white/60 font-mono text-[11px]">
                <GameIcon name="book" size={14} color="#D4AF37" />
                <span>WORKSPACE // D&D PANTHEON MANUAL</span>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveLore}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-red-800 text-white rounded font-bold uppercase tracking-widest hover:bg-red-900 transition-colors shadow-sm disabled:opacity-50 text-[10px]"
                    >
                      {isSaving ? "BAKING CHRONICLE..." : "BAKE & COMMIT CHRONICLE"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditMarkdown(loreContent);
                        playClickSound();
                      }}
                      className="px-4 py-1.5 bg-white/5 text-white/80 border border-white/10 rounded font-bold uppercase tracking-widest hover:bg-white/10 transition-colors text-[10px]"
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
                    className="px-4 py-1.5 bg-dragon-red text-white rounded font-bold uppercase tracking-widest hover:bg-red-800 transition-all shadow-sm text-[10px]"
                  >
                    EDIT CHRONICLE
                  </button>
                )}
              </div>
            </div>

            {/* D&D Book Page (A4 Format) */}
            <div
              className="w-[820px] min-h-[1160px] shadow-[0_35px_60px_rgba(0,0,0,0.8)] relative flex flex-col justify-between text-amber-950 p-14 select-text font-serif border-[14px] border-amber-900/40 rounded-[2px]"
              style={{
                backgroundImage: `url('/assets/ui/parchment.jpg')`,
                backgroundColor: '#f5ebd0',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)'
              }}
            >
              {/* Subtle vintage ink blend over the whole page */}
              <div className="absolute inset-0 bg-[#e5d0aa]/15 mix-blend-multiply pointer-events-none" />

              {/* D&D Styled Top Border Frame */}
              <div className="absolute top-4 left-4 right-4 h-1 border-t-2 border-b border-amber-900/45" />
              <div className="absolute bottom-4 left-4 right-4 h-1 border-t border-b-2 border-amber-900/45" />

              {/* Main Content Area */}
              <div className="relative z-10 flex flex-col flex-1">
                {/* Deity Header Section */}
                <div className="border-b-[3px] border-double border-amber-900/50 pb-4 mb-6 flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[11px] font-sans font-black uppercase tracking-[0.25em] text-red-900 leading-none block">
                      DEITIES OF FAERÛN
                    </span>
                    <h1
                      className="text-5xl font-black uppercase tracking-tight text-red-900 leading-none font-serif"
                      style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.6)' }}
                    >
                      {selectedGod.name}
                    </h1>
                  </div>

                  {/* Sacred Symbol (D&D Book Style representation) */}
                  {currentSymbolUrl && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-amber-900/70 block">
                          SACRED SYMBOL
                        </span>
                        <span className="text-[10px] font-serif italic text-amber-950/80 max-w-[150px] block leading-tight">
                          {selectedGod.symbol}
                        </span>
                      </div>
                      <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 bg-amber-900/5 border-2 border-amber-900/20 rounded-full shadow-inner bg-blend-multiply">
                        <img
                          src={currentSymbolUrl}
                          alt="Sacred Symbol"
                          className="w-full h-full object-contain filter contrast-[1.05]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Facts / Stat Block (D&D Style table) */}
                <div className="bg-amber-900/5 border-y-2 border-amber-900/30 p-3 px-4 mb-6 grid grid-cols-3 gap-6 text-xs font-serif leading-tight">
                  <div>
                    <span className="font-sans font-black text-red-900 uppercase tracking-widest text-[9px] block mb-1">
                      ALIGNMENT
                    </span>
                    <span className="font-bold text-amber-950 text-sm">
                      {renderAlignment(selectedGod.alignment)}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans font-black text-red-900 uppercase tracking-widest text-[9px] block mb-1">
                      DOMAINS
                    </span>
                    <span className="font-bold text-amber-950 text-sm">
                      {selectedGod.domains?.join(', ') || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans font-black text-red-900 uppercase tracking-widest text-[9px] block mb-1">
                      PORTFOLIO
                    </span>
                    <span className="font-bold text-amber-950 text-sm italic">
                      {selectedGod.portfolio}
                    </span>
                  </div>
                </div>

                {/* Lore Body Container */}
                <div className="flex-1 flex flex-col">
                  {isLoading ? (
                    <div className="flex-1 flex justify-center items-center opacity-30 py-32">
                      <GameIcon name="refresh" className="animate-spin text-amber-950" size={48} />
                    </div>
                  ) : isEditing ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        value={editMarkdown}
                        onChange={(e) => setEditMarkdown(e.target.value)}
                        className="w-full flex-1 bg-white/50 border border-amber-900/30 rounded p-6 text-[13px] font-mono text-amber-950 focus:outline-none focus:border-red-900/40 resize-none custom-scrollbar leading-relaxed"
                        placeholder="Write chronicle markdown text..."
                        title="Edit Chronicle Content"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 relative">
                      {/* Floating, borderless, transparent ChromaKey deity portrait */}
                      {currentImageUrl && (
                        <div className="float-right ml-6 mb-4 w-[280px] pointer-events-none relative z-20">
                          {/* Absolutely borderless, floating ChromaKey canvas rendering directly over parchment */}
                          <ChromaKeyImage
                            src={currentImageUrl}
                            alt={selectedGod.name}
                            className="w-full h-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] filter saturate-[0.95]"
                          />
                        </div>
                      )}

                      {/* Majestic Two-Column Lore Content with Drop Cap */}
                      <div className="text-[14px] leading-[1.6] font-serif text-amber-950 text-justify columns-2 gap-8 select-text">
                        <div className="markdown-body text-inherit">
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-4 text-justify indent-4 first-of-type:indent-0 first-of-type:first-letter:text-5xl first-of-type:first-letter:float-left first-of-type:first-letter:font-black first-of-type:first-letter:text-red-900 first-of-type:first-letter:mr-2 first-of-type:first-letter:leading-[0.8] first-of-type:first-letter:font-serif">
                                  {children}
                                </p>
                              ),
                              h1: ({ children }) => <h3 className="font-serif text-xl font-bold uppercase text-red-900 mt-6 mb-2">{children}</h3>,
                              h2: ({ children }) => <h4 className="font-serif text-lg font-bold uppercase text-amber-900 mt-4 mb-2">{children}</h4>,
                              h3: ({ children }) => <h5 className="font-serif text-md font-bold text-amber-950 mt-3 mb-1">{children}</h5>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-justify">{children}</li>,
                            }}
                          >
                            {loreContent}
                          </Markdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Bottom Page Footer */}
              <div className="mt-8 pt-4 border-t border-amber-900/10 flex justify-between items-center text-[10px] font-sans font-black text-amber-900/60 uppercase tracking-[0.2em] relative z-10">
                <span>FAERÛN PANTHEON CHRONICLES</span>
                <span className="font-serif font-black text-[12px] text-red-900">
                  PAGE {gods.findIndex(g => g.index === selectedGod.index) + 1}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-36">
            <GameIcon name="scroll" size={128} />
            <p className="text-sm font-black uppercase tracking-[0.5em]">No_Deity_Selected</p>
          </div>
        )}
      </div>
    </div>
  );
};
