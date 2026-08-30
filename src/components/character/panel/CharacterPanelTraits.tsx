import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { calculateDerivedStats, getEffectiveStats } from '../../../lib/statCalculations';
import { getModifier } from '../../../lib/npcGeneratorUtils';

interface CharacterPanelTraitsProps {
  character: Partial<Character>;
  className?: string;
}

const CLASS_SAVING_THROWS: Record<string, string[]> = {
  barbarian: ['str', 'con'],
  bard: ['dex', 'cha'],
  cleric: ['wis', 'cha'],
  druid: ['int', 'wis'],
  fighter: ['str', 'con'],
  monk: ['str', 'dex'],
  paladin: ['wis', 'cha'],
  ranger: ['str', 'dex'],
  rogue: ['dex', 'int'],
  sorcerer: ['con', 'cha'],
  warlock: ['wis', 'cha'],
  wizard: ['int', 'wis'],
  artificer: ['con', 'int']
};

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

export const CharacterPanelTraits: React.FC<CharacterPanelTraitsProps> = ({ character, className }) => {
  const derivedStats = calculateDerivedStats(character as Character);
  const effectiveStats = getEffectiveStats(character as Character);
  const profBonus = derivedStats.proficiencyBonus;

  // 1. Saving Throws
  const charClass = (character.class || '').toLowerCase();
  const classSaveProfs = CLASS_SAVING_THROWS[charClass] || [];

  const isProficientInSave = (abilityKey: string) => {
    if (classSaveProfs.includes(abilityKey)) return true;
    return (character.proficiencies || []).some((p: any) => {
      const raw = typeof p === 'string' ? p.toLowerCase() : (p.name || p.index || '').toLowerCase();
      return raw.includes('saving throw') && (raw.includes(abilityKey) || raw.includes(getAbilityFullName(abilityKey)));
    });
  };

  const getAbilityFullName = (key: string) => {
    switch (key) {
      case 'str': return 'strength';
      case 'dex': return 'dexterity';
      case 'con': return 'constitution';
      case 'int': return 'intelligence';
      case 'wis': return 'wisdom';
      case 'cha': return 'charisma';
      default: return key;
    }
  };

  const saveAbilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

  // 2. Classify proficiencies
  const armorProfs: string[] = [];
  const weaponProfs: string[] = [];
  const toolProfs: string[] = [];
  const proficientSkillsSet = new Set<string>();

  (character.proficiencies || []).forEach((p: any) => {
    const raw = typeof p === 'string' ? p : p.name || p.index || p;
    const lower = raw.toLowerCase();

    if (lower.includes('armor') || lower.includes('shield')) {
      armorProfs.push(raw);
    } else if (lower.includes('weapon') || lower.includes('sword') || lower.includes('dagger') || lower.includes('bow') || lower.includes('crossbow')) {
      weaponProfs.push(raw);
    } else if (lower.includes('tool') || lower.includes('kit') || lower.includes('supplies')) {
      toolProfs.push(raw);
    } else if (lower.startsWith('skill:') || lower.includes('perception') || lower.includes('stealth')) {
      const clean = raw.replace(/^Skill:\s*/i, '').toLowerCase().replace(/[\s-]+/g, '_');
      if (clean) proficientSkillsSet.add(clean);
    }
  });

  (character.skills || []).forEach((p: any) => {
    const raw = typeof p === 'string' ? p : p.name || p.index || '';
    const clean = raw.replace(/^Skill:\s*/i, '').toLowerCase().replace(/[\s-]+/g, '_');
    if (clean) proficientSkillsSet.add(clean);
  });

  (character.choices?.skills || []).forEach((sk: string) => {
    const clean = sk.toLowerCase().replace(/[\s-]+/g, '_');
    if (clean) proficientSkillsSet.add(clean);
  });

  // 3. Languages
  const languages = Array.from(new Set(character.languages || ['common']));

  // 4. Immunities / Resistances / Vulnerabilities (derived from character traits, features, or species)
  const conditionImmunities: string[] = [];
  const damageImmunities: string[] = [];
  const damageResistances: string[] = [];
  const damageVulnerabilities: string[] = [];

  const raceLower = (character.race || '').toLowerCase();
  if (raceLower.includes('tiefling')) {
    damageResistances.push('Fire');
  }
  if (raceLower.includes('dwarf')) {
    damageResistances.push('Poison');
  }

  // Scan traits and features for passive modifiers / resistances
  const scanMods = (item: any) => {
    const mods = item?.trait_specific?.passive_modifiers || item?.feature_specific?.passive_modifiers || item;
    if (mods?.damage_resistances) {
      if (Array.isArray(mods.damage_resistances)) damageResistances.push(...mods.damage_resistances);
      else damageResistances.push(String(mods.damage_resistances));
    }
    if (mods?.damage_immunities) {
      if (Array.isArray(mods.damage_immunities)) damageImmunities.push(...mods.damage_immunities);
      else damageImmunities.push(String(mods.damage_immunities));
    }
    if (mods?.condition_immunities) {
      if (Array.isArray(mods.condition_immunities)) conditionImmunities.push(...mods.condition_immunities);
      else conditionImmunities.push(String(mods.condition_immunities));
    }
    if (mods?.damage_vulnerabilities) {
      if (Array.isArray(mods.damage_vulnerabilities)) damageVulnerabilities.push(...mods.damage_vulnerabilities);
      else damageVulnerabilities.push(String(mods.damage_vulnerabilities));
    }
  };

  (character.traits || []).forEach(scanMods);
  (character.features || []).forEach(scanMods);

  // 5. General Traits & Features
  const generalTraits = (character.traits || []).map((t: any) => ({
    name: t.name || t.index || t,
    desc: typeof t.desc === 'string' ? t.desc : (Array.isArray(t.desc) ? t.desc.join('\n') : ''),
    source: t.source || 'Species'
  }));

  const generalFeatures = (character.features || []).map((f: any) => ({
    name: f.name || f.index || f,
    desc: typeof f.desc === 'string' ? f.desc : (Array.isArray(f.desc) ? f.desc.join('\n') : ''),
    source: f.source || 'Class'
  }));

  const allGeneralFeatures = [...generalTraits, ...generalFeatures];

  return (
    <div className={`flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3 bg-white/40 border border-dragon-gold/20 rounded-sm ${className || ''}`}>
      {/* 1. Saving Throws Section */}
      <SectionCard title="Saving Throws" icon="trait-saves">
        <div className="grid grid-cols-3 gap-1">
          {saveAbilities.map((abKey) => {
            const isProf = isProficientInSave(abKey);
            const score = (effectiveStats as any)[abKey] ?? 10;
            const abilityMod = getModifier(score);
            const totalSave = abilityMod + (isProf ? profBonus : 0);
            const saveText = totalSave >= 0 ? `+${totalSave}` : `${totalSave}`;

            return (
              <div
                key={abKey}
                className={`px-1.5 py-0.5 rounded border text-center flex items-center justify-between text-[10px] ${
                  isProf
                    ? 'bg-dragon-red/10 border-dragon-red/40 text-dragon-darkRed font-black'
                    : 'bg-white/50 border-dragon-gold/10 text-parchment-700 opacity-75'
                }`}
              >
                <span className="uppercase font-header font-black">{abKey}</span>
                <span className="font-mono font-bold">{saveText}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 2. Weapon Proficiencies */}
      {weaponProfs.length > 0 && (
        <SectionCard title="Weapon Proficiencies" icon="trait-weapon-proficiencies">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(weaponProfs)).map((w, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-dragon-gold/15 border border-dragon-gold/30 rounded text-[9px] font-black text-dragon-darkRed uppercase">
                {w}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 3. Armor Proficiencies */}
      {armorProfs.length > 0 && (
        <SectionCard title="Armor Proficiencies" icon="trait-armor-proficiencies">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(armorProfs)).map((a, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-dragon-gold/15 border border-dragon-gold/30 rounded text-[9px] font-black text-dragon-darkRed uppercase">
                {a}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 4. Skill Proficiencies */}
      <SectionCard title="Skill Proficiencies" icon="trait-skills">
        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {SKILLS_LIST.map((sk) => {
            const isProf = proficientSkillsSet.has(sk.id) || proficientSkillsSet.has(sk.name.toLowerCase().replace(/[\s-]+/g, '_'));
            const score = (effectiveStats as any)[sk.ability] ?? 10;
            const abilityMod = getModifier(score);
            const totalBonus = abilityMod + (isProf ? profBonus : 0);
            const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

            return (
              <div
                key={sk.id}
                className={`px-2 py-0.5 rounded border flex items-center justify-between text-[10px] transition-colors ${
                  isProf
                    ? 'bg-dragon-red/10 border-dragon-red/40 text-dragon-darkRed font-black'
                    : 'bg-white/50 border-dragon-gold/10 text-parchment-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isProf ? 'bg-dragon-red' : 'bg-parchment-300'}`} />
                  <span className="uppercase font-header truncate">{sk.name}</span>
                  <span className="text-[7px] uppercase font-bold text-parchment-500">({sk.ability})</span>
                </div>
                <span className="font-mono font-bold text-[10px]">{bonusText}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* 5. Tool Proficiencies */}
      {toolProfs.length > 0 && (
        <SectionCard title="Tool Proficiencies" icon="trait-tool-proficiencies">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(toolProfs)).map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-dragon-gold/15 border border-dragon-gold/30 rounded text-[9px] font-black text-dragon-darkRed uppercase">
                {t}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 6. Languages */}
      <SectionCard title="Languages" icon="trait-languages">
        <div className="flex flex-wrap gap-1">
          {languages.map((l, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-dragon-red/10 border border-dragon-red/30 text-dragon-red text-[9px] font-black uppercase rounded">
              {l}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* 7. Condition Immunities */}
      {conditionImmunities.length > 0 && (
        <SectionCard title="Condition Immunities" icon="trait-condition-immunities">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(conditionImmunities)).map((ci, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-purple-900/10 border border-purple-600/30 text-purple-900 text-[9px] font-black uppercase rounded">
                {ci}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 8. Damage Immunities */}
      {damageImmunities.length > 0 && (
        <SectionCard title="Damage Immunities" icon="trait-damage-immunities">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(damageImmunities)).map((di, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-amber-900/10 border border-amber-600/30 text-amber-900 text-[9px] font-black uppercase rounded">
                {di}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 9. Damage Resistances */}
      {damageResistances.length > 0 && (
        <SectionCard title="Damage Resistances" icon="trait-damage-resistances">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(damageResistances)).map((dr, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-dragon-red/15 border border-dragon-red/30 text-dragon-darkRed text-[9px] font-black uppercase rounded">
                {dr}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 10. Damage Vulnerabilities */}
      {damageVulnerabilities.length > 0 && (
        <SectionCard title="Damage Vulnerabilities" icon="trait-damage-vulnerabilities">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(damageVulnerabilities)).map((dv, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-red-900/10 border border-red-600/30 text-red-900 text-[9px] font-black uppercase rounded">
                {dv}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 11. Ancestral Traits & Features */}
      {allGeneralFeatures.length > 0 && (
        <SectionCard title="Traits & Features" icon="trait">
          <div className="space-y-1.5">
            {allGeneralFeatures.map((item, idx) => (
              <div key={idx} className="p-1.5 bg-white/70 border border-dragon-gold/20 rounded-sm space-y-0.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase truncate">
                    {item.name}
                  </span>
                  {item.source && (
                    <span className="px-1 py-0.5 bg-dragon-gold/20 text-dragon-darkRed text-[7px] font-black uppercase rounded shrink-0 border border-dragon-gold/30">
                      {item.source}
                    </span>
                  )}
                </div>
                {item.desc && (
                  <p className="text-[9px] font-body text-parchment-800 leading-snug line-clamp-3">
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

const SectionCard: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="p-2 bg-white/60 border border-dragon-gold/20 rounded-sm space-y-1.5 shadow-sm">
    <div className="flex items-center gap-1.5 border-b border-dragon-gold/20 pb-1">
      <GameIcon name={icon as any} size={13} color="#8B0000" className="shrink-0" />
      <span className="text-[9px] font-header font-black text-dragon-darkRed uppercase tracking-wider">
        {title}
      </span>
    </div>
    {children}
  </div>
);
