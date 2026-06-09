import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { isBookLike } from '../lib/bookUtils';
import { ChromaKeyImage } from './ChromaKeyImage';
import { useStore } from '../store/useStore';
import { useBookStore } from '../store/useBookStore';
import { GameIcon, GameIconName } from '../game_icons';
import { DiceText } from './dice/DiceText';
import { BookReader } from './bookreader/BookReader';

import { normalizeImageUrl, playSuccessSound } from '../services/storageService';

import { extractBookPages } from '../lib/bookUtils';

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

interface EquipmentCardProps {
  equipment: any;
  className?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, className, isModal, onClose }) => {
  const { setFocusedItem, explorerTab, equipItem, unequipItem, transferItem, activeCharacterId } = useStore();
  const { registerBook, openBook } = useBookStore();
  const [activeTier, setActiveTier] = React.useState<number>(() => {
    // Detect current tier from index
    const tierMatch = equipment?.index?.match(/_(\d)$/);
    return tierMatch ? parseInt(tierMatch[1]) : 0;
  });
  const [isBookOpen, setIsBookOpen] = useState(false);

  if (!equipment) return null;

  const isBook = isBookLike(equipment);

  // Memoize pages for the book reader
  const bookPages = useMemo(() => {
    const currentItem = (equipment.versions && equipment.versions[activeTier]) || equipment;
    const rawPages = extractBookPages(currentItem);
    
    return rawPages.map(p => ({
        ...p,
        content: <div className="font-playfair text-lg leading-relaxed"><Markdown remarkPlugins={[remarkGfm]}>{p.content || ""}</Markdown></div>
    }));
  }, [equipment, activeTier]);

  // Sync tier if selection changes from outer list
  React.useEffect(() => {
    const tierMatch = equipment.index?.match(/_(\d)$/);
    const newTier = tierMatch ? parseInt(tierMatch[1]) : 0;
    if (newTier !== activeTier) {
      setActiveTier(newTier);
    }
  }, [equipment.index]);

  const currentItem = (equipment.versions && equipment.versions[activeTier]) || equipment;

  const handleEquip = () => {
    if (currentItem.slot) {
      const slots = Array.isArray(currentItem.slot) ? currentItem.slot : [currentItem.slot];
      equipItem(currentItem, slots[0]);
      onClose?.();
    }
  };

  const handleTransfer = () => {
    // Basic transfer logic: toggle between active character and party
    // This is a placeholder since we need the sourceId
    onClose?.();
  };

  const rarityColors: { [key: string]: string } = {
    Common: 'border-parchment-400 text-parchment-600',
    Uncommon: 'border-green-600 text-green-700',
    Rare: 'border-blue-600 text-blue-700',
    'Very Rare': 'border-purple-600 text-purple-700',
    Legendary: 'border-dragon-gold text-dragon-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]',
  };

  const renderValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      const best = val.name || val.value || val.label || (typeof val.toString === 'function' && val.toString() !== '[object Object]' ? val.toString() : JSON.stringify(val));
      return typeof best === 'object' ? renderValue(best) : String(best);
    }
    return String(val);
  };

  const currentRarity = renderValue(currentItem.rarity) || 'Common';
  const rawCategory = currentItem.equipment_category?.index || currentItem.equipment_category || '';
  const categoryIndex = (typeof rawCategory === 'object' ? (rawCategory.index || rawCategory.name || '') : String(rawCategory)).replace(/-/g, '_');

  const descriptionMarkdown = Array.isArray(currentItem.desc) 
    ? currentItem.desc.join('\n\n') 
    : renderValue(currentItem.desc) || "No description available.";

  const hasVariants = equipment.versions && Object.keys(equipment.versions).length > 1;

  const handleRead = () => {
    const bookData = {
        id: `book-${currentItem.index}`,
        title: renderValue(currentItem.name),
        author: currentItem.author || 'Ancient Scholar',
        pages: bookPages,
        type: ((currentItem.type === 'note' || currentItem.type === 'map') ? currentItem.type : (isBook ? "tome" : "note")) as any,
        coverIndex: currentItem.coverIndex || 0,
        spineIndex: currentItem.spineIndex || 0
    };
    registerBook(bookData);
    openBook(bookData.id);
  };

  const cardContent = (
    <div className={cn(
      "w-[450px] h-[280px] bg-parchment-100 border-[12px] rounded-[24px] p-4 flex gap-4 relative overflow-hidden shadow-xl transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group",
      rarityColors[currentRarity] || rarityColors.Common,
      className
    )}
    style={{
      backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-dragon-gold/40 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-dragon-gold/40 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-dragon-gold/40 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-dragon-gold/40 rounded-br-lg" />

      {/* Close Button if Modal */}
      {isModal && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-[60] w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors text-black/40 hover:text-black"
        >
          <GameIcon name="close" size={16} color="currentColor" />
        </button>
      )}

      {/* Rarity at the bottom center */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="w-8 h-[1px] bg-dragon-gold/30" />
        <span className="text-[8px] font-bold text-dragon-red uppercase tracking-[0.2em]">{currentRarity}</span>
        <div className="w-8 h-[1px] bg-dragon-gold/30" />
      </div>

      {/* Tier Selector Overlay */}
      {hasVariants && (
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-1">
          {Object.keys(equipment.versions).sort().map(tStr => {
            const t = parseInt(tStr);
            const isSelected = activeTier === t;
            return (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTier(t);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all shadow-sm",
                  isSelected 
                    ? "bg-dragon-red text-white border-dragon-red" 
                    : "bg-parchment-100 text-dragon-red border-dragon-gold/30 hover:bg-parchment-200"
                )}
                title={t === 0 ? 'Base' : t === 1 ? 'Uncommon (+1)' : t === 2 ? 'Rare (+2)' : 'Legendary (+3)'}
              >
                {t === 0 ? 'B' : `+${t}`}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Left Side: Image */}
      <div 
      className="w-1/3 h-full bg-parchment-200 border-2 border-dragon-gold/20 rounded-lg overflow-hidden relative shadow-inner shrink-0 cursor-zoom-in group/image"
      onClick={() => setFocusedItem(currentItem)}
    >
        <div className="absolute inset-0 bg-parchment-300" />
        <img 
          src={ITEM_BACKGROUND}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/10 z-[5]" />
        
        {(currentItem.imageUrl || currentItem.index) ? (
          <div className="absolute inset-0 flex items-center justify-center p-2 z-10 transition-all duration-700" key={activeTier}>
            <motion.div
              layoutId={`item-image-${equipment.index || equipment.name}`}
              className="w-full h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <ChromaKeyImage 
                src={currentItem.imageUrl || normalizeImageUrl(undefined, currentItem._type === 'books' ? 'books' : 'equipment', currentItem.index)} 
                alt={renderValue(currentItem.name) || 'Equipment'} 
                className="h-[90%] w-auto object-contain mx-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)] group-hover/image:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-parchment-400 relative z-20">
            {categoryIndex ? (
              <div className="scale-150 transform">
                <GameIcon name={categoryIndex as any} size={32} color="#8B4513" />
              </div>
            ) : (
              <GameIcon name="items" size={32} color="#8B4513" className="animate-pulse" />
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-dragon-red/0 group-hover/image:bg-dragon-red/10 transition-colors z-20 flex items-center justify-center text-center">
            <div className="flex flex-col items-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                <GameIcon name="info" className="text-white scale-50 group-hover/image:scale-100 duration-300" size={24} color="#FFFFFF" />
                <span className="text-[8px] text-white font-bold uppercase mt-1">Focus in Codex</span>
            </div>
        </div>
      </div>

      {/* Right Side: Info */}
      <div className="flex-1 flex flex-col gap-2 relative z-10">
        <div className="border-b border-dragon-gold/30 pb-1">
          <div className="flex justify-between items-start">
            <h3 className="font-header text-xl font-bold uppercase tracking-tighter text-dragon-darkRed leading-none drop-shadow-sm transition-all" key={currentItem.name}>
              {renderValue(currentItem.name) || 'Unknown Equipment'}
            </h3>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="flex gap-2">
              {currentItem.equipment_category && (
                <div className="flex items-center gap-1.5 bg-dragon-red/5 px-2 py-0.5 rounded border border-dragon-red/10">
                  <GameIcon name={categoryIndex as any} size={12} color="#8B0000" />
                  <span className="text-[9px] font-bold text-parchment-500 uppercase tracking-widest leading-none">
                    {renderValue(currentItem.equipment_category)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Combat Stats Integration */}
            <div className="flex gap-3">
              {/* Transport Stats */}
              {currentItem.speed && (typeof currentItem.speed === 'object') && (currentItem.speed.land || currentItem.speed.water || currentItem.speed.air) && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-900/10 rounded border border-blue-900/20 shadow-sm" key={`speed-${activeTier}`}>
                  <GameIcon name="target" size={10} color="#1E3A8A" />
                  <span className="text-[10px] font-anton text-blue-900 tracking-wider">
                    {currentItem.speed.land && `${renderValue(currentItem.speed.land.quantity)} ${renderValue(currentItem.speed.land.unit)} Land`}
                    {currentItem.speed.water && `${renderValue(currentItem.speed.water.quantity)} ${renderValue(currentItem.speed.water.unit)} Water`}
                    {currentItem.speed.air && `${renderValue(currentItem.speed.air.quantity)} ${renderValue(currentItem.speed.air.unit)} Air`}
                  </span>
                </div>
              )}

              {/* Armor AC */}
              {currentItem.armor_class && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-dragon-red/10 rounded border border-dragon-red/20 shadow-sm" key={`ac-${activeTier}`}>
                  <GameIcon name="armor" size={10} color="#D32F2F" />
                  <span className="text-[10px] font-anton text-dragon-red tracking-wider">
                    AC {renderValue(currentItem.armor_class.base)}
                    {currentItem.armor_class.dex_bonus ? ` + Dex` : ''}
                  </span>
                </div>
              )}
              
              {/* Weapon Damage */}
              {currentItem.damage && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-dragon-red/10 rounded border border-dragon-red/20 shadow-sm" key={`dmg-${activeTier}`}>
                  <GameIcon name="weapon" size={10} color="#D32F2F" />
                  <span className="text-[10px] font-anton text-dragon-red tracking-wider uppercase">
                    <DiceText>{renderValue(currentItem.damage.damage_dice)}</DiceText> {renderValue(currentItem.damage.damage_type)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Read Button for Books */}
        {isBook && (
          <button 
            onClick={handleRead}
            className="absolute top-2 right-2 z-50 w-10 h-10 bg-dragon-gold text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white group/read"
            title="Read Book"
          >
            <GameIcon name="book" size={20} color="#FFFFFF" className="group-hover/read:scale-110 transition-transform" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
          {/* Specialized Info Row */}
          <div className="flex flex-wrap gap-2 mb-1">
            {currentItem.armor_category && currentItem.armor_category !== 'Shield' && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-parchment-200/50 rounded-md border border-dragon-gold/20 text-[9px] font-bold text-dragon-red uppercase tracking-tight">
                <GameIcon name={(String(renderValue(currentItem.armor_category)).toLowerCase() + '_armor') as any} size={10} color="#8B000099" /> 
                <span className="opacity-60">Armor:</span> {renderValue(currentItem.armor_category)}
              </div>
            )}
            {currentItem.armor_category === 'Shield' && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-parchment-200/50 rounded-md border border-dragon-gold/20 text-[9px] font-bold text-dragon-red uppercase tracking-tight">
                <GameIcon name="shields" size={10} color="#8B000099" />
                <span className="opacity-60">Type:</span> Shield
              </div>
            )}
            {currentItem.weapon_category && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-parchment-200/50 rounded-md border border-dragon-gold/20 text-[9px] font-bold text-dragon-red uppercase tracking-tight">
                <GameIcon name="weapon" size={10} color="#8B000099" /> 
                <span className="opacity-60">Weapon:</span> {renderValue(currentItem.weapon_category)} {renderValue(currentItem.weapon_range)}
              </div>
            )}
            {currentItem.range && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-parchment-200/50 rounded-md border border-dragon-gold/20 text-[9px] font-bold text-dragon-red uppercase tracking-tight">
                <GameIcon name="target" size={10} color="#8B000099" /> 
                <span className="opacity-60">Range:</span> {renderValue(currentItem.range.normal)}{currentItem.range.long ? `/${renderValue(currentItem.range.long)}` : ''}ft.
              </div>
            )}
            {currentItem.str_minimum > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-900/10 rounded-md border border-red-900/20 text-[9px] font-bold text-red-900 uppercase tracking-tight">
                <GameIcon name="weight" size={10} color="#7F1D1D99" />
                <span className="opacity-60">Req STR:</span> {renderValue(currentItem.str_minimum)}
              </div>
            )}
            {currentItem.stealth_disadvantage && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-900/10 rounded-md border border-orange-900/20 text-[9px] font-bold text-orange-900 uppercase tracking-tight">
                <GameIcon name="info" size={10} color="#7C2D1299" />
                Stealth Disadv.
              </div>
            )}
            {currentItem.transport_type && (
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-900/10 rounded-md border border-indigo-900/20 text-[9px] font-bold text-indigo-900 uppercase tracking-tight">
                 <GameIcon name={currentItem.transport_type === 'mount' ? 'horse' : 'boat'} size={10} color="#312E8199" />
                 Type: {renderValue(currentItem.transport_type)}
               </div>
            )}
            {currentItem.capacity && (
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-900/10 rounded-md border border-emerald-900/20 text-[9px] font-bold text-emerald-900 uppercase tracking-tight">
                 <GameIcon name="box" size={10} color="#064E3B99" />
                 Capacity: {renderValue(currentItem.capacity.cargo || currentItem.capacity)}
               </div>
            )}
            {currentItem.background_type && (
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-900/10 rounded-md border border-teal-900/20 text-[9px] font-bold text-teal-900 uppercase tracking-tight">
                 <GameIcon name="landscape" size={10} color="#0F766E99" />
                 Env: {renderValue(currentItem.background_type).replace(/_/g, ' ')}
               </div>
            )}
          </div>

          <div className="text-[10px] text-parchment-800 italic leading-relaxed space-y-1 font-body" key={`desc-${activeTier}`}>
            <div className="markdown-body">
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2"><DiceText iconSize={12}>{children}</DiceText></p>,
                  li: ({ children }) => <li className="mb-1"><DiceText iconSize={12}>{children}</DiceText></li>
                }}
              >
                {descriptionMarkdown}
              </Markdown>
            </div>
            
            {/* Package Contents */}
            {currentItem.contents && Array.isArray(currentItem.contents) && (
              <div className="mt-4 pt-3 border-t border-dragon-gold/20">
                 <div className="flex items-center gap-2 mb-2">
                    <GameIcon name="items" size={12} color="#8B0000" className="opacity-60" />
                    <span className="text-[8px] font-black uppercase text-dragon-darkRed tracking-widest leading-none">Pack Contents</span>
                 </div>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 not-italic font-sans text-[9px]">
                    {currentItem.contents.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between border-b border-dragon-gold/5 pb-0.5">
                         <span className="text-parchment-700 capitalize">{renderValue(item.item?.name || item.name)}</span>
                         <span className="font-bold text-dragon-red">x{item.quantity}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {currentItem.properties && currentItem.properties.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1" key={`props-${activeTier}`}>
              {currentItem.properties.map((prop: any, i: number) => (
                <span key={i} className="text-[8px] font-bold uppercase bg-dragon-red/5 text-dragon-red border border-dragon-red/10 px-1.5 py-0.5 rounded">
                  {renderValue(prop)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-1 border-t border-dragon-gold/10 flex justify-between items-center bg-parchment-100/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-parchment-600">
              <GameIcon name="coins" size={10} color="#D97706" />
              <span className="text-[9px] font-bold uppercase tracking-tight">
                {renderValue(currentItem.cost?.quantity)} {renderValue(currentItem.cost?.unit)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-parchment-600">
              <GameIcon name="weight" size={10} color="#8B4513" />
              <span className="text-[9px] font-bold uppercase tracking-tight">
                {renderValue(currentItem.weight)} lb.
              </span>
            </div>
          </div>
          
          {/* Action Buttons for Modal */}
          {isModal && (
            <div className="flex gap-2">
                {isBookLike(currentItem) && (
                    <button 
                        onClick={() => {
                          useStore.getState().setFocusedItem(currentItem);
                          onClose?.();
                        }}
                        className="px-3 py-1 bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <GameIcon name="book" size={10} color="#FFFFFF" />
                        Read
                    </button>
                )}
                {currentItem.slot && (
                    <button 
                        onClick={handleEquip}
                        className="px-3 py-1 bg-dragon-red text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-dragon-darkRed transition-colors shadow-sm"
                    >
                        Equip
                    </button>
                )}
                {(currentItem.vehicle_category || (currentItem as any).transport_type) && (
                    <button 
                        onClick={() => {
                          const { setIsTransportProfileOpen, setFocusedItem } = useStore.getState();
                          setIsTransportProfileOpen(true);
                          setFocusedItem(currentItem);
                          onClose?.();
                        }}
                        className="px-3 py-1 bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <GameIcon name="search" size={10} color="#FFFFFF" />
                        Details
                    </button>
                )}
                {(currentItem.vehicle_category || (currentItem as any).speed) && (
                    <button 
                        onClick={() => {
                          const { addVehicle } = useStore.getState();
                          addVehicle({ 
                            name: currentItem.name, 
                            capacity: typeof currentItem.capacity === 'number' ? currentItem.capacity : parseInt(String(currentItem.capacity || "0")),
                            type: currentItem.vehicle_category || (currentItem as any).type,
                            speed: (currentItem as any).speed
                          });
                          playSuccessSound();
                          onClose?.();
                        }}
                        className="px-3 py-1 bg-dragon-red text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-dragon-darkRed transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <GameIcon name="land_vehicles" size={10} color="#FFFFFF" />
                        Assets
                    </button>
                )}
            </div>
          )}
          
          <div className="w-8 h-0.5 bg-dragon-gold/20 rounded-full ml-auto" />
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
           initial={{ scale: 0.9, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.9, opacity: 0, y: 20 }}
           className="relative z-10"
        >
          {cardContent}
        </motion.div>
      </div>
    );
  }

  return cardContent;
};
