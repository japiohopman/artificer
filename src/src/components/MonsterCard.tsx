import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monster } from '../services/ai/monsterService';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { isBookLike } from '../lib/bookUtils';
import { GameIcon, GameIconName } from '../game_icons';
import { DiceText as DiceTextComponent } from './DiceText';
import { ChromaKeyImage } from './ChromaKeyImage';
import { isMagicUser, generateNpcSpells, inferSpellClass } from '../services/magicService';
import { BookReader } from './bookreader/BookReader';
import { SpellCard } from './SpellCard';
import { EquipmentCard } from './EquipmentCard';
import { useStore } from '../store/useStore';
import { normalizeImageUrl, playClickSound } from '../services/storageService';

interface MonsterCardProps {
  monster: Partial<Monster>;
  className?: string;
}

const DEFAULT_BACKGROUND = "https://gen.krea.ai/images/9079fcd7-8bb1-4246-971f-1fca07e6034d.png";

const SafeValue = ({ value, fallback = '?' }: { value: any; fallback?: string }) => {
  if (value === null || value === undefined) return <>{fallback}</>;
  if (typeof value === 'object') {
    // Handle common D&D object patterns like { value: 17, type: 'natural' }
    if ('value' in value) return <>{value.value}</>;
    // Handle arrays of objects like [{ value: 17, type: 'natural' }]
    if (Array.isArray(value)) {
      if (value.length > 0) {
        const first = value[0];
        if (typeof first === 'object' && first !== null && 'value' in first) {
          return <>{first.value}</>;
        }
        return <>{value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ')}</>;
      }
      return <>{fallback}</>;
    }
    return <>{JSON.stringify(value)}</>;
  }
  return <>{String(value)}</>;
};

const StatBox = ({ label, value }: { label: string; value: any }) => {
  const numValue = typeof value === 'object' && value !== null && 'value' in value ? value.value : Number(value);
  const modifier = isNaN(numValue) ? 0 : Math.floor((numValue - 10) / 2);
  return (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-[10px] font-rajdhani font-semibold uppercase text-black tracking-wider truncate w-full text-center">{label}</span>
      <span 
        className="text-xl font-anton leading-none text-white" 
        style={{ 
          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.5)' 
        }}
      >
        <SafeValue value={value} fallback="10" />
      </span>
      <span className="text-[9px] font-bold text-parchment-600 font-rajdhani">
        {modifier >= 0 ? `+${modifier}` : modifier}
      </span>
    </div>
  );
};

const DiceText = ({ text }: { text: string }) => <DiceTextComponent iconSize={16}>{text}</DiceTextComponent>;

const RARITY_THEME_COLORS: Record<string, string> = {
  Common: '#94a3b8', // slate-400
  Uncommon: '#16a34a', // green-600
  Rare: '#2563eb', // blue-600
  'Very Rare': '#9333ea', // purple-600
  Legendary: '#d4af37', // dragon-gold
  Artifact: '#dc2626', // red-600
};

