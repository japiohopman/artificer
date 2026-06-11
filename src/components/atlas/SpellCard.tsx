import React from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { DiceText } from '../dice/DiceText';
import { useStore } from '../../store/useStore';
import { renderNameValue, getOrdinal } from '../../lib/dataUtils';
import { GameIcon, GameIconName } from '../../game_icons';

interface SpellCardProps {
  spell: any;
  className?: string;
}

export const SpellCard: React.FC<SpellCardProps> = ({ spell, className }) => {
  const { characters, activeCharacterId, learnSpell } = useStore();
  if (!spell) return null;

  const activeCharacter = characters.find(c => c.id === activeCharacterId);
  const isKnown = activeCharacter?.knownSpells?.some(s => s.index === spell.index);

  const levelText = spell.level === 0 ? 'Cantrip' : `${spell.level}${getOrdinal(spell.level)}-level`;
  const school = renderNameValue(spell.school);

  const descriptionMarkdown = Array.isArray(spell.desc) 
    ? spell.desc.join('\n\n') 
    : renderNameValue(spell.desc) || "No description available.";

  const higherLevelsMarkdown = Array.isArray(spell.higher_level)
    ? spell.higher_level.join('\n\n')
    : renderNameValue(spell.higher_level);

  return (
    <div className={cn(
      "w-[400px] h-[600px] bg-parchment-100 border-[12px] rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden shadow-2xl group",
      "border-[#8B4513]", // Default wood/leather brown
      className
    )}
    style={{
      backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 border-b-2 border-dragon-gold/30 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-header text-2xl font-black uppercase tracking-tighter text-dragon-darkRed leading-tight drop-shadow-sm">
              {renderNameValue(spell.name)}
            </h3>
            {activeCharacter && !isKnown && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  learnSpell(spell);
                }}
                className="mt-1 self-start flex items-center gap-1 px-2 py-0.5 bg-dragon-gold text-white text-[9px] font-black uppercase rounded shadow-sm hover:scale-105 active:scale-95 transition-all animate-pulse"
              >
                <GameIcon name="book" size={10} color="currentColor" />
                Learn Spell
              </button>
            )}
            {isKnown && (
              <div className="mt-1 self-start flex items-center gap-1 text-dragon-gold text-[8px] font-black uppercase tracking-tighter italic opacity-60">
                <GameIcon name="check" size={10} color="currentColor" />
                In Spellbook
              </div>
            )}
          </div>
          <div className="bg-dragon-red/10 px-2 py-1 rounded border border-dragon-red/20 shadow-sm shrink-0">
             <span className="text-[10px] font-anton text-dragon-red uppercase tracking-widest leading-none">
               Lv. {spell.level}
             </span>
          </div>
        </div>
        <p className="text-[12px] font-playfair italic text-parchment-600 mt-1">
          {levelText} {school} {spell.ritual ? '(Ritual)' : ''}
        </p>
      </div>

      {/* Main Info Blocks */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <InfoBlock iconName="speed" label="Casting Time" value={spell.casting_time} />
        <InfoBlock iconName="range" label="Range" value={spell.range} />
        <InfoBlock iconName="magic_effect" label="Components" value={spell.components?.join(', ') + (spell.material ? '*' : '')} tooltip={spell.material} />
        <InfoBlock iconName="loading" label="Duration" value={(spell.concentration ? 'Conc. ' : '') + spell.duration} />
      </div>

      {/* Image / Illustration */}
      <div className="relative h-40 w-full bg-parchment-200 border-2 border-dragon-gold/20 rounded-lg overflow-hidden shadow-inner group/image shrink-0">
        {spell.imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-2">
             <ChromaKeyImage 
                src={spell.imageUrl} 
                alt={spell.name} 
                className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)] group-hover/image:scale-105 transition-transform duration-700"
              />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-parchment-300">
            <GameIcon name="book" size={48} color="currentColor" className="opacity-20 animate-pulse-slow" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Arcane Pattern</span>
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>

      {/* Description */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-4">
        <div className="text-[13px] leading-relaxed text-parchment-900 font-serif italic text-justify">
          <div className="markdown-body">
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2"><DiceText iconSize={14}>{children}</DiceText></p>,
                li: ({ children }) => <li className="mb-1"><DiceText iconSize={14}>{children}</DiceText></li>
              }}
            >
              {descriptionMarkdown}
            </Markdown>
          </div>
        </div>

        {higherLevelsMarkdown && (
          <div className="pt-2 border-t border-dragon-gold/10">
            <h4 className="text-[11px] font-bold uppercase text-dragon-red font-header tracking-wider mb-1">
              At Higher Levels
            </h4>
            <div className="text-[12px] leading-relaxed text-parchment-800 font-serif italic">
               <Markdown 
                 remarkPlugins={[remarkGfm]}
                 components={{
                   p: ({ children }) => <p className="mb-2"><DiceText iconSize={14}>{children}</DiceText></p>,
                   li: ({ children }) => <li className="mb-1"><DiceText iconSize={14}>{children}</DiceText></li>
                 }}
               >
                 {higherLevelsMarkdown}
               </Markdown>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Classes */}
      <div className="relative z-10 pt-2 border-t border-dragon-gold/20 mt-auto">
        <div className="flex flex-wrap gap-1">
          {spell.classes?.map((cls: any, i: number) => (
            <span key={i} className="text-[9px] font-bold uppercase bg-parchment-300/50 text-parchment-600 border border-parchment-400/30 px-1.5 py-0.5 rounded">
              {renderNameValue(cls)}
            </span>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-dragon-gold/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-dragon-gold/20 rounded-bl-xl pointer-events-none" />
    </div>
  );
};

const InfoBlock = ({ iconName, iconPath, label, value, tooltip }: { iconName?: string, iconPath?: string, label: string, value: string, tooltip?: string }) => (
  <div className="flex flex-col min-w-0" title={tooltip}>
    <div className="flex items-center gap-1 opacity-60">
      <GameIcon name={iconName} path={iconPath} size={10} color="#8B0000" />
      <span className="text-[9px] font-bold uppercase tracking-wider text-parchment-500">{label}</span>
    </div>
    <span className="text-[11px] font-bold text-parchment-800 truncate leading-tight mt-0.5">
      {value || 'None'}
    </span>
  </div>
);
