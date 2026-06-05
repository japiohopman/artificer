import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Book } from '../../types';
import { getIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

interface BookFocusProps {
  book: Book;
  onOpen: () => void;
  onClose: () => void;
}

export const BookFocus: React.FC<BookFocusProps> = ({ book, onOpen, onClose }) => {
  // Icons
  const BookOpenIcon = getIcon('ui', 'book-open');
  const CloseIcon = getIcon('ui', 'close');

  if (!book) return null;

  // --- SPRITE CONFIGURATION ---
  const FRONT_SPRITE_URL_BOOK = "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fapp-uploads.krea.ai%2F9678081a-d6a5-4cb1-8e01-1019733c1706%2F1764947885074-book_covers.webp";
  const FRONT_SPRITE_URL_LEGACY = "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fgen.krea.ai%2Fimages%2F7c155055-027b-4320-b745-ba801ba3bf67.png";
  const BACK_SPRITE_URL = "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fapp-uploads.krea.ai%2F9678081a-d6a5-4cb1-8e01-1019733c1706%2F1764947885074-book_covers.webp";
  const SPINE_SPRITE_URL = "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fapp-uploads.krea.ai%2F9678081a-d6a5-4cb1-8e01-1019733c1706%2F1764840175930-spines%25201.webp";
  
  const COLS = 5;

  const getTextureStyle = (type: 'front' | 'back' | 'spine') => {
    // 1. Custom URL Overrides
    if (type === 'front' && book.coverImage) {
        return {
            backgroundImage: `url('${book.coverImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    if (type === 'back' && book.backCoverImage) {
        return {
            backgroundImage: `url('${book.backCoverImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    if (type === 'spine' && book.spineImage) {
        return {
             backgroundImage: `url('${book.spineImage}')`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
        };
    }

    // 2. Sprite Sheet Fallbacks
    const index = (type === 'front' ? book.coverIndex : 
                   type === 'back' ? (book.backCoverIndex ?? book.coverIndex) : 
                   (book.spineIndex ?? book.coverIndex)) || 0;
    
    let url = "";
    if (type === 'front') url = book.type === 'magazine' ? FRONT_SPRITE_URL_LEGACY : FRONT_SPRITE_URL_BOOK;
    else if (type === 'back') url = BACK_SPRITE_URL;
    else url = SPINE_SPRITE_URL;

    if (!url) return {};

    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const xPos = col * (100 / (COLS - 1)); 
    const yPos = row * 33.3333;

    return {
      backgroundImage: `url('${url}')`,
      backgroundSize: '500% 400%',
      backgroundPosition: `${xPos}% ${yPos}%`,
    };
  };

  // Helper for the Paper Texture (Sprite Zero of Spine Sheet)
  const getPaperStyle = () => {
    return {
        backgroundImage: `url('${SPINE_SPRITE_URL}')`,
        backgroundSize: '500% 400%',
        backgroundPosition: '0% 0%', // Index 0 (Top-Left) is the Paper Texture
    };
  };

  // Dimensions based on type
  const isThin = book.type === 'note' || book.type === 'map';
  const isMedium = book.type === 'magazine';
  
  // FIX: Solid block construction to prevent holes
  // Thickness varies by type, but page thickness matches cover thickness to avoid gaps.
  const THICKNESS = isThin ? 4 : (isMedium ? 16 : 50); 
  const HALF_THICKNESS = THICKNESS / 2;
  const PAGE_THICKNESS = THICKNESS; // Flush edges = no holes
  const HALF_PAGE_THICKNESS = PAGE_THICKNESS / 2;

  // Motion physics for rotation
  const rotateY = useMotionValue(0);
  const rotateYSpring = useSpring(rotateY, { stiffness: 50, damping: 15, mass: 1 });
  
  const shineOpacity = useTransform(rotateYSpring, (value) => {
      const normalized = (value % 360);
      const dist = Math.abs(normalized - 30);
      return Math.max(0, 1 - dist / 50) * 0.4;
  });

  const handleWheel = (e: React.WheelEvent) => {
      const newRotate = rotateY.get() + e.deltaY * 0.2;
      rotateY.set(newRotate);
  };

  useEffect(() => {
    rotateY.set(0);
  }, [book, rotateY]);
  
  // Determine aspect ratio class
  let aspectRatioClass = 'aspect-[3/4]'; // Default for books
  if (book.type === 'map') aspectRatioClass = 'aspect-[2/3]'; // Maps keep old ratio or square in logic, keeping 2/3 for standard map item look in 3D
  if (book.type === 'magazine') aspectRatioClass = 'aspect-[2/3]'; // Magazines use legacy ratio

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" onWheel={handleWheel}>
        
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-950/95 backdrop-blur-2xl z-0"
            onClick={onClose}
        />

        <div className="absolute top-8 right-8 z-50">
            <button onClick={onClose} className="p-3 bg-stone-800 text-parchment-200 rounded-full hover:bg-red-900/50 transition-colors">
                <CloseIcon size={24} />
            </button>
        </div>

        {/* 2-Column Layout Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 w-full max-w-7xl p-8 z-10 pointer-events-none">

            {/* LEFT COLUMN: 3D BOOK */}
            <div className="perspective-2000 w-full max-w-sm">
                <motion.div 
                    className={cn("relative w-full cursor-grab active:cursor-grabbing pointer-events-auto preserve-3d", aspectRatioClass)}
                initial={{ scale: 0.8, x: -50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0.8, x: -50, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.8 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDrag={(e, info) => {
                    rotateY.set(rotateY.get() + info.delta.x * 0.5);
                }}
            >
                <motion.div 
                    className="w-full h-full preserve-3d relative"
                    style={{ rotateY: rotateYSpring }}
                >
                     {/* Depth/Thickness Sides */}
                     {/* RIGHT SIDE (PAGES) */}
                     <div 
                        className="absolute top-0 bottom-0 right-0 backface-hidden"
                        style={{ 
                            width: `${PAGE_THICKNESS}px`,
                            transformOrigin: 'right',
                            transform: `translateZ(${HALF_THICKNESS}px) rotateY(90deg)`,
                            ...getPaperStyle()
                        }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                     </div>

                     {/* LEFT SIDE (SPINE) */}
                     <div 
                        className="absolute top-0 bottom-0 left-0 overflow-hidden backface-hidden"
                        style={{ 
                            width: `${THICKNESS}px`,
                            backgroundColor: isThin ? '#f5f0e6' : '#4e342e',
                            transformOrigin: 'left',
                            transform: `translateZ(${HALF_THICKNESS}px) rotateY(-90deg)`,
                            ...(isThin ? getPaperStyle() : getTextureStyle('spine'))
                        }}
                     >
                         {!isThin && (
                             <div className="absolute inset-0 bg-black/40 pointer-events-none mix-blend-multiply" />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
                     </div>

                     {/* TOP SIDE */}
                     <div 
                        className="absolute left-0 right-0 backface-hidden"
                        style={{ 
                            top: 0,
                            height: `${PAGE_THICKNESS}px`,
                            transformOrigin: 'top',
                            transform: `translateZ(${HALF_THICKNESS}px) rotateX(-90deg)`,
                            ...getPaperStyle()
                        }}
                     >
                         <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
                     </div>

                     {/* BOTTOM SIDE */}
                     <div 
                        className="absolute left-0 right-0 backface-hidden"
                        style={{ 
                            bottom: 0,
                            height: `${PAGE_THICKNESS}px`,
                            transformOrigin: 'bottom',
                            transform: `translateZ(${HALF_THICKNESS}px) rotateX(90deg)`,
                            ...getPaperStyle()
                        }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                     </div>

                     {/* --- FRONT FACE --- */}
                     <div 
                        className="absolute inset-0 z-20 rounded-r-md backface-hidden bg-stone-900"
                        style={{ 
                            ...getTextureStyle('front'), 
                            transform: `translateZ(${HALF_THICKNESS}px)`
                        }}
                     >
                        <div className="absolute inset-0 border border-white/10 rounded-r-md" />
                        <motion.div 
                            style={{ opacity: shineOpacity }}
                            className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none mix-blend-overlay" 
                        />
                        {!isThin && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/60 to-transparent mix-blend-multiply" />}
                     </div>

                     {/* --- BACK FACE --- */}
                     <div 
                        className="absolute inset-0 z-10 rounded-l-md backface-hidden bg-stone-900"
                        style={{ 
                            ...getTextureStyle('back'), 
                            transform: `rotateY(180deg) translateZ(${HALF_THICKNESS}px)`
                        }}
                     >
                        <div className="absolute inset-0 bg-paper-texture opacity-30 mix-blend-multiply" />
                        {!isThin && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/60 to-transparent mix-blend-multiply" />}
                     </div>
                </motion.div>
            </motion.div>
        </div>

            {/* RIGHT COLUMN: INFO */}
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg pointer-events-auto"
            >
                <h2 className="font-display text-4xl md:text-6xl text-parchment-100 drop-shadow-xl mb-2 leading-tight">{book.title}</h2>
                <p className="font-serif text-parchment-400 italic text-lg mb-8">By {book.author}</p>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button 
                        onClick={onOpen}
                        className="group relative px-8 py-3 bg-parchment-400 text-stone-900 font-display text-xl tracking-wider rounded-sm shadow-[0_0_15px_rgba(212,197,166,0.3)] hover:bg-parchment-300 hover:scale-105 transition-all flex items-center justify-center gap-3 overflow-hidden w-full md:w-auto"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <BookOpenIcon size={20} /> Open {book.type === 'note' ? 'Note' : (book.type === 'map' ? 'Map' : 'Book')}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>
            </motion.div>
        </div>

    </div>
  );
};
