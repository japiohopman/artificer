import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Character, useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { soundService } from '../../services/soundService';
import { GameIcon } from '../../game_icons';
import { 
  fetchSpeciesList, fetchSpeciesData,
  fetchClassesList, fetchClassData,
  fetchBackgroundsList, fetchBackgroundData,
  fetchAlignmentsList, fetchAlignmentData,
  fetchSubraceList, fetchSubraceData,
  REPO, BRANCH
} from '../../services/storageService';

import { WelcomeStep } from './CharacterCreator/WelcomeStep';
import { SelectionStep } from './CharacterCreator/SelectionStep';
import { SpellsStep } from './CharacterCreator/SpellsStep';
import { EquipmentStep } from './CharacterCreator/EquipmentStep';
import { ChoicesStep } from './CharacterCreator/ChoicesStep';
import { StatsStep } from './CharacterCreator/StatsStep';
import { SkillsStep } from './CharacterCreator/SkillsStep';
import { AppearanceStep } from './CharacterCreator/AppearanceStep';
import { IdentityStep } from './CharacterCreator/IdentityStep';
import { ReviewStep } from './CharacterCreator/ReviewStep';
import { SlotStep } from './CharacterCreator/SlotStep';
import { BackstoryStep } from './CharacterCreator/BackstoryStep';
import { saveService } from '../../services/saveService';
import { atlasService } from '../../services/atlasService';
import { injectFontFace, getLanguageFontFamily } from '../../lib/fontLoader';

// Types for the creation flow
type CreationStep = 
  | 'welcome'
  | 'slot'
  | 'species'
  | 'subrace'
  | 'class'
  | 'choices'
  | 'equipment'
  | 'spells'
  | 'background'
  | 'backstory'
  | 'alignment'
  | 'stats'
  | 'skills'
  | 'appearance'
  | 'languages'
  | 'identity'
  | 'review';

const STEPS: { id: CreationStep; label: string; icon: any }[] = [
  { id: 'welcome', label: 'Welcome', icon: 'devkit' },
  { id: 'slot', label: 'Save Slot', icon: 'save_data' },
  { id: 'species', label: 'Species', icon: 'ancestry' },
  { id: 'subrace', label: 'Heritage', icon: 'ancestry' },
  { id: 'class', label: 'Class', icon: 'weapon' },
  { id: 'choices', label: 'Choices', icon: 'book' },
  { id: 'equipment', label: 'Gear', icon: 'shield' },
  { id: 'spells', label: 'Arcana', icon: 'magic_effect' },
  { id: 'background', label: 'Origins', icon: 'scroll' },
  { id: 'backstory', label: 'Chronicle', icon: 'book' },
  { id: 'alignment', label: 'Ethos', icon: 'shield' },
  { id: 'stats', label: 'Attributes', icon: 'dice' },
  { id: 'skills', label: 'Skills', icon: 'user' },
  { id: 'appearance', label: 'Appearance', icon: 'identity' },
  { id: 'languages', label: 'Tongues', icon: 'magic_effect' },
  { id: 'identity', label: 'Identity', icon: 'info' },
  { id: 'review', label: 'Commit', icon: 'save_data' },
];

const PLAYABLE_SPECIES = ['dragonborn', 'dwarf', 'elf', 'gnome', 'half-elf', 'half-orc', 'halfling', 'human', 'tiefling'];

