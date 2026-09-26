import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { GameIcon } from '../../game_icons';
import { normalizeImageUrl } from '../../services/storageService';
import {
  AtlasSheetFrame,
  AtlasSheetHeader,
  AtlasSheetMedia,
  AtlasSheetBody,
  AtlasSheetFooter
} from './sheet/AtlasSheetFrame';

const ITEM_BACKGROUND = "/assets/ui/back_item_slug.webp";

interface MaterialCardProps {
  material: any;
  className?: string;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, className }) => {
  const rarityBorderColors: { [key: string]: string } = {
    Common: '#8B4513',
    Uncommon: '#16a34a',
    Rare: '#2563eb',
    'Very Rare': '#9333ea',
    Legendary: '#d4af37',
  };

  const renderValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      const best = val.name || val.value || val.label || (typeof val.toString === 'function' && val.toString() !== '[object Object]' ? val.toString() : JSON.stringify(val));
      return typeof best === 'object' ? renderValue(best) : String(best);
    }
    return String(val);
  };

  const currentRarity = renderValue(material.rarity) || 'Common';

  const descriptionMarkdown = Array.isArray(material.desc) 
    ? material.desc.join('\n\n') 
    : renderValue(material.desc) || "No description available.";

  return (
    <AtlasSheetFrame
      borderColor={rarityBorderColors[currentRarity] || rarityBorderColors.Common}
      badgeText={currentRarity}
      className={cn("w-[450px] sm:w-[450px] max-w-[450px] h-[300px] sm:h-[300px] min-h-[300px] max-h-[300px] p-4 gap-3", className)}
    >
      <div className="flex gap-4 h-full min-h-0">
        {/* Left Side: Image */}
        <AtlasSheetMedia className="w-1/3 h-full aspect-auto cursor-zoom-in">
          <div className="absolute inset-0 bg-parchment-300" />
          <img
            src={ITEM_BACKGROUND}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 z-[5]" />

          {material.imageUrl || material.index ? (
            <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
              <ChromaKeyImage
                src={normalizeImageUrl(material.imageUrl, 'materials', material.index)}
                alt={renderValue(material.name) || 'Material'}
                className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)] group-hover/image:scale-110 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-parchment-400 relative z-20">
              <GameIcon name="magic_effect" className="animate-pulse" size={32} color="#D4AF37" />
            </div>
          )}
        </AtlasSheetMedia>

        {/* Right Side: Info */}
        <div className="flex-1 flex flex-col gap-2 relative z-10 min-w-0">
          <AtlasSheetHeader
            title={renderValue(material.name) || 'Unknown Material'}
            titleClassName="text-xl leading-none"
            subtitle={
              <div className="flex flex-wrap gap-2 mt-1">
                {material.material_category && (
                  <div className="flex items-center gap-1.5 bg-dragon-red/5 px-2 py-0.5 rounded border border-dragon-red/10">
                    <GameIcon name="magic_effect" size={12} color="#8B0000" />
                    <span className="text-[9px] font-bold text-parchment-500 uppercase tracking-widest leading-none">
                      {renderValue(material.material_category)}
                    </span>
                  </div>
                )}
                {material.material_sub_category && (
                  <div className="flex items-center gap-1.5 bg-dragon-red/5 px-2 py-0.5 rounded border border-dragon-red/10">
                    <span className="text-[9px] font-bold text-parchment-500 uppercase tracking-widest leading-none opacity-60">
                      {renderValue(material.material_sub_category)}
                    </span>
                  </div>
                )}
              </div>
            }
          />

          <AtlasSheetBody className="space-y-2">
            <div className="text-[10px] text-parchment-800 italic leading-relaxed space-y-1 font-body">
              <div className="markdown-body text-inherit">
                <Markdown remarkPlugins={[remarkGfm]}>{descriptionMarkdown}</Markdown>
              </div>
            </div>

            {material.properties && material.properties.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {material.properties.map((prop: any, i: number) => (
                  <span key={i} className="text-[8px] font-bold uppercase bg-dragon-red/5 text-dragon-red border border-dragon-red/10 px-1.5 py-0.5 rounded">
                    {renderValue(prop)}
                  </span>
                ))}
              </div>
            )}
          </AtlasSheetBody>

          <AtlasSheetFooter className="pt-1 bg-parchment-100/80">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-parchment-600">
                <GameIcon name="coins" size={10} color="#D97706" />
                <span className="text-[9px] font-bold uppercase tracking-tight">
                  {renderValue(material.cost?.quantity)} {renderValue(material.cost?.unit)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-parchment-600">
                <GameIcon name="weight" size={10} color="#8B4513" />
                <span className="text-[9px] font-bold uppercase tracking-tight">
                  {renderValue(material.weight)} lb.
                </span>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-dragon-gold/20 rounded-full" />
          </AtlasSheetFooter>
        </div>
      </div>
    </AtlasSheetFrame>
  );
};
