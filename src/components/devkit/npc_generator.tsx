import React, { useState, useEffect } from 'react';
import { CharacterPipeline } from '../../lib/characterPipeline';
import { 
  getLevelFromXP, getXPForLevel, generateStandardStats, 
  calculateHP, randomFromList, DND_CLASSES, DND_RACES, DND_ALIGNMENTS, DND_BACKGROUNDS,
  getModifier,
  calculateInitiative, generateNPC
} from '../../lib/npcGeneratorUtils';
import { atlasService, AtlasClass, AtlasSpecies, AtlasBackground, StartingEquipmentOption } from '../../services/atlasService';
import { generateNPCData, generateNPCImages, NPCProfile } from '../../services/ai/npcService';
import { commitFile, playSuccessSound, playFailSound, playClickSound, normalizeImageUrl } from '../../services/storageService';
import { useStore, SKILL_LIST } from '../../store/useStore';
import { EquipmentDoll } from '../character/EquipmentDoll';
import { GameIcon, GameIconName } from '../../game_icons';

import { NPCChoiceResolver } from '../../lib/npcChoiceResolver';

interface NPCGeneratorProps {
  onSave?: (npc: NPCProfile) => void;
}

export const NPCGenerator: React.FC<NPCGeneratorProps> = ({ onSave }) => {
  const { characters } = useCharacterStore();
  const { equipmentList } = useStore();
  const {  loadAllLists } = useStore();
  const { 
    
    
    updateCharacter,
    deleteCharacter,
    addCharacter
  } = useCharacterStore();
  const { equipmentList } = useStore();

  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [npcData, setNpcData] = useState<Partial<NPCProfile>>({
    name: '',
    gender: 'Male',
    class: 'Fighter',
    race: 'Human',
    background: 'Soldier',
    alignment: 'Neutral',
    level: 0,
    xp: 0,
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    proficiencies: [],
    backstory: '',
    flaws: [],
    ideals: [],
    bonds: [],
    traits: [],
    appearance: {
      hairColor: 'Raven Black',
      hairStyle: 'Short',
      bodyType: 'Medium',
      eyeColor: 'Brown',
      skinColor: '#ffdbac',
      height: '5\'10"',
      weight: '160 lbs'
    },
    money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    inventory: {},
    backpack: [],
    items: {},
    containers: {},
    equipment: { containerId: 'equipment_npc', slots: [] },
    spells: [],
    saveVersion: 2
  });

  const [npcImages, setNpcImages] = useState<{ profileUrl: string; avatarUrl: string; matrixUrl: string } | null>(null);
  const [statGenMethod, setStatGenMethod] = useState<'Standard Array' | 'Rolling' | 'Point Buy'>('Rolling');
  const [isGeneratingNpc, setIsGeneratingNpc] = useState(false);
  const [isGeneratingNpcImages, setIsGeneratingNpcImages] = useState(false);
  const [atlasClass, setAtlasClass] = useState<AtlasClass | null>(null);
  const [atlasSpecies, setAtlasSpecies] = useState<AtlasSpecies | null>(null);
  const [atlasBackground, setAtlasBackground] = useState<AtlasBackground | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Equipment resolution choices
  const [selectedChoices, setSelectedChoices] = useState<Record<number, any>>({});
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState<any[]>([]);

  const [isApplyingGear, setIsApplyingGear] = useState(false);

  // Computed derived stats
  const proficiencyBonus = Math.floor(Math.max(0, (npcData.level || 0) - 1) / 4) + 2;

  const calculateSkillBonus = (skillName: string) => {
    const skill = SKILL_LIST.find(s => s.name.toLowerCase() === skillName.toLowerCase().replace(/skill:_/i, '').replace(/_/g, ' '));
    if (!skill) return 0;
    
    const modifier = getModifier((npcData.stats as any)?.[skill.ability] || 10);
    const isProficient = npcData.proficiencies?.some(p => p.toLowerCase().includes(skillName.toLowerCase().replace(/skill:/i, '').trim()));
    
    return modifier + (isProficient ? proficiencyBonus : 0);
  };

  const equippedArmor = npcData.inventory?.chest || null;
  const equippedShield = npcData.inventory?.['off-hand'] || null;
  
  // Use pipeline for more accurate AC calculation
  const [computedAC, setComputedAC] = useState(10);
  
  useEffect(() => {
    const updateAC = async () => {
      const ac = await CharacterPipeline.calculateAC(npcData.stats?.dex ?? 10, npcData.inventory || {}, npcData.choices);
      setComputedAC(ac);
    };
    updateAC();
  }, [npcData.stats?.dex, npcData.inventory, npcData.choices]);

  const computedInitiative = calculateInitiative(npcData.stats?.dex ?? 10);
  const computedSpeed = atlasSpecies?.speed || 30;

  useEffect(() => {
    loadAllLists();
  }, []);

  useEffect(() => {
    if (equipmentSearch.length > 1) {
      const filtered = equipmentList.filter(e => 
        e.name.toLowerCase().includes(equipmentSearch.toLowerCase()) || 
        e.index.toLowerCase().includes(equipmentSearch.toLowerCase())
      ).slice(0, 10);
      setFilteredEquipment(filtered);
    } else {
      setFilteredEquipment([]);
    }
  }, [equipmentSearch, equipmentList]);

  useEffect(() => {
    const loadAtlasData = async () => {
      if (npcData.class) {
        const cls = await atlasService.loadClass(npcData.class);
        setAtlasClass(cls);
        setSelectedChoices({}); // Reset choices when class changes
      }
      if (npcData.race) {
        const spc = await atlasService.loadSpecies(npcData.race);
        setAtlasSpecies(spc);
      }
      if (npcData.background) {
        const bg = await atlasService.loadBackground(npcData.background);
        setAtlasBackground(bg);
      }
    };
    loadAtlasData();
  }, [npcData.class, npcData.race, npcData.background]);

  const randomizeStats = () => {
    const stats = NPCChoiceResolver.resolveStats(statGenMethod);
    setNpcData(prev => ({ ...prev, stats }));
    playClickSound();
  };

  const randomizeField = (field: keyof NPCProfile, options: readonly string[]) => {
    setNpcData(prev => ({ ...prev, [field]: randomFromList(options as string[]) }));
    playClickSound();
  };

  const syncLevelFromXp = (xp: number) => {
    const level = getLevelFromXP(xp);
    setNpcData(prev => ({ ...prev, xp, level }));
  };

  const syncXpFromLevel = (level: number) => {
    const xp = getXPForLevel(level);
    setNpcData(prev => ({ ...prev, level, xp }));
  };

  const handleQuickRandomize = () => {
    const npc = generateNPC({
        name: npcData.name,
        class: npcData.class,
        race: npcData.race,
        alignment: npcData.alignment,
        background: npcData.background,
        level: npcData.level || 0,
        gender: npcData.gender
    });
    setNpcData(npc);
    playSuccessSound();
  };

  const handleGenerateNpc = async () => {
    setIsGeneratingNpc(true);
    try {
      const data = await generateNPCData(npcData, { 
        classList: DND_CLASSES as string[],
        speciesList: DND_RACES as string[],
        backgroundList: DND_BACKGROUNDS as string[],
        alignmentList: DND_ALIGNMENTS as string[],
        statGenMethod: statGenMethod
      });
      
      // Auto-resolve equipment for the generated character
      const atlasCls = await atlasService.loadClass(data.class);
      const atlasBg = await atlasService.loadBackground(data.background);
      const atlasSpc = await atlasService.loadSpecies(data.race);
      
      const { characters } = useCharacterStore();
  const { equipmentList } = useStore();
  const { inventory, backpack, v2 } = await NPCChoiceResolver.resolveFullStartingEquipment(atlasCls, atlasBg);
      const personality = NPCChoiceResolver.resolvePersonality(atlasBg);
      const proficiencies = NPCChoiceResolver.resolveAllProficiencies(atlasCls, atlasBg, atlasSpc);
      const spells = await NPCChoiceResolver.resolveSpells(atlasCls);
      const money = NPCChoiceResolver.resolveStartingMoney();

      // Recalculate HP based on class hit die
      const hitDie = atlasCls?.hit_die || 8;
      const finalHP = CharacterPipeline.calculateHP(data.level ?? 0, data.stats.con, hitDie);

      setNpcData({
        ...data,
        level: data.level ?? 0,
        inventory,
        backpack,
        items: v2.items,
        containers: v2.containers,
        equipment: v2.equipment,
        proficiencies,
        spells,
        ...personality,
        money,
        hp: finalHP,
        maxHp: finalHP,
        saveVersion: 2
      });
      playSuccessSound();
    } catch (error) {
      console.error(error);
      playFailSound();
      alert("NPC generation failed.");
    } finally {
      setIsGeneratingNpc(false);
    }
  };

  const handleGenerateNpcImages = async () => {
    if (!npcData.name) return;
    setIsGeneratingNpcImages(true);
    try {
      const images = await generateNPCImages(npcData as NPCProfile);
      setNpcImages({
        profileUrl: images.profileUrl,
        avatarUrl: images.avatarUrl,
        matrixUrl: images.matrixUrl
      });
      playSuccessSound();
    } catch (error) {
      console.error(error);
      playFailSound();
      alert("Image generation failed.");
    } finally {
      setIsGeneratingNpcImages(false);
    }
  };

  const addItemToNpc = async (itemMini: any) => {
    if (!itemMini || !itemMini.index) return;
    const indexStr = String(itemMini.index);
    const slug = indexStr.toLowerCase().replace(/[\s-]/g, '_');
    
    if (slug?.endsWith('_pack')) {
      const pack = await atlasService.loadEquipmentPack(indexStr);
      if (pack && pack.contents) {
        for (const content of pack.contents) {
          const contentItem = content.item?.of || content.item?.item || content.item;
          if (contentItem) {
            await addItemToNpc({ ...contentItem, quantity: content.quantity || 1 });
          }
        }
        return;
      }
    }

    const fullData = await atlasService.loadEquipment(indexStr);
    const itemObj = CharacterPipeline.createItemObject({ ...fullData, ...itemMini });

    setNpcData(prev => {
      const newBackpack = [...(prev.backpack || [])];
      const existing = newBackpack.findIndex(i => (i.index && i.index === itemObj.index) || (i.name === itemObj.name));
      
      if (existing > -1) {
        const updated = { ...newBackpack[existing] };
        updated.quantity = (updated.quantity || 1) + (itemObj.quantity || 1);
        newBackpack[existing] = updated;
      } else {
        newBackpack.push(itemObj);
      }
      return { ...prev, backpack: newBackpack };
    });
    playSuccessSound();
  };

  const unequipItemFromNpc = (slot: string) => {
    setNpcData(prev => {
      const newInventory = { ...(prev.inventory || {}) };
      delete newInventory[slot];
      return { ...prev, inventory: newInventory };
    });
    playClickSound();
  };

  const equipItemToNpc = (item: any) => {
    if (!item.slot) return;
    const slots = Array.isArray(item.slot) ? item.slot : [item.slot];
    const slot = slots[0];
    
    setNpcData(prev => {
      const newInventory = { ...(prev.inventory || {}) };
      const newBackpack = (prev.backpack || []).filter(b => b.id !== item.id);
      
      // If something already there, move to backpack
      const existingEquipped = newInventory[slot];
      if (existingEquipped) {
        const backpackIdx = newBackpack.findIndex(b => (b.index && b.index === existingEquipped.index) || (b.name === existingEquipped.name));
        if (backpackIdx > -1) {
           const updated = { ...newBackpack[backpackIdx] };
           updated.quantity = (updated.quantity || 1) + (existingEquipped.quantity || 1);
           newBackpack[backpackIdx] = updated;
        } else {
           newBackpack.push(existingEquipped);
        }
      }
      
      newInventory[slot] = item;
      return { ...prev, inventory: newInventory, backpack: newBackpack };
    });
    playSuccessSound();
  };

  const handleSaveNpc = async () => {
    if (!npcData.name) return;
    setIsChecking(true);
    try {
      const id = editingCharId || npcData.name.toLowerCase().replace(/\s+/g, '_');
      const repo = "japiohopman/artificer";
      const branch = "main";
      const githubBase = `https://github.com/${repo}/blob/${branch}/`;

      // Sanitize inventory and backpack URLs
      const sanitizeItems = (items: any[]) => items.map(item => {
        if (!item || !item.index) return item;
        const indexStr = String(item.index);
        const pathSlug = indexStr.toLowerCase().replace(/[\s-]/g, '_').replace(/'/g, '');
        return {
          ...item,
          url: `public/assets/atlas/equipment/json/${indexStr}.json`,
          image_url: `/assets/atlas/equipment/images/${pathSlug}.webp`,
          imageUrl: `/assets/atlas/equipment/images/${pathSlug}.webp`
        };
      });

      const sanitizedBackpack = sanitizeItems(npcData.backpack || []);
      const sanitizedInventory: any = {};
      Object.entries(npcData.inventory || {}).forEach(([slot, item]: [string, any]) => {
        sanitizedInventory[slot] = sanitizeItems([item])[0];
        // Add the slot property: "chest_slot": "leather armor"
        const slotKey = `${slot.replace('-', '_')}_slot`;
        sanitizedInventory[slot][slotKey] = sanitizedInventory[slot].name;
      });

      const npcToSave: any = { 
        ...npcData, 
        id,
        saveVersion: 2,
        level: npcData.level || 0,
        inventory: sanitizedInventory,
        backpack: sanitizedBackpack,
        items: npcData.items || {},
        containers: npcData.containers || {},
        equipment: npcData.equipment || { containerId: `equipment_${id}`, slots: [] },
        dataPath: `${githubBase}public/assets/atlas/character/npc_character_profiles/json/${id}.json`,
        atlas_data: {
          class: atlasClass,
          species: atlasSpecies,
          background: atlasBackground
        },
        metadata: {
          updated_at: new Date().toISOString(),
          version: "2.6"
        }
      };

      if (npcImages) {
        const relativeImageBase = `assets/atlas/character/npc_character_profiles/images/${id}/`;
        const publicImageBase = `public/${relativeImageBase}`;
        
        const portraitPath = `${publicImageBase}${id}_portrait.webp`;
        const avatarPath = `${publicImageBase}${id}_avatar.webp`;
        const matrixPath = `${publicImageBase}${id}_matrix.webp`;
        
        await commitFile(portraitPath, npcImages.profileUrl.split(',')[1], true);
        await commitFile(avatarPath, npcImages.avatarUrl.split(',')[1], true);
        await commitFile(matrixPath, npcImages.matrixUrl.split(',')[1], true);
        
        npcToSave.imageUrl = `/${relativeImageBase}${id}_portrait.webp`;
        npcToSave.avatarUrl = `/${relativeImageBase}${id}_avatar.webp`;
        npcToSave.matrixUrl = `/${relativeImageBase}${id}_matrix.webp`;
      }

      const jsonPath = `public/assets/atlas/character/npc_character_profiles/json/${id}.json`;
      const success = await commitFile(jsonPath, JSON.stringify(npcToSave, null, 2));

      if (success) {
        if (editingCharId) {
          updateCharacter(editingCharId, npcToSave);
        } else {
          addCharacter(npcToSave);
        }
        playSuccessSound();
        alert(`Entity ${npcData.name} synchronized successfully!`);
        setEditingCharId(id);
      }
    } catch (error) {
      console.error(error);
      playFailSound();
      alert("Synchronization failed.");
    } finally {
      setIsChecking(false);
    }
  };

  const EquipmentChoiceButton = ({ 
    choice, 
    isSelected, 
    onClick 
  }: { 
    choice: any, 
    isSelected: boolean, 
    onClick: () => void 
  }) => {
    const [resolvedLabel, setResolvedLabel] = useState<string>("...");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const getLabel = async () => {
        if (choice.option_type === 'multiple') {
          const names = choice.items.map((it: any) => {
            const inner = it.of || it.item || it.equipment || it;
            const count = it.count || it.quantity || 1;
            const name = inner.name || inner.index || "Item";
            return count > 1 ? `${count}x ${name}` : name;
          });
          setResolvedLabel(names.join(' + '));
        } else if (choice.option_type === 'choice') {
          const c = choice.choice;
          if (c?.from?.option_set_type === 'equipment_category') {
            setResolvedLabel(`Any ${c.from.equipment_category.name}`);
          } else {
            setResolvedLabel(c?.desc || "Choice");
          }
        } else {
          const inner = choice.of || choice.item || choice.equipment || choice;
          setResolvedLabel(inner.name || inner.index || "Item");
        }
      };
      getLabel();
    }, [choice]);

    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-3 py-2 rounded-xl text-[9px] font-bold uppercase transition-all border group relative overflow-hidden ${
          isSelected 
            ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:bg-white/10'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none`} />
        <span className="relative z-10">{resolvedLabel}</span>
        {isSelected && (
           <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-bl-lg animate-pulse" />
        )}
      </button>
    );
  };

  const renderEquipmentChoice = (option: StartingEquipmentOption, index: number) => {
    const choices = option.from.options || [];
    const currentChoice = selectedChoices[index];

    return (
      <div key={index} className="space-y-2 p-3 bg-white/5 rounded border border-white/10">
        <div className="text-[10px] text-white/50 font-bold italic mb-2 tracking-tight">{option.desc}</div>
        
        {option.from.option_set_type === 'equipment_category' ? (
           <EquipmentCategoryChoice 
             category={option.from.equipment_category} 
             onSelect={(item) => setSelectedChoices(prev => ({ ...prev, [index]: { option_type: 'reference', item } }))}
             isSelected={(item) => selectedChoices[index]?.item?.index === item.index}
           />
        ) : (
          <div className="flex flex-wrap gap-2">
            {choices.map((choice, i) => (
              <EquipmentChoiceButton 
                key={i}
                choice={choice}
                isSelected={currentChoice === i}
                onClick={() => setSelectedChoices(prev => ({ ...prev, [index]: i }))}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const EquipmentCategoryChoice = ({ category, onSelect, isSelected }: any) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const load = async () => {
        setLoading(true);
        const data = await atlasService.loadEquipmentByCategory(category.index);
        setItems(data);
        setLoading(false);
      };
      load();
    }, [category]);

    if (loading) return <div className="text-[9px] text-white/20 animate-pulse">Scanning_Database...</div>;

    return (
          <div className="grid grid-cols-2 gap-2">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => onSelect(it)}
                className={`px-3 py-2 rounded-xl text-[8px] font-bold uppercase border transition-all truncate text-left relative group overflow-hidden ${
                  isSelected(it)
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none`} />
                <span className="relative z-10">{it.name}</span>
              </button>
            ))}
          </div>
    );
  };

  const handleAutoResolvedEquipment = async () => {
    setIsApplyingGear(true);
    try {
      const { characters } = useCharacterStore();
  const { equipmentList } = useStore();
  const { inventory, backpack, v2 } = await NPCChoiceResolver.resolveFullStartingEquipment(atlasClass, atlasBackground);
      
      setNpcData(prev => ({
        ...prev,
        inventory,
        backpack,
        items: v2.items,
        containers: v2.containers,
        equipment: v2.equipment,
        saveVersion: 2
      }));
      playSuccessSound();
    } catch (error) {
      console.error(error);
      playFailSound();
    } finally {
      setIsApplyingGear(false);
    }
  };

  const applyChoices = async () => {
    setIsApplyingGear(true);
    try {
      // Collect manual selections
      const manualItems: any[] = [];
      const resolveChoice = async (option: StartingEquipmentOption, selectionIndex: number) => {
        const selection = option.from.options?.[selectionIndex];
        if (selection) {
          const resolved = await NPCChoiceResolver.resolveChoice(selection);
          manualItems.push(...resolved);
        }
      };

      // Class Choices
      if (atlasClass?.starting_equipment_options) {
        for (let i = 0; i < atlasClass.starting_equipment_options.length; i++) {
          if (selectedChoices[i] !== undefined) {
             await resolveChoice(atlasClass.starting_equipment_options[i], selectedChoices[i]);
          }
        }
      }

      // Static Items
      const staticItems: any[] = [];
      if (atlasClass?.starting_equipment) {
        staticItems.push(...atlasClass.starting_equipment.map(e => ({ index: e.equipment.index, quantity: e.quantity })));
      }
      if (atlasBackground?.starting_equipment) {
        staticItems.push(...atlasBackground.starting_equipment.map(e => ({ index: e.equipment.index, quantity: e.quantity })));
      }

      // Expand and Standardize
      const allItems = [...staticItems, ...manualItems];
      const expanded = await NPCChoiceResolver.expandPacks(allItems);
      const standardized = await NPCChoiceResolver.standardizeItems(expanded);
      const { characters } = useCharacterStore();
  const { equipmentList } = useStore();
  const { inventory, backpack } = await NPCChoiceResolver.buildResolvedInventory(npcData, standardized);
      const v2 = await NPCChoiceResolver.buildV2Inventory(standardized);

      setNpcData(prev => ({
        ...prev,
        inventory,
        backpack,
        items: v2.items,
        containers: v2.containers,
        equipment: v2.equipment,
        saveVersion: 2
      }));
      playSuccessSound();
    } catch (error) {
      console.error(error);
      playFailSound();
    } finally {
      setIsApplyingGear(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1a1a1a]">
      {/* Side List */}
      <div className="w-64 border-r border-white/5 flex flex-col bg-[#1e1e1e]">
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Repository</span>
          <button 
            onClick={() => {
              setEditingCharId(null);
              setNpcData({
                name: '',
                gender: 'Male',
                class: 'Fighter',
                race: 'Human',
                background: 'Soldier',
                alignment: 'True Neutral',
                level: 0,
                xp: 0,
                stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                proficiencies: [],
                skills: [],
                backstory: '',
                appearance: { hairColor: '', hairStyle: '', bodyType: '', eyeColor: '', skinColor: '', height: '', weight: '' },
                money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
                inventory: {},
                backpack: [],
                spells: []
              });
              setNpcImages(null);
            }}
            className="p-1 px-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-[8px] font-black uppercase hover:bg-purple-500/20 transition-all"
          >
            New_Entity
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {characters.map(char => (
            <div 
              key={char.id}
              className={`group flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${editingCharId === char.id ? 'bg-purple-500/10 border-r-2 border-r-purple-500' : ''}`}
              onClick={() => {
                setEditingCharId(char.id);
                setNpcData(char);
                setNpcImages(null);
                playClickSound();
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-black/40 border border-white/5 shadow-sm">
                  <img src={normalizeImageUrl(char.avatarUrl || char.imageUrl, 'npc_character_profiles', char.id)} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-white/80 uppercase truncate">{char.name}</span>
                  <span className="text-[8px] text-white/30 uppercase font-bold tracking-tight">LVL {char.level} • {char.class}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Authorize permanent deletion of entity: ${char.name}?`)) {
                    deleteCharacter(char.id);
                    if (editingCharId === char.id) setEditingCharId(null);
                    playFailSound();
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-dragon-red transition-all"
              >
                <GameIcon name="trash" size={12} color="currentColor" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Builder Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
              <GameIcon name="avatar" size={16} />
            </div>
            <div>
              <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Universal_Entity_Builder</div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">NPC Character Profile</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleQuickRandomize}
               className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all shadow-md border border-white/10"
             >
               <GameIcon name="refresh" size={12} color="currentColor" />
               Quick_Random
             </button>
             <button 
               onClick={handleGenerateNpc}
               disabled={isGeneratingNpc}
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-50 shadow-md border border-indigo-400/30"
             >
               <GameIcon name="loading" size={14} color="currentColor" className={isGeneratingNpc ? 'animate-spin' : ''} />
               {isGeneratingNpc ? 'GEN_DATA...' : 'Full_AI_Gen'}
             </button>
             <div className="w-px h-6 bg-white/10 mx-1" />
             <button 
               onClick={handleGenerateNpcImages}
               disabled={isGeneratingNpcImages || !npcData.name}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all disabled:opacity-50 shadow-lg border border-blue-400/30"
             >
               <GameIcon name="award" size={14} color="currentColor" className={isGeneratingNpcImages ? 'animate-spin' : ''} />
               {isGeneratingNpcImages ? 'GENERATING...' : 'GEN_NPC_ASSETS'}
             </button>
             <button 
               onClick={handleSaveNpc}
               disabled={isChecking}
               className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all disabled:opacity-50 shadow-lg border border-purple-400/30"
             >
               <GameIcon name="save_data" size={14} color="currentColor" />
               {isChecking ? 'SYNCHRONIZING...' : 'COMMIT_NPC_TO_REPO'}
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header / Name */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                <div className="text-right">
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Character_Tier</div>
                  <div className="text-4xl font-black text-white italic tracking-tighter">LVL {npcData.level}</div>
                </div>
              </div>

              {/* Image Previews */}
              {(npcImages || npcData.imageUrl || npcData.matrixUrl) && (
                <div className="mb-6 space-y-4">
                   <div className="flex items-center gap-4 border-b border-white/5 pb-2">
                      <GameIcon name="loading" size={14} className="text-blue-400" color="currentColor" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Image_Intelligence_Matrix</span>
                   </div>
                   <div className="grid grid-cols-12 gap-4">
                      {/* Portrait */}
                      <div className="col-span-3 aspect-[9/16] bg-black/40 rounded-xl overflow-hidden border border-white/10 relative group/img">
                         <img src={npcImages?.profileUrl || normalizeImageUrl(npcData.imageUrl, 'npc_character_profiles', npcData.id || 'unnamed')} className="w-full h-full object-cover" />
                         <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white/60 uppercase text-center">Hero_Portrait_Vertical</div>
                      </div>
                      {/* Avatar */}
                      <div className="col-span-2 space-y-4">
                         <div className="aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/10 relative group/img">
                            <img src={npcImages?.avatarUrl || normalizeImageUrl(npcData.avatarUrl, 'npc_character_profiles', npcData.id || 'unnamed')} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white/60 uppercase text-center">Neural_Avatar</div>
                         </div>
                      </div>
                      {/* Matrix */}
                      <div className="col-span-7 aspect-[3/2] bg-black/40 rounded-xl overflow-hidden border border-white/10 relative group/img">
                         <img src={npcImages?.matrixUrl || normalizeImageUrl(npcData.matrixUrl, 'npc_character_profiles', npcData.id || 'unnamed')} className="w-full h-full object-cover" />
                         <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white/60 uppercase text-center">NPC_Portrait_Matrix_Forge [3x3 Emotion Grid]</div>
                      </div>
                   </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-6 items-end">
                  <div className="col-span-8">
                    <input 
                      type="text"
                      value={npcData.name}
                      onChange={(e) => setNpcData({ ...npcData, name: e.target.value })}
                      className="bg-transparent text-5xl font-black text-white placeholder:text-white/10 focus:outline-none w-full tracking-tighter uppercase"
                      placeholder="E N T I T Y _ N A M E"
                    />
                  </div>
                  <div className="col-span-4 flex justify-end pb-2">
                    <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
                      {(['Male', 'Female'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => setNpcData(prev => ({ ...prev, gender: g }))}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                            npcData.gender === g 
                              ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                              : 'text-white/30 hover:bg-white/5'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Appearance Summary / Visual Identity */}
                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl space-y-2">
                   <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest">
                      <GameIcon name="ruler" size={12} color="currentColor" className="text-blue-400/50" />
                      Visual_Identity_Profile
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                         <span className="text-[8px] text-white/20 uppercase font-bold block">Build</span>
                         <div className="text-[10px] text-white/80 font-bold uppercase">{npcData.appearance?.bodyType || 'Standard'}</div>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[8px] text-white/20 uppercase font-bold block">Size</span>
                         <div className="text-[10px] text-white/80 font-bold uppercase">{(npcData.appearance as any)?.size || 'Medium'}</div>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[8px] text-white/20 uppercase font-bold block">Hair_Style</span>
                         <div className="text-[10px] text-white/80 font-bold uppercase">{npcData.appearance?.hairStyle || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[8px] text-white/20 uppercase font-bold block">Art_Style_Ref</span>
                         <div className="text-[10px] text-blue-400 font-bold uppercase italic">Cinematic Digital Painting</div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4 items-center border-t border-white/10 pt-4">
                  {[
                    { label: 'Class', value: npcData.class, icon: 'award' },
                    { label: 'Species', value: npcData.race, icon: 'ancestry' },
                    { label: 'Origin', value: npcData.background, icon: 'package' },
                    { label: 'Aura', value: npcData.alignment, icon: 'dice_roll' }
                  ].map((tag, i) => (
                    <div key={i} className="flex items-center gap-2 group/tag">
                      <GameIcon name={tag.icon as any} size={12} color="currentColor" className="text-purple-400/50 group-hover/tag:text-purple-400 transition-colors" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{tag.value}</span>
                    </div>
                  ))}
                  
                  <div className="w-full flex flex-wrap gap-4 pt-2">
                     <div className="flex-1 min-w-[300px] flex items-center gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/10 shadow-inner">
                        <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Bio_Scan:</span>
                        <div className="flex flex-wrap gap-6 text-[10px] text-white/70 font-bold uppercase tracking-tight">
                            <span className="flex items-center gap-2 group cursor-help">
                               <div className="w-2 h-2 rounded-full bg-blue-400/40 border border-blue-400/20" />
                               <span className="text-white/40">Eyes:</span> 
                               <select 
                                 value={npcData.appearance?.eyeColor || 'Deep Brown'}
                                 onChange={(e) => setNpcData(prev => ({ 
                                   ...prev, 
                                   appearance: { ...prev.appearance!, eyeColor: e.target.value } 
                                 }))}
                                 className="bg-transparent border-none focus:outline-none text-[10px] text-blue-300 w-24 font-bold cursor-pointer"
                               >
                                 {["Emerald Green", "Sapphire Blue", "Amber", "Deep Brown", "Steel Grey", "Violet", "Glowing Gold", "Blood Red", "Cloudy White", "Icy Blue"].map(c => (
                                   <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                                 ))}
                               </select>
                            </span>
                            <span className="flex items-center gap-2 group cursor-help">
                               <div className="w-2 h-2 rounded-full bg-yellow-400/40 border border-yellow-400/20" />
                               <span className="text-white/40">Hair:</span> 
                               <select 
                                 value={npcData.appearance?.hairColor || 'Raven Black'}
                                 onChange={(e) => setNpcData(prev => ({ 
                                   ...prev, 
                                   appearance: { ...prev.appearance!, hairColor: e.target.value } 
                                 }))}
                                 className="bg-transparent border-none focus:outline-none text-[10px] text-yellow-300 w-28 font-bold cursor-pointer"
                               >
                                 {["Raven Black", "Platinum Blonde", "Chestnut Brown", "Crimson Red", "Silver White", "Midnight Blue", "Forest Green", "Royal Purple", "Ash Grey", "Golden Blonde"].map(c => (
                                   <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                                 ))}
                               </select>
                            </span>

                            <span className="flex items-center gap-3 group">
                              <div className="w-2 h-2 rounded-full bg-orange-400/40" />
                              <span className="text-white/40 mr-1">Skin:</span> 
                              <div className="flex gap-1.5 p-1 bg-black/20 rounded-lg border border-white/5">
                                {[
                                  { name: 'Pale', hex: '#fdf5e6' },
                                  { name: 'Fair', hex: '#ffdbac' },
                                  { name: 'Olive', hex: '#e0ac69' },
                                  { name: 'Bronzed', hex: '#8d5524' },
                                  { name: 'Deep', hex: '#3b2219' },
                                  { name: 'Drow', hex: '#4b5267' },
                                  { name: 'Orc', hex: '#6b8e23' },
                                  { name: 'Tiefl Red', hex: '#8b0000' },
                                  { name: 'Tiefl Purp', hex: '#483d8b' }
                                ].map((tone) => (
                                  <button
                                    key={tone.hex}
                                    title={tone.name}
                                    onClick={() => setNpcData(prev => ({ 
                                      ...prev, 
                                      appearance: { ...prev.appearance!, skinColor: tone.hex } 
                                    }))}
                                    className={`w-4 h-4 rounded-sm border transition-all ${
                                      npcData.appearance?.skinColor === tone.hex 
                                        ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                                        : 'border-white/10 hover:border-white/30'
                                    }`}
                                    style={{ backgroundColor: tone.hex }}
                                  />
                                ))}
                              </div>
                              <input 
                                type="text"
                                value={npcData.appearance?.skinColor || ''}
                                onChange={(e) => setNpcData(prev => ({ 
                                  ...prev, 
                                  appearance: { ...prev.appearance!, skinColor: e.target.value } 
                                }))}
                                className="bg-transparent border-none focus:outline-none text-[9px] font-mono text-white/30 w-14"
                              />
                            </span>
                           <span className="flex items-center gap-2 group">
                              <GameIcon name="volume" size={12} color="currentColor" className="text-purple-400/60" />
                              <span className="text-white/40">Voice:</span>
                              <input 
                                type="text"
                                value={npcData.voiceProfile || ''}
                                onChange={(e) => setNpcData(prev => ({ ...prev, voiceProfile: e.target.value }))}
                                className="bg-transparent border-none focus:outline-none text-[10px] text-white/80 w-32 truncate placeholder:text-white/10"
                                placeholder="SYNTH_PROFILE_01"
                              />
                           </span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/10 shadow-inner">
                        <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Build_Profile:</span>
                        <div className="flex gap-4 text-[10px] text-white/70 font-bold uppercase tracking-tight">
                           <input 
                             type="text" 
                             value={npcData.appearance?.bodyType || 'Medium'}
                             onChange={(e) => setNpcData(prev => ({ 
                               ...prev, 
                               appearance: { ...prev.appearance!, bodyType: e.target.value } 
                             }))}
                             placeholder="Build"
                             className="bg-transparent border-none focus:outline-none text-[10px] text-white/60 w-20 font-bold"
                           />
                           <select 
                             value={npcData.appearance?.hairStyle || 'Short'}
                             onChange={(e) => setNpcData(prev => ({ 
                               ...prev, 
                               appearance: { ...prev.appearance!, hairStyle: e.target.value } 
                             }))}
                             className="bg-transparent border-none focus:outline-none text-[10px] text-purple-400 w-24 font-bold appearance-none cursor-pointer"
                           >
                             {["Cropped", "Medium", "Long", "Braided", "Buzzcut", "Elegant Updo", "Messy", "Ponytail", "Shaved", "Flowing", "Top Knot"].map(s => (
                               <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
                             ))}
                           </select>
                           <input 
                             type="text" 
                             value={npcData.appearance?.height || '5\'10"'}
                             onChange={(e) => setNpcData(prev => ({ 
                               ...prev, 
                               appearance: { ...prev.appearance!, height: e.target.value } 
                             }))}
                             placeholder="Height"
                             className="bg-transparent border-none focus:outline-none text-[10px] text-white/60 w-16"
                           />
                           <input 
                             type="text" 
                             value={npcData.appearance?.weight || '160 lbs'}
                             onChange={(e) => setNpcData(prev => ({ 
                               ...prev, 
                               appearance: { ...prev.appearance!, weight: e.target.value } 
                             }))}
                             placeholder="Weight"
                             className="bg-transparent border-none focus:outline-none text-[10px] text-white/60 w-16"
                           />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Left Panel: Stats */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Core_Parameters</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[8px] text-white/30 uppercase block font-bold">Class</span>
                      <div className="relative group">
                        <select 
                          value={npcData.class}
                          onChange={(e) => setNpcData({ ...npcData, class: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white rounded appearance-none font-bold"
                        >
                          {DND_CLASSES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                        </select>
                        <GameIcon name="dice_roll" size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-purple-400 cursor-pointer" onClick={() => randomizeField('class', DND_CLASSES)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-white/30 uppercase block font-bold">Race</span>
                      <div className="relative group">
                        <select 
                          value={npcData.race}
                          onChange={(e) => setNpcData({ ...npcData, race: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white rounded appearance-none font-bold"
                        >
                          {DND_RACES.map(r => <option key={r} value={r} className="bg-[#1a1a1a]">{r}</option>)}
                        </select>
                        <GameIcon name="dice_roll" size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-purple-400 cursor-pointer" onClick={() => randomizeField('race', DND_RACES)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-white/30 uppercase block font-bold">Background</span>
                      <div className="relative group">
                        <select 
                          value={npcData.background}
                          onChange={(e) => setNpcData({ ...npcData, background: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white rounded appearance-none font-bold"
                        >
                          {DND_BACKGROUNDS.map(b => <option key={b} value={b} className="bg-[#1a1a1a]">{b}</option>)}
                        </select>
                        <GameIcon name="dice_roll" size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-purple-400 cursor-pointer" onClick={() => randomizeField('background', DND_BACKGROUNDS)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-white/30 uppercase block font-bold">Alignment</span>
                      <div className="relative group">
                        <select 
                          value={npcData.alignment}
                          onChange={(e) => setNpcData({ ...npcData, alignment: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white rounded appearance-none font-bold"
                        >
                          {DND_ALIGNMENTS.map(a => <option key={a} value={a} className="bg-[#1a1a1a]">{a}</option>)}
                        </select>
                        <GameIcon name="dice_roll" size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-purple-400 cursor-pointer" onClick={() => randomizeField('alignment', DND_ALIGNMENTS)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Ability_Scores</label>
                    <div className="flex items-center gap-3">
                        <select 
                          value={statGenMethod}
                          onChange={(e) => setStatGenMethod(e.target.value as any)}
                          className="bg-transparent border-none text-[9px] text-purple-400 font-bold uppercase focus:outline-none cursor-pointer"
                        >
                           <option value="Rolling" className="bg-[#1a1a1a]">Rolling (4d6 drop low)</option>
                           <option value="Standard Array" className="bg-[#1a1a1a]">Standard Array</option>
                           <option value="Point Buy" className="bg-[#1a1a1a]">Point Buy</option>
                        </select>
                        <GameIcon name="dice_roll" size={12} className="text-white/20 hover:text-purple-400 cursor-pointer transition-colors" onClick={randomizeStats} />
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(npcData.stats || {}).map(([stat, val]) => (
                      <div key={stat} className="space-y-1">
                        <span className="text-[8px] text-white/30 uppercase block">{stat}</span>
                        <input 
                          type="number"
                          value={val}
                          onChange={(e) => setNpcData({ ...npcData, stats: { ...npcData.stats!, [stat]: parseInt(e.target.value) } })}
                          className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white text-center rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Vitals</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-[8px] text-white/30 uppercase font-black">
                        <GameIcon name="heart" size={10} className="text-red-400/50" /> Health
                      </div>
                      <div className="text-lg font-mono font-bold text-white">{npcData.hp} / {npcData.maxHp}</div>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-[8px] text-white/30 uppercase font-black">
                        <GameIcon name="shield" size={10} className="text-blue-400/50" /> Armor
                      </div>
                      <div className="text-lg font-mono font-bold text-white">{computedAC}</div>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-[8px] text-white/30 uppercase font-black">
                        <GameIcon name="energy" size={10} className="text-yellow-400/50" /> Initiative
                      </div>
                      <div className="text-lg font-mono font-bold text-white">{computedInitiative >= 0 ? '+' : ''}{computedInitiative}</div>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-[8px] text-white/30 uppercase font-black">
                        <GameIcon name="vitality" size={10} className="text-green-400/50" /> Speed
                      </div>
                      <div className="text-lg font-mono font-bold text-white">{computedSpeed}FT</div>
                    </div>
                  </div>
                </div>

                {/* Background Intel Section */}
                <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <GameIcon name="book" size={48} />
                  </div>
                  <label className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] flex items-center gap-2">
                    <GameIcon name="book" size={12} />
                    Background_Intel
                  </label>
                  
                  <div className="space-y-4 relative z-10">
                    {atlasBackground ? (
                      <>
                        <div className="text-[10px] text-white/60 leading-relaxed italic border-l-2 border-purple-500/30 pl-3">
                          {atlasBackground.description || "Synthesizing history..."}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Suggested_Traits</span>
                            <button 
                              onClick={() => {
                                if (atlasBackground?.suggested_characteristics?.traits) {
                                  const trait = randomFromList(atlasBackground.suggested_characteristics.traits);
                                  setNpcData(prev => ({ ...prev, traits: [trait] }));
                                }
                              }}
                              className="text-[8px] text-purple-400/50 hover:text-purple-400 transition-colors"
                            >
                              <GameIcon name="refresh" size={10} />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {npcData.traits?.map((t, i) => (
                              <div key={i} className="text-[10px] text-white/80 bg-white/5 p-2 rounded border border-white/5 relative group">
                                {t}
                                <button 
                                  onClick={() => setNpcData(prev => ({ ...prev, traits: prev.traits?.filter((_, idx) => idx !== i) }))}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"
                                >
                                  <GameIcon name="close" size={10} />
                                </button>
                              </div>
                            ))}
                            {(!npcData.traits || npcData.traits.length === 0) && (
                              <button 
                                onClick={() => {
                                  if (atlasBackground?.suggested_characteristics?.traits) {
                                    setNpcData(prev => ({ ...prev, traits: [randomFromList(atlasBackground.suggested_characteristics!.traits!)] }));
                                  }
                                }}
                                className="w-full py-2 border border-dashed border-white/10 rounded text-[9px] text-white/20 hover:text-white/40 hover:border-white/20 transition-all uppercase font-bold"
                              >
                                + Generate_Trait
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Ideals, Bonds, Flaws similarly */}
                        <div className="grid grid-cols-1 gap-4">
                           {['ideals', 'bonds', 'flaws'].map((category) => (
                              <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{category}</span>
                                  <button 
                                    onClick={() => {
                                      const pool = (atlasBackground as any)?.suggested_characteristics?.[category];
                                      if (pool) {
                                        setNpcData(prev => ({ ...prev, [category]: [randomFromList(pool)] }));
                                      }
                                    }}
                                    className="text-[8px] text-purple-400/50 hover:text-purple-400 transition-colors"
                                  >
                                    <GameIcon name="refresh" size={10} />
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  {(npcData as any)[category]?.map((val: string, i: number) => (
                                    <div key={i} className="text-[9px] text-white/60 bg-white/5 p-2 rounded relative group">
                                      {val}
                                      <button 
                                        onClick={() => setNpcData(prev => ({ ...prev, [category]: (prev as any)[category]?.filter((_: any, idx: number) => idx !== i) }))}
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"
                                      >
                                        <GameIcon name="close" size={10} />
                                      </button>
                                    </div>
                                  ))}
                                  {(!(npcData as any)[category] || (npcData as any)[category].length === 0) && (
                                     <button 
                                       onClick={() => {
                                         const pool = (atlasBackground as any)?.suggested_characteristics?.[category];
                                         if (pool) {
                                           setNpcData(prev => ({ ...prev, [category]: [randomFromList(pool)] }));
                                         }
                                       }}
                                       className="w-full py-1.5 border border-dashed border-white/5 rounded text-[8px] text-white/20 hover:text-white/40 transition-all uppercase font-bold"
                                     >
                                       + Gen_{category.slice(0, -1)}
                                     </button>
                                  )}
                                </div>
                              </div>
                           ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center gap-3 opacity-20 italic">
                        <GameIcon name="package" size={24} />
                        <span className="text-[10px] uppercase font-bold">Awaiting_Origin_Data...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel: Equipment & Choices */}
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Equipment_Engine</label>
                  </div>

                  <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Doll */}
                    <div className="col-span-12 md:col-span-5 flex flex-col items-center gap-6">
                       <div className="p-4 bg-black/40 rounded-2xl border border-white/10 w-full">
                          <EquipmentDoll 
                            equippedItems={npcData.inventory || {}}
                            onSlotClick={unequipItemFromNpc}
                            alignment={npcData.alignment || 'True Neutral'}
                            characterImageUrl={npcData.imageUrl}
                          />
                       </div>
                    </div>

                    {/* Choices UI */}
                    <div className="col-span-12 md:col-span-7 space-y-6">
                       <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-4">
                          <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <GameIcon name="magic_effect" size={12} /> Resource_Resolution
                             </div>
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={handleAutoResolvedEquipment}
                                  disabled={isApplyingGear}
                                  className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 rounded text-[9px] font-black uppercase hover:bg-white/10 transition-all disabled:opacity-50"
                                >
                                  Auto_Resolve
                                </button>
                                <button 
                                  onClick={applyChoices}
                                  disabled={isApplyingGear}
                                  className="px-3 py-1 bg-purple-500 text-white rounded text-[9px] font-black uppercase hover:bg-purple-400 transition-all shadow-lg disabled:opacity-50"
                                >
                                  {isApplyingGear ? "PROVISIONING..." : "Apply_Gear"}
                                </button>
                             </div>
                          </div>
                          
                          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                             {/* Fixed Class Gear */}
                             {atlasClass?.starting_equipment && (
                               <div className="space-y-2">
                                  <span className="text-[8px] text-white/30 uppercase block font-bold">Class_Guaranteed</span>
                                  <div className="flex flex-wrap gap-2">
                                     {atlasClass.starting_equipment.map((e, i) => (
                                       <div key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-white/50">
                                         {e.quantity > 1 ? `${e.quantity}x ` : ''}{e.equipment.name}
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}

                             {/* Dynamic Choices (Class) */}
                             {atlasClass?.starting_equipment_options?.map((opt, i) => renderEquipmentChoice(opt, i))}

                             {/* Dynamic Choices (Background) */}
                             {atlasBackground?.starting_equipment_options?.map((opt, i) => renderEquipmentChoice(opt, i + 100))}

                             {/* Background Gear */}
                             {atlasBackground?.starting_equipment && (
                               <div className="space-y-2 pt-4 border-t border-white/5">
                                  <span className="text-[8px] text-white/30 uppercase block font-bold">Background_Base</span>
                                  <div className="flex flex-wrap gap-2">
                                     {atlasBackground.starting_equipment.map((e, i) => (
                                       <div key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-white/50">
                                         {e.quantity > 1 ? `${e.quantity}x ` : ''}{e.equipment.name}
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}
                          </div>
                       </div>                       {/* Skills & Proficiencies */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/10">
                         {/* Skills Column */}
                         <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                           <div className="flex items-center justify-between border-b border-white/5 pb-2">
                             <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                               <GameIcon name="vitality" size={14} className="text-blue-500" />
                               Active_Skills
                             </label>
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Bonus: +{proficiencyBonus}</span>
                               <div className="h-3 w-px bg-white/10 mx-1" />
                               <span className="text-[8px] text-white/20 font-bold uppercase">[{SKILL_LIST.length} Total]</span>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                             {SKILL_LIST.map((skill) => {
                               const bonus = calculateSkillBonus(skill.name);
                               const isProf = npcData.proficiencies?.some(p => p.toLowerCase().includes(skill.name.toLowerCase()));
                               
                               return (
                                 <div 
                                   key={skill.name} 
                                   className={`flex items-center justify-between p-2 rounded-lg transition-all border ${
                                     isProf 
                                       ? 'bg-blue-500/10 border-blue-500/30' 
                                       : 'bg-white/2 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/5'
                                   }`}
                                 >
                                   <div className="flex items-center gap-3">
                                     <div className={`w-1.5 h-1.5 rounded-full ${isProf ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-white/10'}`} />
                                     <div className="flex flex-col">
                                       <span className={`text-[10px] font-bold uppercase tracking-tight ${isProf ? 'text-blue-200' : 'text-white/40'}`}>
                                         {skill.name}
                                       </span>
                                       <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">{skill.ability}</span>
                                     </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-2">
                                     <div className={`text-xs font-mono font-bold ${isProf ? 'text-blue-400' : 'text-white/40'}`}>
                                       {bonus >= 0 ? '+' : ''}{bonus}
                                     </div>
                                     {isProf && <GameIcon name="award" size={10} className="text-blue-400/40" />}
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>

                         {/* Proficiencies Column */}
                         <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                           <div className="flex items-center justify-between border-b border-white/5 pb-2">
                             <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                               <GameIcon name="award" size={14} className="text-purple-500" />
                               Proficiencies
                             </label>
                             <span className="text-[8px] text-white/20 font-bold uppercase">[{npcData.proficiencies?.length || 0}]</span>
                           </div>
                           
                           <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                             {/* Group by type */}
                             {[
                               { label: 'Saves', items: npcData.proficiencies?.filter(p => p.startsWith('Saving Throw:')) },
                               { label: 'Tools', items: npcData.proficiencies?.filter(p => !p.startsWith('skill-') && !p.startsWith('Saving Throw:') && (p.includes('tool') || p.includes('supplies') || p.includes('kit') || p.includes('set'))) },
                               { label: 'Equipment', items: npcData.proficiencies?.filter(p => !p.startsWith('skill-') && !p.startsWith('Saving Throw:') && !(p.includes('tool') || p.includes('supplies') || p.includes('kit') || p.includes('set'))) }
                             ].map((group, i) => group.items && group.items.length > 0 && (
                               <div key={i} className="space-y-2">
                                 <span className="text-[8px] text-purple-400/40 font-black uppercase tracking-widest block">{group.label}</span>
                                 <div className="flex flex-wrap gap-2">
                                   {group.items.map((prof, i) => (
                                     <div key={i} className="px-3 py-1.5 bg-purple-500/5 border border-purple-500/20 rounded-lg text-[9px] text-purple-200/70 font-bold uppercase hover:bg-purple-500/10 hover:border-purple-500/40 transition-all cursor-default flex items-center gap-2">
                                       <div className="w-1 h-1 rounded-full bg-purple-500/40" />
                                       {prof.replace(/skill:|Saving Throw:|_/gi, '').replace(/-/g, ' ')}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             ))}
                             
                             {(!npcData.proficiencies || npcData.proficiencies.length === 0) && (
                               <div className="w-full py-10 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 opacity-20 italic">
                                 <GameIcon name="identity" size={24} />
                                 <span className="text-[9px] uppercase font-bold tracking-widest">No_Hardware_Optimization</span>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>

                      {/* Inventory Search & Results */}
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                           <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Equipment_Library_Access</label>
                           <div className="flex items-center gap-2">
                              <GameIcon name="search" size={10} className="text-white/20" />
                              <input 
                                type="text"
                                value={equipmentSearch}
                                onChange={(e) => setEquipmentSearch(e.target.value)}
                                placeholder="SEARCH_DATABASE..."
                                className="bg-transparent border-none focus:outline-none text-[10px] text-white/60 w-32 placeholder:text-white/10 italic"
                              />
                           </div>
                        </div>
                        
                        {filteredEquipment.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                             {filteredEquipment.map(item => (
                               <button 
                                 key={item.index}
                                 onClick={() => {
                                   addItemToNpc(item);
                                   setEquipmentSearch('');
                                 }}
                                 className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-xl transition-all group/item text-left"
                               >
                                 <div className="w-8 h-8 rounded bg-black/40 border border-white/5 shrink-0 overflow-hidden group-hover/item:border-purple-500/20 transition-all flex items-center justify-center">
                                    <img src={item.imageUrl || `/assets/atlas/equipment/images/${item.index.toLowerCase().replace(/[\s-]/g, '_')}.webp`} className="h-[90%] w-auto object-contain mx-auto" />
                                 </div>
                                 <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] font-black text-white/60 uppercase truncate group-hover/item:text-purple-300 transition-colors">{item.name}</span>
                                    <span className="text-[7px] text-white/20 uppercase font-bold truncate">{item.category || 'GEAR'}</span>
                                 </div>
                               </button>
                             ))}
                          </div>
                        )}
                      </div>

                      {/* Inventory List */}
                      <div className="space-y-4">
                          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Storage_Matrix</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                             {npcData.backpack?.map((it, i) => (
                               <div key={it?.id || i} className="group relative flex flex-col p-2 bg-white/5 border border-white/5 rounded-xl hover:border-purple-500/30 hover:bg-white/10 transition-all">
                                 <div className="flex items-start justify-between gap-1">
                                   <div className="text-[8px] text-white/70 font-black uppercase leading-tight truncate pr-4">{it?.name || 'Unknown Item'}</div>
                                   <button 
                                     onClick={() => {
                                       const next = (npcData.backpack || []).filter(b => b.id !== it?.id);
                                       setNpcData({ ...npcData, backpack: next });
                                     }}
                                     className="absolute top-1 right-1 text-white/10 hover:text-dragon-red transition-all opacity-0 group-hover:opacity-100"
                                   >
                                     <GameIcon name="close" size={10} />
                                   </button>
                                 </div>
                                 <div className="flex items-center justify-between mt-auto pt-1 relative z-10">
                                   <div className="flex flex-col">
                                     <div className="flex items-center gap-1.5 pt-0.5">
                                       <span className="text-[7px] text-white/30 font-bold uppercase transition-colors">QTY: {it?.quantity || 1}</span>
                                       {it?.weight && <span className="text-[7px] text-white/30 font-bold uppercase transition-colors">{it.weight}LB</span>}
                                     </div>
                                   </div>
                                   {it?.slot && (
                                     <button 
                                       onClick={() => equipItemToNpc(it)}
                                       className="h-5 px-2 bg-dragon-red/10 border border-dragon-red/40 rounded text-[7px] font-black italic text-dragon-red hover:bg-dragon-red/20 transition-all uppercase tracking-tighter"
                                     >
                                       EQUIP
                                     </button>
                                   )}
                                 </div>
                               </div>
                             ))}
                             {(!npcData.backpack || npcData.backpack.length === 0) && (
                               <div className="col-span-full border border-dashed border-white/5 rounded-xl py-8 flex flex-col items-center justify-center gap-2 opacity-20">
                                 <GameIcon name="package" size={14} />
                                 <div className="text-[9px] uppercase font-bold tracking-[0.2em]">Empty_Storage</div>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
