import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { useBookStore } from '../../store/useBookStore';
import { ChromaKeyImage } from './ChromaKeyImage';
import { DiceText } from '../dice/DiceText';
import { GameIcon } from '../../game_icons';
import { BookFocus } from '../bookreader/BookFocus';
import { isBookLike } from '../../lib/bookUtils';
import { extractBookPages } from '../../lib/bookUtils';
import { SpellCard } from '../atlas/SpellCard';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const FocusView: React.FC = () => {
  const { focusedItem, setFocusedItem } = useStore();
  const { registerBook, openBook } = useBookStore();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  if (!focusedItem) return null;

  const isBook = isBookLike(focusedItem);

  const handleOpenBook = () => {
    const rawPages = extractBookPages(focusedItem);
    const bookData = {
        id: `book-${focusedItem.index || focusedItem.name}`,
        title: renderValue(focusedItem.name),
        author: focusedItem.author || 'Ancient Scholar',
        pages: rawPages.map(p => ({
            ...p,
            content: <div className="font-playfair text-lg leading-relaxed"><Markdown remarkPlugins={[remarkGfm]}>{p.content || ""}</Markdown></div>
        })),
        type: ((focusedItem.type === 'note' || focusedItem.type === 'map') ? focusedItem.type : (isBook ? "tome" : "note")) as any,
        coverIndex: focusedItem.coverIndex || 0,
        spineIndex: focusedItem.spineIndex || 0
    };
    registerBook(bookData);
    openBook(bookData.id);
    setFocusedItem(null); // Close focus view when opening the reader
  };

  const isSpell = focusedItem._type === 'spells' || focusedItem.level !== undefined;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position relative to center
    // Dividing by 15 for a subtle but noticeable tilt
    const rotateX = (y - centerY) / 15; 
    const rotateY = (centerX - x) / 15; 
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const renderValue = (val: any) => {
    if (!val) return null;
    if (typeof val === 'object') return val.name || val.value || JSON.stringify(val);
    return val;
  };

  const currentRarity = focusedItem.rarity || 'Common';

  return (
    <AnimatePresence>
      {focusedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
          onClick={() => setFocusedItem(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
            onClick={() => setFocusedItem(null)}
          >
            <GameIcon name="close" size={40} />
          </button>

          {/* Focused Item Content Area */}
          {isBook ? (
             <BookFocus 
                book={{
                    id: `book-${focusedItem.index || focusedItem.name}`,
                    title: renderValue(focusedItem.name),
                    author: focusedItem.author || 'Ancient Scholar',
                    type: ((focusedItem.type === 'note' || focusedItem.type === 'map') ? focusedItem.type : "tome") as any,
                    coverIndex: focusedItem.coverIndex || 0,
                    spineIndex: focusedItem.spineIndex || 0
                }}
                onOpen={handleOpenBook}
                onClose={() => setFocusedItem(null)}
             />
          ) : isSpell ? (
            <div className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col items-center justify-center relative z-10 overflow-hidden">
               <div className="scale-110 md:scale-125 origin-center">
                  <SpellCard spell={focusedItem} />
               </div>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10 overflow-hidden">
              
              {/* Left Side: Responsive Image Container */}
              <div className="flex-1 flex items-center justify-center perspective-[1000px] w-full h-full max-h-[60vh]">
                <motion.div
                  ref={cardRef}
                  layoutId={`item-image-${focusedItem.index || focusedItem.name}`}
                  className="relative w-full max-w-[320px] aspect-[2/3] flex items-center justify-center group/card"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {focusedItem.imageUrl ? (
                    <div className="relative z-10 w-full h-full p-2 flex items-center justify-center" style={{ transform: 'translateZ(50px)' }}>
                      <ChromaKeyImage 
                        src={focusedItem.imageUrl} 
                        alt={renderValue(focusedItem.name)} 
                        className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                  ) : (
                    <GameIcon name="package" size={120} color="#D4AF37" className="opacity-20" />
                  )}
                </motion.div>
              </div>

              {/* Right Side: Thinner Info Panel */}
              <div 
                className="w-full md:w-[380px] h-full max-h-[70vh] flex flex-col z-[110] select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <h2 className="font-header text-4xl md:text-5xl font-bold tracking-tight text-white lowercase">
                    {renderValue(focusedItem.name)}
                  </h2>
                  <hr className="border-t-2 border-dragon-red my-4 opacity-80" />
                </div>
                
                {/* Scrollable Description (No Scrollbar) */}
                <div className="flex-1 overflow-y-auto scrollbar-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <div className="font-quintessential text-white text-2xl leading-relaxed italic">
                        {focusedItem.desc && Array.isArray(focusedItem.desc) ? (
                          focusedItem.desc.map((line: any, i: number) => (
                            <p key={i} className="mb-6"><DiceText iconSize={36}>{renderValue(line)}</DiceText></p>
                          ))
                        ) : (
                          <p><DiceText iconSize={36}>{renderValue(focusedItem.desc) || "No description available."}</DiceText></p>
                        )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Minimal Footer for Stats */}
          <div 
            className="w-full h-24 flex-none border-t border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-16 relative z-[105]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 group">
              <GameIcon name="coins" size={20} color="#D4AF37" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Value</span>
                <span className="text-xl font-header text-white">
                  {renderValue(focusedItem.cost?.quantity)} {renderValue(focusedItem.cost?.unit)}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-3 group">
              <GameIcon name="weight" size={20} color="#FFFFFF" className="opacity-40" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Weight</span>
                <span className="text-xl font-header text-white">
                  {renderValue(focusedItem.weight)} LB.
                </span>
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
