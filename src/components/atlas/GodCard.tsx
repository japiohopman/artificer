import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { normalizeImageUrl } from '../../services/storageService';

interface GodCardProps {
  god: any;
  className?: string;
}

export const GodCard: React.FC<GodCardProps> = ({ god, className }) => {
  const [loreText, setLoreText] = useState<string>('');
  const [isLoadingLore, setIsLoadingLore] = useState<boolean>(false);

  useEffect(() => {
    if (!god || !god.lore) return;

    const fetchLore = async () => {
      setIsLoadingLore(true);
      try {
        const lorePath = god.lore.startsWith('public/')
          ? god.lore.substring(6)
          : god.lore;
        const cleanPath = lorePath.startsWith('/') ? lorePath : '/' + lorePath;

        const res = await fetch(cleanPath);
        if (res.ok) {
          const text = await res.text();
          setLoreText(text);
        } else {
          setLoreText(`# ${god.name}\n\nNo lore chronicle found in the repository.`);
        }
      } catch (e) {
        console.error("Error fetching god lore for GodCard:", e);
        setLoreText(`# ${god.name}\n\nFailed to load lore.`);
      } finally {
        setIsLoadingLore(false);
      }
    };

    fetchLore();
  }, [god]);

  if (!god) return null;

  const renderAlignment = (alignment: any) => {
    if (!alignment) return 'True Neutral';
    if (typeof alignment === 'string') return alignment;
    return alignment.name || alignment.index || 'True Neutral';
  };

  return (
    <div
      className={cn(
        "w-[380px] h-[600px] border-[14px] rounded-[24px] p-5 flex flex-col gap-3 relative overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] group text-black",
        "border-amber-900/60",
        className
      )}
      style={{
        backgroundImage: `url('/assets/ui/parchment.jpg')`,
        backgroundColor: '#f5ebd0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#3d2516'
      }}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[#e6d5b0]/20 mix-blend-multiply pointer-events-none rounded-[12px]" />
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-950/20 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-950/20 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-950/20 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-950/20 rounded-br-lg" />

      {/* Registry Info at the bottom center */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="w-8 h-[1px] bg-amber-950/30" />
        <span className="text-[8px] font-bold text-red-900 uppercase tracking-[0.2em]">Deity Registry</span>
        <div className="w-8 h-[1px] bg-amber-950/30" />
      </div>

      {/* Header */}
      <div className="flex flex-col relative z-10 pb-1">
        <h3
          className="font-serif text-3xl font-black uppercase tracking-tight leading-none text-center text-white"
          style={{
            textShadow: `-1px -1px 0 #78350f, 1px -1px 0 #78350f, -1px 1px 0 #78350f, 1px 1px 0 #78350f, 0 2px 4px rgba(0,0,0,0.3)`
          }}
        >
          {god.name}
        </h3>

        {/* stretching HR */}
        <div className="h-[2px] w-[calc(100%+40px)] -ml-5 my-2 border-y border-amber-950/20" style={{ backgroundColor: '#78350f' }} />

        <div className="w-full flex justify-between items-center px-1">
          <span className="text-[12px] font-black text-red-900 uppercase tracking-widest">
            {renderAlignment(god.alignment)}
          </span>
          <span className="text-[12px] font-black text-amber-900 uppercase tracking-widest opacity-80">
            Gods_of_Faerûn
          </span>
        </div>
      </div>

      {/* Deity Image / Portrait Area */}
      <div className="relative shrink-0 z-20 flex justify-center items-center">
        {/* Borderless and transparent ChromaKey deity portrait */}
        <div className="aspect-[3/2] w-[260px] relative flex items-center justify-center overflow-hidden">
          {god.imageUrl ? (
            <ChromaKeyImage
              src={normalizeImageUrl(god.imageUrl, 'gods', god.index)}
              alt={god.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center p-4 opacity-20">
              <GameIcon name="identity" size={48} className="mx-auto mb-1" />
              <span className="text-[10px] uppercase tracking-widest block">No portrait</span>
            </div>
          )}
        </div>

        {/* Sacred Symbol floating at top right */}
        {(god.symbolUrl || god.index) && (
          <div className="absolute top-0 right-1 z-30 w-12 h-12 bg-[#161616]/95 border border-white/10 rounded-full overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-lg">
            <img
              src={god.symbolUrl && god.symbolUrl !== "/assets/atlas/gods/images/symbols/undefined.webp"
                ? normalizeImageUrl(god.symbolUrl, 'gods', god.index)
                : `/assets/atlas/gods/images/symbols/${god.index}.webp`
              }
              alt="Sacred Symbol"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Metadata Detail Area */}
      <div className="relative z-10 flex flex-col gap-1.5 border-y border-amber-950/10 py-2">
        <div className="text-[11px] leading-snug">
          <span className="font-bold uppercase text-red-900">Portfolio:</span> {god.portfolio}
        </div>
        <div className="text-[11px] leading-snug">
          <span className="font-bold uppercase text-red-900">Symbol:</span> {god.symbol}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {god.domains && god.domains.map((domain: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-amber-950/10 border border-amber-950/20 rounded text-[9px] text-amber-950 font-bold uppercase tracking-wider">
              {domain}
            </span>
          ))}
        </div>
      </div>

      {/* Lore Content Scrollable */}
      <div className="flex-1 overflow-hidden relative z-10 bg-parchment-50/10 rounded p-2 border border-amber-950/10">
        <div className="h-full overflow-y-auto custom-scrollbar pr-1 select-text">
          {isLoadingLore ? (
            <div className="h-full flex justify-center items-center opacity-30">
              <GameIcon name="refresh" className="animate-spin" size={24} />
            </div>
          ) : (
            <div className="text-[12px] leading-relaxed font-serif text-amber-950 text-justify">
              <div className="markdown-body text-inherit">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {loreText}
                </Markdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-auto flex justify-center relative z-10">
        <div className="w-16 h-1 bg-amber-950/20 rounded-full" />
      </div>
    </div>
  );
};
