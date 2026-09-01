import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore, Character } from '../../store/useCharacterStore';
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
import { CreatorRightPanel } from './CreatorRightPanel';
import { ValidationOverlay, MissingStepItem } from './CharacterCreator/ValidationOverlay';
import { saveService } from '../../services/saveService';
import { atlasService } from '../../services/atlasService';
import { injectFontFace, getLanguageFontFamily } from '../../lib/fontLoader';

// Types for the creation flow
type CreationStep = 
  | 'welcome'
  | 'slot'
  | 'identity'
  | 'species'
  | 'class'
  | 'background'
  | 'alignment'
  | 'stats'
  | 'choices'
  | 'spells'
  | 'equipment'
  | 'appearance'
  | 'backstory'
  | 'review';

const ALL_STEPS: { id: CreationStep; label: string; icon: any }[] = [
  { id: 'welcome', label: 'Welcome', icon: 'devkit' },
  { id: 'slot', label: 'Save Slot', icon: 'save_data' },
  { id: 'identity', label: 'Identity', icon: 'info' },
  { id: 'species', label: 'Species', icon: 'ancestry' },
  { id: 'class', label: 'Class', icon: 'weapon' },
  { id: 'background', label: 'Origins', icon: 'scroll' },
  { id: 'alignment', label: 'Alignment', icon: 'shield' },
  { id: 'stats', label: 'Attributes', icon: 'dice' },
  { id: 'choices', label: 'Skills & Choices', icon: 'book' },
  { id: 'spells', label: 'Arcana', icon: 'magic_effect' },
  { id: 'equipment', label: 'Gear', icon: 'shield' },
  { id: 'appearance', label: 'Appearance', icon: 'identity' },
  { id: 'backstory', label: 'Describe Your Character', icon: 'book' },
  { id: 'review', label: 'Commit', icon: 'save_data' },
];

const CHARACTER_MIRROR_START_STEP: CreationStep = 'species';

const PLAYABLE_SPECIES = ['dragonborn', 'dwarf', 'elf', 'gnome', 'half-elf', 'half-orc', 'halfling', 'human', 'tiefling'];

import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';

