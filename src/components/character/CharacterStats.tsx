import React from 'react';
import { useStore, SKILL_LIST } from '../../store/useStore';
import { motion } from 'motion/react';
import { GameIcon, GAME_ICONS } from '../../game_icons';
import { getAlignmentColor, ALIGNMENT_SPRITE_POS, normalizeAlignment, getAlignmentPortraitStyle } from '../../lib/colors';
import { normalizeImageUrl } from '../../services/storageService';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { cn } from '../../lib/utils';
import { skillIcons } from '../../assets/icons/skill';
import { abilityScoreIcons } from '../../assets/icons/ability_score';

import { calculateDerivedStats, getXpProgress, getEffectiveStats } from '../../lib/statCalculations';
import { extractOptionsFromFeature, getChoiceLimit, getFeatureIcon } from '../../lib/atlasUtils';
import { soundService } from '../../services/soundService';
import { atlasService } from '../../services/atlasService';

const InfoRow: React.FC<{ label: string; value: string | number; color?: string; valueColor?: string }> = ({ label, value, color, valueColor }) => (
  <div className="flex items-center gap-2">
    <span className="text-[7px] font-black text-[#D4AF37] uppercase tracking-widest min-w-[50px]">{label}:</span>
    <span className={cn(
      "text-[10px] font-bold border-b border-parchment-200 flex-1 leading-none pb-0.5",
      valueColor || "text-parchment-900"
    )} style={{ color }}>{value}</span>
  </div>
);

const AttributeRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[7px] font-black text-parchment-400 uppercase tracking-[0.15em] leading-none">{label}</span>
    <span className="text-[9px] font-bold text-parchment-900 uppercase truncate leading-tight" style={{ color }}>{value}</span>
  </div>
);