export const CharacterCreator: React.FC = () => {
  const { 
    isCharacterCreatorOpen, 
    setIsCharacterCreatorOpen, 
    setCharacters, 
    characters,
    setMainCharacter,
    setIsGameStarted
  } = useStore();
  const [currentStep, setCurrentStep] = useState<CreationStep>('welcome');
  const [direction, setDirection] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // New character state
  const [newChar, setNewChar] = useState<Partial<Character>>({
    level: 0,
    xp: 0,
    saveVersion: 2,
    gender: 'Male',
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    proficiencies: [],
    traits: [],
    features: [],
    flaws: [],
    ideals: [],
    bonds: [],
    money: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    appearance: {
      hairColor: 'Raven Black',
      hairStyle: 'Short',
      bodyType: 'Medium',
      eyeColor: 'Brown',
      skinColor: '#ffdbac',
      height: "5'10\"",
      weight: '160 lbs',
      size: 'Medium',
      specialFeatures: []
    },
    // Registry v2
    items: {},
    containers: {},
    equipment: {
      containerId: '',
      slots: []
    },
    // Legacy support
    backpack: [],
    inventory: {},
    knownSpells: [],
    languages: ['common'],
    preparedSpells: [],
    spellSlots: {},
    choices: {}
  });

  const [availableSpecies, setAvailableSpecies] = useState<{name: string, index: string}[]>([]);
  const [availableSubraces, setAvailableSubraces] = useState<{name: string, index: string}[]>([]);
  const [availableClasses, setAvailableClasses] = useState<{name: string, index: string}[]>([]);
  const [availableBackgrounds, setAvailableBackgrounds] = useState<{name: string, index: string}[]>([]);
  const [availableAlignments, setAvailableAlignments] = useState<{name: string, index: string}[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<{name: string, index: string}[]>([]);
  const [languageDetails, setLanguageDetails] = useState<Record<string, any>>({});
  const [staticLanguages, setStaticLanguages] = useState<string[]>([]);
  const [maxLanguageOptions, setMaxLanguageOptions] = useState(0);
  const [allowedLanguagesPool, setAllowedLanguagesPool] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync traits, proficiencies and languages as selections change
  useEffect(() => {
    if (!newChar.race && !newChar.class && !newChar.subrace && !newChar.background) return;

    const syncMetadata = async () => {
        let traits: string[] = [];
        let profs: string[] = [];
        let features: any[] = [];
        let langs: string[] = ['common'];
        let optionsCount = 0;
        const pool = new Set<string>();

        try {
            // Helper to resolve trait details
            const resolveTrait = async (traitRef: any) => {
                const traitIndex = typeof traitRef === 'string' ? traitRef : traitRef.index;
                if (!traitIndex) return;
                
                const traitData = await atlasService.loadTrait(traitIndex);
                if (traitData) {
                    if (traitData.name && !traits.includes(traitData.name)) {
                        traits.push(traitData.name);
                    }
                    if (traitData.proficiencies) {
                        for (const p of traitData.proficiencies) {
                            profs.push(p.name || p.index || p);
                        }
                    }
                    // Some traits are actually features
                    features.push({
                        name: traitData.name,
                        index: traitData.index,
                        desc: Array.isArray(traitData.desc) ? traitData.desc.join('\n') : traitData.desc,
                        source: 'Species'
                    });
                } else if (typeof traitRef === 'string') {
                    traits.push(traitRef);
                } else if (traitRef.name) {
                    traits.push(traitRef.name);
                }
            };

            if (newChar.race) {
                const sData = await fetchSpeciesData(newChar.race);
                if (sData?.traits) {
                    await Promise.all(sData.traits.map(resolveTrait));
                }
                if (sData?.proficiencies) {
                    profs.push(...sData.proficiencies.map((p: any) => p.name || p.index || p));
                }
                if (sData?.languages) {
                    const lList = sData.languages.map((l: any) => (l.index || l.name || l).toLowerCase());
                    langs.push(...lList);
                }
                if (sData?.language_options?.choose) {
                    optionsCount += sData.language_options.choose;
                    if (sData.language_options.from?.options) {
                        sData.language_options.from.options.forEach((o: any) => {
                            const idx = o.item?.index || o.index || o.name?.toLowerCase();
                            if (idx) pool.add(idx);
                        });
                    }
                }
            }
            if (newChar.subrace) {
                const subData = await fetchSubraceData(newChar.subrace);
                if (subData?.racial_traits) {
                    await Promise.all(subData.racial_traits.map(resolveTrait));
                }
                if (subData?.proficiencies) {
                    profs.push(...subData.proficiencies.map((p: any) => p.name || p.index || p));
                }
                if (subData?.languages) {
                  const lList = subData.languages.map((l: any) => (l.index || l.name || l).toLowerCase());
                  langs.push(...lList);
                }
                if (subData?.language_options?.choose) {
                    optionsCount += subData.language_options.choose;
                    if (subData.language_options.from?.options) {
                        subData.language_options.from.options.forEach((o: any) => {
                            const idx = o.item?.index || o.index || o.name?.toLowerCase();
                            if (idx) pool.add(idx);
                        });
                    }
                }
            }
            if (newChar.background) {
               const bgData = await atlasService.loadBackground(newChar.background);
               if (bgData?.languages) {
                  const lList = bgData.languages.map((l: any) => (l.index || l.name || l).toLowerCase());
                  langs.push(...lList);
               }
               if (bgData?.language_options?.choose) {
                   optionsCount += bgData.language_options.choose;
                   if (bgData.language_options.from?.options) {
                       bgData.language_options.from.options.forEach((o: any) => {
                           const idx = o.item?.index || o.index || o.name?.toLowerCase();
                           if (idx) pool.add(idx);
                       });
                   }
               }
               if (bgData?.starting_proficiencies) {
                   profs.push(...bgData.starting_proficiencies.map((p: any) => p.name || p.index || p));
               }
               if (bgData?.feature) {
                   features.push({
                       ...bgData.feature,
                       source: 'Background'
                   });
               }
            }
            if (newChar.class) {
                const cData = await atlasService.loadClass(newChar.class);
                if (cData?.proficiencies) {
                    profs.push(...cData.proficiencies.map((p: any) => p.name || p.index || p));
                }
                if (cData?.saving_throws) {
                    profs.push(...cData.saving_throws.map((p: any) => `Saving Throw: ${p.name || p.index}`));
                }

                // Initial level features
                const lvlData = await atlasService.loadLevelData(newChar.class, 1);
                if (lvlData?.features) {
                    for (const fRef of lvlData.features) {
                        const fData = await atlasService.loadFeature(fRef.index);
                        if (fData) {
                            features.push({
                                ...fData,
                                source: 'Class'
                            });
                        }
                    }
                }
            }

            const currentTraits = newChar.traits || [];
            const currentProfs = newChar.proficiencies || [];
            const currentLangs = newChar.languages || [];
            const currentFeatures = newChar.features || [];
            
            const newTraits = Array.from(new Set(traits));
            const newProfs = Array.from(new Set(profs));
            const newLangs = Array.from(new Set(langs));
            const newFeatures = Array.from(new Set(features.map(f => JSON.stringify(f)))).map(s => JSON.parse(s));

            setStaticLanguages(newLangs);
            setMaxLanguageOptions(optionsCount);
            setAllowedLanguagesPool(pool.size > 0 ? Array.from(pool) : null);

            const needsUpdate = 
                JSON.stringify(newTraits) !== JSON.stringify(currentTraits) || 
                JSON.stringify(newProfs) !== JSON.stringify(currentProfs) ||
                JSON.stringify(newLangs) !== JSON.stringify(currentLangs) ||
                JSON.stringify(newFeatures) !== JSON.stringify(currentFeatures);

            if (needsUpdate) {
                setNewChar(prev => {
                    const manualChoices = (prev.languages || []).filter(l => !newLangs.includes(l));
                    const limitedManual = manualChoices.slice(0, optionsCount);
                    
                    return {
                        ...prev,
                        traits: newTraits,
                        proficiencies: newProfs,
                        features: newFeatures,
                        languages: Array.from(new Set([...newLangs, ...limitedManual]))
                    };
                });
            }
        } catch (e) {
            console.error("Metadata sync error", e);
        }
    };
    syncMetadata();
  }, [newChar.race, newChar.subrace, newChar.class, newChar.background]);

  useEffect(() => {
    if (isCharacterCreatorOpen) {
      loadInitialData();
    }
  }, [isCharacterCreatorOpen]);

  useEffect(() => {
    if (availableLanguages.length > 0) {
      const loadLangs = async () => {
        const details: Record<string, any> = {};
        await Promise.all(availableLanguages.map(async (lang) => {
          const data = await atlasService.loadLanguage(lang.index);
          const name = lang.name || lang.index;
          const capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          
          if (data) {
            details[lang.index] = data;
            let ttfUrl: string | string[] | undefined = data.ttf;
            
            // Try to resolve ttf path
            if (ttfUrl && typeof ttfUrl === 'string') {
              if (ttfUrl.startsWith('public/')) {
                const path = ttfUrl.replace('public/', '');
                ttfUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/${path}`;
              }
            } else {
              // Fallback: try common pattern if ttf is missing
              const pascalCase = name.split(/[\s_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
              
              ttfUrl = [
                `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/${capitalized}-Regular.ttf`,
                `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/${pascalCase}-Regular.ttf`
              ];
              
              // Special case for common variations
              if (lang.index === 'gnoll') {
                 (ttfUrl as string[]).push(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Gnolll-Regular.ttf`);
              }
              if (lang.index === 'dwarvish' || name.toLowerCase().includes('dwarvish')) {
                 (ttfUrl as string[]).unshift(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Dwarven-Regular.ttf`);
              }
              if (lang.index === 'orc' || name.toLowerCase() === 'orc') {
                 (ttfUrl as string[]).unshift(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Orcish-Regular.ttf`);
              }
              if (name.toLowerCase().includes('deep speech') || lang.index.includes('deep_speech') || lang.index.includes('deep-speech')) {
                 (ttfUrl as string[]).unshift(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Ingan-Regular.ttf`);
              }
            }
            
            if (ttfUrl) {
              const fontFamily = getLanguageFontFamily(lang.index);
              injectFontFace(fontFamily, ttfUrl);
            }
          } else {
             // Even if data load fails, try font fallback
             details[lang.index] = { name: lang.name, index: lang.index }; 
             const pascalCase = name.split(/[\s_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
             const ttfUrls = [
               `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/${capitalized}-Regular.ttf`,
               `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/${pascalCase}-Regular.ttf`
             ];

             if (lang.index === 'dwarvish' || name.toLowerCase().includes('dwarvish')) {
               ttfUrls.unshift(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Dwarven-Regular.ttf`);
             }
             if (lang.index === 'orc' || name.toLowerCase() === 'orc') {
               ttfUrls.unshift(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Orcish-Regular.ttf`);
             }
             if (name.toLowerCase().includes('deep speech') || lang.index.includes('deep_speech') || lang.index.includes('deep-speech')) {
               ttfUrls.unshift(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/assets/atlas/languages/Ingan-Regular.ttf`);
             }

             injectFontFace(getLanguageFontFamily(lang.index), ttfUrls);
          }
        }));
        setLanguageDetails(details);
      };
      loadLangs();
    }
  }, [availableLanguages]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const { fetchLanguagesList } = await import('../../services/storageService');
      const [s, sub, c, b, a, l] = await Promise.all([
        fetchSpeciesList(),
        fetchSubraceList(),
        fetchClassesList(),
        fetchBackgroundsList(),
        fetchAlignmentsList(),
        fetchLanguagesList()
      ]);
      
      setAvailableSpecies(s.filter(item => {
        const normalized = item.index.toLowerCase().replace(/_/g, '-');
        return PLAYABLE_SPECIES.includes(normalized);
      }));
      
      setAvailableSubraces(sub);
      setAvailableClasses(c);
      setAvailableBackgrounds(b);
      setAvailableAlignments(a);
      setAvailableLanguages(l);
    } catch (e) {
      console.error("Failed to load initial character creation data", e);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch(currentStep) {
        case 'welcome': return true;
        case 'slot': return !!selectedSlot;
        case 'species': return !!newChar.race;
        case 'subrace': {
            const hasSubraces = availableSubraces.some(s => {
                if (newChar.race === 'elf') return s.index.includes('elf');
                if (newChar.race === 'dwarf') return s.index.includes('dwarf');
                if (newChar.race === 'halfling') return s.index.includes('halfling');
                if (newChar.race === 'gnome') return s.index.includes('gnome');
                return false;
            });
            return !hasSubraces || !!newChar.subrace;
        }
        case 'class': return !!newChar.class;
        case 'choices': return true;
        case 'equipment': return true;
        case 'spells': return true;
        case 'background': return !!newChar.background;
        case 'backstory': return true;
        case 'alignment': return !!newChar.alignment;
        case 'stats': return true;
        case 'skills': return true;
        case 'appearance': return true;
        case 'identity': return !!newChar.name && !!newChar.gender;
        default: return true;
    }
  };

  const nextStep = () => {
    if (!canGoNext()) {
        soundService.playEffect('MENU_ERROR');
        return;
    }
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(STEPS[currentIndex + 1].id);
      soundService.playEffect('UI_CLICK_LIGHT');
    }
  };

  const handleExit = () => {
    setIsCharacterCreatorOpen(false);
    setIsGameStarted(false);
    soundService.playEffect('UI_BACK_EXIT');
    // Ensure title/startup music is playing
    soundService.playMusic('startup');
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentStep(STEPS[currentIndex - 1].id);
      soundService.playEffect('UI_BACK_EXIT');
    } else if (currentIndex === 0) {
      handleExit();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    let finalHp = 10;

    try {
        const [sData, subData, cData] = await Promise.all([
            newChar.race ? fetchSpeciesData(newChar.race) : null,
            newChar.subrace ? fetchSubraceData(newChar.subrace) : null,
            newChar.class ? fetchClassData(newChar.class) : null
        ]);

        if (cData?.hit_die) {
            const conVal = (newChar.stats?.con || 10);
            let totalCon = conVal;
            if (sData?.ability_bonuses) {
                const b = sData.ability_bonuses.find((ab: any) => ab.ability_score.index === 'con');
                if (b) totalCon += b.bonus;
            }
            if (subData?.ability_bonuses) {
                const b = subData.ability_bonuses.find((ab: any) => ab.ability_score.index === 'con');
                if (b) totalCon += b.bonus;
            }
            const conMod = Math.floor((totalCon - 10) / 2);
            
            // Level 0: Half hit die + Con mod (min 1)
            // Level 1: Max hit die + Con mod
            const level = newChar.level || 0;
            if (level === 0) {
                finalHp = Math.max(1, Math.floor(cData.hit_die / 2) + conMod);
            } else {
                finalHp = cData.hit_die + conMod;
                // Add HP for subsequent levels
                for (let i = 2; i <= level; i++) {
                    finalHp += Math.floor(cData.hit_die / 2) + 1 + conMod;
                }
            }
        }

        const charId = selectedSlot ? `slot${selectedSlot}` : `char-${Date.now()}`;
        
        // Finalize spellcasting stats
        const spellcastingAbility = 
            ['wizard', 'artificer'].includes(newChar.class?.toLowerCase() || '') ? 'int' :
            ['cleric', 'druid', 'ranger'].includes(newChar.class?.toLowerCase() || '') ? 'wis' :
            ['bard', 'sorcerer', 'warlock', 'paladin'].includes(newChar.class?.toLowerCase() || '') ? 'cha' : 'cha';

        const { calculateMaxSpellSlots } = await import('../../lib/statCalculations');
        const { createDefaultEquipment, createDefaultBackpack } = await import('../../lib/inventoryUtils');
        const maxSlots = calculateMaxSpellSlots(newChar as Character);
        const spellSlots: Record<string, { current: number; max: number }> = {};
        Object.entries(maxSlots).forEach(([lvl, max]) => {
            spellSlots[lvl] = { current: max, max };
        });

        // Initialize containers if missing (Manifestation v2)
        const items = newChar.items || {};
        const containers = newChar.containers || {};
        let equipment = newChar.equipment;

        if (!equipment || equipment.slots.length === 0) {
            equipment = createDefaultEquipment(charId);
        } else {
            equipment.containerId = `equipment_${charId}`;
        }

        if (Object.keys(containers).length === 0) {
            const backpack = createDefaultBackpack(charId);
            containers[backpack.id] = backpack;
        }

        const finalizedChar: Character = {
          ...newChar as Character,
          id: charId,
          name: newChar.name || 'Hero',
          hp: finalHp,
          maxHp: finalHp,
          spellcastingAbility,
          spellSlots,
          saveVersion: 2,
          items,
          containers,
          equipment
        };

        // 1. Save images to GitHub first if they exist in base64/dataURL
        if (newChar.imageUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.imageUrl, 'portrait');
            finalizedChar.imageUrl = `data/character_save/images/${charId}/${charId}_portrait.webp`;
        }
        if (newChar.avatarUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.avatarUrl, 'avatar');
            finalizedChar.avatarUrl = `data/character_save/images/${charId}/${charId}_avatar.webp`;
        }
        if (newChar.matrixUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.matrixUrl, 'matrix');
            finalizedChar.matrixUrl = `data/character_save/images/${charId}/${charId}_matrix.webp`;
        }

        // 2. Save character JSON to GitHub
        await saveService.saveCharacter(finalizedChar, selectedSlot || undefined);

        // 3. Update local store
        setMainCharacter(finalizedChar);
        useStore.getState().setActiveCharacter(charId);
        useStore.getState().setIsGameStarted(true);
        
        // Switch to game playlist as character is manifested
        soundService.playMusic('game');
        
        // Refresh slots in store
        await useStore.getState().loadCharacters();
        
        soundService.playEffect('TRANSACTION_SUCCESS');
        setIsCharacterCreatorOpen(false);
    } catch (e) {
        console.error("Error finalizing character", e);
        soundService.playEffect('MENU_ERROR');
    } finally {
        setLoading(false);
    }
  };

  if (!isCharacterCreatorOpen) return null;

  return (
    <div id="character-creator-portal" className="fixed inset-0 top-16 z-[100] bg-dragon-darkRed/95 flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="absolute inset-0 bg-paper-texture opacity-10 mix-blend-overlay pointer-events-none" />
      
      <div id="creator-main-modal" className="w-full max-w-7xl h-[95vh] bg-parchment-100 border border-dragon-gold/30 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative rounded-sm items-stretch" style={{
        backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Header */}
        <div className="h-12 bg-white/20 backdrop-blur-sm border-b border-dragon-red/20 flex items-center px-4 shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-dragon-red/5 text-dragon-red border border-dragon-red/10 rounded-sm">
              {(() => {
                const iconName = STEPS.find(s => s.id === currentStep)?.icon || 'identity';
                return <GameIcon name={iconName as any} size={18} />;
              })()}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <h1 className="text-2xl font-bodoni font-black text-dragon-darkRed uppercase tracking-[0.2em] drop-shadow-sm">
                {STEPS.find(s => s.id === currentStep)?.label}
             </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Navigation Sidebar */}
          <div id="creator-sidebar" className="w-14 border-r border-dragon-red/10 bg-transparent p-2 flex flex-col gap-2 shrink-0 overflow-y-auto custom-scrollbar items-center">
             {STEPS.map((s, idx) => {
                const activeIdx = STEPS.findIndex(step => step.id === currentStep);
                const isCompleted = idx < activeIdx;
                const isActive = idx === activeIdx;

                return (
                  <button
                    key={s.id}
                    disabled={idx > activeIdx}
                    onClick={() => {
                        setDirection(idx > activeIdx ? 1 : -1);
                        setCurrentStep(s.id);
                    }}
                    title={s.label}
                    className={cn(
                       "w-10 h-10 flex items-center justify-center rounded-sm transition-all group shrink-0 relative",
                       isActive ? "bg-dragon-red text-white shadow-lg shadow-dragon-red/20" : 
                       isCompleted ? "text-dragon-red hover:bg-dragon-red/5" : "text-parchment-300 pointer-events-none opacity-40"
                    )}
                  >
                        {isCompleted ? <GameIcon name="check" size={16} color="currentColor" /> : (
                             <GameIcon name={s.icon as any} size={16} />
                        )}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full" />
                        )}
                  </button>
                );
             })}
          </div>

          {/* Main Stage */}
          <div id="creator-stage" className="flex-1 relative overflow-hidden bg-transparent">
             {loading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <GameIcon name="refresh" className="text-dragon-red animate-spin" size={32} />
                  <span className="text-[10px] font-header font-black text-dragon-red/40 uppercase tracking-widest">Invoking Data...</span>
               </div>
             ) : (
               <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    initial={{ x: direction * 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -direction * 30, opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute inset-0 p-1 flex flex-col"
                  >
                     <StepContent 
                        step={currentStep} 
                        newChar={newChar} 
                        setNewChar={setNewChar}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                        available={{ subraces: availableSubraces,
                           species: availableSpecies,
                           classes: availableClasses,
                           backgrounds: availableBackgrounds,
                           alignments: availableAlignments,
                           languages: availableLanguages
                        }}
                        languageDetails={languageDetails}
                        maxLanguageOptions={maxLanguageOptions}
                        staticLanguages={staticLanguages}
                        allowedLanguagesPool={allowedLanguagesPool}
                     />
                  </motion.div>
               </AnimatePresence>
             )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div id="creator-footer" className="h-16 bg-white/20 backdrop-blur-sm border-t border-dragon-red/20 flex items-center justify-between px-6 shrink-0">
           <button 
             onClick={prevStep}
             className="flex items-center gap-1.5 px-4 py-2 border border-parchment-300 rounded-sm font-black text-[9px] text-parchment-500 uppercase tracking-widest hover:bg-parchment-100 transition-all"
           >
             <GameIcon name="direction_left" size={14} color="currentColor" />
             Previous
           </button>

           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-dragon-red/40 uppercase tracking-tighter mb-0.5">Character_Identity</span>
              <div className="flex items-center gap-2 text-[11px] font-black text-dragon-darkRed uppercase tracking-wider font-bodoni">
                 <span>{newChar.race?.replace(/-/g, ' ') || 'NO_ANCESTRY'}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold/40" />
                 <span>{newChar.class || 'NO_CLASS'}</span>
              </div>
           </div>

           {currentStep === 'review' ? (
              <button 
                id="finish-creation-btn"
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-6 py-2 bg-dragon-red text-white rounded-sm font-header font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-dragon-darkRed transition-all"
              >
                <GameIcon name="save_data" size={14} color="currentColor" />
                Manifest
              </button>
           ) : (
             <button 
               id="next-stage-btn"
               onClick={nextStep}
               disabled={!canGoNext()}
               className={cn(
                 "flex items-center gap-1.5 px-6 py-2 rounded-sm font-header font-black text-[10px] uppercase tracking-widest shadow-lg transition-all",
                 canGoNext() 
                    ? "bg-dragon-red text-white hover:bg-dragon-darkRed" 
                    : "bg-parchment-200 text-parchment-400 cursor-not-allowed shadow-none"
               )}
             >
               Continue
               <GameIcon name="direction_right" size={14} color="currentColor" />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

const StepContent: React.FC<{
  step: CreationStep;
  newChar: Partial<Character>;
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
  selectedSlot: number | null;
  setSelectedSlot: (slot: number) => void;
  available: any;
  languageDetails: Record<string, any>;
  maxLanguageOptions: number;
  staticLanguages: string[];
  allowedLanguagesPool: string[] | null;
}> = ({ step, newChar, setNewChar, selectedSlot, setSelectedSlot, available, languageDetails, maxLanguageOptions, staticLanguages, allowedLanguagesPool }) => {
   switch (step) {
     case 'welcome': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><WelcomeStep /></div>;
     case 'slot': return <SlotStep selectedSlot={selectedSlot} onSelect={setSelectedSlot} />;
     case 'species': return <SelectionStep 
         title="Select Species" 
         desc="Your species defines your biological traits and natural talents."
         items={available.species}
         selected={newChar.race}
         onSelect={(val) => {
            setNewChar({...newChar, race: val, subrace: undefined});
         }}
         category="species"
      />;
     case 'subrace': {
        const speciesSubraces = available.subraces.filter((s: any) => {
            const idx = s.index.toLowerCase();
            if (newChar.race === 'elf') return idx.includes('elf') || idx.includes('drow');
            if (newChar.race === 'dwarf') return idx.includes('dwarf');
            if (newChar.race === 'halfling') return idx.includes('halfling');
            if (newChar.race === 'gnome') return idx.includes('gnome');
            return false;
        });
        
        if (speciesSubraces.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="p-8 bg-dragon-red/5 rounded-full border-2 border-dragon-red/10 text-dragon-red/20">
                        <GameIcon name="ancestry" size={80} color="currentColor" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase">Pure Lineage</h3>
                        <p className="text-parchment-500 font-medium max-w-md">The selected species does not have diverging heritages. You represent the core ancestral line.</p>
                    </div>
                </div>
            );
        }
        
        return <SelectionStep 
            title="Select Heritage" 
            desc="Further define your ancestry through cultural or biological divergence."
            items={speciesSubraces}
            selected={newChar.subrace}
            onSelect={(val) => setNewChar({...newChar, subrace: val})}
            category="subrace"
        />;
     }
     case 'class': return <SelectionStep 
         title="Choose Class" 
         desc="Your class is your primary calling and path of training."
         items={available.classes}
         selected={newChar.class}
         onSelect={(val) => {
            const lowVal = (val || "").toLowerCase();
            const spellAbility = 
                ['wizard', 'artificer'].includes(lowVal) ? 'int' :
                ['cleric', 'druid', 'ranger'].includes(lowVal) ? 'wis' :
                ['bard', 'sorcerer', 'warlock', 'paladin'].includes(lowVal) ? 'cha' : 'cha';

            setNewChar({...newChar, class: val, proficiencies: [], inventory: {}, knownSpells: [], preparedSpells: [], spellSlots: {}, spellcastingAbility: spellAbility, choices: {}});
         }}
         category="class"
      />;
     case 'choices': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><ChoicesStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'equipment': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><EquipmentStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'spells': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><SpellsStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'background': return <SelectionStep 
         title="Character Origins" 
         desc="Definition of your life before embarking on adventures."
         items={available.backgrounds}
         selected={newChar.background}
         onSelect={async (val) => {
            const { fetchBackgroundJson } = await import('../../services/storageService');
            const bgData = await fetchBackgroundJson(val);
            
            setNewChar(prev => {
                const newBackpack = [...(prev.backpack || [])];
                const newProficiencies = prev.proficiencies ? [...prev.proficiencies] : [];
                const newFeatures = prev.features ? [...prev.features] : [];

                if (bgData?.starting_equipment) {
                    bgData.starting_equipment.forEach((entry: any) => {
                        const item = entry.equipment;
                        const qty = entry.quantity || 1;
                        newBackpack.push({ ...item, quantity: qty, slot: entry.slot });
                    });
                }

                if (bgData?.starting_proficiencies) {
                    bgData.starting_proficiencies.forEach((p: any) => {
                        const pIdx = p.index || p.name;
                        if (!newProficiencies.includes(pIdx)) {
                            newProficiencies.push(pIdx);
                        }
                    });
                }

                // Handle 2024 Feat structure
                if (bgData?.feat) {
                    const featFeature = {
                        name: bgData.feat.name,
                        index: bgData.feat.index,
                        desc: 'Granted by your ' + bgData.name + ' background.',
                        source: 'Background'
                    };
                    if (!newFeatures.find(f => f.index === featFeature.index)) {
                        newFeatures.push(featFeature);
                    }
                }

                // Legacy feature support
                if (bgData?.feature) {
                    const feature = {
                        name: bgData.feature.name,
                        index: bgData.feature.index || bgData.index + '-feature',
                        desc: Array.isArray(bgData.feature.desc) ? bgData.feature.desc.join('\n') : bgData.feature.desc,
                        source: 'Background'
                    };
                    if (!newFeatures.find(f => f.name === feature.name)) {
                        newFeatures.push(feature);
                    }
                }

                return {
                    ...prev,
                    background: val,
                    backpack: newBackpack,
                    proficiencies: newProficiencies,
                    features: newFeatures
                };
            });
         }}
         category="backgrounds"
      />;
     case 'backstory': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><BackstoryStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'alignment': return <SelectionStep 
         title="Ethical Ethos" 
         desc="The moral compass that guides your decisions."
         items={available.alignments}
         selected={newChar.alignment}
         onSelect={(val) => setNewChar({...newChar, alignment: val})}
         category="alignments"
      />;
      case 'stats': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><StatsStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'skills': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><SkillsStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'appearance': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><AppearanceStep newChar={newChar} setNewChar={setNewChar} /></div>;
      case 'languages': return <div className="h-full overflow-y-auto custom-scrollbar pr-2">
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-end border-b border-dragon-gold/20 pb-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Linguistic Mastery</h2>
                    <p className="text-[11px] text-parchment-600 font-bold max-w-2xl uppercase tracking-widest">
                        {maxLanguageOptions > 0 
                            ? `You may choose ${maxLanguageOptions} additional ${maxLanguageOptions === 1 ? 'language' : 'languages'} based on your origins.` 
                            : "Your linguistic capabilities are dictated by your lineage and background."}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-dragon-gold/10 px-4 py-2 rounded-sm border border-dragon-gold/20">
                    <GameIcon name="book" size={20} color="#B8860B" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-dragon-gold uppercase leading-none">Limit</span>
                        <span className="text-[14px] font-black text-dragon-darkRed leading-none mt-1">
                            {(newChar.languages || []).filter(l => !staticLanguages.includes(l)).length} / {maxLanguageOptions}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(available.languages || []).filter((l: any) => !allowedLanguagesPool || allowedLanguagesPool.includes(l.index)).map((lang: any) => {
                    const isSelected = (newChar.languages || []).includes(lang.index);
                    const isStatic = staticLanguages.includes(lang.index);
                    const fontFamily = getLanguageFontFamily(lang.index);
                    const choicesMade = (newChar.languages || []).filter(l => !staticLanguages.includes(l)).length;
                    const canSelect = isSelected || choicesMade < maxLanguageOptions;
                    
                    return (
                        <button
                            key={lang.index}
                            disabled={isStatic}
                            onClick={() => {
                                const current = newChar.languages || [];
                                if (isStatic) return;
                                
                                if (isSelected) {
                                    setNewChar({ ...newChar, languages: current.filter(l => l !== lang.index) });
                                    soundService.playEffect('UI_CLICK_LIGHT');
                                } else if (choicesMade < maxLanguageOptions) {
                                    setNewChar({ ...newChar, languages: [...current, lang.index] });
                                    soundService.playEffect('TRANSACTION_SUCCESS');
                                } else {
                                    soundService.playEffect('MENU_ERROR');
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-sm border-2 transition-all relative group h-32 overflow-hidden",
                                isStatic
                                    ? "bg-dragon-darkRed/10 border-dragon-gold/30 text-dragon-darkRed/40 cursor-default"
                                    : isSelected 
                                        ? "bg-dragon-darkRed text-white border-dragon-gold shadow-lg" 
                                        : canSelect
                                            ? "bg-white/40 border-dragon-red/5 text-dragon-darkRed hover:border-dragon-red/20 shadow-sm"
                                            : "bg-white/10 border-dragon-red/5 text-dragon-darkRed/20 opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className={cn(
                                "text-[22px] font-black uppercase tracking-widest text-center relative z-10",
                                isStatic ? "opacity-30" : ""
                            )}>
                                {lang.name}
                            </span>
                            
                            <span 
                                className={cn(
                                    "mt-1 text-[55px] font-bold leading-[28px] group-hover:opacity-100 transition-opacity whitespace-nowrap relative z-10",
                                    isSelected ? "text-dragon-gold" : "text-dragon-gold/30"
                                )}
                                style={{ fontFamily }}
                            >
                                {lang.name}
                            </span>

                            {/* Background Decoration */}
                            <div className={cn(
                                "absolute -bottom-4 -right-4 opacity-5 transition-transform duration-500 group-hover:scale-110",
                                isSelected ? "text-dragon-gold" : "text-dragon-darkRed"
                            )}>
                                <GameIcon name="book" size={80} color="currentColor" />
                            </div>

                            {(isSelected || isStatic) && (
                                <div className="absolute top-1 right-1 z-20">
                                    <GameIcon name={isStatic ? "lock" : "check"} size={12} color={isStatic ? "#B8860B" : "white"} />
                                </div>
                            )}
                            
                            {isStatic && (
                                <div className="absolute top-1 left-1 z-20">
                                    <span className="text-[7px] font-black bg-dragon-gold/20 text-dragon-gold px-1 py-0.5 rounded uppercase">Heritage</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            <div className="p-5 bg-dragon-gold/5 border border-dragon-gold/20 rounded-sm relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-5">
                    <GameIcon name="book" size={120} color="#B8860B" />
                </div>
                <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.3em]">Registry of Known Tongues</span>
                <div className="flex flex-wrap gap-2 mt-3">
                    {(newChar.languages || []).sort().map(l => (
                        <div key={l} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-dragon-gold/10 rounded-sm shadow-sm">
                            <GameIcon name="magic_effect" size={10} color="#B8860B" />
                            <span className="text-[10px] font-black text-dragon-darkRed uppercase tracking-tight">
                                {l.replace(/-/g, ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
     </div>;
     case 'identity': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><IdentityStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'review': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><ReviewStep newChar={newChar} setNewChar={setNewChar} /></div>;
     default: return null;
   }
};

export default CharacterCreator;