export const MonsterCard: React.FC<MonsterCardProps> = ({ monster, className }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'actions' | 'loot'>('stats');
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<any>(null);
  
  const { setIsMonsterProfileOpen } = useStore();

  // Generate spells if magic user
  const npcSpells = useMemo(() => {
    if (isMagicUser(monster)) {
      const level = (monster as any).level || Math.max(1, Math.round(Number(monster.challenge_rating || 1) * 1.5));
      const className = inferSpellClass(monster);
      return generateNpcSpells(level, className);
    }
    return [];
  }, [monster]);

  // Convert spells to book pages
  const bookPages = useMemo(() => {
    return npcSpells.map(spell => ({
      id: spell.index,
      content: (
        <div className="flex justify-center py-4">
          <div className="scale-[0.85] origin-top">
             <SpellCard spell={spell} className="shadow-none border-none !bg-transparent" />
          </div>
        </div>
      ),
      headerContent: (
        <div className="mb-4 border-b border-black/10 pb-2 flex justify-between items-center text-black/40">
           <span className="text-[10px] font-bold uppercase tracking-widest">Arcane Transcription</span>
           <GameIcon name="knowledge" size={12} color="#000000" className="opacity-40" />
        </div>
      )
    }));
  }, [npcSpells]);

  const derivedImageUrl = useMemo(() => {
    const rawUrl = monster.imageUrl || (monster as any).image_url || monster.image;
    return normalizeImageUrl(rawUrl, 'enemies', monster.index || monster.id || "");
  }, [monster.imageUrl, (monster as any).image_url, monster.image, monster.index, monster.id]);

  const hasAnyImage = !!(monster.imageUrl || (monster as any).image_url || monster.image);

  const formatName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const currentRarity = monster.rarity || 'Common';
  const themeColor = monster.card_color || RARITY_THEME_COLORS[currentRarity] || '#8B0000';

  const rarityColors = {
    Common: 'text-parchment-600',
    Uncommon: 'text-green-700',
    Rare: 'text-blue-700',
    'Very Rare': 'text-purple-700',
    Legendary: 'text-dragon-gold shadow-[0_0_25px_rgba(212,175,55,0.4)]',
    Artifact: 'text-red-700 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse-slow',
  };

  const getBackgroundUrl = (type?: string) => {
    const repo = process.env.GITHUB_REPO || "japiohopman/artificer";
    const branch = process.env.GITHUB_BRANCH || "main";
    const timestamp = Date.now();

    let finalType = type;

    if (!finalType) {
      // Try to infer from monster type
      const mType = (monster.type || "").toLowerCase();
      if (mType.includes('dragon')) finalType = 'dragon_cave';
      else if (mType.includes('undead') || mType.includes('fiend') || mType.includes('aberration')) finalType = 'underdark';
      else if (mType.includes('fey')) finalType = 'fey';
      else if (mType.includes('beast')) finalType = 'land_forest';
      else if (mType.includes('monstrosity')) finalType = 'ruins';
      else if (mType.includes('elemental')) finalType = 'air';
      else if (mType.includes('construct')) finalType = 'fort';
      else if (mType.includes('celestial')) finalType = 'cathedral';
      else finalType = 'land_forest'; // Default fallback
      
      console.log(`No background type provided for ${monster.name}, inferred: ${finalType}`);
    }
    
    // Use GitHub URL to ensure it works in all environments
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/images/enemy_backgrounds/${finalType}.webp?t=${timestamp}`;
    console.log(`Loading background for ${monster.name} (type: ${finalType}): ${rawUrl}`);
    return `/api/raw?url=${encodeURIComponent(rawUrl)}`;
  };

  const formatSpeed = (speed: any) => {
    if (!speed) return '30 ft.';
    if (typeof speed === 'string') return speed;
    if (typeof speed === 'object') {
      return Object.entries(speed).map(([k, v]) => `${k} ${v}`).join(', ');
    }
    return '30 ft.';
  };

  return (
    <div 
      className={cn(
        "w-[380px] h-[600px] border-[14px] rounded-[24px] p-5 flex flex-col gap-3 relative overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] group text-black",
        rarityColors[currentRarity as keyof typeof rarityColors],
        className
      )}
      style={{ 
        borderColor: themeColor,
        backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Item Action Overlay */}
      {inspectingItem && (
        <EquipmentCard 
          equipment={inspectingItem} 
          isModal={true} 
          onClose={() => setInspectingItem(null)} 
        />
      )}

      {/* Spells Button for Magic Users */}
      {npcSpells.length > 0 && (
        <button 
          onClick={() => {
            setIsBookOpen(true);
            playClickSound();
          }}
          className="absolute top-2 right-2 z-50 w-10 h-10 bg-dragon-gold text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white group/book"
          title="Open Spellbook"
        >
          <GameIcon name="book" size={20} color="#FFFFFF" className="group-hover/book:rotate-12 transition-transform" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-white/20 rounded-full" 
          />
        </button>
      )}

      {/* Book Reader Modal */}
      <BookReader 
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        book={{
          id: `book-${monster.index}`,
          title: `${monster.name}'s Spellbook`,
          author: monster.name,
          pages: bookPages,
          type: 'spellbook',
          coverIndex: 0,
          spineIndex: 0
        }}
      />

      {/* Lore Button - Left Side */}
      {(monster.lore || (monster.wikiData && Object.keys(monster.wikiData).length > 0)) && (
        <button 
          onClick={() => {
            useStore.getState().setFocusedItem(monster as any);
            setIsMonsterProfileOpen(true);
            playClickSound();
          }}
          className="absolute top-[340px] -left-2 z-50 w-10 h-10 bg-dragon-red text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white rounded-lg rotate-[-15deg] group/lore"
          title="Ancient Lore"
        >
          <GameIcon name="key" size={20} color="#FFFFFF" className="group-hover/lore:scale-110 transition-transform" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-white/20 rounded-lg" 
          />
        </button>
      )}

      {/* Spells Button for Magic Users */}

      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-dragon-gold/50 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-dragon-gold/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-dragon-gold/50 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-dragon-gold/50 rounded-br-lg" />
      
      {/* Rarity at the bottom center */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="w-8 h-[1px] bg-dragon-gold/30" />
        <span className="text-[8px] font-bold text-dragon-red uppercase tracking-[0.2em]">{currentRarity}</span>
        <div className="w-8 h-[1px] bg-dragon-gold/30" />
      </div>

      {/* CR Badge - Bottom Right (Overflowing) */}
      <div className="absolute -bottom-4 -right-4 z-40 flex items-center justify-center w-16 h-16 group/cr hover:scale-110 transition-transform">
        <div 
          className="absolute inset-0 rounded-lg border-2 shadow-xl rotate-45"
          style={{ backgroundColor: themeColor, borderColor: '#d4af37' }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
          <span className="text-[15px] font-anton text-white/90 uppercase leading-none mb-0.5">CR</span>
          <span className="text-[10px] font-anton text-white leading-none">
            <SafeValue value={monster.challenge_rating} />
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col relative z-10 pb-1">
        <h3 
          className="font-bodoni-sc text-3xl font-black tracking-tighter leading-none text-center text-white transition-colors"
          style={{ 
            textShadow: `-1px -1px 0 #8B0000, 1px -1px 0 #8B0000, -1px 1px 0 #8B0000, 1px 1px 0 #8B0000, 0 2px 4px rgba(0,0,0,0.3)` 
          }}
        >
          {formatName(monster.name) || 'Unknown Entity'}
        </h3>
        
        {/* Yellow stretching HR */}
        <div className="h-[2px] w-[calc(100%+40px)] -ml-5 my-2 border-y border-dragon-gold shadow-[0_1px_4px_rgba(212,175,55,0.4)]" style={{ backgroundColor: '#D4AF37' }} />

        <div className="w-full flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black text-dragon-red uppercase tracking-widest">
              {monster.size} {monster.type}
            </span>
          </div>
          <span className="text-[12px] font-black text-dragon-darkRed uppercase tracking-widest opacity-80">
            {monster.alignment}
          </span>
        </div>
      </div>

      {/* Image Area Wrapper (to allow badges to overflow) */}
      <motion.div 
        animate={{ 
          height: activeTab === 'actions' ? 0 : 'auto',
          opacity: activeTab === 'actions' ? 0 : 1,
          scale: activeTab === 'actions' ? 0.9 : 1,
          y: activeTab === 'actions' ? -40 : 0,
          marginBottom: activeTab === 'actions' ? -20 : 0,
          pointerEvents: activeTab === 'actions' ? 'none' : 'auto'
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative shrink-0 z-20"
      >
        {/* XP Badge - Floating on top border */}
        {monster.xp !== undefined && (
          <div 
            className="absolute -top-2 left-0 z-40 px-3 py-0.5 bg-parchment-100 border-2 rounded-full shadow-md flex items-center gap-1"
            style={{ borderColor: themeColor }}
          >
            <span className="text-[9px] font-anton uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" style={{ color: themeColor }}>XP:</span>
            <span className="text-[16px] font-anton leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" style={{ color: themeColor }}>
              {monster.xp.toLocaleString()}
            </span>
          </div>
        )}

        {/* HP, AC, Speed Badge Stack - Top Right (Overflowing) */}
        <div className="absolute -top-6 -right-6 z-40 flex flex-col gap-1 items-center">
          {/* HP */}
          <div className="relative flex items-center justify-center w-16 h-16 group/hp drop-shadow-xl hover:scale-105 transition-transform">
            <GameIcon name="hp" width={48} height={58} color="#8B0000" className="opacity-100" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className="text-[14px] font-anton text-white/90 uppercase tracking-tighter leading-none mb-0.5">HP</span>
              <span className="text-[11px] font-anton text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                <SafeValue value={monster.hit_points} fallback="0" />
              </span>
            </div>
          </div>
          
          {/* AC */}
          <div className="relative flex items-center justify-center w-14 h-14 -mt-2 group/ac drop-shadow-lg hover:scale-110 transition-transform">
            <div className="absolute inset-0 bg-dragon-red border-2 border-dragon-gold rotate-45 rounded-sm" />
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-anton text-white/80 uppercase leading-none">AC</span>
              <span className="text-[14px] font-anton text-white leading-none">
                <SafeValue value={monster.armor_class} fallback="10" />
              </span>
            </div>
          </div>

          {/* Speed */}
          <div className="relative flex items-center justify-center w-14 h-14 -mt-2 group/speed drop-shadow-md hover:scale-110 transition-transform">
            <div className="absolute inset-0 bg-dragon-gold border-2 border-white rotate-45 rounded-sm" />
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span className="text-[8px] font-anton text-dragon-red/80 uppercase leading-none">SPD</span>
              <span className="text-[12px] font-anton text-dragon-red leading-none">
                {typeof monster.speed === 'object' ? (monster.speed.walk || monster.speed.land || 30) : parseInt(String(monster.speed)) || 30}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="aspect-[3/2] w-full bg-parchment-200 border-4 rounded-lg overflow-hidden relative shadow-inner"
          style={{ borderColor: themeColor }}
        >
          {/* Background Layer */}
          <div className="absolute inset-0 bg-parchment-300" /> {/* Base color if image fails */}
          <img 
            key={monster.background_type}
            src={getBackgroundUrl(monster.background_type)}
            alt="Atmospheric Background"
            className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.warn(`Failed to load background: ${monster.background_type}`);
              (e.target as HTMLImageElement).src = DEFAULT_BACKGROUND;
            }}
          />
          <div className="absolute inset-0 bg-black/20 z-[5]" /> {/* Darken background slightly */}
          
          {hasAnyImage ? (
            <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
              <ChromaKeyImage 
                src={derivedImageUrl} 
                alt={monster.name || 'Monster'} 
                className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-parchment-400 italic text-xs p-8 text-center relative z-20">
              <GameIcon name="sparkles" className="animate-pulse mr-2" size={16} color="#8B4513" />
              Manifesting ethereal form...
            </div>
          )}
        </div>
      </motion.div>

      {/* Ability Scores - Horizontal, no boxes, Rajdhani labels */}
      <motion.div 
        animate={{ 
          height: activeTab === 'actions' ? 0 : 'auto',
          opacity: activeTab === 'actions' ? 0 : 1,
          y: activeTab === 'actions' ? -20 : 0,
          marginBottom: activeTab === 'actions' ? 0 : 8,
          pointerEvents: activeTab === 'actions' ? 'none' : 'auto'
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
        className="grid grid-cols-6 gap-0 relative z-10 border-b border-dragon-gold/20 pb-2 overflow-hidden"
      >
        <StatBox label="-STR-" value={monster.stats?.str ?? monster.strength} />
        <StatBox label="-DEX-" value={monster.stats?.dex ?? monster.dexterity} />
        <StatBox label="-CON-" value={monster.stats?.con ?? monster.constitution} />
        <StatBox label="-INT-" value={monster.stats?.int ?? monster.intelligence} />
        <StatBox label="-WIS-" value={monster.stats?.wis ?? monster.wisdom} />
        <StatBox label="-CHA-" value={monster.stats?.cha ?? monster.charisma} />
      </motion.div>

      <div 
        className="h-[1px] w-full my-0.5" 
        style={{ 
          background: 'linear-gradient(90deg, rgba(139, 0, 0, 0) 0%, rgba(139, 0, 0, 1) 50%, rgba(139, 0, 0, 0) 100%)' 
        }} 
      />

      {/* Tab Navigation */}
      <div className="flex justify-around border-b border-dragon-gold/20 relative z-10">
        {[
          { id: 'stats', icon: 'dashboard', label: 'Stats' },
          { id: 'actions', icon: 'sword', label: 'Actions' },
          { id: 'loot', icon: 'package', label: 'Loot' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              playClickSound();
            }}
            className={cn(
              "flex flex-col items-center py-1 px-3 transition-all relative",
              activeTab === tab.id ? "text-dragon-red" : "text-parchment-400 hover:text-parchment-600"
            )}
          >
            {tab.id === 'actions' && activeTab === 'actions' ? (
              <GameIcon name="dice_roll" size={14} color="#8B0000" className="animate-pulse" />
            ) : (
              <GameIcon name={tab.icon as any} size={14} color={activeTab === tab.id ? "#8B0000" : "#8B4513"} className="opacity-60" />
            )}
            <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-dragon-red" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative z-10 bg-parchment-50/30 rounded p-2 border border-dragon-gold/10">
        <div className="h-full overflow-y-auto custom-scrollbar pr-1">
          {activeTab === 'stats' && (
            <div className="space-y-4 animate-in fade-in duration-300 font-playfair">
              <div className="text-[14px] space-y-3 text-black">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    <GameIcon name="speed" size={16} color="#8B0000" />
                  </div>
                  <p><span className="font-bold uppercase text-dragon-red font-header tracking-wider">Speed:</span> {formatSpeed(monster.speed)}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    <GameIcon name="senses" size={16} color="#8B0000" />
                  </div>
                  <p><span className="font-bold uppercase text-dragon-red font-header tracking-wider">Senses:</span> <SafeValue value={monster.senses} fallback="None" /></p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    <GameIcon name="languages" size={16} color="#8B0000" />
                  </div>
                  <p><span className="font-bold uppercase text-dragon-red font-header tracking-wider">Languages:</span> <SafeValue value={monster.languages} fallback="None" /></p>
                </div>
              </div>

              {/* Proficiencies & Skills Section */}
              {(monster.proficiencies && monster.proficiencies.length > 0) && (
                <div className="pt-3 border-t border-dragon-gold/10 space-y-2">
                  <div className="flex items-center gap-1.5 mb-1 text-dragon-red">
                    <GameIcon name="knowledge" size={14} color="#8B0000" />
                    <h4 className="text-[12px] font-bold uppercase tracking-widest font-header">Proficiencies</h4>
                  </div>
                  <div className="text-[12px] grid grid-cols-2 gap-x-4 gap-y-1 text-black">
                    {monster.proficiencies.map((p: any, i: number) => {
                      const name = p.skill?.name || p.proficiency?.name || (typeof p === 'string' ? p : 'Skill');
                      const bonus = p.value !== undefined ? (p.value >= 0 ? `+${p.value}` : p.value) : '';
                      return (
                        <div key={i} className="flex justify-between border-b border-dragon-gold/5 pb-0.5">
                          <span className="font-bold uppercase text-dragon-red text-[10px] font-header tracking-wider">{name}</span>
                          <span className="font-mono text-[11px]">{bonus}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Defenses Section */}
              {(monster.damage_vulnerabilities?.length || monster.damage_resistances?.length || monster.damage_immunities?.length || monster.condition_immunities?.length) && (
                <div className="pt-3 border-t border-dragon-gold/10 space-y-2">
                  <div className="flex items-center gap-1.5 mb-1 text-dragon-red">
                    <GameIcon name="shield" size={14} color="#8B0000" />
                    <h4 className="text-[12px] font-bold uppercase tracking-widest font-header">Defenses</h4>
                  </div>
                  <div className="text-[12px] space-y-1.5 text-black">
                    {monster.damage_vulnerabilities && monster.damage_vulnerabilities.length > 0 && (
                      <p><span className="font-bold uppercase text-dragon-red text-[10px] font-header tracking-wider">Vulnerabilities:</span> {monster.damage_vulnerabilities.map((v: any) => typeof v === 'string' ? v : (v.name || JSON.stringify(v))).join(', ')}</p>
                    )}
                    {monster.damage_resistances && monster.damage_resistances.length > 0 && (
                      <p><span className="font-bold uppercase text-dragon-red text-[10px] font-header tracking-wider">Resistances:</span> {monster.damage_resistances.map((r: any) => typeof r === 'string' ? r : (r.name || JSON.stringify(r))).join(', ')}</p>
                    )}
                    {monster.damage_immunities && monster.damage_immunities.length > 0 && (
                      <p><span className="font-bold uppercase text-dragon-red text-[10px] font-header tracking-wider">Damage Immunities:</span> {monster.damage_immunities.map((di: any) => typeof di === 'string' ? di : (di.name || JSON.stringify(di))).join(', ')}</p>
                    )}
                    {monster.condition_immunities && monster.condition_immunities.length > 0 && (
                      <p>
                        <span className="font-bold uppercase text-dragon-red text-[10px] font-header tracking-wider">Condition Immunities:</span> {
                          monster.condition_immunities.map((ci: any) => typeof ci === 'string' ? ci : (ci.name || JSON.stringify(ci))).join(', ')
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'loot' && (
            <div className="space-y-4 animate-in fade-in duration-300 font-playfair">
              <div className="flex items-center gap-2 mb-2 text-dragon-gold">
                <GameIcon name="package" size={18} color="#D4AF37" />
                <h4 className="text-[14px] font-bold uppercase tracking-widest font-header">Loot & Materials</h4>
              </div>
              
              {monster.item_drops && monster.item_drops.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {monster.item_drops.map((drop, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (isBookLike(drop)) {
                          useStore.getState().setFocusedItem(drop);
                        } else {
                          setInspectingItem(drop);
                        }
                      }}
                      className="w-full flex justify-between items-center text-[12px] bg-parchment-200/50 px-2.5 py-2 rounded border border-dragon-gold/10 hover:bg-dragon-red/5 hover:border-dragon-red/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {drop.type === 'currency' ? <GameIcon name="coins" size={14} color="#D97706" className="shrink-0" /> : 
                          drop.type === 'equipment' ? <GameIcon name="sword" size={14} color="#8B0000" className="shrink-0" /> : 
                          drop.type === 'material' ? <GameIcon name="sparkles" size={14} color="#D4AF37" className="shrink-0" /> :
                          <GameIcon name="package" size={14} color="#8B4513" className="shrink-0 opacity-40" />}
                        <span className="font-medium text-parchment-800 truncate"><SafeValue value={drop.name} /></span>
                      </div>
                      <div className="flex gap-4 items-center shrink-0">
                        <span className="text-[10px] italic text-parchment-500"><SafeValue value={drop.rarity} /></span>
                        <span className="font-bold text-dragon-red"><SafeValue value={drop.quantity} /></span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-parchment-400 italic">
                  <GameIcon name="package" size={32} color="#8B4513" className="opacity-20 mb-2" />
                  <p className="text-[12px]">No significant materials salvaged.</p>
                </div>
              )}

              {/* Mention possible gold drop based on CR */}
              <div className="mt-4 p-3 bg-dragon-gold/5 border border-dragon-gold/20 rounded text-[12px] text-parchment-700 italic">
                <p>Expected treasure value: <span className="font-bold text-yellow-600">
                  {Math.round(Number(monster.challenge_rating || 0) * 50 + Math.random() * 100)} GP
                </span></p>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-5 animate-in fade-in duration-300 text-black font-playfair">
              {monster.special_abilities && monster.special_abilities.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[14px] font-bold uppercase text-dragon-red border-b border-dragon-red/20 flex items-center gap-1.5 font-header tracking-wider">
                    <GameIcon name="sparkles" size={14} color="#8B0000" /> Traits
                  </h4>
                  {monster.special_abilities.map((sa, i) => (
                    <div key={i} className="text-[15px] leading-snug">
                      <span className="text-[16px] font-bold uppercase text-dragon-red font-header"><SafeValue value={sa.name} />.</span> <DiceText text={String(sa.desc || '')} />
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2.5">
                <h4 className="text-[14px] font-bold uppercase text-dragon-red border-b border-dragon-red/20 flex items-center gap-1.5 font-header tracking-wider">
                  <GameIcon name="sword" size={14} color="#8B0000" /> Actions
                </h4>
                {monster.actions?.map((a, i) => {
                  const iconName = a.name?.toLowerCase().includes('multiattack') ? 'multiattack' :
                                  a.name?.toLowerCase().includes('claw') ? 'claw' :
                                  a.name?.toLowerCase().includes('bite') ? 'bite' :
                                  a.name?.toLowerCase().includes('slam') ? 'slam' :
                                  a.name?.toLowerCase().includes('whirlwind') ? 'whirlwind' :
                                  a.name?.toLowerCase().includes('tail') ? 'tail' : null;
                  
                  return (
                    <div key={i} className="text-[15px] leading-snug">
                      <div className="flex items-start gap-2">
                        {iconName && (
                          <div className="mt-1 shrink-0">
                            <GameIcon name={iconName as any} size={14} color="#8B0000" />
                          </div>
                        )}
                        <div>
                          <span className="text-[16px] font-bold uppercase text-dragon-red font-header"><SafeValue value={a.name} />.</span> <DiceText text={String(a.desc || '')} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-auto flex justify-center relative z-10">
        <div className="w-16 h-1 bg-dragon-gold/30 rounded-full" />
      </div>
    </div>
  );
};
