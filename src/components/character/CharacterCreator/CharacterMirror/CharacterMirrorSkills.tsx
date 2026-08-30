import React from 'react';
import { Character } from '../../../../store/useCharacterStore';
import { GameIcon } from '../../../../game_icons';

interface CharacterMirrorSkillsProps {
  newChar: Partial<Character>;
}

const SKILLS_LIST = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex' },
  { id: 'animal_handling', name: 'Animal Handling', ability: 'wis' },
  { id: 'arcana', name: 'Arcana', ability: 'int' },
  { id: 'athletics', name: 'Athletics', ability: 'str' },
  { id: 'deception', name: 'Deception', ability: 'cha' },
  { id: 'history', name: 'History', ability: 'int' },
  { id: 'insight', name: 'Insight', ability: 'wis' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha' },
  { id: 'investigation', name: 'Investigation', ability: 'int' },
  { id: 'medicine', name: 'Medicine', ability: 'wis' },
  { id: 'nature', name: 'Nature', ability: 'int' },
  { id: 'perception', name: 'Perception', ability: 'wis' },
  { id: 'performance', name: 'Performance', ability: 'cha' },
  { id: 'persuasion', name: 'Persuasion', ability: 'cha' },
  { id: 'religion', name: 'Religion', ability: 'int' },
  { id: 'sleight_of_hand', name: 'Sleight of Hand', ability: 'dex' },
  { id: 'stealth', name: 'Stealth', ability: 'dex' },
  { id: 'survival', name: 'Survival', ability: 'wis' }
];

export const CharacterMirrorSkills: React.FC<CharacterMirrorSkillsProps> = ({ newChar }) => {
  const stats = newChar.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const profBonus = 2; // Level 1 / Creator default

  // Extract proficient skills from newChar.proficiencies and newChar.choices
  const proficientSkillsSet = new Set<string>();

  (newChar.proficiencies || []).forEach((p: any) => {
    const raw = typeof p === 'string' ? p : p.name || p.index || '';
    const clean = raw.replace(/^Skill:\s*/i, '').toLowerCase().replace(/[\s-]+/g, '_');
    if (clean) proficientSkillsSet.add(clean);
  });

  const chosenSkills = newChar.choices?.skills || [];
  chosenSkills.forEach((sk: string) => {
    const clean = sk.toLowerCase().replace(/[\s-]+/g, '_');
    if (clean) proficientSkillsSet.add(clean);
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-white/40 border border-dragon-gold/20 rounded-sm">
      <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-1 mb-2">
        <span className="text-[9px] font-black uppercase text-dragon-red tracking-widest flex items-center gap-1.5">
          <GameIcon name="book" size={12} color="#8B0000" />
          Skill Proficiencies
        </span>
        <span className="text-[8px] font-bold text-parchment-600 uppercase">
          Prof. Bonus: +{profBonus}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {SKILLS_LIST.map((sk) => {
          const isProf = proficientSkillsSet.has(sk.id) || proficientSkillsSet.has(sk.name.toLowerCase().replace(/[\s-]+/g, '_'));
          const abilityScore = (stats as any)[sk.ability] ?? 10;
          const abilityMod = Math.floor((abilityScore - 10) / 2);
          const totalBonus = abilityMod + (isProf ? profBonus : 0);
          const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

          return (
            <div
              key={sk.id}
              className={`px-2 py-1 rounded border flex items-center justify-between text-xs transition-colors ${
                isProf
                  ? 'bg-dragon-red/10 border-dragon-red/40 text-dragon-darkRed font-black'
                  : 'bg-white/50 border-dragon-gold/10 text-parchment-700 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isProf ? 'bg-dragon-red shadow-sm' : 'bg-parchment-300'}`} />
                <span className="text-[10px] uppercase font-header truncate">{sk.name}</span>
                <span className="text-[8px] uppercase font-bold text-parchment-500">({sk.ability})</span>
              </div>
              <span className="text-[11px] font-mono font-bold">{bonusText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
