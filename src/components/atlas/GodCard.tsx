import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { normalizeImageUrl } from '../../services/storageService';
import {
  AtlasSheetFrame,
  AtlasSheetHeader,
  AtlasSheetMedia,
  AtlasSheetBody,
  AtlasSheetFooter
} from './sheet/AtlasSheetFrame';

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
    <AtlasSheetFrame
      borderColor="#78350f"
      badgeText="Deity Registry"
      badgeColor="text-amber-950"
      className={cn("w-[380px] sm:w-[380px] max-w-[380px] h-[600px] sm:h-[600px] min-h-[600px] max-h-[600px] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-500", className)}
      style={{
        color: '#3d2516'
      }}
    >
      {/* Header */}
      <AtlasSheetHeader
        title={
          <span
            className="font-serif text-3xl font-black uppercase tracking-tight leading-none text-center text-white block"
            style={{
              textShadow: `-1px -1px 0 #78350f, 1px -1px 0 #78350f, -1px 1px 0 #78350f, 1px 1px 0 #78350f, 0 2px 4px rgba(0,0,0,0.3)`
            }}
          >
            {god.name}
          </span>
        }
        subtitle={
          <div className="w-full flex justify-between items-center px-1">
            <span className="text-[12px] font-black text-red-900 uppercase tracking-widest">
              {renderAlignment(god.alignment)}
            </span>
            <span className="text-[12px] font-black text-amber-900 uppercase tracking-widest opacity-80">
              Gods_of_Faerûn
            </span>
          </div>
        }
      />

      {/* Deity Image / Portrait Area */}
      <div className="relative shrink-0 z-20 flex justify-center items-center">
        {/* Borderless and transparent ChromaKey deity portrait */}
        <AtlasSheetMedia className="aspect-[3/2] w-[260px] border-none shadow-none bg-transparent h-auto p-0">
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
        </AtlasSheetMedia>

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
      <AtlasSheetBody className="bg-parchment-50/10 rounded p-2 border border-amber-950/10">
        <div className="h-full select-text">
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
      </AtlasSheetBody>

      {/* Footer Decoration */}
      <AtlasSheetFooter className="mt-auto justify-center">
        <div className="w-16 h-1 bg-amber-950/20 rounded-full" />
      </AtlasSheetFooter>
    </AtlasSheetFrame>
  );
};
