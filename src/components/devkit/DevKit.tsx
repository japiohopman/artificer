import React, { useState, useEffect } from 'react';
import { Monster, scrapeMonsterWiki, getPredictedWikiUrl } from '../../services/ai/monsterService';
import { parseRawMonsterText, generateLore } from '../../services/ai/monsterService';
import { generateItemDescription } from '../../services/ai/itemService';
import { generateCodexImage, generateBackgroundImage, generateVisualPrompt } from '../../services/ai/imageService';
import { EnemyImageGenerator } from './enemy-image_generator';
import { EquipmentImageGenerator } from './equipment-image_generator';
import { MaterialImageGenerator } from './material-image_generator';
import { 
  commitFile, fetchMonsterData, playSuccessSound, playFailSound, 
  fetchMaterialData, fetchEquipmentData, fetchMagicItemData, playModalOpenSound, playModalCloseSound, playClickSound,
  normalizeImageUrl, updateMonsterCategory
} from '../../services/storageService';
import { generateNPCData, generateNPCImages, NPCProfile } from '../../services/ai/npcService';
import { 
  getLevelFromXP, getXPForLevel, rollAbilityScore, generateStandardStats, 
  calculateHP, randomFromList, DND_CLASSES, DND_RACES, DND_ALIGNMENTS, DND_BACKGROUNDS,
  resolveStartingEquipment, getModifier, calculateAC, calculateInitiative,
  generateNPC
} from '../../lib/npcGeneratorUtils';
import { atlasService, AtlasClass, AtlasSpecies, AtlasBackground } from '../../services/atlasService';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, SKILL_LIST } from '../../store/useStore';
import { EquipmentDoll } from '../character/EquipmentDoll';
import { GameIcon } from '../../game_icons';

import { NPCGenerator } from './npc_generator';
import { NPCTester } from './npc_tester';
import { Simulator } from './Simulator';
import { Jane } from './Jane';

import { Mixer } from '../audio/Mixer';

interface DevKitProps {
  isOpen: boolean;
  onClose: () => void;
  onMonsterUpdated: (monster: any) => void;
  initialMonster?: any | null;
  currentExplorerTab?: string;
}