export const CharacterCreator: React.FC = () => {
  const { 
    isCharacterCreatorOpen, 
    setIsCharacterCreatorOpen, 
    setIsLoading,
  } = useUIStore();
  const { setIsGameStarted } = useGameStore();

  const {
    characters,
    setCharacters,
    setMainCharacter,
    loadCharacters,
    setActiveCharacter
  } = useCharacterStore();
  const [currentStep, setCurrentStep] = useState<CreationStep>(() => {
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_TEST_STEP__) {
      return (window as any).__PLAYWRIGHT_TEST_STEP__;
    }
    return 'welcome';
  });
  const [direction, setDirection] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isRulesetExplicitlySelected, setIsRulesetExplicitlySelected] = useState(false);
  const [isGenderExplicitlySelected, setIsGenderExplicitlySelected] = useState(false);

  // New character state
  const [newChar, setNewChar] = useState<Partial<Character>>({
    ruleset: '2014',
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

  const handleRulesetChange = (ruleset: '2014' | '2024') => {
    setIsRulesetExplicitlySelected(true);
    if (newChar.ruleset === ruleset) return;
    soundService.playEffect('UI_CLICK_LIGHT');
    // Reset rules-sensitive selections on ruleset change to prevent mixed data
    setNewChar(prev => ({
      ...prev,
      ruleset,
      race: undefined,
      subrace: undefined,
      class: undefined,
      subclass: undefined,
      background: undefined,
      proficiencies: [],
      traits: [],
      features: [],
      knownSpells: [],
      preparedSpells: [],
      backpack: [],
      inventory: {},
      choices: {}
    }));
  };

  const handleGenderChange = (gender: 'Male' | 'Female') => {
    setIsGenderExplicitlySelected(true);
    setNewChar(prev => ({ ...prev, gender }));
  };

  // We dynamically determine which steps are active. Specifically, we hide 'spells'
  // if the chosen class does not support spellcasting.
  const SPELLCASTER_CLASSES = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'warlock', 'paladin', 'ranger', 'artificer'];
  const [isClassSpellcaster, setIsClassSpellcaster] = useState(false);

  useEffect(() => {
    if (newChar.class) {
      const clsLower = newChar.class.toLowerCase();
      const isKnownSpellcaster = SPELLCASTER_CLASSES.includes(clsLower);
      if (isKnownSpellcaster) {
        setIsClassSpellcaster(true);
      } else {
        atlasService.loadClass(newChar.class, newChar.ruleset).then(cData => {
          setIsClassSpellcaster(!!cData?.spellcasting);
        }).catch(() => {
          setIsClassSpellcaster(false);
        });
      }
    } else {
      setIsClassSpellcaster(false);
    }
  }, [newChar.class]);

  const STEPS = ALL_STEPS.filter(s => {
    if (s.id === 'spells' && !isClassSpellcaster) return false;
    return true;
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
        let traits: any[] = [];
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
                    if (traitData.name && !traits.some(t => t.index === traitData.index)) {
                        traits.push({
                            name: traitData.name,
                            index: traitData.index,
                            desc: Array.isArray(traitData.desc) ? traitData.desc.join('\n') : (traitData.desc || ""),
                            trait_specific: traitData.trait_specific
                        });
                    }
                    if (traitData.proficiencies) {
                        for (const p of traitData.proficiencies) {
                            profs.push(p.name || p.index || p);
                        }
                    }
                } else if (typeof traitRef === 'string') {
                    traits.push({ name: traitRef, index: traitRef, desc: "" });
                } else if (traitRef.name) {
                    traits.push({ name: traitRef.name, index: traitRef.index || traitRef.name, desc: "" });
                }
            };

            if (newChar.race) {
                const sData = await fetchSpeciesData(newChar.race, newChar.ruleset);
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
            if (newChar.subclass) {
                const subData = await atlasService.loadSubclass(newChar.subclass);
                if (subData?.features) {
                    const subLvl1Features = subData.features.filter((f: any) => f.level === 1);
                    for (const fRef of subLvl1Features) {
                        const fData = await atlasService.loadFeature(fRef.index);
                        if (fData) {
                            features.push({
                                ...fData,
                                source: 'Subclass'
                            });
                        }
                    }
                }
                if (subData?.proficiencies) {
                    profs.push(...subData.proficiencies.map((p: any) => p.name || p.index || p));
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
                const cData = await atlasService.loadClass(newChar.class, newChar.ruleset);
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

            // Sync manually chosen skills from Choices.skills
            const chosenSkills = newChar.choices?.skills || [];
            chosenSkills.forEach((sk: string) => {
                profs.push(`Skill: ${sk}`);
            });

            const currentTraits = newChar.traits || [];
            const currentProfs = newChar.proficiencies || [];
            const currentLangs = newChar.languages || [];
            const currentFeatures = newChar.features || [];
            
            const newTraits = Array.from(new Set(traits.map(t => JSON.stringify(t)))).map(s => JSON.parse(s));
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
        fetchClassesList(newChar.ruleset),
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
      setIsLoading(false);
    }
  };

  const getMissingRequiredSteps = (): MissingStepItem[] => {
    const missing: MissingStepItem[] = [];

    if (!selectedSlot) {
      missing.push({
        stepId: 'slot',
        label: 'Save Slot',
        icon: 'save_data',
        reason: 'No save slot selected'
      });
    }
    if (!newChar.gender) {
      missing.push({
        stepId: 'identity',
        label: 'Manifested Polarity',
        icon: 'info',
        reason: 'Gender selection is missing'
      });
    }
    if (!newChar.name || !newChar.name.trim()) {
      missing.push({
        stepId: 'backstory',
        label: 'Soul Moniker',
        icon: 'book',
        reason: 'Character name is missing'
      });
    }
    if (!newChar.race) {
      missing.push({
        stepId: 'species',
        label: 'Species & Heritage',
        icon: 'ancestry',
        reason: 'No species selected'
      });
    }
    if (!newChar.class) {
      missing.push({
        stepId: 'class',
        label: 'Class',
        icon: 'weapon',
        reason: 'No class selected'
      });
    }
    if (!newChar.background) {
      missing.push({
        stepId: 'background',
        label: 'Origins / Background',
        icon: 'scroll',
        reason: 'No background selected'
      });
    }
    if (!newChar.alignment) {
      missing.push({
        stepId: 'alignment',
        label: 'Alignment',
        icon: 'shield',
        reason: 'No alignment selected'
      });
    }

    return missing;
  };

  const canGoNext = () => {
    switch(currentStep) {
        case 'welcome': return isRulesetExplicitlySelected;
        case 'slot': return !!selectedSlot;
        case 'identity': return isGenderExplicitlySelected;
        case 'species': return !!newChar.race;
        case 'class': return !!newChar.class;
        case 'choices': return true;
        case 'equipment': return true;
        case 'spells': return true;
        case 'background': return !!newChar.background;
        case 'backstory': return true;
        case 'alignment': return !!newChar.alignment;
        case 'stats': return true;
        case 'appearance': return true;
        default: return true;
    }
  };

  const nextStep = () => {
    if (!canGoNext()) {
        soundService.playEffect('UI_ERROR');
        setIsValidationOpen(true);
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
    const missing = getMissingRequiredSteps();
    if (missing.length > 0) {
      soundService.playEffect('UI_ERROR');
      setIsValidationOpen(true);
      return;
    }

    setLoading(true);
    let finalHp = 10;

    try {
        const [sData, subData, cData] = await Promise.all([
            newChar.race ? fetchSpeciesData(newChar.race, newChar.ruleset) : null,
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

            // Apply HP bonuses from traits (e.g. Dwarven Toughness)
            newChar.traits?.forEach(trait => {
                const hpBonus = trait.trait_specific?.passive_modifiers?.hp_bonus_per_level;
                if (hpBonus) {
                    finalHp += (hpBonus * Math.max(1, level));
                }
            });

            // Apply HP bonuses from features/feats (e.g. Tough)
            newChar.features?.forEach(feat => {
                const hpBonus = feat.feature_specific?.passive_modifiers?.hp_bonus_per_level;
                if (hpBonus) {
                    finalHp += (hpBonus * Math.max(1, level));
                }
            });
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
            finalizedChar.imageUrl = `/data/character_save/images/${charId}/${charId}_portrait.webp`;
        }
        if (newChar.avatarUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.avatarUrl, 'avatar');
            finalizedChar.avatarUrl = `/data/character_save/images/${charId}/${charId}_avatar.webp`;
        }
        if (newChar.matrixUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.matrixUrl, 'matrix');
            finalizedChar.matrixUrl = `/data/character_save/images/${charId}/${charId}_matrix.webp`;
        }

        // 2. Save character JSON to GitHub
        await saveService.saveCharacter(finalizedChar, selectedSlot || undefined);

        // 3. Update local store
        setMainCharacter(finalizedChar);
        setActiveCharacter(charId);
        setIsGameStarted(true);
        
        // Switch to game playlist as character is manifested
        soundService.playMusic('game');
        
        // Refresh slots in store
        await loadCharacters();
        
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

  const speciesStepIndex = ALL_STEPS.findIndex(s => s.id === CHARACTER_MIRROR_START_STEP);
  const currentStepIndex = ALL_STEPS.findIndex(s => s.id === currentStep);
  const showCharacterMirror = currentStepIndex >= speciesStepIndex;

  return (
    <div id="character-creator-portal" className="fixed inset-0 z-[100] w-full h-full bg-parchment-100 flex flex-col items-stretch overflow-hidden">
      <div className="absolute inset-0 bg-paper-texture opacity-10 mix-blend-overlay pointer-events-none" />
      
      <div id="creator-main-modal" className="w-full h-full bg-transparent flex flex-col relative overflow-hidden items-stretch flex-1">
        {/* Header */}
        <div className="h-12 bg-white/20 border-b border-dragon-red/20 flex items-center px-4 shrink-0 relative">
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
                        onSelectRuleset={handleRulesetChange}
                        onSelectGender={handleGenderChange}
                        isRulesetExplicitlySelected={isRulesetExplicitlySelected}
                        isGenderExplicitlySelected={isGenderExplicitlySelected}
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

          {/* Persistent Character Frame Right Panel */}
          {showCharacterMirror && <CreatorRightPanel newChar={newChar} currentStep={currentStep} />}
        </div>

        <ValidationOverlay
          isOpen={isValidationOpen}
          onClose={() => setIsValidationOpen(false)}
          missingSteps={getMissingRequiredSteps()}
          onGoToStep={(stepId) => setCurrentStep(stepId as CreationStep)}
        />

        {/* Footer Navigation */}
        <div id="creator-footer" className="h-16 bg-white/20 border-t border-dragon-red/20 flex items-center justify-between px-6 shrink-0">
           <button 
             onClick={prevStep}
             className="flex items-center gap-1.5 px-4 py-2 border border-parchment-300 rounded-sm font-black text-[9px] text-parchment-500 uppercase tracking-widest hover:bg-parchment-100 transition-all"
           >
             <GameIcon name="direction_left" size={14} color="currentColor" />
             Previous
           </button>

           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-dragon-red/40 uppercase tracking-tighter mb-0.5">Character Creation Wizard</span>
              <div className="flex items-center gap-2 text-[11px] font-black text-dragon-darkRed uppercase tracking-wider font-bodoni">
                 <span>Step {STEPS.findIndex(s => s.id === currentStep) + 1} of {STEPS.length}</span>
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
                    ? "bg-dragon-red text-white hover:bg-dragon-darkRed animate-subtle-pulse cursor-pointer"
                    : "bg-parchment-200 text-parchment-600 shadow-none cursor-not-allowed opacity-60"
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
  onSelectRuleset: (ruleset: '2014' | '2024') => void;
  onSelectGender: (gender: 'Male' | 'Female') => void;
  isRulesetExplicitlySelected: boolean;
  isGenderExplicitlySelected: boolean;
  available: any;
  languageDetails: Record<string, any>;
  maxLanguageOptions: number;
  staticLanguages: string[];
  allowedLanguagesPool: string[] | null;
}> = ({ step, newChar, setNewChar, selectedSlot, setSelectedSlot, onSelectRuleset, onSelectGender, isRulesetExplicitlySelected, isGenderExplicitlySelected, available, languageDetails, maxLanguageOptions, staticLanguages, allowedLanguagesPool }) => {
   switch (step) {
     case 'welcome': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><WelcomeStep ruleset={newChar.ruleset || '2014'} isExplicitlySelected={isRulesetExplicitlySelected} onSelectRuleset={onSelectRuleset} /></div>;
     case 'slot': return <SlotStep selectedSlot={selectedSlot} onSelect={setSelectedSlot} />;
     case 'species': {
        return <SelectionStep 
            title="Select Species & Heritage"
            desc="Your species defines your biological traits and natural talents."
            items={available.species}
            selected={newChar.race}
            selectedSubrace={newChar.subrace}
            ruleset={newChar.ruleset}
            onSelect={(raceVal, subraceVal) => {
                setNewChar({...newChar, race: raceVal, subrace: subraceVal});
            }}
            category="species"
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
         title="Alignment"
         desc="The moral and ethical compass that guides your decisions."
         items={available.alignments}
         selected={newChar.alignment}
         onSelect={(val) => setNewChar({...newChar, alignment: val})}
         category="alignments"
      />;
      case 'stats': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><StatsStep newChar={newChar} setNewChar={setNewChar} /></div>;
      case 'appearance': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><AppearanceStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'identity': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><IdentityStep newChar={newChar} setNewChar={setNewChar} isExplicitlySelected={isGenderExplicitlySelected} onSelectGender={onSelectGender} /></div>;
     case 'review': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><ReviewStep newChar={newChar} setNewChar={setNewChar} /></div>;
     default: return null;
   }
};

export default CharacterCreator;
