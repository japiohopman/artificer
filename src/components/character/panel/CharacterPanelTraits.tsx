import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';

interface CharacterPanelTraitsProps {
  character: Partial<Character>;
}

export const CharacterPanelTraits: React.FC<CharacterPanelTraitsProps> = ({ character }) => {
  const profs = character.proficiencies || [];
  const profNames = profs.map(p => typeof p === 'string' ? p : p.name || p.index || '').filter(Boolean);

  const weaponProfs = profNames.filter(p => /weapon|sword|axe|bow|hammer|dagger|spear|mace/i.test(p));
  const armorProfs = profNames.filter(p => /armor|shield|mail|plate|padded|leather/i.test(p));
  const toolProfs = profNames.filter(p => /tool|kit|supplies|instrument/i.test(p));
  const generalProfs = profNames.filter(p => !weaponProfs.includes(p) && !armorProfs.includes(p) && !toolProfs.includes(p));

  const languages = character.languages || [];
  const saves = character.stats ? Object.keys(character.stats) : [];

  // Conditional Trait lists (only rendered if non-empty)
  const conditionImmunities = character.conditions?.filter(c => /immunity|immune/i.test(c)) || [];
  const damageImmunities: string[] = [];
  const damageResistances: string[] = [];
  const damageVulnerabilities: string[] = [];

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar p-2 bg-white/40 backdrop-blur-sm rounded border border-dragon-gold/20">
      <div className="flex items-center gap-1.5 border-b border-dragon-gold/30 pb-1.5">
        <GameIcon name="trait" size={14} color="#8B0000" />
        <h3 className="text-xs font-header font-black text-dragon-darkRed uppercase tracking-wider">
          Mechanical Traits & Proficiencies
        </h3>
      </div>

      {/* Saving Throws */}
      <TraitSection
        title="Saving Throws"
        icon="trait-saves"
        items={saves.map(s => s.toUpperCase())}
      />

      {/* Weapon Proficiencies */}
      <TraitSection
        title="Weapon Proficiencies"
        icon="trait-weapon-proficiencies"
        items={weaponProfs.length > 0 ? weaponProfs : ['Simple Weapons']}
      />

      {/* Armor Proficiencies */}
      <TraitSection
        title="Armor Proficiencies"
        icon="trait-armor-proficiencies"
        items={armorProfs.length > 0 ? armorProfs : ['Light Armor']}
      />

      {/* Skills & General Proficiencies */}
      <TraitSection
        title="Skills & Proficiencies"
        icon="trait-skills"
        items={generalProfs.length > 0 ? generalProfs : ['Perception']}
      />

      {/* Languages */}
      <TraitSection
        title="Languages"
        icon="trait-languages"
        items={languages.length > 0 ? languages : ['Common']}
      />

      {/* Conditional Trait Sections (only render when data exists) */}
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
