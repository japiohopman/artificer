import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { DiceText } from '../dice/DiceText';
import { renderNameValue, getOrdinal } from '../../lib/dataUtils';
import { GameIcon } from '../../game_icons';
import { SpellSprite } from './SpellSprite';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useActiveCharacter } from '../../lib/character';

export interface SpellCardProps {
  spell: any;
  className?: string;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isSelectionDisabled?: boolean;
  disabledReason?: string;
  hideLearnButton?: boolean;
  ruleset?: '2014' | '2024';
}

export const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  className,
  isSelected,
  onToggleSelect,
  isSelectionDisabled,
  disabledReason,
  hideLearnButton,
  ruleset
}) => {
  const { learnSpell } = useCharacterStore();
  const activeCharacter = useActiveCharacter();
  if (!spell) return null;

  const isKnownInStore = activeCharacter?.knownSpells?.some(s => s.index === spell.index || (s.name && spell.name && s.name.toLowerCase() === spell.name.toLowerCase()));
  const isSelectedState = isSelected !== undefined ? isSelected : isKnownInStore;

  const levelText = spell.level === 0 || spell.level === "0" ? 'Cantrip' : `${spell.level}${getOrdinal(spell.level)}-level`;
  const school = renderNameValue(spell.school);

  const descriptionMarkdown = Array.isArray(spell.desc) 
    ? spell.desc.join('\n\n') 
    : renderNameValue(spell.desc) || "No description available.";

  const higherLevelsMarkdown = Array.isArray(spell.higher_level)
    ? spell.higher_level.join('\n\n')
    : renderNameValue(spell.higher_level);

  const tierIconSrc = spell.level > 0
    ? `/assets/icons/spell-tiers/spell${spell.level}.webp`
    : null;

  return (
    <div className={cn(
      "w-full max-w-[460px] min-h-[620px] max-h-[85vh] sm:h-[680px] bg-parchment-100 border-[12px] sm:border-[14px] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 relative overflow-hidden shadow-2xl group shrink-0",
      "border-[#8B4513]", // Default wood/leather brown
      className
    )}
    style={{
      backgroundImage: `url('/assets/ui/parchment.jpg')`,
      backgroundColor: '#f5ebd0',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 border-b-2 border-dragon-gold/30 pb-2">
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-header text-xl sm:text-2xl font-black uppercase tracking-tight text-dragon-darkRed leading-snug drop-shadow-sm truncate">
              {renderNameValue(spell.name)}
            </h3>

            {/* Custom Selection Action Controls */}
            {onToggleSelect ? (
              <div className="mt-1.5 flex items-center gap-2">
                {isSelectedState ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-dragon-darkRed text-dragon-gold text-[10px] font-black uppercase rounded shadow border border-dragon-gold/50 hover:bg-dragon-red transition-all"
                  >
                    <GameIcon name="check" size={12} color="currentColor" />
                    <span>Selected Arcana</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelectionDisabled) onToggleSelect();
                    }}
                    disabled={isSelectionDisabled}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase rounded shadow transition-all",
                      isSelectionDisabled
                        ? "bg-stone-300 text-stone-600 border border-stone-400 cursor-not-allowed opacity-80"
                        : "bg-dragon-gold text-stone-950 hover:bg-amber-400 border border-amber-600 active:scale-95"
                    )}
                    title={isSelectionDisabled ? disabledReason : undefined}
                  >
                    <GameIcon name="magic_effect" size={12} color="currentColor" />
                    <span>{isSelectionDisabled ? (disabledReason || 'Limit Reached') : 'Select Spell'}</span>
                  </button>
                )}
              </div>
            ) : (!hideLearnButton && activeCharacter) ? (
              <>
                {!isKnownInStore && (
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
                {isKnownInStore && (
                  <div className="mt-1 self-start flex items-center gap-1 text-dragon-gold text-[8px] font-black uppercase tracking-tighter italic opacity-80">
                    <GameIcon name="check" size={10} color="currentColor" />
                    In Spellbook
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Spell Tier Medallion using public/assets/icons/spell-tiers/ */}
          {tierIconSrc ? (
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-stone-900/40 border-2 border-dragon-gold/30 rounded-full flex items-center justify-center p-1 shadow-md shrink-0">
              <img
                src={tierIconSrc}
                alt={`Spell Tier ${spell.level}`}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute -bottom-1 -right-1 bg-dragon-red text-white text-[8px] font-black w-5 h-5 rounded-full border border-dragon-gold/40 flex items-center justify-center shadow">
                {spell.level}
              </div>
            </div>
          ) : (
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-stone-900/40 border-2 border-dragon-gold/30 rounded-full flex items-center justify-center p-2 sm:p-2.5 shadow-md shrink-0">
              <GameIcon name="magic_effect" size={24} color="#D4AF37" className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              <div className="absolute -bottom-1 -right-1 bg-dragon-darkRed text-white text-[7px] font-black w-5 h-5 rounded-full border border-dragon-gold/40 flex items-center justify-center shadow uppercase">
                C
              </div>
            </div>
          )}
        </div>
        <p className="text-[11px] sm:text-[12px] font-playfair italic text-parchment-600 mt-1">
          {levelText} {school} {spell.ritual ? '(Ritual)' : ''}
        </p>
      </div>

      {/* Main Info Blocks */}
      <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-3">
        <InfoBlock iconName="speed" label="Casting Time" value={spell.casting_time} />
        <InfoBlock iconName="range" label="Range" value={spell.range} />
        <InfoBlock iconName="magic_effect" label="Components" value={spell.components?.join(', ') + (spell.material ? '*' : '')} tooltip={spell.material} />
        <InfoBlock iconName="loading" label="Duration" value={(spell.concentration ? 'Conc. ' : '') + spell.duration} />
      </div>

      {/* Image / Illustration - h-40 on small, h-48 on sm */}
      <div className="relative aspect-square h-36 sm:h-44 mx-auto bg-parchment-200 border-2 border-dragon-gold/20 rounded-lg overflow-hidden shadow-inner group/image shrink-0 flex items-center justify-center p-2">
        <SpellSprite
          spell={spell}
          ruleset={ruleset}
          size="100%"
          alt={renderNameValue(spell.name)}
          className="w-full h-full object-contain group-hover/image:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
      </div>

      {/* Description */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-3">
        <div className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-parchment-900 font-serif italic text-justify">
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
            <div className="text-[11.5px] sm:text-[12px] leading-relaxed text-parchment-800 font-serif italic">
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
      <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-dragon-gold/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-dragon-gold/20 rounded-bl-xl pointer-events-none" />
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