export const DevKit: React.FC<DevKitProps> = ({ isOpen, onClose, onMonsterUpdated, initialMonster, currentExplorerTab }) => {
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const { 
    monstersList,
    materialsList,
    equipmentList,
    characters,
    equipmentCategories: storeEquipmentCategories,
    materialCategories: storeMaterialCategories,
    loadAllLists,
    updateCharacter,
    deleteCharacter,
    addCharacter
  } = useStore();

  const [activeTab, setActiveTab] = useState<'monsters' | 'materials' | 'equipment' | 'backgrounds' | 'npcs' | 'test' | 'simulator' | 'jane'>('monsters');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(initialMonster || null);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [itemDataMap, setItemDataMap] = useState<Record<string, any>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [checklist, setChecklist] = useState({
    jsonExists: false,
    wikiExists: false,
    promptReady: false,
    imageGenerated: false,
    bgReady: false,
    xpReady: false
  });
  const [tierStatuses, setTierStatuses] = useState<any[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedBgType, setSelectedBgType] = useState<string>('land_forest');
  const [generatedBackground, setGeneratedBackground] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [customWikiUrl, setCustomWikiUrl] = useState('');
  const [wikiTab, setWikiTab] = useState<'editor' | 'raw'>('editor');
  
  const [ripperText, setRipperText] = useState('');
  const [isParsingRipper, setIsParsingRipper] = useState(false);
  const [selectedMonsterCategory, setSelectedMonsterCategory] = useState<string>('beast');

  useEffect(() => {
    if (editingItem && activeTab === 'monsters' && editingItem.name) {
      setCustomWikiUrl(getPredictedWikiUrl(editingItem.name));
    } else {
      setCustomWikiUrl('');
    }
  }, [editingItem?.name, activeTab]);

  const safeString = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.name || val.value || val.index || "";
    }
    return String(val);
  };

  const equipmentCategories = [
    "Adventuring Gear", "Ammunition", "Arcane Foci", "Armor", "Artisan's Tools",
    "Druidic Foci", "Equipment Packs", "Gaming Sets", "Heavy Armor", "Holy Symbols",
    "Kits", "Land Vehicles", "Light Armor", "Martial Melee Weapons", "Martial Ranged Weapons",
    "Martial Weapons", "Medium Armor", "Melee Weapons", "Mounts and Other Animals",
    "Mounts and Vehicles", "Musical Instruments", "Other Tools", "Potion", "Ranged Weapons",
    "Ring", "Rod", "Scroll", "Shields", "Simple Melee Weapons", "Simple Ranged Weapons",
    "Simple Weapons", "Staff", "Standard Gear", "Tack Harness and Drawn Vehicles",
    "Tools", "Wand", "Waterborne Vehicles", "Weapon", "Wondrous Items"
  ];

  const materialCategories = [
    "Consumables", "Herbs", "Oils", "Monster Parts", "Common Materials",
    "Raw Materials", "Refined Materials", "Bundled Materials"
  ];

  const backgroundTypes = [
    { id: 'air', label: 'Air' },
    { id: 'water', label: 'Water' },
    { id: 'land_forest', label: 'Forest' },
    { id: 'land_urban', label: 'Urban' },
    { id: 'land_plains', label: 'Plains' },
    { id: 'land_mountains', label: 'Mountains' },
    { id: 'jungle', label: 'Jungle' },
    { id: 'desert', label: 'Desert' },
    { id: 'underdark', label: 'Underdark' },
    { id: 'beach', label: 'Beach' },
    { id: 'church', label: 'Church' },
    { id: 'castle', label: 'Castle' },
    { id: 'fort', label: 'Fort' },
    { id: 'ruins', label: 'Ruins' },
    { id: 'cave', label: 'Cave' },
    { id: 'snowy', label: 'Snowy' },
    { id: 'swamp', label: 'Swamp' },
    { id: 'dragon_cave', label: 'Dragon Cave' },
    { id: 'fey', label: 'Fey' },
    { id: 'volcano', label: 'Volcano' },
    { id: 'ethereal', label: 'Ethereal' },
    { id: 'void', label: 'Void' }
  ];

  const npcSpecies = [
    "Dragonborn", "Dwarf", "Elf", "Gnome", "Half-Elf", "Half-Orc", "Halfling", "Human", "Tiefling",
    "High Elf", "Hill Dwarf", "Lightfoot Halfling", "Rock Gnome"
  ];

  const npcClasses = [
    "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard", "Artificer"
  ];

  const npcBackgrounds = [
    "Acolyte", "Artisan", "Charlatan", "Criminal", "Entertainer", "Farmer", "Guard", "Guide", "Hermit", "Merchant", "Noble", "Sage", "Sailor", "Scribe", "Soldier", "Wayfarer"
  ];

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
      hairColor: '',
      hairStyle: '',
      bodyType: '',
      eyeColor: '',
      skinColor: '',
      height: '',
      weight: ''
    },
    money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    inventory: {},
    backpack: [],
    spells: []
  });

  const [npcImages, setNpcImages] = useState<{ profileUrl: string; avatarUrl: string } | null>(null);
  const [isGeneratingNpc, setIsGeneratingNpc] = useState(false);
  const [isGeneratingNpcImages, setIsGeneratingNpcImages] = useState(false);
  const [atlasClass, setAtlasClass] = useState<AtlasClass | null>(null);
  const [atlasSpecies, setAtlasSpecies] = useState<AtlasSpecies | null>(null);
  const [atlasBackground, setAtlasBackground] = useState<AtlasBackground | null>(null);

  // Computed derived stats for NPC
  const equippedArmor = npcData.inventory?.armor || npcData.inventory?.chest || null;
  const equippedShield = npcData.inventory?.shield || npcData.inventory?.['off-hand'] || null;
  const computedAC = calculateAC(npcData.stats?.dex || 10, equippedArmor, equippedShield);
  const computedInitiative = calculateInitiative(npcData.stats?.dex || 10);
  const computedSpeed = atlasSpecies?.speed || 30;
  
  const [selectedPack, setSelectedPack] = useState<string>('explorers_pack');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState<any[]>([]);

  const equipmentPacksList = [
    { index: "burglars_pack", name: "Burglar's Pack" },
    { index: "diplomats_pack", name: "Diplomat's Pack" },
    { index: "dungeoneers_pack", name: "Dungeoneer's Pack" },
    { index: "entertainers_pack", name: "Entertainer's Pack" },
    { index: "explorers_pack", name: "Explorer's Pack" },
    { index: "priests_pack", name: "Priest's Pack" },
    { index: "scholars_pack", name: "Scholar's Pack" }
  ];

  const [selectedBgVariation, setSelectedBgVariation] = useState(0);
  const [bgInstruction, setBgInstruction] = useState('');

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

  // Auto-load Atlas data when selections change
  useEffect(() => {
    const loadAtlasData = async () => {
      if (npcData.class) {
        const cls = await atlasService.loadClass(npcData.class);
        setAtlasClass(cls);
        if (cls && cls.hit_die) {
          // You could potentially update HP here if you have a field for it
        }
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

  // Fetch all lists when DevKit opens
  useEffect(() => {
    if (isOpen) {
      loadAllLists();
      setSelectedCategory(null);
      
      // Context-aware tab selection
      if (initialMonster) {
        // Check if it's monster or item
        if (initialMonster.challenge_rating !== undefined || initialMonster.type) {
          setActiveTab('monsters');
        } else if (initialMonster.material_category) {
          setActiveTab('materials');
        } else {
          setActiveTab('equipment');
        }
      } else if (currentExplorerTab) {
        if (currentExplorerTab === 'enemies') setActiveTab('monsters');
        else if (currentExplorerTab === 'materials') setActiveTab('materials');
        else setActiveTab('equipment');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [activeTab]);

  // Update editing item when initialMonster changes
  useEffect(() => {
    if (initialMonster) {
      const itemWithDefaults = {
        ...initialMonster,
        background_type: initialMonster.background_type || 'land_forest'
      };
      setEditingItem(itemWithDefaults);
      runChecks(itemWithDefaults);
    }
  }, [initialMonster]);

  const runChecks = async (item: any) => {
    if (!item.index) return;
    setIsChecking(true);
    
    // 1. Check current item
    const { fetchMonsterList, fetchMaterialsList, fetchEquipmentList } = await import('../../services/storageService');
    let currentList: any[] = [];
    if (activeTab === 'monsters') currentList = monstersList;
    else if (activeTab === 'materials') currentList = materialsList;
    else if (activeTab === 'equipment') {
      // Use original equipment list to check for physical file presence
      currentList = useStore.getState().equipmentList;
    }

    const jsonExists = currentList.some(m => m.index === item.index);
    const wikiExists = !!item.lore || !!item.wikiData || !!item.desc;
    const bgExists = activeTab === 'monsters' ? !!item.background_type : true;
    const xpExists = activeTab === 'monsters' ? (item.xp !== undefined && item.xp > 0) : true;

    setChecklist(prev => ({
      ...prev,
      jsonExists,
      wikiExists,
      promptReady: !!prompt,
      imageGenerated: !!item.imageUrl,
      bgReady: bgExists,
      xpReady: xpExists
    }));

    // 2. Check all tiers if applicable
    if (item.versions) {
      const statuses = Object.keys(item.versions).map(t => {
        const v = item.versions[t];
        return {
          tier: parseInt(t),
          index: v.index,
          name: v.name,
          jsonExists: !!v.imageUrl || true, // Placeholder check
          imageGenerated: !!v.imageUrl
        };
      });
      setTierStatuses(statuses);
    } else {
      setTierStatuses([]);
    }

    setIsChecking(false);
  };

  const generateDescription = async () => {
    if (!editingItem) return;
    setIsChecking(true);
    try {
      const category = activeTab === 'materials' ? 'Materials' : (editingItem.category || 'Equipment');
      const subCategory = activeTab === 'materials' ? editingItem.material_sub_category : undefined;
      const desc = await generateItemDescription(editingItem.name || '', category, subCategory);
      if (desc) {
        updateField('desc', [desc]);
        setChecklist(prev => ({ ...prev, wikiExists: true }));
      }
    } finally {
      setIsChecking(false);
    }
  };

  const formatCost = (cost: any) => {
    if (!cost) return '';
    if (typeof cost === 'string') return cost;
    if (typeof cost === 'object') {
      return `${cost.quantity || 0} ${cost.unit || 'gp'}`;
    }
    return String(cost);
  };

  const parseCost = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length >= 2) {
      const quantity = parseInt(parts[0]);
      const unit = parts[1];
      if (!isNaN(quantity)) {
        return { quantity, unit };
      }
    }
    return value;
  };

  const scrapeWiki = async () => {
    if (!editingItem) return;
    setIsChecking(true);
    try {
      const wikiUrl = customWikiUrl || `https://forgottenrealms.fandom.com/wiki/${editingItem.name?.replace(/\s+/g, '_')}`;
      setCustomWikiUrl(wikiUrl);
      
      if (activeTab === 'monsters') {
        const result = await scrapeMonsterWiki(editingItem.name || '', wikiUrl);
        if (result) {
          updateField('lore', result.lore);
          updateField('wikiData', result.wikiData);
          setChecklist(prev => ({ ...prev, wikiExists: true }));
        }
      } else {
        const lore = await generateLore(
          editingItem.name || '',
          editingItem.type || editingItem.category || 'Material',
          editingItem.size,
          editingItem.alignment,
          editingItem.subtype,
          wikiUrl
        );
        if (lore) {
          updateField('desc', [lore]);
          setChecklist(prev => ({ ...prev, wikiExists: true }));
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const generatePrompt = async () => {
    if (!editingItem) return;
    setIsChecking(true);
    try {
      const category = activeTab === 'monsters' ? 'monsters' : 
                      activeTab === 'materials' ? 'materials' : 'equipment';
      const newPrompt = await generateVisualPrompt(editingItem, category);
      if (newPrompt) {
        setPrompt(newPrompt);
        setChecklist(prev => ({ ...prev, promptReady: true }));
      }
    } finally {
      setIsChecking(false);
    }
  };

  const generateBackground = async () => {
    setIsGeneratingBg(true);
    try {
      const { generateBackgroundImage } = await import('../../services/ai/imageService');
      const isSmall = editingItem && 
                     ((editingItem.size || "").toLowerCase().includes('tiny') || 
                      (editingItem.size || "").toLowerCase().includes('small')) &&
                     (editingItem.type || "").toLowerCase().includes('beast');
      
      const base64 = await generateBackgroundImage(selectedBgType, selectedBgVariation, bgInstruction, !!isSmall);
      if (base64) {
        setGeneratedBackground(`data:image/png;base64,${base64}`);
      }
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const saveBackground = async () => {
    if (!generatedBackground) return;
    setIsChecking(true);
    try {
      const base64Data = generatedBackground.split(',')[1];
      const suffix = selectedBgVariation === 0 ? '' : selectedBgVariation;
      const path = `public/assets/images/enemy_backgrounds/${selectedBgType}${suffix}.webp`;
      const success = await commitFile(path, base64Data, true);
      if (success) {
        playSuccessSound();
        alert(`Global background for ${selectedBgType} (Variation ${selectedBgVariation}) updated!`);
        setGeneratedBackground(null);
      }
    } catch (err) {
      console.error(err);
      playFailSound();
      alert("Failed to save background.");
    } finally {
      setIsChecking(false);
    }
  };

  const randomizeStats = () => {
    setNpcData(prev => ({ ...prev, stats: generateStandardStats() }));
    playClickSound();
  };

  const randomizeField = (field: keyof NPCProfile, options: string[]) => {
    setNpcData(prev => ({ ...prev, [field]: randomFromList(options) }));
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

  const autoAssignEquipment = async () => {
    if (!atlasClass) return;
    
    // 1. Resolve starting options
    let newItems = resolveStartingEquipment(atlasClass.starting_equipment_options || []);
    
    // 2. Add guaranteed starting equipment
    if ((atlasClass as any).starting_equipment) {
      const constants = (atlasClass as any).starting_equipment.map((e: any) => ({ ...e.equipment, quantity: e.quantity }));
      newItems = [...newItems, ...constants];
    }
    
    // 3. Add background equipment
    if (atlasBackground?.starting_equipment) {
      const bgGear = atlasBackground.starting_equipment.map((e: any) => ({ ...e.equipment, quantity: e.quantity }));
      newItems = [...newItems, ...bgGear];
    }

    // 4. Expand packs
    const expandedItems: any[] = [];
    for (const it of newItems) {
      if (it.index?.endsWith('_pack')) {
        const pack = await atlasService.loadEquipmentPack(it.index);
        if (pack && pack.contents) {
          pack.contents.forEach((c: any) => expandedItems.push({ ...c.item, quantity: c.quantity }));
        } else {
          expandedItems.push(it);
        }
      } else {
        expandedItems.push(it);
      }
    }

    setNpcData(prev => ({
      ...prev,
      backpack: [...(prev.backpack || []), ...expandedItems.map(it => ({ ...it, id: Math.random().toString(36).substr(2, 9) }))]
    }));
    
    playSuccessSound();
  };

  const handleGenerateNpc = async () => {
    setIsGeneratingNpc(true);
    try {
      const data = await generateNPCData(npcData, { 
        classList: DND_CLASSES as string[],
        speciesList: DND_RACES as string[],
        backgroundList: DND_BACKGROUNDS as string[],
        alignmentList: DND_ALIGNMENTS as string[]
      });
      setNpcData(data);
      playSuccessSound();
    } catch (error) {
      console.error(error);
      playFailSound();
      alert("NPC generation failed.");
    } finally {
      setIsGeneratingNpc(false);
    }
  };

  const handleQuickRandomize = () => {
    // Generate NPC using local rules from npcGeneratorUtils
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

  const handleGenerateNpcImages = async () => {
    if (!npcData.name) return;
    setIsGeneratingNpcImages(true);
    try {
      const images = await generateNPCImages(npcData as NPCProfile);
      setNpcImages(images);
      playSuccessSound();
    } catch (error) {
      console.error(error);
      playFailSound();
      alert("Image generation failed.");
    } finally {
      setIsGeneratingNpcImages(false);
    }
  };

  const addItemToNpc = (item: any) => {
    setNpcData(prev => ({
      ...prev,
      backpack: [...(prev.backpack || []), { ...item, id: Math.random().toString(36).substr(2, 9) }]
    }));
    playSuccessSound();
  };

  const equipItemOnNpc = (item: any, slot: string) => {
    setNpcData(prev => ({
      ...prev,
      inventory: {
        ...(prev.inventory || {}),
        [slot]: { ...item, id: Math.random().toString(36).substr(2, 9) }
      }
    }));
    playSuccessSound();
  };

  const unequipItemFromNpc = (slot: string) => {
    setNpcData(prev => {
      const newInventory = { ...(prev.inventory || {}) };
      delete newInventory[slot];
      return {
        ...prev,
        inventory: newInventory
      };
    });
    playClickSound();
  };

  const handleSaveNpc = async () => {
    if (!npcData.name) return;
    setIsChecking(true);
    try {
      const id = editingCharId || npcData.name.toLowerCase().replace(/\s+/g, '_');
      const npcToSave: any = { 
        ...npcData, 
        id,
        level: npcData.level || 0,
        atlas_data: {
          class: atlasClass,
          species: atlasSpecies,
          background: atlasBackground
        },
        metadata: {
          updated_at: new Date().toISOString(),
          version: "2.5"
        }
      };

      if (!editingCharId) {
        npcToSave.xp = 0;
        npcToSave.metadata.generated_at = new Date().toISOString();
      }
      
      // Save images if generated
      if (npcImages) {
        const portraitPath = `public/assets/atlas/character/npc_character_profiles/images/${id}_portrait.webp`;
        const avatarPath = `public/assets/atlas/character/npc_character_profiles/images/${id}_avatar.webp`;
        
        await commitFile(portraitPath, npcImages.profileUrl.split(',')[1], true);
        await commitFile(avatarPath, npcImages.avatarUrl.split(',')[1], true);
        
        npcToSave.imageUrl = `/assets/atlas/character/npc_character_profiles/images/${id}_portrait.webp`;
        npcToSave.avatarUrl = `/assets/atlas/character/npc_character_profiles/images/${id}_avatar.webp`;
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

  const handleSave = async () => {
    if (!editingItem || !editingItem.name) return;
    
    setIsChecking(true);
    try {
      const now = new Date();
      const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
      const index = editingItem.index;
      
      let category = activeTab === 'monsters' ? 'enemies' : 
                     activeTab === 'materials' ? 'crafting' : 
                     activeTab === 'equipment' ? 'equipment' : '';
      
      // Check if it's a magic item (Wondrous Items category or non-common rarity)
      if (activeTab === 'equipment' && 
          (String(editingItem.category).toLowerCase().includes('wondrous') || 
           (editingItem.rarity && editingItem.rarity !== 'Common'))) {
        category = 'magic_items';
      }
      
      const jsonPath = `public/assets/atlas/${category}/json/${index}.json`;
      
      // 2. Commit Image if it's a new manifestation (base64)
      let finalImageUrl = editingItem.imageUrl;
      if (editingItem.imageUrl?.startsWith('data:image/')) {
        const base64Data = editingItem.imageUrl.split(',')[1];
        
        const categoriesWithImagesFolder = ['magic_items', 'equipment', 'enemies', 'crafting', 'materials'];
        const imagePath = categoriesWithImagesFolder.includes(category)
          ? `public/assets/atlas/${category}/images/${index}.webp`
          : `public/assets/atlas/${category}/${index}.webp`;
          
        console.log(`Attempting to bake image to: ${imagePath}`);
        
        const imageSuccess = await commitFile(imagePath, base64Data, true);
        if (!imageSuccess) {
          throw new Error(`Failed to commit image file to ${imagePath}`);
        }
        
        // Update the URL to the relative path for the JSON
        finalImageUrl = categoriesWithImagesFolder.includes(category)
          ? `/assets/atlas/${category}/images/${index}.webp`
          : `/assets/atlas/${category}/${index}.webp`;
      }

      // Split Lore Logic for Monsters
      let lorePath: string | null = null;
      if (activeTab === 'monsters' && (editingItem.lore || editingItem.wikiData)) {
        lorePath = `/assets/atlas/enemies/enemies_wiki/${index}.json`;
        
        const wikiDataToSave = {
          name: editingItem.name,
          lore: editingItem.lore,
          wikiData: editingItem.wikiData,
          bakedAt: Date.now()
        };

        const wikiJsonPath = `public/assets/atlas/enemies/enemies_wiki/${index}.json`;
        await commitFile(wikiJsonPath, JSON.stringify(wikiDataToSave, null, 2));
      }
      
      const itemToSave = { 
        ...editingItem, 
        imageUrl: finalImageUrl,
        lore: lorePath || editingItem.lore, // Store path if split, otherwise keep original
        last_updated: dateStr,
        updated_at: now.toISOString()
      };

      // 1. Commit JSON
      const jsonSuccess = await commitFile(
        jsonPath,
        JSON.stringify(itemToSave, null, 2)
      );

      if (!jsonSuccess) {
        throw new Error("Failed to commit JSON file.");
      }

      // 3. Update Category if it's a monster
      if (activeTab === 'monsters' && selectedMonsterCategory) {
        await updateMonsterCategory(selectedMonsterCategory, index, editingItem.name);
      }
      
      setEditingItem(itemToSave);
      setItemDataMap(prev => ({ ...prev, [itemToSave.index!]: itemToSave }));
      onMonsterUpdated(itemToSave);
      playSuccessSound();
      alert(`${activeTab.slice(0, -1)} asset successfully baked to repository!`);
    } catch (err) {
      console.error(err);
      playFailSound();
      alert(`Bake failed: ${err instanceof Error ? err.message : "Unknown error"}. Check console for details.`);
    } finally {
      setIsChecking(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingItem(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1a1a1a] w-full max-w-6xl h-[90vh] rounded-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col font-mono selection:bg-dragon-red/30"
        >
          {/* Top Bar / Window Header */}
          <div className="bg-[#252525] px-4 py-2 flex items-center justify-between border-b border-white/5 select-none">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2">
                <GameIcon name="devkit" size={18} className="text-dragon-red" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2 text-white/50 text-[11px] uppercase tracking-widest font-bold">
                <GameIcon name="terminal" size={14} color="#8B0000" />
                <span>ARCANE_OS // DM_TOOLKIT.v2</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsMixerOpen(!isMixerOpen);
                  playClickSound();
                }}
                className={`p-2 rounded border transition-all ${
                  isMixerOpen 
                    ? 'bg-dragon-red border-dragon-red text-white' 
                    : 'bg-black/30 border-white/5 text-white/40 hover:text-white'
                }`}
                title="Audio Mixer"
              >
                <GameIcon name="sliders" size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-1 bg-black/30 rounded border border-white/5 text-[10px] text-dragon-red/80 font-bold">
                <div className="w-1.5 h-1.5 bg-dragon-red rounded-full animate-pulse" />
                LIVE_SESSION_ACTIVE
              </div>
              <button 
                onClick={() => {
                  onClose();
                  playModalCloseSound();
                }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <GameIcon name="close" size={18} />
              </button>
            </div>
          </div>

          {/* Secondary Header: Tab Manager */}
          <div className="bg-[#1e1e1e] flex items-center border-b border-white/5 overflow-x-auto scrollbar-none">
            {[
              { id: 'monsters', icon: (props: any) => <GameIcon name="bot" {...props} />, label: 'ENEMIES' },
              { id: 'materials', icon: (props: any) => <GameIcon name="sparkles" {...props} />, label: 'MATERIALS' },
              { id: 'equipment', icon: (props: any) => <GameIcon name="package" {...props} />, label: 'EQUIPMENT' },
              { id: 'npcs', icon: (props: any) => <GameIcon name="avatar" {...props} />, label: 'NPCS' },
              { id: 'test', icon: (props: any) => <GameIcon name="users" {...props} />, label: 'TESTER' },
              { id: 'simulator', icon: (props: any) => <GameIcon name="sparkles" {...props} />, label: 'SIMULATOR' },
              { id: 'jane', icon: (props: any) => <GameIcon name="map" {...props} />, label: 'JANE' },
              { id: 'backgrounds', icon: (props: any) => <GameIcon name="image" {...props} />, label: 'HABITATS' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playClickSound();
                }}
                className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-widest border-r border-white/5 transition-all relative ${
                  activeTab === tab.id 
                    ? 'bg-[#1a1a1a] text-white' 
                    : 'text-white/30 hover:bg-white/5 hover:text-white/50'
                }`}
              >
                <tab.icon size={12} className={activeTab === tab.id ? 'text-dragon-red' : 'opacity-50'} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-dragon-red" />
                )}
              </button>
            ))}
          </div>

          {/* Main Space */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'npcs' ? (
              <NPCGenerator onSave={() => loadAllLists()} />
            ) : activeTab === 'test' ? (
              <NPCTester />
            ) : activeTab === 'simulator' ? (
              <Simulator />
            ) : activeTab === 'jane' ? (
              <Jane />
            ) : activeTab !== 'backgrounds' ? (
              <>
                {/* Left Drawer: Hierarchy & Checklist */}
                <div className="w-64 border-r border-white/5 flex flex-col bg-[#1e1e1e]">
                  <div className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-between">
                    <span>Hierarchy Explorer</span>
                    <GameIcon 
                      name="refresh" 
                      size={12} 
                      color="currentColor"
                      className="hover:rotate-180 transition-transform cursor-pointer" 
                      onClick={loadAllLists}
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* Item Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {(activeTab === 'equipment' || activeTab === 'materials') && selectedCategory ? 'Current Scope' : 'Root Selection'}
                        </label>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              const skeleton = {
                                name: 'New Entity',
                                index: 'new-entity',
                                size: 'Medium',
                                type: activeTab === 'monsters' ? 'Humanoid' : 'Misc',
                                stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                                rarity: 'Common',
                                challenge_rating: '1',
                                actions: [],
                                special_abilities: []
                              };
                              setEditingItem(skeleton);
                              playClickSound();
                            }}
                            className="p-1 px-2 bg-dragon-red/10 border border-dragon-red/30 rounded text-[9px] font-bold text-dragon-red hover:bg-dragon-red hover:text-white transition-all uppercase tracking-tighter"
                            title="Create New Entity Manifestation"
                          >
                            + NEW
                          </button>
                          {(activeTab === 'equipment' || activeTab === 'materials') && selectedCategory && (
                            <button 
                              onClick={() => setSelectedCategory(null)}
                              className="text-[9px] font-bold text-dragon-red uppercase tracking-widest hover:text-white transition-colors"
                            >
                              ../back
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-px bg-white/5 rounded overflow-hidden">
                          {(activeTab === 'monsters' ? monstersList : 
                            activeTab === 'materials' && !selectedCategory ? storeMaterialCategories :
                            activeTab === 'materials' && selectedCategory ? (storeMaterialCategories.find(c => c.index === selectedCategory)?.materials || []) :
                            activeTab === 'equipment' && !selectedCategory ? storeEquipmentCategories :
                            activeTab === 'equipment' && selectedCategory ? (storeEquipmentCategories.find(c => c.index === selectedCategory)?.equipment || []) :
                            []).map((mOrIndex, i) => {
                              // Resolve item if it's an index
                              let m = mOrIndex;
                              if (typeof mOrIndex === 'string') {
                                if (activeTab === 'equipment') {
                                  m = equipmentList.find(e => e.index === mOrIndex) || { index: mOrIndex, name: mOrIndex };
                                } else if (activeTab === 'materials') {
                                  m = materialsList.find(e => e.index === mOrIndex) || { index: mOrIndex, name: mOrIndex };
                                }
                              }

                              const isSelected = editingItem?.index === m.index || (editingItem?.index?.startsWith(m.index + '_'));

                              return (
                              <button
                                key={`${m.index}-${i}`}
                                onClick={async () => {
                                  if ((activeTab === 'equipment' || activeTab === 'materials') && !selectedCategory) {
                                    setSelectedCategory(m.index);
                                    return;
                                  }

                                  let data = itemDataMap[m.index];
                                  if (!data) {
                                    if (activeTab === 'monsters') data = await fetchMonsterData(m.index);
                                    else if (activeTab === 'materials') data = await fetchMaterialData(m.index);
                                    else if (activeTab === 'equipment') data = await fetchEquipmentData(m.index);
                                    
                                    if (data) {
                                      if (activeTab === 'equipment' && !data.category) {
                                        const mapping = useStore.getState().equipmentCategoryMapping;
                                        if (mapping[m.index]) data.category = mapping[m.index];
                                      }
                                      if (activeTab === 'materials' && !data.category) {
                                        const mapping = useStore.getState().materialCategoryMapping;
                                        if (mapping[m.index]) data.category = mapping[m.index];
                                      }
                                      setItemDataMap(prev => ({ ...prev, [m.index]: data }));
                                    }
                                  }
                                  
                                  if (data) {
                                    const itemWithDefaults = {
                                      ...data,
                                      background_type: data.background_type || 'land_forest',
                                      versions: m.versions // Carry over grouped versions
                                    };
                                    setEditingItem(itemWithDefaults);
                                    runChecks(itemWithDefaults);
                                  }
                                }}
                                className={`text-left px-3 py-1.5 transition-all flex items-center gap-2 group ${
                                  isSelected 
                                    ? 'bg-dragon-red/20 text-white' 
                                    : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                  <GameIcon name="save_data" size={10} color={isSelected ? "#8B0000" : "currentColor"} className={isSelected ? '' : 'opacity-30'} />
                                  <span className="truncate text-[10px] font-bold uppercase">{safeString(m.name)}</span>
                                  {m.versions && Object.keys(m.versions).length > 1 && (
                                    <span className="text-[8px] bg-dragon-red/10 text-dragon-red px-1 rounded border border-dragon-red/10 shrink-0">
                                      {Object.keys(m.versions).length}_V
                                    </span>
                                  )}
                                </div>
                                {(activeTab === 'equipment' || activeTab === 'materials') && !selectedCategory && (
                                  <span className="text-[9px] opacity-40 ml-auto">{m.totalAssets || (m.equipment?.length || m.materials?.length || 0)}</span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                  {/* Operational Status / Checklist */}
                  <div className="p-3 border-t border-white/5 bg-black/20 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Operational Integrity</div>
                      {tierStatuses.length > 0 && (
                        <div className="flex gap-1.5">
                          {tierStatuses.map(s => (
                            <button
                              key={s.tier}
                              onClick={async () => {
                                let data = itemDataMap[s.index];
                                if (!data) {
                                  data = await fetchEquipmentData(s.index);
                                  if (!data) data = await fetchMagicItemData(s.index);
                                  if (data) setItemDataMap(prev => ({ ...prev, [s.index]: data }));
                                }
                                if (data) {
                                  setEditingItem({ ...data, background_type: data.background_type || 'land_forest', versions: editingItem.versions });
                                  runChecks({ ...data, versions: editingItem.versions });
                                }
                                playClickSound();
                              }}
                              className={`w-2.5 h-2.5 rounded-full transition-all border ${
                                s.imageGenerated 
                                  ? 'bg-green-500 border-green-400/50 shadow-[0_0_8px_rgba(34,197,94,0.3)]' 
                                  : 'bg-white/5 border-white/10 hover:border-white/30'
                              } ${editingItem?.index === s.index ? 'ring-2 ring-dragon-red ring-offset-1 ring-offset-[#1a1a1a] scale-110' : ''}`}
                              title={`${s.name} ${s.imageGenerated ? '[IMAGE_OK]' : '[IMAGE_MISSING]'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {[
                      { key: 'jsonExists', label: 'FS_JSON', id: 1 },
                      { key: 'wikiExists', label: 'MD_WIKI', id: 2 },
                      { key: 'promptReady', label: 'AI_PRMPT', id: 3 },
                      { key: 'imageGenerated', label: 'GEN_IMG', id: 4 },
                      { key: 'bgReady', label: 'BG_STAT', id: 5 }
                    ].map(step => (
                      <div key={step.id} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${checklist[step.key as keyof typeof checklist] ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                          <span className={`${checklist[step.key as keyof typeof checklist] ? 'text-white/80' : 'text-white/20'}`}>{step.label}</span>
                        </div>
                        {checklist[step.key as keyof typeof checklist] ? (
                          <span className="text-green-500 font-bold">[OK]</span>
                        ) : (
                          <span className="text-dragon-red animate-pulse cursor-pointer hover:underline" onClick={step.key === 'jsonExists' ? handleSave : step.key === 'wikiExists' ? (activeTab === 'monsters' ? scrapeWiki : generateDescription) : step.key === 'promptReady' ? generatePrompt : undefined}>[FIX]</span>
                        )}
                      </div>
                    ))}
                  </div>
                  </div>
                </div>

                {/* Right Panel: Code Workspace (2/3) */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a] relative">
                  {editingItem ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Editor Header */}
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-dragon-red/10 rounded border border-dragon-red/20 text-dragon-red">
                            {activeTab === 'monsters' ? <GameIcon name="bot" size={16} color="currentColor" /> : 
                             activeTab === 'materials' ? <GameIcon name="sparkles" size={16} color="currentColor" /> :
                             <GameIcon name="package" size={16} color="currentColor" />}
                          </div>
                          <div>
                            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{editingItem.index}</div>
                            <div className="text-sm font-bold text-white uppercase tracking-tight">{safeString(editingItem.name)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleSave}
                            className="px-4 py-1.5 bg-dragon-red text-white text-[10px] font-bold rounded hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
                          >
                            <GameIcon name="save_data" size={12} color="currentColor" /> DEPLOY_CHANGES
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* IDE Input Group */}

                        {/* Ripper / Raw Text Parser */}
                        <div className="bg-[#2a1a1a] border border-red-900/30 rounded-lg p-4 space-y-3 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 pointer-events-none">
                              <GameIcon name="scroll" size={60} color="#8B0000" />
                           </div>
                           <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-2">
                                 <GameIcon name="terminal" size={14} className="text-dragon-red" />
                                 <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">5e.Tools / Raw Manifestation Ripper</h3>
                              </div>
                              <span className="text-[8px] font-mono text-white/20">v.1.0_PARSER</span>
                           </div>
                           <textarea 
                              value={ripperText}
                              onChange={(e) => setRipperText(e.target.value)}
                              placeholder="Paste monster stats here from 5e.tools or any PDF/Source. AI will reconstruct the essence..."
                              rows={3}
                              className="w-full bg-black/40 border border-white/5 p-3 text-[11px] text-white/50 rounded focus:border-dragon-red/40 transition-all font-mono custom-scrollbar"
                           />
                           <div className="flex justify-end gap-3 items-center">
                              {isParsingRipper && <span className="text-[9px] font-mono text-dragon-red animate-pulse">RECONSTRUCTING_ESSENCE...</span>}
                              <button 
                                 onClick={async () => {
                                    if (!ripperText.trim()) return;
                                    setIsParsingRipper(true);
                                    playClickSound();
                                    try {
                                       const parsed = await parseRawMonsterText(ripperText);
                                       if (parsed) {
                                          setEditingItem({ ...editingItem, ...parsed });
                                          
                                          // Auto-select category based on type
                                          if (parsed.type) {
                                             const typeLower = parsed.type.toLowerCase();
                                             const validCats = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'];
                                             if (validCats.includes(typeLower)) {
                                                setSelectedMonsterCategory(typeLower);
                                             }
                                          }

                                          playSuccessSound();
                                          setRipperText('');
                                       } else {
                                          playFailSound();
                                       }
                                    } finally {
                                       setIsParsingRipper(false);
                                    }
                                 }}
                                 disabled={isParsingRipper || !ripperText}
                                 className="px-4 py-1.5 bg-dragon-red/80 hover:bg-dragon-red text-white text-[10px] font-bold rounded transition-all flex items-center gap-2 shadow-inner disabled:opacity-30"
                              >
                                 <GameIcon name="sparkles" size={12} color="#FFFFFF" />
                                 BAM! MANIFEST ESSENCE
                              </button>
                           </div>
                        </div>
                        
                        {/* External Scraper Support */}
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 mb-6 group transition-all hover:border-dragon-red/20">
                          <div className="p-2 bg-dragon-red/10 rounded-full transition-colors group-hover:bg-dragon-red/20">
                            <GameIcon name="search" size={14} color="#8B0000" />
                          </div>
                          <div className="flex-1 flex gap-2">
                            <div className="flex-1 bg-black/40 border-b border-white/10 flex items-center px-3 rounded h-9 group-hover:border-dragon-red/30 transition-all">
                              <span className="text-[10px] text-white/30 mr-1 font-mono shrink-0">URL:</span>
                              <input 
                                type="text" 
                                placeholder="Auto-detecting wiki page..."
                                value={customWikiUrl}
                                onChange={(e) => setCustomWikiUrl(e.target.value)}
                                className="flex-1 bg-transparent focus:outline-none text-[11px] text-dragon-red/90 font-mono"
                              />
                            </div>
                            <button 
                              onClick={() => {
                                console.log("[DevKit] Manually triggering scrapeWiki");
                                scrapeWiki();
                              }}
                              disabled={isChecking}
                              className="px-6 bg-dragon-red border border-dragon-red/30 text-white text-[11px] font-anton uppercase tracking-widest hover:bg-red-700 transition-all rounded disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95"
                            >
                              {isChecking ? <GameIcon name="refresh" size={14} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="sparkles" size={14} color="#FFFFFF" />}
                              SCRAPE_LORE
                            </button>
                          </div>
                        </div>

                        {/* Lore Binder Section */}
                        {activeTab === 'monsters' && (
                          <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-dragon-red">
                                <GameIcon name="scroll" size={16} color="currentColor" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest">Chronicle Binder</h3>
                              </div>
                              <div className="flex bg-white/5 rounded p-0.5 border border-white/10">
                                <button 
                                  onClick={() => setWikiTab('editor')}
                                  className={`px-3 py-1 text-[9px] font-bold rounded transition-all ${wikiTab === 'editor' ? 'bg-dragon-red text-white' : 'text-white/40 hover:text-white/60'}`}
                                >
                                  EDITOR
                                </button>
                                <button 
                                  onClick={() => setWikiTab('raw')}
                                  className={`px-3 py-1 text-[9px] font-bold rounded transition-all ${wikiTab === 'raw' ? 'bg-dragon-red text-white' : 'text-white/40 hover:text-white/60'}`}
                                >
                                  WIKI_RAW
                                </button>
                              </div>
                            </div>

                            {wikiTab === 'editor' ? (
                              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Atmospheric Lore (Display Summary)</label>
                                  <textarea 
                                    value={editingItem.lore || ''}
                                    onChange={(e) => updateField('lore', e.target.value)}
                                    rows={4}
                                    placeholder="Write a beautifully written summary for players..."
                                    className="w-full bg-white/5 border border-white/10 p-3 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-all font-playfair leading-relaxed custom-scrollbar"
                                  />
                                </div>

                                <div className="space-y-3">
                                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Wiki Sections (Detailed Data)</label>
                                  {editingItem.wikiData ? (
                                    <div className="grid grid-cols-1 gap-3">
                                      {Object.entries(editingItem.wikiData).map(([key, val]: [string, any]) => (
                                        <div key={key} className="p-3 bg-white/5 rounded border border-white/10 space-y-2 group hover:border-dragon-red/30 transition-all">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-dragon-red/80 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                                            <button 
                                              onClick={() => {
                                                const newData = { ...editingItem.wikiData };
                                                delete newData[key];
                                                updateField('wikiData', newData);
                                              }}
                                              className="text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                              <GameIcon name="trash" size={12} color="currentColor" />
                                            </button>
                                          </div>
                                          <textarea 
                                            value={typeof val === 'string' ? val : JSON.stringify(val)}
                                            onChange={(e) => {
                                              const newData = { ...editingItem.wikiData, [key]: e.target.value };
                                              updateField('wikiData', newData);
                                            }}
                                            rows={2}
                                            className="w-full bg-transparent border-none p-0 text-[11px] text-white/60 focus:outline-none resize-none custom-scrollbar leading-tight italic"
                                          />
                                        </div>
                                      ))}
                                      <button 
                                        onClick={() => {
                                          const section = window.prompt("New section name (e.g. Personality, Rituals):");
                                          if (section) {
                                            updateField('wikiData', { ...(editingItem.wikiData || {}), [section]: '' });
                                          }
                                        }}
                                        className="w-full py-2 border border-dashed border-white/10 rounded flex items-center justify-center gap-2 text-[10px] text-white/30 hover:text-white/50 hover:border-white/20 transition-all"
                                      >
                                        <GameIcon name="plus" size={12} /> ADD_NEW_BUREAUCRATIC_RECORD
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="py-8 text-center bg-white/5 rounded border border-dashed border-white/10">
                                      <p className="text-[10px] text-white/20 italic">No detailed records found. Use the Scraper or add manually.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Raw JSON (Lore Data)</label>
                                <textarea 
                                  value={JSON.stringify(editingItem.wikiData, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      const data = JSON.parse(e.target.value);
                                      updateField('wikiData', data);
                                    } catch (err) {}
                                  }}
                                  rows={12}
                                  className="w-full bg-black/40 border border-white/10 p-4 text-[10px] text-dragon-red/80 rounded focus:outline-none focus:border-dragon-red/50 transition-all font-mono custom-scrollbar"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'monsters' && (
                          <div className="space-y-6 pt-6 border-t border-white/5 bg-black/5 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-dragon-red">
                               <GameIcon name="sliders" size={16} color="currentColor" />
                               <h3 className="text-[10px] font-bold uppercase tracking-widest">Mechanical Essence</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Armor Class</label>
                                <div className="flex gap-1">
                                  <input type="number" value={editingItem.armor_class || 0} onChange={(e) => updateField('armor_class', parseInt(e.target.value))} className="w-16 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" />
                                  <input type="text" value={editingItem.armor_desc || ''} onChange={(e) => updateField('armor_desc', e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="natural armor" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Hit Points</label>
                                <input type="number" value={editingItem.hit_points || 0} onChange={(e) => updateField('hit_points', parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">HP Dice</label>
                                <input type="text" value={editingItem.hit_dice || ''} onChange={(e) => updateField('hit_dice', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="1d6" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">CR</label>
                                <input type="text" value={editingItem.challenge_rating || '0'} onChange={(e) => updateField('challenge_rating', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Initiative & Skills</label>
                                <div className="flex gap-2">
                                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded w-1/3">
                                    <span className="text-[8px] text-white/30 font-bold">INIT</span>
                                    <input type="number" value={editingItem.initiative || 0} onChange={(e) => updateField('initiative', parseInt(e.target.value))} className="bg-transparent border-none p-0 text-xs text-white w-full focus:outline-none" />
                                  </div>
                                  <input type="text" value={editingItem.skills || ''} onChange={(e) => updateField('skills', e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Stealth +4, Perception +2" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Senses & Languages</label>
                                <div className="flex gap-2">
                                  <input type="text" value={editingItem.senses || ''} onChange={(e) => updateField('senses', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Darkvision 60ft" />
                                  <input type="text" value={editingItem.languages || ''} onChange={(e) => updateField('languages', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Common" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Habitat & Treasure</label>
                                <div className="flex gap-2">
                                  <input type="text" value={editingItem.habitat || ''} onChange={(e) => updateField('habitat', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Underdark" />
                                  <input type="text" value={editingItem.treasure || ''} onChange={(e) => updateField('treasure', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Any here?" />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-6 gap-2">
                               {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(s => (
                                 <div key={s} className="space-y-1">
                                    <label className="text-[8px] font-bold text-white/20 uppercase text-center block">{s}</label>
                                    <input 
                                      type="number" 
                                      value={editingItem.stats?.[s] || 10} 
                                      onChange={(e) => {
                                        const newStats = { ...(editingItem.stats || {}), [s]: parseInt(e.target.value) || 0 };
                                        updateField('stats', newStats);
                                      }}
                                      className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-dragon-red font-bold text-center rounded focus:border-dragon-red/50 outline-none"
                                    />
                                    <div className="text-[8px] text-white/30 text-center font-mono">
                                      {getModifier(editingItem.stats?.[s] || 10) >= 0 ? '+' : ''}{getModifier(editingItem.stats?.[s] || 10)}
                                    </div>
                                 </div>
                               ))}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Size & Type</label>
                                <div className="flex gap-2">
                                  <input type="text" value={editingItem.size || ''} onChange={(e) => updateField('size', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Medium" />
                                  <input type="text" value={editingItem.type || ''} onChange={(e) => updateField('type', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Humanoid" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase">Alignment</label>
                                <input type="text" value={editingItem.alignment || ''} onChange={(e) => updateField('alignment', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Lawful Neutral" />
                              </div>
                            </div>

                            {/* Traits & Actions Editor */}
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                     <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Special Abilities (Traits)</label>
                                     <button onClick={() => updateField('special_abilities', [...(editingItem.special_abilities || []), { name: 'New Trait', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Trait</button>
                                  </div>
                                  <div className="space-y-2">
                                     {(editingItem.special_abilities || []).map((sa: any, i: number) => (
                                       <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                                          <input value={sa.name} onChange={(e) => {
                                             const newSAs = [...editingItem.special_abilities];
                                             newSAs[i].name = e.target.value;
                                             updateField('special_abilities', newSAs);
                                          }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                                          <textarea value={sa.desc} onChange={(e) => {
                                             const newSAs = [...editingItem.special_abilities];
                                             newSAs[i].desc = e.target.value;
                                             updateField('special_abilities', newSAs);
                                          }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                                          <button onClick={() => {
                                             const newSAs = editingItem.special_abilities.filter((_: any, idx: number) => idx !== i);
                                             updateField('special_abilities', newSAs);
                                          }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                     <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Actions</label>
                                     <button onClick={() => updateField('actions', [...(editingItem.actions || []), { name: 'New Action', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Action</button>
                                  </div>
                                  <div className="space-y-2">
                                     {(editingItem.actions || []).map((a: any, i: number) => (
                                       <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                                          <input value={a.name} onChange={(e) => {
                                             const newActions = [...editingItem.actions];
                                             newActions[i].name = e.target.value;
                                             updateField('actions', newActions);
                                          }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                                          <textarea value={a.desc} onChange={(e) => {
                                             const newActions = [...editingItem.actions];
                                             newActions[i].desc = e.target.value;
                                             updateField('actions', newActions);
                                          }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                                          <button onClick={() => {
                                             const newActions = editingItem.actions.filter((_: any, idx: number) => idx !== i);
                                             updateField('actions', newActions);
                                          }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                     <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Bonus Actions</label>
                                     <button onClick={() => updateField('bonus_actions', [...(editingItem.bonus_actions || []), { name: 'New Bonus Action', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Bonus</button>
                                  </div>
                                  <div className="space-y-2">
                                     {(editingItem.bonus_actions || []).map((ba: any, i: number) => (
                                       <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                                          <input value={ba.name} onChange={(e) => {
                                             const newBAs = [...editingItem.bonus_actions];
                                             newBAs[i].name = e.target.value;
                                             updateField('bonus_actions', newBAs);
                                          }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                                          <textarea value={ba.desc} onChange={(e) => {
                                             const newBAs = [...editingItem.bonus_actions];
                                             newBAs[i].desc = e.target.value;
                                             updateField('bonus_actions', newBAs);
                                          }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                                          <button onClick={() => {
                                             const newBAs = editingItem.bonus_actions.filter((_: any, idx: number) => idx !== i);
                                             updateField('bonus_actions', newBAs);
                                          }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                     <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Reactions</label>
                                     <button onClick={() => updateField('reactions', [...(editingItem.reactions || []), { name: 'New Reaction', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Reaction</button>
                                  </div>
                                  <div className="space-y-2">
                                     {(editingItem.reactions || []).map((r: any, i: number) => (
                                       <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                                          <input value={r.name} onChange={(e) => {
                                             const newRs = [...editingItem.reactions];
                                             newRs[i].name = e.target.value;
                                             updateField('reactions', newRs);
                                          }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                                          <textarea value={r.desc} onChange={(e) => {
                                             const newRs = [...editingItem.reactions];
                                             newRs[i].desc = e.target.value;
                                             updateField('reactions', newRs);
                                          }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                                          <button onClick={() => {
                                             const newRs = editingItem.reactions.filter((_: any, idx: number) => idx !== i);
                                             updateField('reactions', newRs);
                                          }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                     <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Legendary Actions</label>
                                     <button onClick={() => updateField('legendary_actions', [...(editingItem.legendary_actions || []), { name: 'New Legendary Action', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Legendary</button>
                                  </div>
                                  <div className="space-y-2">
                                     {(editingItem.legendary_actions || []).map((la: any, i: number) => (
                                       <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                                          <input value={la.name} onChange={(e) => {
                                             const newLAs = [...editingItem.legendary_actions];
                                             newLAs[i].name = e.target.value;
                                             updateField('legendary_actions', newLAs);
                                          }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                                          <textarea value={la.desc} onChange={(e) => {
                                             const newLAs = [...editingItem.legendary_actions];
                                             newLAs[i].desc = e.target.value;
                                             updateField('legendary_actions', newLAs);
                                          }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                                          <button onClick={() => {
                                             const newLAs = editingItem.legendary_actions.filter((_: any, idx: number) => idx !== i);
                                             updateField('legendary_actions', newLAs);
                                          }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Asset Rarity</label>
                            <select 
                              value={editingItem.rarity || 'Common'}
                              onChange={(e) => updateField('rarity', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-colors cursor-pointer"
                            >
                              {['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'].map(r => (
                                <option key={r} value={r} className="bg-[#1a1a1a]">{r}</option>
                              ))}
                            </select>
                          </div>

                          {activeTab === 'monsters' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Target Category</label>
                              <select 
                                value={selectedMonsterCategory}
                                onChange={(e) => setSelectedMonsterCategory(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-colors cursor-pointer"
                              >
                                {['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead', 'misc'].map(cat => (
                                  <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {activeTab !== 'monsters' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Asset_Tier [0-3]</label>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map(t => {
                                  // Detect current tier from index or name
                                  const index = editingItem.index || '';
                                  const currentTier = index.endsWith(`_${t}`) || (t === 0 && !index.match(/_\d$/)) ? true : false;
                                  
                                  return (
                                    <button
                                      key={t}
                                      onClick={() => {
                                        const baseIndex = index.replace(/_\d$/, '');
                                        const newIndex = t === 0 ? baseIndex : `${baseIndex}_${t}`;
                                        const newRarity = t === 0 ? 'Common' : t === 1 ? 'Uncommon' : t === 2 ? 'Rare' : 'Very Rare';
                                        
                                        // Update name
                                        let newName = editingItem.name || '';
                                        newName = newName.replace(/, \+\d$/, '');
                                        if (t > 0) newName = `${newName}, +${t}`;
                                        
                                        setEditingItem({
                                          ...editingItem,
                                          index: newIndex,
                                          name: newName,
                                          rarity: newRarity
                                        });
                                      }}
                                      className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                                        (index.endsWith(`_${t}`) || (t === 0 && !index.match(/_\d$/)))
                                          ? 'bg-dragon-red border-dragon-red text-white' 
                                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                      }`}
                                    >
                                      {t === 0 ? 'BASE' : `T_${t}`}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {activeTab === 'monsters' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">XP_VALUE</label>
                              <div className="flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
                                <input 
                                  type="number"
                                  value={editingItem.xp || 0}
                                  onChange={(e) => updateField('xp', parseInt(e.target.value) || 0)}
                                  className="w-full p-2 text-[11px] text-white/80 focus:outline-none bg-transparent"
                                />
                                <div className="px-2 text-[9px] text-white/20 font-bold border-l border-white/10 uppercase">PTS</div>
                              </div>
                            </div>
                          )}

                          {activeTab !== 'monsters' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Material_Cost</label>
                              <div className="flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
                                <input 
                                  type="text"
                                  value={formatCost(editingItem.cost)}
                                  onChange={(e) => updateField('cost', parseCost(e.target.value))}
                                  className="w-full p-2 text-[11px] text-white/80 focus:outline-none bg-transparent"
                                  placeholder="e.g. 10 gp"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Habitat Map</label>
                            <select 
                              value={editingItem.background_type || 'land_forest'}
                              onChange={(e) => updateField('background_type', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-all cursor-pointer"
                            >
                              {backgroundTypes.flatMap(b => [
                                <option key={b.id} value={b.id} className="bg-[#1a1a1a]">{b.label} [MAIN]</option>,
                                ...[1, 2, 3, 4].map(v => (
                                  <option key={`${b.id}${v}`} value={`${b.id}${v}`} className="bg-[#1a1a1a]">{b.label} [V_{v}]</option>
                                ))
                              ])}
                            </select>
                          </div>
                        </div>

                        {activeTab === 'monsters' ? (
                          <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5">
                            {/* Monster Parts Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <GameIcon name="sparkles" size={12} color="currentColor" /> HARVEST_NODES
                                </label>
                                <button 
                                  onClick={() => {
                                    const current = editingItem.item_drops || [];
                                    updateField('item_drops', [...current, { name: 'New Part', rarity: 'Common', quantity: '1', type: 'material' }]);
                                  }}
                                  className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/10 hover:bg-dragon-red hover:text-white transition-all uppercase font-bold"
                                >
                                  + Add Node
                                </button>
                              </div>
                              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                {editingItem.item_drops?.filter(d => d.type === 'material').map((drop, i) => (
                                  <div key={i} className="flex gap-2 items-center bg-white/5 p-2 rounded border border-white/5 group/drop">
                                    <input 
                                      type="text"
                                      list="materials-datalist"
                                      value={drop.name}
                                      onChange={(e) => {
                                        const newDrops = [...(editingItem.item_drops || [])];
                                        const realIdx = newDrops.indexOf(drop);
                                        newDrops[realIdx] = { ...drop, name: e.target.value };
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="flex-1 bg-transparent border-none text-[11px] text-white/80 p-0 focus:outline-none font-bold"
                                      placeholder="Component identifier..."
                                    />
                                    <input 
                                      type="text"
                                      value={drop.quantity}
                                      onChange={(e) => {
                                        const newDrops = [...(editingItem.item_drops || [])];
                                        const realIdx = newDrops.indexOf(drop);
                                        newDrops[realIdx] = { ...drop, quantity: e.target.value };
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="w-12 bg-black/20 border border-white/10 text-[10px] text-white/40 p-1 rounded text-center"
                                      placeholder="QTY"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newDrops = (editingItem.item_drops || []).filter(d => d !== drop);
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="text-white/20 hover:text-dragon-red opacity-0 group-hover/drop:opacity-100 transition-all"
                                    >
                                      <GameIcon name="trash" size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Loot Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <GameIcon name="coins" size={12} color="currentColor" /> LOOT_RESOURCES
                                </label>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      const current = editingItem.item_drops || [];
                                      updateField('item_drops', [...current, { name: 'gp', rarity: 'Common', quantity: '1d10', type: 'currency' }]);
                                      playClickSound();
                                    }}
                                    className="text-[9px] bg-yellow-600/10 text-yellow-600/60 px-2 py-0.5 rounded border border-yellow-600/20 hover:bg-yellow-600 hover:text-white transition-all uppercase font-bold"
                                  >
                                    + GP
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const current = editingItem.item_drops || [];
                                      updateField('item_drops', [...current, { name: 'New Item', rarity: 'Common', quantity: '1', type: 'equipment' }]);
                                      playClickSound();
                                    }}
                                    className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/10 hover:bg-dragon-red hover:text-white transition-all uppercase font-bold"
                                  >
                                    + Add Item
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                {editingItem.item_drops?.filter(d => d.type !== 'material').map((drop, i) => (
                                  <div key={i} className="flex gap-2 items-center bg-white/5 p-2 rounded border border-white/5 group/drop">
                                    <select 
                                      value={drop.type || 'currency'}
                                      onChange={(e) => {
                                        const newDrops = [...(editingItem.item_drops || [])];
                                        const realIdx = newDrops.indexOf(drop);
                                        newDrops[realIdx] = { ...drop, type: e.target.value as any };
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="bg-black/20 border border-white/10 text-[9px] text-white/40 p-1 rounded focus:outline-none"
                                    >
                                      <option value="currency">CUR</option>
                                      <option value="equipment">EQP</option>
                                    </select>
                                    <input 
                                      type="text"
                                      list={drop.type === 'equipment' ? 'equipment-datalist' : undefined}
                                      value={drop.name}
                                      onChange={(e) => {
                                        const newDrops = [...(editingItem.item_drops || [])];
                                        const realIdx = newDrops.indexOf(drop);
                                        newDrops[realIdx] = { ...drop, name: e.target.value };
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="flex-1 bg-transparent border-none text-[11px] text-white/80 p-0 focus:outline-none font-bold"
                                      placeholder="Asset SKU..."
                                    />
                                    <input 
                                      type="text"
                                      value={drop.quantity}
                                      onChange={(e) => {
                                        const newDrops = [...(editingItem.item_drops || [])];
                                        const realIdx = newDrops.indexOf(drop);
                                        newDrops[realIdx] = { ...drop, quantity: e.target.value };
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="w-12 bg-black/20 border border-white/10 text-[10px] text-white/40 p-1 rounded text-center"
                                      placeholder="QTY"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newDrops = (editingItem.item_drops || []).filter(d => d !== drop);
                                        updateField('item_drops', newDrops);
                                      }}
                                      className="text-white/20 hover:text-dragon-red opacity-0 group-hover/drop:opacity-100 transition-all"
                                    >
                                      <GameIcon name="trash" size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">ITEM_WEIGHT</label>
                                  <div className="flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
                                    <input 
                                      type="text"
                                      value={editingItem.weight || ''}
                                      onChange={(e) => updateField('weight', e.target.value)}
                                      className="w-full p-2 text-[11px] text-white/80 focus:outline-none bg-transparent"
                                      placeholder="e.g. 1 lb."
                                    />
                                    <div className="px-2 text-[9px] text-white/20 font-bold border-l border-white/10 uppercase">LBS</div>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Asset Group</label>
                                  <select 
                                    value={editingItem.category || ''}
                                    onChange={(e) => updateField('category', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-2 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-colors"
                                  >
                                    <option value="" className="bg-[#1a1a1a]">UNASSIGNED</option>
                                    {(activeTab === 'equipment' ? equipmentCategories : materialCategories).map(cat => (
                                      <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {activeTab === 'equipment' && (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Socket_Slots</label>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => updateField('slot', ['main-hand', 'off-hand'])}
                                        className="text-[8px] text-dragon-red hover:text-red-400 font-bold uppercase transition-colors"
                                      >
                                        [SET_2H]
                                      </button>
                                      <button 
                                        onClick={() => updateField('slot', ['main-hand'])}
                                        className="text-[8px] text-dragon-red hover:text-red-400 font-bold uppercase transition-colors"
                                      >
                                        [SET_1H]
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 border border-white/5 rounded min-h-[80px]">
                                    {[
                                      'head', 'neck', 'chest', 'back', 'waist', 
                                      'main-hand', 'off-hand', 'hands', 'legs', 'feet', 
                                      'ring-1', 'ring-2', 'focus', 'tool', 'extra', 'ammo'
                                    ].map(slot => {
                                      const currentSlots = Array.isArray(editingItem.slot) ? editingItem.slot : (editingItem.slot ? [editingItem.slot] : []);
                                      const isSelected = currentSlots.includes(slot);
                                      return (
                                        <button
                                          key={slot}
                                          onClick={() => {
                                            const newSlots = isSelected 
                                              ? currentSlots.filter((s: string) => s !== slot)
                                              : [...currentSlots, slot];
                                            updateField('slot', newSlots);
                                          }}
                                          className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all border ${
                                            isSelected 
                                              ? 'bg-dragon-red/20 border-dragon-red text-dragon-red shadow-[0_0_10px_rgba(139,0,0,0.2)]' 
                                              : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                                          }`}
                                        >
                                          {slot.replace('-', '_')}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5 flex flex-col">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Lore_Description</label>
                                <button 
                                  onClick={generateDescription}
                                  className="text-[9px] text-dragon-red flex items-center gap-1 hover:text-red-400 font-bold uppercase"
                                >
                                  <GameIcon name="bot" size={10} color="currentColor" /> Execute_Gen
                                </button>
                              </div>
                              <textarea 
                                value={Array.isArray(editingItem.desc) ? editingItem.desc.join('\n') : (editingItem.desc || '')}
                                onChange={(e) => updateField('desc', e.target.value.split('\n'))}
                                className="flex-1 min-h-[120px] bg-white/5 border border-white/10 p-3 text-[11px] text-white/70 rounded focus:outline-none focus:border-dragon-red/50 transition-colors font-sans leading-relaxed resize-none custom-scrollbar"
                                placeholder="// Enter metadata description..."
                              />
                            </div>
                          </div>
                        )}

                        {/* Synthesis Section */}
                        <div className="space-y-6">
                          {/* Prompt Shell */}
                          <div className="space-y-3 p-4 bg-black/40 border border-white/5 rounded-lg border-l-2 border-l-dragon-red">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                <GameIcon name="bot" size={12} color="#8B0000" /> Synthesis_String
                              </label>
                              <button 
                                onClick={() => {
                                  generatePrompt();
                                  playClickSound();
                                }} 
                                className="text-[9px] text-white/40 hover:text-white transition-colors flex items-center gap-1 font-bold uppercase"
                              >
                                <GameIcon name="refresh" size={10} color="currentColor" /> Recalculate
                              </button>
                            </div>
                            <textarea 
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              className="w-full h-24 bg-transparent text-[11px] text-dragon-red/80 font-mono leading-relaxed focus:outline-none custom-scrollbar resize-none"
                              placeholder="Prompt will be derived from metadata..."
                            />
                          </div>

                          {/* Visual Synthesis Engine */}
                          <div className="space-y-4">
                            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5 pb-1">
                              <GameIcon name="package" size={12} color="currentColor" /> Visualization_Engine
                            </label>
                            <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                              {activeTab === 'monsters' && (
                                <EnemyImageGenerator 
                                  monsterName={editingItem.name || ''}
                                  monsterType={editingItem.type || ''}
                                  monsterSize={editingItem.size}
                                  monsterAlignment={editingItem.alignment}
                                  monsterSubtype={editingItem.subtype}
                                  monsterLore={editingItem.lore || (editingItem.desc ? editingItem.desc[0] : '')}
                                  initialHabitat={editingItem.background_type || 'land_forest'}
                                  onImageGenerated={(url) => {
                                    updateField('imageUrl', url);
                                    setChecklist(prev => ({ ...prev, imageGenerated: true }));
                                  }}
                                />
                              )}
                              {activeTab === 'equipment' && (
                                <EquipmentImageGenerator 
                                  itemName={editingItem.name || ''}
                                  itemType={editingItem.category || editingItem.type || ''}
                                  itemLore={editingItem.desc ? editingItem.desc[0] : ''}
                                  onImageGenerated={(url) => {
                                    updateField('imageUrl', url);
                                    setChecklist(prev => ({ ...prev, imageGenerated: true }));
                                  }}
                                />
                              )}
                              {activeTab === 'materials' && (
                                <MaterialImageGenerator 
                                  itemName={editingItem.name || ''}
                                  itemType={editingItem.material_sub_category || editingItem.category || ''}
                                  itemLore={editingItem.desc ? editingItem.desc[0] : ''}
                                  onImageGenerated={(url) => {
                                    updateField('imageUrl', url);
                                    setChecklist(prev => ({ ...prev, imageGenerated: true }));
                                  }}
                                />
                              )}
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-6">
                        <GameIcon name="terminal" size={80} color="currentColor" strokeWidth={1} />
                        <div className="text-center space-y-2">
                          <p className="font-bold tracking-[0.3em] uppercase text-sm">Awaiting_Entry_Signal</p>
                          <p className="text-[10px] text-white/5 max-w-[240px]">Select an asset from the project hierarchy to initialize initialization protocols.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">
                      <GameIcon name="image" size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Global_Environment_Layer</div>
                      <div className="text-sm font-bold text-white uppercase tracking-tight">Habitat Generator</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="grid grid-cols-12 gap-10">
                      {/* Configuration Panel */}
                      <div className="col-span-12 lg:col-span-5 space-y-8">
                        <section className="space-y-4">
                          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Environment_Config</label>
                          <div className="space-y-6">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">Select_Region</label>
                              <select 
                                value={selectedBgType}
                                onChange={(e) => {
                                  setSelectedBgType(e.target.value);
                                  setGeneratedBackground(null);
                                }}
                                className="w-full bg-white/5 border border-white/10 p-3 text-[11px] text-white/80 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer box-border"
                              >
                                {backgroundTypes.map(b => (
                                  <option key={b.id} value={b.id} className="bg-[#1a1a1a]">{b.label.toUpperCase()}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">Variation_Vector</label>
                              <div className="grid grid-cols-5 gap-2">
                                {[0, 1, 2, 3, 4].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => {
                                      setSelectedBgVariation(v);
                                      setGeneratedBackground(null);
                                    }}
                                    className={`py-2.5 rounded border text-[10px] font-bold transition-all ${
                                      selectedBgVariation === v 
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                        : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'
                                    }`}
                                  >
                                    {v === 0 ? 'MAIN' : v === 3 ? 'WIDE' : v === 4 ? 'MAC' : v}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">Entropy_Instructions</label>
                              <textarea 
                                value={bgInstruction}
                                onChange={(e) => setBgInstruction(e.target.value)}
                                placeholder="Describe specific atmospheric conditions, weather, or local features..."
                                className="w-full bg-white/5 border border-white/10 p-3 text-[11px] text-white/70 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all min-h-[100px] font-mono leading-relaxed"
                              />
                            </div>
                          </div>
                        </section>

                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={generateBackground}
                            disabled={isGeneratingBg}
                            className="w-full py-3 bg-blue-600 text-white text-[11px] font-bold rounded-lg uppercase hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg group"
                          >
                            <GameIcon name="sparkles" size={14} className={isGeneratingBg ? 'animate-spin' : 'group-hover:animate-pulse'} />
                            {isGeneratingBg ? 'SYNTHESIZING_ENVIRONMENT...' : 'EXECUTE_GENERATE'}
                          </button>
                          {generatedBackground && (
                            <button 
                              onClick={saveBackground}
                              disabled={isChecking}
                              className="w-full py-3 bg-green-600 text-white text-[11px] font-bold rounded-lg uppercase hover:bg-green-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
                            >
                              <GameIcon name="save_data" size={14} color="currentColor" />
                              {isChecking ? 'UPLOADING_TO_REPO...' : 'COMMIT_TO_DATABASE'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Preview Engine Area */}
                      <div className="col-span-12 lg:col-span-7 space-y-6">
                        <section className="space-y-4">
                          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Visual_Output_Steam</label>
                          <div className="aspect-[16/9] w-full bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
                            {generatedBackground ? (
                              <img src={generatedBackground} alt="Generated" className="w-full h-full object-cover animate-in zoom-in-95 fade-in duration-700" />
                            ) : (
                              <div className="relative w-full h-full group">
                                <img 
                                  src={`https://raw.githubusercontent.com/${process.env.GITHUB_REPO || 'japiohopman/artificer'}/${process.env.GITHUB_BRANCH || 'main'}/public/assets/images/enemy_backgrounds/${selectedBgType}${selectedBgVariation === 0 ? '' : selectedBgVariation}.webp?t=${Date.now()}`} 
                                  alt="Current" 
                                  className="w-full h-full object-cover opacity-60 grayscale-[0.3]"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                                  <div className="p-3 bg-black/60 rounded-full border border-white/20 mb-3">
                                    <GameIcon name="image" size={24} className="text-white/40" />
                                  </div>
                                  <span className="text-[10px] text-white/60 font-mono tracking-[0.4em] uppercase">
                                    LIVE_FEED: {selectedBgType.toUpperCase()}_{selectedBgVariation}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {isGeneratingBg && (
                              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white gap-6">
                                <div className="relative">
                                  <div className="w-16 h-16 border-2 border-white/5 rounded-full" />
                                  <div className="absolute inset-0 w-16 h-16 border-2 border-t-blue-500 rounded-full animate-spin" />
                                </div>
                                <div className="space-y-1 text-center">
                                  <span className="text-[11px] text-blue-400 font-mono tracking-[0.3em] font-bold uppercase block">Calculating_Voxels</span>
                                  <span className="text-[9px] text-white/20 uppercase">Artificial Intelligence synthesis in progress</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </section>

                        {/* Status Grid */}
                        <div className="p-5 bg-black/20 border border-white/5 rounded-xl space-y-4">
                          <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] block">Asset_Inventory_Matrix</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {backgroundTypes.map(type => (
                              <div key={type.id} className="space-y-1">
                                <span className="text-[8px] text-white/20 font-bold uppercase truncate block">{type.id.slice(0, 10)}</span>
                                <div className="flex gap-0.5">
                                  {[0, 1, 2, 3, 4].map(v => (
                                    <div 
                                      key={v}
                                      className={`w-2 h-2 rounded-[1px] border ${
                                        selectedBgType === type.id && selectedBgVariation === v 
                                          ? 'bg-blue-500 border-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.5)]' 
                                          : 'bg-white/5 border-white/5'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
          
          {/* Footer */}
          <div className="bg-[#0a0a0a] px-4 py-2 text-[9px] text-white/30 font-mono flex justify-between items-center border-t border-white/5">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" /> SYSTEM_V1.4.2_READY</span>
              <span className="text-white/10">|</span>
              <span>ENVIRONMENT_STABLE</span>
              <span className="text-white/10">|</span>
              <span>LOC: {window.location.hostname}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-dragon-red font-bold uppercase">DevKit_Subroutines</span>
              <span className="text-white/10">|</span>
              <span>© {new Date().getFullYear()} ARCANE_CORE</span>
            </div>
          </div>
          {/* Datalists for autocomplete */}
          <datalist id="materials-datalist">
            {materialsList.map(m => (
              <option key={m.index} value={m.name} />
            ))}
          </datalist>
          <datalist id="equipment-datalist">
            {equipmentList.map(e => (
              <option key={e.index} value={e.name} />
            ))}
          </datalist>
        </motion.div>

        {/* Mixer Overlay */}
        <AnimatePresence>
          {isMixerOpen && (
            <div className="absolute right-8 bottom-8 z-[110]">
              <Mixer onClose={() => setIsMixerOpen(false)} />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
