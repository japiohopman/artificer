import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { CLASS_DATA } from '../../../lib/characterUtils';
import { GameIcon } from '../../../game_icons';

interface CharacterPanelTraitsProps {
  character: Partial<Character>;
}

export const CharacterPanelTraits: React.FC<CharacterPanelTraitsProps> = ({ character }) => {
  const profs = character.proficiencies || [];
  const profNames = profs.map(p => typeof p === 'string' ? p : p.name || p.index || '').filter(Boolean);

  // Derive actual saving throw proficiencies
  const derivedSavesSet = new Set<string>();

  if (Array.isArray((character as any).savingThrows)) {
    (character as any).savingThrows.forEach((s: string) => derivedSavesSet.add(s.toUpperCase()));
  }

  if (character.class) {
    const formattedClassName = character.class.charAt(0).toUpperCase() + character.class.slice(1).toLowerCase();
    const classSaves: string[] = CLASS_DATA[formattedClassName]?.savingThrows || [];
    classSaves.forEach(s => derivedSavesSet.add(s.toUpperCase()));
  }

  profNames.forEach(p => {
    const match = p.match(/saving\s*throw[:\s]+([a-z]+)/i);
    if (match) {
      derivedSavesSet.add(match[1].toUpperCase());
    }
  });

  const saves = Array.from(derivedSavesSet);

  // Filter out saving throw entries from general proficiencies
  const nonSaveProfs = profNames.filter(p => !/saving\s*throw/i.test(p));

  const weaponProfs = nonSaveProfs.filter(p => /weapon|sword|axe|bow|hammer|dagger|spear|mace|crossbow|club|flail|halberd|javelin|lance|maul|morningstar|pike|rapier|scimitar|shortsword|sickle|trident|warhammer|whip/i.test(p));
  const armorProfs = nonSaveProfs.filter(p => /armor|shield|mail|plate|padded|leather/i.test(p));
  const toolProfs = nonSaveProfs.filter(p => /tool|kit|supplies|instrument|disguise|thieves/i.test(p));
  const skillProfs = nonSaveProfs.filter(p => !weaponProfs.includes(p) && !armorProfs.includes(p) && !toolProfs.includes(p));

  const languages = character.languages || [];

  // Conditional Trait lists
  const conditionImmunities = character.conditions?.filter(c => /immunity|immune/i.test(c)) || [];
  const damageImmunities: string[] = [];
  const damageResistances: string[] = [];
  const damageVulnerabilities: string[] = [];

  const hasAnyTraits =
    saves.length > 0 ||
    weaponProfs.length > 0 ||
    armorProfs.length > 0 ||
    skillProfs.length > 0 ||
    languages.length > 0 ||
    conditionImmunities.length > 0 ||
    damageImmunities.length > 0 ||
    damageResistances.length > 0 ||
    damageVulnerabilities.length > 0;

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar p-2 bg-white/40 backdrop-blur-sm rounded border border-dragon-gold/20">
      <div className="flex items-center gap-1.5 border-b border-dragon-gold/30 pb-1.5">
        <GameIcon name="trait" size={14} color="#8B0000" />
        <h3 className="text-xs font-header font-black text-dragon-darkRed uppercase tracking-wider">
          Mechanical Traits & Proficiencies
        </h3>
      </div>

      {!hasAnyTraits ? (
        <div className="text-[11px] font-sans italic text-parchment-600 text-center py-6">
          No mechanical traits or proficiencies derived yet.
        </div>
      ) : (
        <>
          {/* Saving Throws */}
          {saves.length > 0 && (
            <TraitSection
              title="Saving Throws"
              icon="trait-saves"
              items={saves}
            />
          )}

          {/* Weapon Proficiencies */}
          {weaponProfs.length > 0 && (
            <TraitSection
              title="Weapon Proficiencies"
              icon="trait-weapon-proficiencies"
              items={weaponProfs}
            />
          )}

          {/* Armor Proficiencies */}
          {armorProfs.length > 0 && (
            <TraitSection
              title="Armor Proficiencies"
              icon="trait-armor-proficiencies"
              items={armorProfs}
            />
          )}

          {/* Skills & General Proficiencies */}
          {skillProfs.length > 0 && (
            <TraitSection
              title="Skills & Proficiencies"
              icon="trait-skills"
              items={skillProfs}
            />
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <TraitSection
              title="Languages"
              icon="trait-languages"
              items={languages}
            />
          )}

          {/* Conditional Trait Sections */}
          {conditionImmunities.length > 0 && (
            <TraitSection
              title="Condition Immunities"
              icon="trait-condition-immunities"
              items={conditionImmunities}
            />
          )}

          {damageImmunities.length > 0 && (
            <TraitSection
              title="Damage Immunities"
              icon="trait-damage-immunities"
              items={damageImmunities}
            />
          )}

          {damageResistances.length > 0 && (
            <TraitSection
              title="Damage Resistances"
              icon="trait-damage-resistances"
              items={damageResistances}
            />
          )}

          {damageVulnerabilities.length > 0 && (
            <TraitSection
              title="Damage Vulnerabilities"
              icon="trait-damage-vulnerabilities"
              items={damageVulnerabilities}
            />
          )}
        </>
      )}
    </div>
  );
};

const TraitSection: React.FC<{
  title: string;
  icon: string;
  items: string[];
}> = ({ title, icon, items }) => (
  <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 shadow-xs space-y-1">
    <div className="flex items-center gap-1.5">
      <GameIcon name={icon as any} size={13} color="#8B0000" />
      <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase tracking-tight">
        {title}
      </span>
    </div>
    <div className="flex flex-wrap gap-1 pt-0.5">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="text-[9px] font-medium bg-parchment-100 text-dragon-darkRed px-1.5 py-0.5 rounded border border-dragon-gold/30 capitalize"
        >
          {item.replace(/-/g, ' ')}
        </span>
      ))}
    </div>
  </div>
);
