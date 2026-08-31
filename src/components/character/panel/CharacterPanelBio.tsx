import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';

interface CharacterPanelBioProps {
  character: Partial<Character>;
  onUpdate?: (updates: Partial<Character>) => void;
  isEditable?: boolean;
}

export const CharacterPanelBio: React.FC<CharacterPanelBioProps> = ({
  character,
  onUpdate,
  isEditable = false
}) => {
  const traitsText = Array.isArray(character.traits)
    ? character.traits.map(t => typeof t === 'string' ? t : t.name || t.desc || '').filter(Boolean).join(', ')
    : '';

  const idealsText = Array.isArray(character.ideals) ? character.ideals.join(', ') : '';
  const bondsText = Array.isArray(character.bonds) ? character.bonds.join(', ') : '';
  const flawsText = Array.isArray(character.flaws) ? character.flaws.join(', ') : '';
  const backstoryText = character.backstory || '';

  const handleArrayChange = (field: 'ideals' | 'bonds' | 'flaws', val: string) => {
    if (!onUpdate) return;
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    onUpdate({ [field]: arr });
  };

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar p-2 bg-white/40 backdrop-blur-sm rounded border border-dragon-gold/20">
      <div className="flex items-center gap-1.5 border-b border-dragon-gold/30 pb-1.5">
        <GameIcon name="pen_line" size={14} color="#8B0000" />
        <h3 className="text-xs font-header font-black text-dragon-darkRed uppercase tracking-wider">
          Character Biography & Narrative
        </h3>
      </div>

      {/* Personality Traits */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 shadow-xs">
        <span className="text-[9px] font-black uppercase text-dragon-red block mb-0.5">
          Personality Traits
        </span>
        {isEditable ? (
          <textarea
            value={traitsText}
            onChange={(e) => {
              if (onUpdate) {
                onUpdate({
                  traits: e.target.value ? [{ name: 'Custom Trait', index: 'custom_trait', desc: e.target.value }] : []
                });
              }
            }}
            placeholder="Describe your character's quirks, demeanor, and habits..."
            className="w-full text-[11px] p-1.5 border border-dragon-gold/30 rounded bg-parchment-50 text-dragon-darkRed focus:outline-none focus:border-dragon-red"
            rows={2}
          />
        ) : (
          <p className="text-[11px] font-body text-dragon-darkRed/90 leading-relaxed italic">
            {traitsText || 'No personality traits specified.'}
          </p>
        )}
      </div>

      {/* Ideals */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 shadow-xs">
        <span className="text-[9px] font-black uppercase text-dragon-red block mb-0.5">
          Ideals
        </span>
        {isEditable ? (
          <input
            type="text"
            value={idealsText}
            onChange={(e) => handleArrayChange('ideals', e.target.value)}
            placeholder="e.g. Freedom, Honor, Greed, Knowledge..."
            className="w-full text-[11px] p-1 border border-dragon-gold/30 rounded bg-parchment-50 text-dragon-darkRed focus:outline-none focus:border-dragon-red"
          />
        ) : (
          <p className="text-[11px] font-body text-dragon-darkRed/90 leading-relaxed">
            {idealsText || 'No ideals recorded.'}
          </p>
        )}
      </div>

      {/* Bonds */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 shadow-xs">
        <span className="text-[9px] font-black uppercase text-dragon-red block mb-0.5">
          Bonds
        </span>
        {isEditable ? (
          <input
            type="text"
            value={bondsText}
            onChange={(e) => handleArrayChange('bonds', e.target.value)}
            placeholder="e.g. Family heirloom, Protect my hometown..."
            className="w-full text-[11px] p-1 border border-dragon-gold/30 rounded bg-parchment-50 text-dragon-darkRed focus:outline-none focus:border-dragon-red"
          />
        ) : (
          <p className="text-[11px] font-body text-dragon-darkRed/90 leading-relaxed">
            {bondsText || 'No bonds recorded.'}
          </p>
        )}
      </div>

      {/* Flaws */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 shadow-xs">
        <span className="text-[9px] font-black uppercase text-dragon-red block mb-0.5">
          Flaws
        </span>
        {isEditable ? (
          <input
            type="text"
            value={flawsText}
            onChange={(e) => handleArrayChange('flaws', e.target.value)}
            placeholder="e.g. Overconfident, Quick to anger, Gullible..."
            className="w-full text-[11px] p-1 border border-dragon-gold/30 rounded bg-parchment-50 text-dragon-darkRed focus:outline-none focus:border-dragon-red"
          />
        ) : (
          <p className="text-[11px] font-body text-dragon-darkRed/90 leading-relaxed">
            {flawsText || 'No flaws recorded.'}
          </p>
        )}
      </div>

      {/* Backstory */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 shadow-xs flex-1 flex flex-col">
        <span className="text-[9px] font-black uppercase text-dragon-red block mb-0.5">
          Backstory & Lore
        </span>
        {isEditable ? (
          <textarea
            value={backstoryText}
            onChange={(e) => onUpdate && onUpdate({ backstory: e.target.value })}
            placeholder="Write or generate your character's backstory here..."
            className="w-full text-[11px] p-1.5 border border-dragon-gold/30 rounded bg-parchment-50 text-dragon-darkRed focus:outline-none focus:border-dragon-red min-h-[100px] flex-1 resize-y"
          />
        ) : (
          <p className="text-[11px] font-body text-dragon-darkRed/90 leading-relaxed whitespace-pre-wrap">
            {backstoryText || 'No backstory recorded yet.'}
          </p>
        )}
      </div>
    </div>
  );
};