export const CharacterStats: React.FC = () => {
  const { characters, activeCharacterId, partyStats, classLevelingData, updateCharacter } = useStore();
  const [optionDetails, setOptionDetails] = React.useState<Record<string, string>>({});

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  
  React.useEffect(() => {
    if (activeCharacter?.features) {
      activeCharacter.features.forEach(feat => {
        const options = extractOptionsFromFeature(feat);
        options.forEach(opt => {
          if (opt.desc) {
            setOptionDetails(prev => ({ ...prev, [opt.index]: opt.desc! }));
          }
          atlasService.loadFeature(opt.index).then(fullFeat => {
            if (fullFeat && fullFeat.desc) {
              const description = Array.isArray(fullFeat.desc) ? fullFeat.desc.join('\n') : fullFeat.desc;
              setOptionDetails(prev => ({ ...prev, [opt.index]: description }));
            } else {
              atlasService.loadSubclass(opt.index).then(subFeat => {
                if (subFeat && subFeat.desc) {
                  const description = Array.isArray(subFeat.desc) ? subFeat.desc.join('\n') : subFeat.desc;
                  setOptionDetails(prev => ({ ...prev, [opt.index]: description }));
                }
              });
            }
          });
        });
      });
    }
  }, [activeCharacter?.id, activeCharacter?.features?.length]);

  if (!activeCharacter) return null;

  // Find full feature data from leveled data to check for choices
  const getFullFeatureData = (featIndex: string) => {
    if (!activeCharacter.class) return null;
    const classKey = String(activeCharacter.class).toLowerCase();
    const classData = classLevelingData[classKey];
    if (!classData) return null;

    // Search through all levels up to current
    for (let l = 1; l <= activeCharacter.level; l++) {
      const levelData = classData[l];
      if (levelData?.features) {
        const feat = levelData.features.find((f: any) => f.index === featIndex);
        if (feat) return feat;
      }
    }
    return null;
  };

  const handleToggleChoice = (featIndex: string, optionIndex: string, limit: number) => {
    const currentChoices = JSON.parse(JSON.stringify(activeCharacter.choices || {}));
    const selections = currentChoices[featIndex] || [];
    
    let newSelections;
    if (selections.includes(optionIndex)) {
      newSelections = selections.filter((i: string) => i !== optionIndex);
    } else {
      if (selections.length >= limit && limit === 1) {
        newSelections = [optionIndex];
      } else if (selections.length >= limit) {
        return;
      } else {
        newSelections = [...selections, optionIndex];
      }
    }

    currentChoices[featIndex] = newSelections;
    
    // Legacy mapping for specific features
    const lowerIndex = String(featIndex || '').toLowerCase();
    if (lowerIndex.includes('fighting_style')) {
      currentChoices['fighting-style'] = newSelections;
    }
    if (lowerIndex.includes('expertise')) {
      currentChoices['expertise'] = [...(currentChoices['expertise'] || [])].filter(s => !selections.includes(s));
      currentChoices['expertise'] = [...currentChoices['expertise'], ...newSelections];
    }
    if (lowerIndex.includes('martial_archetype') || 
        lowerIndex.includes('subclass') || 
        lowerIndex.includes('archetype') || 
        lowerIndex.includes('arcane_tradition') ||
        lowerIndex.includes('druid_circle') ||
        lowerIndex.includes('sacred_oath') ||
        lowerIndex.includes('ranger_archetype') ||
        lowerIndex.includes('monastic_tradition') ||
        lowerIndex.includes('bard_college') ||
        lowerIndex.includes('otherworldly_patron') ||
        lowerIndex.includes('sorcerous_origin')) {
      currentChoices['subclass'] = newSelections[0];
    }

    const updateData: any = { choices: currentChoices };
    if (currentChoices['subclass']) {
      updateData.subclass = currentChoices['subclass'];
    }

    updateCharacter(activeCharacter.id, updateData);
    soundService.playEffect('UI_CLICK_LIGHT');
  };

  const effectiveStats = getEffectiveStats(activeCharacter);
  const itemModifiers = React.useMemo(() => {
    const advantages: string[] = [];
    const resistances: string[] = [];
    
    Object.values(activeCharacter.inventory || {}).forEach((item: any) => {
      if (!item || !item.feature_specific?.passive_modifiers) return;
      const mods = item.feature_specific.passive_modifiers;
      if (mods.advantage) {
        if (Array.isArray(mods.advantage)) advantages.push(...mods.advantage);
        else advantages.push(mods.advantage);
      }
      if (mods.resistance) {
        if (Array.isArray(mods.resistance)) resistances.push(...mods.resistance);
        else resistances.push(mods.resistance);
      }
    });

    return { advantages, resistances };
  }, [activeCharacter.inventory]);

  const derived = calculateDerivedStats(activeCharacter);
  const characterImageUrl = activeCharacter.imageUrl ? normalizeImageUrl(activeCharacter.imageUrl, 'npc_character_profiles', activeCharacterId) : undefined;

  const calculateWeight = () => {
    const parseWeight = (weight: any): number => {
      if (!weight) return 0;
      if (typeof weight === 'number') return weight;
      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
      return weightMatch ? parseFloat(weightMatch[0]) : 0;
    };

    const calculateItemWeight = (item: any): number => {
      if (!item) return 0;
      return parseWeight(item.weight) * (item.quantity || 1);
    };

    const equippedWeight = Object.values(activeCharacter.inventory || {}).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
    const backpackWeight = (activeCharacter.backpack || []).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
    
    const money = activeCharacter.money || { cp: 0, sp: 0, gp: 10, pp: 0 };
    const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.gp || 0) + (money.pp || 0);
    const moneyWeight = totalCoins * (partyStats.currencyWeightPerCoin || 0.02);

    return {
      total: equippedWeight + backpackWeight + moneyWeight,
      capacity: derived.weightCapacity,
      equipped: equippedWeight,
      backpack: backpackWeight,
      money: moneyWeight
    };
  };

  const weights = calculateWeight();

  return (
    <div className="space-y-4">
      {/* Top Section: Technical Data & Identity */}
      <div className="grid grid-cols-12">
        {/* Profile Image (Increased presence with requested negative margins) */}
        <div 
          className="col-span-5 aspect-[9/16] bg-parchment-200 rounded-sm overflow-hidden relative border border-parchment-300 shadow-md"
          style={{ 
            height: '170.5px', 
            marginLeft: '-10px', 
            marginTop: '-10px',
            ...getAlignmentPortraitStyle(activeCharacter.alignment)
          }}
        >
          {characterImageUrl ? (
            <ChromaKeyImage 
              src={characterImageUrl} 
              alt=""
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-transparent relative z-10">
               <GameIcon name="user" size={48} color="#8B0000" className="opacity-20" />
             </div>
          )}
          <div className="absolute inset-0 bg-black/5 z-0" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-20" />
        </div>

        {/* Identity & Vertical Info (Slick list format, no boxes) */}
        <div 
          className="col-span-7 flex flex-col py-1"
          style={{ paddingLeft: '18px', marginTop: '-10px' }}
        >
          <div className="space-y-0.5">
            <InfoRow label="HP" value={`${activeCharacter.hp}/${activeCharacter.maxHp}`} valueColor="text-dragon-red" />
            <InfoRow label="AC" value={derived.ac} />
            <InfoRow label="Speed" value={`${derived.speed} ft`} />
            <InfoRow label="Init" value={derived.initiative >= 0 ? `+${derived.initiative}` : derived.initiative} />
            
            {activeCharacter.spellcastingAbility && (
                <>
                    <div className="pt-0.5 mt-0.5 border-t border-parchment-200/50" />
                    <InfoRow label="Spell DC" value={derived.spellSaveDC} />
                    <InfoRow label="Spell Atk" value={derived.spellAttackBonus >= 0 ? `+${derived.spellAttackBonus}` : derived.spellAttackBonus} />
                </>
            )}

            <div className="pt-0.5 mt-0.5 border-t border-parchment-200/50" />
            
            <InfoRow label="Class" value={activeCharacter.class} />
            {activeCharacter.subclass && (
              <InfoRow label="Spec" value={activeCharacter.subclass} valueColor="text-dragon-gold" />
            )}
            <InfoRow label="Species" value={activeCharacter.race} />
            <InfoRow label="Origin" value={activeCharacter.background} />
            <InfoRow label="Size" value={activeCharacter.appearance?.size || 'Medium'} />
            <InfoRow label="Body" value={activeCharacter.gender} />
            <InfoRow label="Align" value={activeCharacter.alignment} color={getAlignmentColor(activeCharacter.alignment)} />
          </div>

          <div className="mt-3 space-y-1 pr-2">
            <div className="flex justify-between items-end">
              <span className="text-[6px] font-black text-parchment-400 uppercase tracking-widest">XP Progress</span>
              <span className="text-[8px] font-black text-dragon-red">{activeCharacter.xp.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 bg-parchment-200 rounded-full overflow-hidden border border-parchment-300 shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-dragon-red to-dragon-darkRed shadow-[0_0_5px_rgba(139,0,0,0.2)]"
                initial={{ width: 0 }}
                animate={{ width: `${getXpProgress(activeCharacter.level, activeCharacter.xp)}%` }}
              />
            </div>
            <div className="flex justify-between items-start">
               <span className="text-[6px] font-bold text-parchment-300 uppercase">Level {activeCharacter.level}</span>
               <span className="text-[6px] font-bold text-parchment-300 uppercase">Level {activeCharacter.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Attributes Score Row (Clean, no bg boxes) */}
      <div className="flex justify-between items-center py-2 px-1 border-y border-parchment-200">
        {Object.entries(effectiveStats || {}).map(([stat, val]: [string, any], index) => {
          if (stat.startsWith('_')) return null; // Skip private metadata
          const mod = Math.floor((val - 10) / 2);
          const iconPath = abilityScoreIcons[stat.toLowerCase()];
          const isModified = (effectiveStats as any)?._isModified?.[stat];
          
          return (
            <div 
              key={stat} 
              className={cn(
                "flex flex-col items-center flex-1 border-r last:border-0 border-parchment-200/50 transition-all",
                isModified && "bg-dragon-red/5 scale-105 z-10"
              )}
            >
              {iconPath ? (
                <svg viewBox="0 0 512 512" className={cn("w-4 h-4 mb-1 opacity-40 fill-parchment-400", isModified && "fill-dragon-red opacity-60")}>
                  <path d={iconPath} />
                </svg>
              ) : (
                <span className={cn("text-[7px] font-black text-parchment-400 uppercase tracking-widest mb-0.5", isModified && "text-dragon-red")}>{stat}</span>
              )}
              <div className="flex items-baseline gap-0.5">
                <span className={cn("text-[13px] font-cinzel font-black text-parchment-900", isModified && "text-dragon-darkRed drop-shadow-[0_0_8px_rgba(139,0,0,0.2)]")}>{val}</span>
                <span className={cn("text-[8px] font-black text-dragon-red", isModified && "text-dragon-darkRed animate-pulse")}>{mod >= 0 ? `+${mod}` : mod}</span>
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest">Active Effects</span>
           <div className="h-px flex-1 bg-gradient-to-r from-dragon-red/20 to-transparent" />
        </div>
        
        <div className="bg-white/40 rounded-sm border border-dragon-red/5 p-2 min-h-[40px] flex flex-wrap gap-2">
            {(activeCharacter.conditions && activeCharacter.conditions.length > 0) || itemModifiers.advantages.length > 0 || itemModifiers.resistances.length > 0 ? (
                <>
                  {activeCharacter.conditions?.map(condition => (
                      <div key={condition} className="flex items-center gap-1.5 bg-dragon-red/10 border border-dragon-red/20 px-2 py-0.5 rounded shadow-sm">
                          <GameIcon name="info" size={10} color="#8B0000" />
                          <span className="text-[9px] font-bold text-dragon-darkRed uppercase tracking-tight">{condition}</span>
                      </div>
                  ))}
                  {itemModifiers.resistances.map((res, i) => (
                      <div key={`res-${i}`} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shadow-sm">
                          <GameIcon name="shield" size={10} color="#059669" />
                          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-tight">Res: {res}</span>
                      </div>
                  ))}
                  {itemModifiers.advantages.map((adv, i) => (
                      <div key={`adv-${i}`} className="flex items-center gap-1.5 bg-dragon-gold/10 border border-dragon-gold/20 px-2 py-0.5 rounded shadow-sm">
                          <GameIcon name="sparkles" size={10} color="#D4AF37" />
                          <span className="text-[9px] font-bold text-dragon-gold uppercase tracking-tight">Adv: {adv}</span>
                      </div>
                  ))}
                </>
            ) : (
                <div className="w-full flex items-center justify-center">
                    <p className="text-[9px] italic text-parchment-400">No active status effects or conditions.</p>
                </div>
            )}
        </div>
      </div>

      {/* Two-Panel Layout for Skills and Features */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Panel: Skills & Saving Throws */}
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2 mb-3">
              <GameIcon name="shield" size={12} color="#8B0000" /> Saving Throws
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(abbr => {
                const key = abbr.toLowerCase() as keyof typeof effectiveStats;
                const statVal = (effectiveStats?.[key] as number) ?? 10;
                const abilityMod = Math.floor((statVal - 10) / 2);
                const isProficient = (activeCharacter.proficiencies || []).some(p => 
                  typeof p === 'string' 
                    ? p.toLowerCase().includes(`saving throw: ${String(abbr || '').toLowerCase()}`)
                    : (p as any).name?.toString().toLowerCase().includes(`saving throw: ${String(abbr || '').toLowerCase()}`)
                );
                const totalMod = abilityMod + (isProficient ? derived.proficiencyBonus : 0);
                
                return (
                  <div 
                    key={abbr}
                    className={cn(
                      "flex flex-col items-center justify-center py-1.5 rounded-sm border transition-all",
                      isProficient ? "bg-dragon-red/5 border-dragon-red/20" : "bg-white/20 border-parchment-200/40 opacity-70"
                    )}
                  >
                    <span className="text-[7px] font-black text-parchment-400 uppercase tracking-tighter mb-0.5">{abbr}</span>
                    <span className={cn(
                      "text-[10px] font-black leading-none tabular-nums",
                      isProficient ? "text-dragon-darkRed" : "text-parchment-800"
                    )}>
                      {totalMod >= 0 ? `+${totalMod}` : totalMod}
                    </span>
                    {isProficient && <div className="w-1 h-1 bg-dragon-red rounded-full mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2 mb-2">
              <GameIcon name="pen_line" size={12} color="#8B0000" /> Skills
            </h3>
            <div className="space-y-1">
               {SKILL_LIST.map(skill => {
                 const isProficient = activeCharacter.proficiencies?.includes(skill.name);
                 const hasExpertise = activeCharacter.features?.some(f => (f.index?.toLowerCase() || '').includes('expertise') || (f.name?.toLowerCase() || '').includes('expertise')) && 
                                    activeCharacter.choices?.['expertise']?.includes(skill.name);
                 
                 const abilityVal = effectiveStats[skill.ability as keyof typeof effectiveStats] || 10;
                 const mod = Math.floor((abilityVal - 10) / 2);
                 const bonus = mod + (isProficient ? derived.proficiencyBonus : 0) + (hasExpertise ? derived.proficiencyBonus : 0);
                 
                 const skillKey = skill.name.toLowerCase().replace(/\s+/g, '_');
                 const iconPath = skillIcons[skillKey];

                 return (
                   <div key={skill.name} className="flex items-center justify-between text-[9px] py-1 border-b border-parchment-200/50 last:border-0 group">
                     <div className="flex items-center gap-1.5 min-w-0">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full relative shrink-0",
                         isProficient ? "bg-dragon-red ring-1 ring-dragon-red/20" : "bg-parchment-200"
                       )}>
                         {hasExpertise && (
                           <div className="absolute inset-0 bg-dragon-gold rounded-full scale-125 animate-pulse" />
                         )}
                       </div>
                       
                       {iconPath && (
                         <svg viewBox="0 0 512 512" className={cn(
                           "w-3.5 h-3.5 shrink-0 transition-colors mr-0.5",
                           isProficient ? "fill-dragon-red" : "fill-parchment-300"
                         )}>
                           <path d={iconPath} />
                         </svg>
                       )}

                       <span className={cn(
                         "font-bold truncate",
                         isProficient ? "text-parchment-900" : "text-parchment-400",
                         hasExpertise && "text-dragon-darkRed"
                       )}>{skill.name}</span>
                       <span className="text-[7px] text-parchment-300 font-black uppercase shrink-0">({skill.ability})</span>
                     </div>
                     <div className="flex items-center gap-1">
                        {hasExpertise && (
                          <span className="text-[6px] font-black text-dragon-gold bg-dragon-red/10 px-1 rounded border border-dragon-gold/20 leading-none">EXP</span>
                        )}
                        <span className={cn(
                          "font-black tabular-nums min-w-[20px] text-right",
                          isProficient ? "text-dragon-red" : "text-parchment-400"
                        )}>{bonus >= 0 ? `+${bonus}` : bonus}</span>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>

          <div>
             <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2 mb-2">
              <GameIcon name="award" size={12} color="#8B0000" /> Proficiencies
            </h3>
            <div className="flex flex-wrap gap-1">
               {activeCharacter.proficiencies?.filter(p => !SKILL_LIST.some(s => s.name === p)).map(p => (
                 <span key={p} className="text-[8px] font-black bg-parchment-900/5 text-parchment-600 px-1.5 py-0.5 rounded border border-parchment-200 uppercase tracking-tighter">
                   {p}
                 </span>
               ))}
               {!activeCharacter.proficiencies?.length && <span className="text-[8px] italic text-parchment-400">None declared</span>}
            </div>
          </div>
        </div>

        {/* Right Panel: Traits & Loadout */}
        <div className="space-y-4">
          <div>
            <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2 mb-2">
              <GameIcon name="sparkles" size={12} color="#8B0000" /> Traits & Features
            </h3>
            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
              {activeCharacter.traits?.map((trait, i) => (
                <div key={`trait-${i}`} className="bg-white/20 p-1.5 rounded border border-dragon-red/5">
                  <p className="text-[9px] text-parchment-700 leading-tight">{trait}</p>
                </div>
              ))}
              {activeCharacter.features?.map((feat, i) => {
                const fullFeat = getFullFeatureData(feat.index);
                const isEx = (feat.index?.toLowerCase() || '').includes('expertise') || (feat.name?.toLowerCase() || '').includes('expertise');
                const options = extractOptionsFromFeature(fullFeat || feat);
                const effectiveOptions: { index: string; name: string; desc?: string }[] = options.length > 0 ? options : (isEx ? (activeCharacter.proficiencies || []).map(p => ({ index: p, name: p })) : []);
                const limit = getChoiceLimit(fullFeat || feat);
                const selections = activeCharacter.choices?.[feat.index] || activeCharacter.choices?.['expertise'] || [];
                const hasChoice = effectiveOptions.length > 0;

                return (
                  <div key={`feat-${i}`} className="bg-white/20 p-1.5 rounded border border-dragon-red/5 space-y-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <GameIcon name={getFeatureIcon(feat.index, feat.name)} size={10} color="#8B0000" fallbackName="award" />
                      <span className="text-[8px] font-black text-dragon-red uppercase block">{feat.name}</span>
                    </div>
                    <p className="text-[8px] text-parchment-600 line-clamp-2 leading-tight">{feat.desc}</p>
                    
                    {hasChoice && (
                      <div className="pt-1.5 border-t border-dragon-red/10 mt-1.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] font-black text-dragon-darkRed uppercase tracking-wider">
                            Selection: {selections.length} / {limit}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {effectiveOptions.map((opt) => {
                            const isSelected = selections.includes(opt.index);
                            return (
                              <button
                                key={opt.index}
                                onClick={() => handleToggleChoice(feat.index, opt.index, limit)}
                                className={cn(
                                  "text-left px-2 py-1.5 rounded-sm border text-[8px] font-bold transition-all uppercase flex flex-col gap-1 group/opt",
                                  isSelected 
                                    ? "bg-dragon-darkRed text-dragon-gold border-dragon-gold shadow-sm" 
                                    : "bg-white/40 border-dragon-gold/10 text-parchment-500 hover:bg-white hover:text-dragon-red"
                                )}
                              >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <GameIcon name={getFeatureIcon(opt.index, opt.name)} size={10} color={isSelected ? "#D4AF37" : "#8B0000"} className="opacity-70 group-hover/opt:opacity-100 transition-opacity" fallbackName="award" />
                                      <span>{opt.name.replace(/fighting style:\s*/i, '')
                                                   .replace(/expertise:\s*/i, '')
                                                   .replace(/martial archetype:\s*/i, '')
                                                   .replace(/archetype:\s*/i, '')
                                                   .replace(/arcane tradition:\s*/i, '')
                                                   .replace(/druid circle:\s*/i, '')
                                                   .replace(/sacred oath:\s*/i, '')
                                                   .replace(/ranger archetype:\s*/i, '')
                                                   .replace(/monastic tradition:\s*/i, '')
                                                   .replace(/bard college:\s*/i, '')
                                                   .replace(/otherworldly patron:\s*/i, '')
                                                   .replace(/sorcerous origin:\s*/i, '')
                                      }</span>
                                    </div>
                                    {isSelected && <GameIcon name="check" size={8} color="#D4AF37" />}
                                  </div>
                                  {(optionDetails[opt.index] || opt.desc) && (
                                    <span className={cn(
                                      "text-[7px] font-medium normal-case leading-tight line-clamp-2",
                                      isSelected ? "text-dragon-gold/60" : "text-parchment-400 opacity-60"
                                    )}>
                                      {optionDetails[opt.index] || opt.desc}
                                    </span>
                                  )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {(!activeCharacter.traits?.length && !activeCharacter.features?.length) && (
                <span className="text-[8px] italic text-parchment-400">No traits discovered</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2 mb-2">
              <GameIcon name="weight" size={12} color="#8B0000" /> Loadout
            </h3>
            <div className="bg-white/30 p-2 rounded border border-dragon-red/5 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[8px] font-bold text-parchment-500 uppercase">Encumbrance</span>
                <span className="text-[10px] font-bold text-dragon-red">{weights.total.toFixed(1)} / {weights.capacity} lb</span>
              </div>
              <div className="h-1.5 bg-black/5 rounded-full overflow-hidden border border-white/20 shadow-inner">
                <motion.div 
                  className={cn(
                    "h-full transition-colors",
                    weights.total > weights.capacity ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-amber-500"
                  )} 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((weights.total / weights.capacity) * 100, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[7px] font-bold uppercase text-parchment-400">
                <div className="flex justify-between">
                  <span>Equipped</span>
                  <span className="text-parchment-600">{weights.equipped.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currency</span>
                  <span className="text-parchment-600">{weights.money.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
