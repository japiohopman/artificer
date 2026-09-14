import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SortableContext,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, ChevronLeft } from 'lucide-react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useUIStore } from '../../store/useUIStore';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { cn } from '../../lib/utils';
import { EquipmentCard } from '../atlas/EquipmentCard';
import { normalizeImageUrl } from '../../services/storageService';
import { calculateDerivedStats, getXpProgress, XP_TABLE, useActiveCharacter } from '../../lib/character';
import { CharacterPanel, CharacterPanelTab } from './panel/CharacterPanel';

export const CharacterProfile: React.FC = () => {
  const { 
    setIsProfileMenuOpen, 
    inspectingItem,
    setInspectingItem
  } = useUIStore();

  const {
    characters,
    activeCharacterId,
    setActiveCharacter,
    deleteCharacter,
    updateCharacter
  } = useCharacterStore();

  const [activeTab, setActiveTab] = useState<CharacterPanelTab>('stats');

  const character = useActiveCharacter();

  if (!character) return null;

  const xpPercentage = getXpProgress(character.level || 1, character.xp || 0);
  const derived = calculateDerivedStats(character);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-[5000] overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-6"
    >
      {/* Navigation Header */}
      <div className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-6 flex justify-between items-center z-[5001] pointer-events-none">
        <button 
          type="button"
          onClick={() => setIsProfileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-dragon-red text-white rounded-sm border-2 border-dragon-gold shadow-2xl hover:scale-105 active:scale-95 transition-all pointer-events-auto group"
          title="Return to Game"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Back to Journey</span>
        </button>

        <button 
          type="button"
          onClick={() => setIsProfileMenuOpen(false)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 text-white/60 flex items-center justify-center border border-white/10 hover:bg-dragon-red hover:text-white hover:border-dragon-gold transition-all pointer-events-auto group"
          title="Close Profile"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
      
      {/* Party Character Tabs */}
      <div className="w-full max-w-[98vw] z-20 shrink-0 mb-2">
        <div className={cn(
          "grid gap-0.5",
          characters.length === 1 ? "grid-cols-1" :
          characters.length === 2 ? "grid-cols-2" :
          characters.length === 3 ? "grid-cols-3" :
          "grid-cols-6"
        )}>
          {characters.map((c, idx) => (
            <SortableCharacterTab
              key={c.id}
              character={c}
              index={idx}
              isSelected={activeCharacterId === c.id}
              onClick={() => setActiveCharacter(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Main Profile Host Screen */}
      <div 
        className="w-full max-w-5xl h-[85vh] rounded border-2 border-dragon-red/20 shadow-2xl relative flex flex-col overflow-hidden font-sans bg-parchment-100"
        style={{
          backgroundImage: `url('/assets/ui/parchment.jpg')`,
          backgroundColor: '#f5ebd0',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none z-[1]" />
        
        {/* Item Action Overlay */}
        {inspectingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
             <div className="pointer-events-auto">
                <EquipmentCard 
                  equipment={inspectingItem.item} 
                  isModal={true} 
                  onClose={() => setInspectingItem(null)} 
                />
             </div>
          </div>
        )}

        {/* Hero Identity Banner */}
        <div className="relative z-10 p-4 sm:p-6 bg-white/40 border-b border-dragon-gold/30 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 bg-stone-900/10 rounded border-2 border-dragon-gold overflow-hidden shrink-0 shadow relative">
              {character.imageUrl || character.avatarUrl ? (
                <ChromaKeyImage
                  src={normalizeImageUrl(character.imageUrl || character.avatarUrl, 'character', character.id)}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dragon-red/40">
                  <GameIcon name="user" size={32} color="currentColor" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="font-header text-2xl sm:text-3xl font-black text-dragon-darkRed uppercase tracking-tight">
                  {character.name}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${character.name}?`)) {
                      deleteCharacter(character.id);
                    }
                  }}
                  className="text-dragon-red/50 hover:text-dragon-red transition-colors"
                  title="Delete Character"
                >
                  <GameIcon name="trash" size={14} color="currentColor" />
                </button>
              </div>

              <p className="text-[10px] sm:text-xs font-bold text-parchment-700 uppercase tracking-widest">
                Level {character.level || 1} {character.race} {character.class} {character.subclass ? `(${character.subclass})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-3 py-1.5 bg-white/60 rounded border border-dragon-gold/30">
              <span className="text-[7px] font-black uppercase text-parchment-500 block">Armor Class</span>
              <span className="text-sm font-header font-black text-dragon-darkRed">{derived.ac}</span>
            </div>
            <div className="px-3 py-1.5 bg-white/60 rounded border border-dragon-gold/30">
              <span className="text-[7px] font-black uppercase text-parchment-500 block">Hit Points</span>
              <span className="text-sm font-header font-black text-dragon-darkRed">{character.hp}/{character.maxHp}</span>
            </div>
            <div className="px-3 py-1.5 bg-white/60 rounded border border-dragon-gold/30">
              <span className="text-[7px] font-black uppercase text-parchment-500 block">Speed</span>
              <span className="text-sm font-header font-black text-dragon-darkRed">{derived.speed} FT</span>
            </div>
          </div>
        </div>

        {/* Main Stage: Canonical Character Panel */}
        <div className="flex-1 p-3 relative z-10 min-h-0">
          <CharacterPanel
            character={character}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isEditable={true}
            onUpdate={(updates) => updateCharacter(character.id, updates)}
          />
        </div>
      </div>
    </motion.div>
  );
};

const SortableCharacterTab: React.FC<{
  character: any;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ character, isSelected, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `tab-${character.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 transition-all flex items-center justify-center px-3 gap-2 relative overflow-hidden rounded-t border-t border-x",
        isSelected
          ? "bg-dragon-red text-white border-dragon-gold shadow"
          : "bg-white/40 border-dragon-gold/20 text-dragon-darkRed hover:bg-white/70 opacity-80"
      )}
    >
      <span className="truncate font-header text-xs font-bold uppercase tracking-tight">
        {character.name ? character.name.split(' ')[0] : 'Hero'}
      </span>
      <span className="text-[8px] font-black opacity-80 uppercase tracking-widest">
        Lvl {character.level || 1}
      </span>
    </button>
  );
};
