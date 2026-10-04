import React from 'react';
import { GameIcon } from '../../../../game_icons';

interface WikiScraperHeaderProps {
  ripperText: string;
  setRipperText: (val: string) => void;
  isParsingRipper: boolean;
  setIsParsingRipper: (val: boolean) => void;
  customWikiUrl: string;
  setCustomWikiUrl: (val: string) => void;
  isChecking: boolean;
  editingItem: any;
  setEditingItem: (item: any) => void;
  setSelectedMonsterCategory: (cat: string) => void;
  scrapeWiki: () => void;
  parseRawMonsterText: (text: string) => Promise<any>;
  playClickSound: () => void;
  playSuccessSound: () => void;
  playFailSound: () => void;
}

export const WikiScraperHeader: React.FC<WikiScraperHeaderProps> = ({
  ripperText,
  setRipperText,
  isParsingRipper,
  setIsParsingRipper,
  customWikiUrl,
  setCustomWikiUrl,
  isChecking,
  editingItem,
  setEditingItem,
  setSelectedMonsterCategory,
  scrapeWiki,
  parseRawMonsterText,
  playClickSound,
  playSuccessSound,
  playFailSound,
}) => {
  return (
    <>
      {/* Ripper / Raw Text Parser */}
      <div className="bg-[#2a1a1a] border border-red-900/30 rounded-lg p-4 space-y-3 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 pointer-events-none">
            <GameIcon name="scroll" size={60} color="#8B0000" />
         </div>
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
               <GameIcon name="console" size={14} className="text-dragon-red" />
               <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">5e.Tools / Raw Manifestation Ripper</h3>
            </div>
            <span className="text-[8px] font-mono text-white/20">v.1.0_PARSER</span>
         </div>
         <textarea
            value={ripperText}
            onChange={(e) => setRipperText(e.target.value)}
            placeholder="Paste monster stats here from 5e.tools or any PDF/Source. AI will reconstruct the essence..."
            rows={3}
            className="w-full bg-black/40 border border-white/5 p-3 text-[11px] text-white/50 rounded focus:border-dragon-red/40 transition-all font-mono custom-scrollbar"
            title="Raw Manifestation Ripper Input"
         />
         <div className="flex justify-end gap-3 items-center">
            {isParsingRipper && <span className="text-[9px] font-mono text-dragon-red animate-pulse">RECONSTRUCTING_ESSENCE...</span>}
            <button
               title="Manifest Essence from Raw Text"
               onClick={async () => {
                  if (!ripperText.trim()) return;
                  setIsParsingRipper(true);
                  playClickSound();
                  try {
                     const parsed = await parseRawMonsterText(ripperText);
                     if (parsed) {
                        setEditingItem({ ...editingItem, ...parsed });

                        if (parsed.type) {
                           const typeLower = parsed.type.toLowerCase();
                           const validCats = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'];
                           if (validCats.includes(typeLower)) {
                              setSelectedMonsterCategory(typeLower);
                           }
                        }

                        playSuccessSound();
                        setRipperText('');
                     } else {
                        playFailSound();
                     }
                  } finally {
                     setIsParsingRipper(false);
                  }
               }}
               disabled={isParsingRipper || !ripperText}
               className="px-4 py-1.5 bg-dragon-red/80 hover:bg-dragon-red text-white text-[10px] font-bold rounded transition-all flex items-center gap-2 shadow-inner disabled:opacity-30"
            >
               <GameIcon name="magic_effect" size={12} color="#FFFFFF" />
               BAM! MANIFEST ESSENCE
            </button>
         </div>
      </div>

      {/* External Scraper Support */}
      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 mb-6 group transition-all hover:border-dragon-red/20">
        <div className="p-2 bg-dragon-red/10 rounded-full transition-colors group-hover:bg-dragon-red/20">
          <GameIcon name="search" size={14} color="#8B0000" />
        </div>
        <div className="flex-1 flex gap-2">
          <div className="flex-1 bg-black/40 border-b border-white/10 flex items-center px-3 rounded h-9 group-hover:border-dragon-red/30 transition-all">
            <span className="text-[10px] text-white/30 mr-1 font-mono shrink-0">URL:</span>
            <input
              type="text"
              placeholder="Auto-detecting wiki page..."
              value={customWikiUrl}
              onChange={(e) => setCustomWikiUrl(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-[11px] text-dragon-red/90 font-mono"
              title="Wiki URL Input"
            />
          </div>
          <button
            onClick={() => scrapeWiki()}
            disabled={isChecking}
            className="px-6 bg-dragon-red border border-dragon-red/30 text-white text-[11px] font-anton uppercase tracking-widest hover:bg-red-700 transition-all rounded disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95"
            title="Scrape Lore from Wiki"
          >
            {isChecking ? <GameIcon name="refresh" size={14} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="magic_effect" size={14} color="#FFFFFF" />}
            SCRAPE_LORE
          </button>
        </div>
      </div>
    </>
  );
};
