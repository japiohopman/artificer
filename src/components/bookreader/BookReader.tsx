import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { playClickSound } from '../../services/storageService';
import { Book } from '../../types';
import { PageView, PageData, BookViewState, BookReaderSettings } from './PageView';
import { GameIcon } from '../../game_icons';

export type BookPage = PageData;

interface BookReaderProps {
  book: Book & { spells?: any[] };
  initialPageIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  inline?: boolean;
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  initialPageIndex = 0,
  isOpen,
  onClose,
  className,
  inline = false
}) => {
  const { title, type, spells, description, pages: propPages } = book;
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [settings] = useState<BookReaderSettings>({
    fontSize: 1,
    fontFamily: 'serif',
    lineHeight: 1.6
  });

  // Total pages
  const allPages = useMemo(() => {
    let basePages: PageData[] = [];
    
    if (propPages && propPages.length > 0) {
      basePages = propPages.map((p, i) => ({
        index: i,
        chapterTitle: p.title || '',
        text: p.text || (typeof p.content === 'string' ? p.content : ''),
        image: p.image,
        content: p.content
      }));
    } else if (type === 'spellbook' && spells) {
      basePages = spells.map((s, i) => ({
        index: i,
        chapterTitle: typeof s === 'string' ? s : s.name,
        text: s.desc ? (Array.isArray(s.desc) ? s.desc.join('\n\n') : s.desc) : "The ink swirls in familiar patterns...",
        image: s.imageUrl ? { src: s.imageUrl, placement: 'top-right' } : undefined
      }));
    } else {
      const descText = Array.isArray(description) ? description.join('\n\n') : (description || "");
      basePages = [{
        index: 0,
        text: descText || "This volume appears to be silent for now..."
      }];
    }
    return basePages;
  }, [propPages, spells, description, type]);

  // Total spreads = 1 (front) + ceil(pages / 2) + 1 (back)
  const totalSpreads = useMemo(() => {
    return 1 + Math.ceil((allPages?.length || 0) / 2) + 1;
  }, [allPages.length]);

  useEffect(() => {
    if (initialPageIndex > 0) {
        const spread = Math.floor(initialPageIndex / 2) + 1;
        setCurrentSpread(Math.min(spread, totalSpreads - 1));
    }
  }, [initialPageIndex, totalSpreads]);

  const getPagesForSpread = (spreadIndex: number) => {
    if (spreadIndex === 0) return { left: undefined, right: undefined, state: 'front-cover' as BookViewState };
    if (spreadIndex === totalSpreads - 1) return { left: undefined, right: undefined, state: 'back-cover' as BookViewState };
    
    const leftIdx = (spreadIndex - 1) * 2;
    const rightIdx = leftIdx + 1;
    
    return {
      left: allPages[leftIdx],
      right: allPages[rightIdx],
      state: 'spread' as BookViewState
    };
  };

  const currentData = getPagesForSpread(currentSpread);

  const handleNext = () => {
    if (currentSpread < totalSpreads - 1 && !isTurning) {
      setTurnDirection('forward');
      setIsTurning(true);
      playClickSound();
      
      setTimeout(() => {
        setCurrentSpread(prev => prev + 1);
        setIsTurning(false);
      }, 800);
    }
  };

  const handlePrev = () => {
    if (currentSpread > 0 && !isTurning) {
      setTurnDirection('backward');
      setIsTurning(true);
      playClickSound();
      
      setTimeout(() => {
        setCurrentSpread(prev => prev - 1);
        setIsTurning(false);
      }, 800);
    }
  };

  if (!isOpen) return null;

  const containerClasses = inline 
    ? cn("relative w-full h-full flex items-center justify-center p-4 select-none", className)
    : cn("fixed inset-0 z-[15000] flex items-center justify-center bg-stone-950/90 backdrop-blur-xl p-4 md:p-8 select-none", className);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={containerClasses}
    >
      {/* HUD / Overlay Controls */}
      <div className={cn(
          "absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-[12000] pointer-events-none transition-colors",
          !inline && "bg-stone-900/10 backdrop-blur-md border-b border-white/5",
          inline && "opacity-60 h-auto p-2"
      )}>
        <div className="flex items-center gap-6 pointer-events-auto">
          {!inline && (
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-800/50 hover:bg-stone-700/50 text-parchment-200 rounded-md transition-all border border-white/10 group"
            >
              <GameIcon name="direction_left" size={18} color="currentColor" className="transition-transform group-hover:-translate-x-1" />
              <span className="font-header text-sm tracking-widest uppercase text-dragon-gold">Back</span>
            </button>
          )}

          <div className="flex flex-col">
            <h1 className="text-parchment-100 font-header text-sm md:text-lg tracking-tighter uppercase line-clamp-1">{title}</h1>
            <div className="flex items-center gap-2 opacity-50 text-[8px] font-bold text-parchment-400 uppercase tracking-widest leading-none">
                <span>{type}</span>
                <span className="w-1 h-1 rounded-full bg-current" />
                <span>Spread {currentSpread} of {totalSpreads - 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Top right buttons removed as requested to keep UI clean and consistent with the new navigation pattern */}
        </div>
      </div>

      {/* Pages View Area */}
      <div className={cn(
          "relative w-full h-full flex flex-col items-center justify-center transition-all duration-700",
          (isFullscreen || inline) ? "max-w-none" : "max-w-7xl"
      )}>
          <PageView 
            book={book}
            viewState={currentData.state}
            leftPage={currentData.left}
            rightPage={currentData.right}
            nextLeftPage={currentSpread < totalSpreads - 1 ? getPagesForSpread(currentSpread + 1).left : undefined}
            nextRightPage={currentSpread < totalSpreads - 1 ? getPagesForSpread(currentSpread + 1).right : undefined}
            prevLeftPage={currentSpread > 0 ? getPagesForSpread(currentSpread - 1).left : undefined}
            prevRightPage={currentSpread > 0 ? getPagesForSpread(currentSpread - 1).right : undefined}
            isTurning={isTurning}
            turnDirection={turnDirection}
            settings={settings}
            onNextPage={handleNext}
            onPrevPage={handlePrev}
          />
      </div>

      {/* Bottom Spread Bar */}
      <div className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-[12000]",
          !inline && "bottom-8 gap-1.5"
      )}>
          {Array.from({ length: totalSpreads }).map((_, idx) => (
             <button
                key={idx}
                onClick={() => {
                   if (idx !== currentSpread && !isTurning) {
                      setTurnDirection(idx > currentSpread ? 'forward' : 'backward');
                      setIsTurning(true);
                      setTimeout(() => {
                         setCurrentSpread(idx);
                         setIsTurning(false);
                      }, 800);
                   }
                }}
                className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    idx === currentSpread 
                        ? "bg-dragon-gold w-6 shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
                        : "bg-white/10 hover:bg-white/30",
                    !inline && idx === currentSpread && "w-8"
                )}
             />
          ))}
      </div>
    </motion.div>
  );
};
