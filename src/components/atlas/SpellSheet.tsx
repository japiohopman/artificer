import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { DiceText } from '../dice/DiceText';
import { renderNameValue, getOrdinal } from '../../lib/dataUtils';
import { GameIcon } from '../../game_icons';
import { SpellSprite } from './SpellSprite';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useActiveCharacter } from '../../lib/character';
import { fetchSpellData } from '../../services/storageService';
import {
  AtlasSheetFrame,
  AtlasSheetHeader,
  AtlasSheetMedia,
  AtlasSheetInfoGrid,
  AtlasSheetInfoBlock,
  AtlasSheetBody,
  AtlasSheetFooter
} from './sheet/AtlasSheetFrame';

export interface SpellSheetProps {
  spell: any;
  className?: string;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isSelectionDisabled?: boolean;
  disabledReason?: string;
  hideLearnButton?: boolean;
  ruleset?: '2014' | '2024';
}

export const SpellSheet: React.FC<SpellSheetProps> = ({
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
  const [fullSpell, setFullSpell] = useState<any>(spell);

  // Lazy-load complete canonical spell data if missing description or key fields
  useEffect(() => {
    setFullSpell(spell);
    if (!spell) return;

    const needsDetail = (!spell.desc || (Array.isArray(spell.desc) && spell.desc.length === 0)) || !spell.casting_time;
    const spellKey = spell.index || spell.id;

    if (needsDetail && spellKey) {
      let isMounted = true;
      fetchSpellData(spellKey, ruleset).then((loaded) => {
        if (isMounted && loaded) {
          setFullSpell((prev: any) => ({ ...prev, ...loaded }));
        }
      }).catch((err) => {
        console.warn(`[SpellSheet] Failed to fetch full spell details for ${spellKey}:`, err);
      });
      return () => { isMounted = false; };
    }
  }, [spell, ruleset]);

  if (!fullSpell) return null;

  const isKnownInStore = activeCharacter?.knownSpells?.some(s =>
    s.index === fullSpell.index || (s.name && fullSpell.name && s.name.toLowerCase() === fullSpell.name.toLowerCase())
  );
  const isSelectedState = isSelected !== undefined ? isSelected : isKnownInStore;

  const spellLevelNum = typeof fullSpell.level === 'number' ? fullSpell.level : parseInt(fullSpell.level || '0', 10);
  const levelText = spellLevelNum === 0 ? 'Cantrip' : `${spellLevelNum}${getOrdinal(spellLevelNum)}-level`;
  const school = renderNameValue(fullSpell.school);

  const descriptionMarkdown = Array.isArray(fullSpell.desc)
    ? fullSpell.desc.join('\n\n')
    : renderNameValue(fullSpell.desc) || "No description available.";

  const higherLevelsMarkdown = Array.isArray(fullSpell.higher_level)
    ? fullSpell.higher_level.join('\n\n')
    : renderNameValue(fullSpell.higher_level);

  const tierIconSrc = spellLevelNum > 0
    ? `/assets/icons/spell-tiers/spell${spellLevelNum}.webp`
    : null;

  const componentsText = Array.isArray(fullSpell.components)
    ? fullSpell.components.join(', ') + (fullSpell.material ? '*' : '')
    : (fullSpell.components || '—');

  const actionControls = onToggleSelect ? (
    <div className="mt-1.5 flex items-center gap-2">
      {isSelectedState ? (
        <button
          type="button"
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
          type="button"
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
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            learnSpell(fullSpell);
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
  ) : null;

  const topRightMedallion = tierIconSrc ? (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-stone-900/40 border-2 border-dragon-gold/30 rounded-full flex items-center justify-center p-1 shadow-md shrink-0">
      <img
        src={tierIconSrc}
        alt={`Spell Tier ${spellLevelNum}`}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      />
      <div className="absolute -bottom-1 -right-1 bg-dragon-red text-white text-[8px] font-black w-5 h-5 rounded-full border border-dragon-gold/40 flex items-center justify-center shadow">
        {spellLevelNum}
      </div>
    </div>
  ) : (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-stone-900/40 border-2 border-dragon-gold/30 rounded-full flex items-center justify-center p-2 sm:p-2.5 shadow-md shrink-0">
      <GameIcon name="magic_effect" size={24} color="#D4AF37" className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
      <div className="absolute -bottom-1 -right-1 bg-dragon-darkRed text-white text-[7px] font-black w-5 h-5 rounded-full border border-dragon-gold/40 flex items-center justify-center shadow uppercase">
        C
      </div>
    </div>
  );

  return (
    <AtlasSheetFrame className={className}>
      {/* Header */}
      <AtlasSheetHeader
        title={renderNameValue(fullSpell.name)}
        subtitle={`${levelText} ${school} ${fullSpell.ritual ? '(Ritual)' : ''}`}
        topRight={topRightMedallion}
        actionControls={actionControls}
      />

      {/* Main Info Blocks */}
      <AtlasSheetInfoGrid cols={2}>
        <AtlasSheetInfoBlock iconName="speed" label="Casting Time" value={fullSpell.casting_time || '1 action'} />
        <AtlasSheetInfoBlock iconName="range" label="Range" value={fullSpell.range || 'Self'} />
        <AtlasSheetInfoBlock iconName="magic_effect" label="Components" value={componentsText} tooltip={fullSpell.material} />
        <AtlasSheetInfoBlock iconName="loading" label="Duration" value={(fullSpell.concentration ? 'Conc. ' : '') + (fullSpell.duration || 'Instantaneous')} />
      </AtlasSheetInfoGrid>

      {/* Image / Illustration */}
      <AtlasSheetMedia>
        <SpellSprite
          spell={fullSpell}
          ruleset={ruleset}
          size="100%"
          alt={renderNameValue(fullSpell.name)}
          className="w-full h-full object-contain group-hover/image:scale-105 transition-transform duration-700"
        />
      </AtlasSheetMedia>

      {/* Description */}
      <AtlasSheetBody>
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
      </AtlasSheetBody>

      {/* Footer / Classes */}
      <AtlasSheetFooter>
        <div className="flex flex-wrap gap-1">
          {fullSpell.classes?.map((cls: any, i: number) => (
            <span key={i} className="text-[9px] font-bold uppercase bg-parchment-300/50 text-parchment-600 border border-parchment-400/30 px-1.5 py-0.5 rounded">
              {renderNameValue(cls)}
            </span>
          ))}
        </div>
      </AtlasSheetFooter>
    </AtlasSheetFrame>
  );
};
