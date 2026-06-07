import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { ChromaKeyImage } from './ChromaKeyImage';
import { GameIcon } from '../game_icons';

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

interface MaterialCardProps {
  material: any;
  className?: string;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, className }) => {
  const rarityColors: { [key: string]: string } = {
    Common: 'border-parchment-400 text-parchment-600',
    Uncommon: 'border-green-600 text-green-700',
    Rare: 'border-blue-600 text-blue-700',
    'Very Rare': 'border-purple-600 text-purple-700',
    Legendary: 'border-dragon-gold text-dragon-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]',
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
  const categoryIndex = material.material_category?.index || material.material_category || '';

  const descriptionMarkdown = Array.isArray(material.desc) 
    ? material.desc.join('\n\n') 
    : renderValue(material.desc) || "No description available.";

  return (
    <div className={cn(
      "w-[450px] h-[280px] bg-parchment-100 border-[12px] rounded-[24px] p-4 flex gap-4 relative overflow-hidden shadow-xl transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group",
      rarityColors[currentRarity] || rarityColors.Common,
      className
    )}
    style={{
      backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-dragon-gold/40 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-dragon-gold/40 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-dragon-gold/40 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-dragon-gold/40 rounded-br-lg" />

      {/* Rarity at the bottom center */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="w-8 h-[1px] bg-dragon-gold/30" />
        <span className="text-[8px] font-bold text-dragon-red uppercase tracking-[0.2em]">{currentRarity}</span>
        <div className="w-8 h-[1px] bg-dragon-gold/30" />
      </div>

      {/* Left Side: Image */}
      <div className="w-1/3 h-full bg-parchment-200 border-2 border-dragon-gold/20 rounded-lg overflow-hidden relative shadow-inner shrink-0 cursor-zoom-in group/image">
        <div className="absolute inset-0 bg-parchment-300" />
        <img 
          src={ITEM_BACKGROUND}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/10 z-[5]" />
        
        {material.imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
            <ChromaKeyImage 
              src={material.imageUrl} 
              alt={renderValue(material.name) || 'Material'} 
              className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)] group-hover/image:scale-110 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-parchment-400 relative z-20">
            <GameIcon name="sparkles" className="animate-pulse" size={32} color="#D4AF37" />
          </div>
        )}
      </div>

      {/* Right Side: Info */}
      <div className="flex-1 flex flex-col gap-2 relative z-10">
        <div className="border-b border-dragon-gold/30 pb-1">
          <div className="flex justify-between items-start">
            <h3 className="font-header text-xl font-bold uppercase tracking-tighter text-dragon-darkRed leading-none drop-shadow-sm">
              {renderValue(material.name) || 'Unknown Material'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {material.material_category && (
              <div className="flex items-center gap-1.5 bg-dragon-red/5 px-2 py-0.5 rounded border border-dragon-red/10">
                <GameIcon name="sparkles" size={12} color="#8B0000" />
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
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
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
        </div>

        <div className="mt-auto pt-1 border-t border-dragon-gold/10 flex justify-between items-center bg-parchment-100/80 backdrop-blur-sm">
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
        </div>
      </div>
    </div>
  );
};
