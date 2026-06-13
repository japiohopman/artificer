import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Book, BookType } from '../../types';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { fetchLanguageData, REPO, BRANCH } from '../../services/storageService';
import { injectFontFace, getLanguageFontFamily } from '../../lib/fontLoader';

export type BookViewState = 'front-cover' | 'back-cover' | 'single-sheet' | 'spread';

export interface BookReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans';
  lineHeight: number;
}

export interface PageData {
    index: number;
    chapterTitle?: string;
    text: string;
    image?: {
        src?: string;
        sheet?: 'species1' | 'species2';
        spriteIndex?: number;
        placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'full';
        caption?: string;
        filters?: {
            sepia?: number;
            brightness?: number;
            contrast?: number;
            grayscale?: number;
            saturate?: number;
            hueRotate?: number;
        };
        aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide';
    };
}

const COVERS = {
    FRONT_SPRITE_BOOK: "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fapp-uploads.krea.ai%2F9678081a-d6a5-4cb1-8e01-1019733c1706%2F1764947885074-book_covers.webp",
    FRONT_SPRITE_LEGACY: "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fgen.krea.ai%2Fimages%2F7c155055-027b-4320-b745-ba801ba3bf67.png",
    BACK_SPRITE: "https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fapp-uploads.krea.ai%2F9678081a-d6a5-4cb1-8e01-1019733c1706%2F1764947885074-book_covers.webp"
};


interface PageViewProps {
  book: Book;
  viewState: BookViewState;
  leftPage?: PageData;
  rightPage?: PageData;
  nextLeftPage?: PageData;
  nextRightPage?: PageData;
  prevLeftPage?: PageData;
  prevRightPage?: PageData;
  isTurning: boolean;
  turnDirection?: 'forward' | 'backward';
  settings: BookReaderSettings;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

const useLanguageFont = (languageIndex?: string) => {
    const [loading, setLoading] = useState(false);
    const [fontLoaded, setFontLoaded] = useState(false);

    useEffect(() => {
        if (!languageIndex) return;

        const load = async () => {
            setLoading(true);
            try {
                const langData = await fetchLanguageData(languageIndex);
                if (langData && langData.ttf) {
                    const fontFamily = getLanguageFontFamily(languageIndex);
                    // Handle potential path prefix in data
                    let ttfUrl = langData.ttf;
                    
                    // If it points to public/ in the repo, we should use the raw github URL
                    if (ttfUrl.startsWith('public/')) {
                      const path = ttfUrl.replace('public/', '');
                      ttfUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/${path}`;
                    }
                    
                    injectFontFace(fontFamily, ttfUrl);
                    setFontLoaded(true);
                }
            } catch (e) {
                console.error("Failed to load language font", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [languageIndex]);

    return { loading, fontLoaded };
};

const CoverView = ({ book, type }: { book: Book, type: 'front' | 'back' }) => {
    const isMedium = book.type === 'magazine';
    const isFront = type === 'front';

    const getCoverStyle = () => {
        if (isFront && book.coverImage) {
            return { backgroundImage: `url('${book.coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        if (!isFront && book.backCoverImage) {
            return { backgroundImage: `url('${book.backCoverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        
        const url = isFront 
            ? (book.type === 'magazine' ? COVERS.FRONT_SPRITE_LEGACY : COVERS.FRONT_SPRITE_BOOK)
            : COVERS.BACK_SPRITE;

        const index = isFront ? book.coverIndex : (book.backCoverIndex ?? book.coverIndex);
        const COLS = 5;
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const xPos = col * 25; 
        const yPos = row * 33.3333;

        return {
            backgroundImage: `url('${url}')`,
            backgroundSize: '500% 400%',
            backgroundPosition: `${xPos}% ${yPos}%`,
        };
    };

    return (
        <div className={cn(
            "relative w-full h-full shadow-2xl bg-stone-900 overflow-hidden",
            isFront ? 'rounded-r-sm border-l-4' : 'rounded-l-sm border-r-4',
            isMedium ? 'border-stone-800' : 'border-stone-900'
        )}>
             <div className="absolute inset-0" style={getCoverStyle()} />
             <div className={cn("absolute inset-0 border border-white/5", isFront ? 'rounded-r-sm' : 'rounded-l-sm')} />
             <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-white/5 mix-blend-overlay" />
             <div className={cn(
                "absolute top-0 bottom-0 w-8 bg-gradient-to-r mix-blend-multiply",
                isFront ? 'left-0 from-black/60 to-transparent' : 'right-0 from-transparent to-black/60'
             )} />
             
             {isFront && !book.coverImage && (
                 <div className="absolute inset-0 flex flex-col items-center justify-start pt-12 px-8 z-20 pointer-events-none">
                     <h1 className="font-header text-3xl md:text-5xl text-parchment-200 drop-shadow-md tracking-widest leading-tight text-center uppercase">{book.title}</h1>
                     <div className="w-16 h-1 bg-parchment-400/50 my-4" />
                     <p className="font-playfair text-parchment-400 italic text-lg mb-8">{book.author}</p>
                 </div>
             )}
        </div>
    );
};

const InsideCover = ({ type }: { type: 'front' | 'back' }) => (
    <div className={cn("w-full h-full bg-stone-800 relative overflow-hidden", type === 'front' ? 'rounded-l-sm' : 'rounded-r-sm')}>
        <div className="absolute inset-0 bg-paper-texture opacity-20" />
        <div className={cn("absolute inset-0 border-[20px] border-stone-900/50", type === 'front' ? 'border-r-0' : 'border-l-0')} />
        <div className={cn("absolute top-0 bottom-0 w-4 bg-black/30 blur-sm", type === 'front' ? 'right-0' : 'left-0')} />
    </div>
);

const SinglePageContent = ({ 
    page, 
    settings, 
    side, 
    bookType = 'book',
    bookTitle,
    bookAuthor,
    language
}: any) => {
  const { characters, activeCharacterId } = useCharacterStore();
  const character = characters.find(c => c.id === activeCharacterId) || characters[0];
  const knowsLanguage = !language || (character?.languages || []).includes(language.toLowerCase());
  const { fontLoaded } = useLanguageFont(knowsLanguage ? undefined : language);

  if (!page) return <div className="w-full h-full bg-parchment-200" />;

  let fontFamily = settings.fontFamily === 'sans' ? 'var(--font-sans)' : 'var(--font-playfair)';
  if (language && !knowsLanguage && fontLoaded) {
      fontFamily = `'${getLanguageFontFamily(language)}', serif`;
  }
  const finalFontSize = `${settings.fontSize}rem`;

  const imgData = page.image;
  let imageElement = null;
  let fullPageBg = null;
  const isFullBleed = imgData?.placement === 'full';
  
  if (imgData) {
      const placement = imgData.placement || 'top-right';
      const filterString = imgData.filters ? 
          `sepia(${imgData.filters.sepia ?? 0}%) brightness(${imgData.filters.brightness ?? 100}%) contrast(${imgData.filters.contrast ?? 100}%) grayscale(${imgData.filters.grayscale ?? 0}%) saturate(${imgData.filters.saturate ?? 100}%) hue-rotate(${imgData.filters.hueRotate ?? 0}deg)` 
          : 'sepia(40%)';

      if (placement === 'full' && imgData.src) {
           const bgStyle = { backgroundImage: `url('${imgData.src}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
           fullPageBg = (
               <div className="absolute inset-0 z-0 select-none overflow-hidden">
                   <div className="w-full h-full opacity-90 mix-blend-multiply" style={{ ...bgStyle, filter: filterString }} />
                   <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none opacity-20" />
               </div>
           );
      } else {
          let containerClasses = "relative mb-6 border-4 border-stone-900/10 shadow-md bg-parchment-300 transition-all";
          if (placement === 'top-left') containerClasses += " float-left mr-6 mb-4 mt-2";
          else if (placement === 'top-right') containerClasses += " float-right ml-6 mb-4 mt-2";

          if (imgData.src) {
               let aspectRatioClass = "aspect-square";
               if (imgData.aspectRatio === 'portrait') aspectRatioClass = "aspect-[2/3]";
               if (imgData.aspectRatio === 'landscape') aspectRatioClass = "aspect-[3/2]";
               imageElement = (
                  <div className={cn(containerClasses, aspectRatioClass, "w-1/2")}>
                       <img src={imgData.src} alt="illustration" className="w-full h-full object-cover" style={{ filter: filterString }} />
                  </div>
               );
          }
      }
  }

  const isNote = bookType === 'note';
  const isMap = bookType === 'map';
  
  let paddingClass = "px-12 md:px-16 py-16";
  if (side === 'left') paddingClass += " md:pr-20";
  if (side === 'right') paddingClass += " md:pl-20";
  if (isNote) paddingClass = "p-12 bg-parchment-50";

  const headerText = side === 'left' ? bookTitle : (page.chapterTitle || bookTitle);
  const footerText = side === 'left' ? (page.index + 1) : bookAuthor;

  return (
    <div className={cn(
        "w-full min-h-full flex flex-col relative overflow-hidden",
        side === 'left' ? 'rounded-l-sm' : 'rounded-r-sm',
        paddingClass,
        "bg-parchment-100"
    )}>
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply z-0 bg-paper-texture" />
      {fullPageBg}
      
      {(side === 'left' || side === 'right') && !isMap && (
          <div className={cn(
              "absolute top-0 bottom-0 w-16 pointer-events-none z-10 mix-blend-multiply opacity-15",
              side === 'left' ? 'right-0 bg-gradient-to-l from-black' : 'left-0 bg-gradient-to-r from-black'
          )} />
      )}
      
      {/* Header */}
      {!isNote && !isMap && (
          <div className="absolute top-0 left-0 right-0 h-16 flex items-end justify-center pb-3 z-30 pointer-events-none">
              <span className="font-header text-[9px] uppercase tracking-[0.2em] text-stone-800/40 border-b border-stone-800/5 pb-1 px-6">
                  {headerText}
              </span>
          </div>
      )}

      {/* Content */}
      <div className={cn("relative z-20 flex-1 flex flex-col pt-8")}>
          <div className="flex-1 text-stone-900" style={{ fontSize: finalFontSize, fontFamily: fontFamily }}>
             {imageElement}
             {page.content ? (
                 <div className="w-full h-full">
                    {page.content}
                 </div>
             ) : (
                <div className="markdown-body font-playfair leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {Array.isArray(page.text) ? page.text.join('\n\n') : (page.text || "")}
                    </ReactMarkdown>
                </div>
             )}
          </div>
      </div>

      {/* Footer */}
      {!isNote && !isMap && (
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-start justify-center pt-2 z-30 pointer-events-none">
               <span className="font-header text-[9px] uppercase tracking-widest text-stone-800/40">
                  {side === 'left' ? `— ${footerText} —` : <span className="italic">{footerText}</span>}
               </span>
          </div>
      )}
    </div>
  );
};

export const PageView: React.FC<PageViewProps> = ({ 
    book,
    viewState,
    leftPage, 
    rightPage,
    nextLeftPage,
    nextRightPage,
    prevLeftPage,
    prevRightPage,
    isTurning, 
    turnDirection = 'forward',
    settings,
    onNextPage,
    onPrevPage
}) => {
    
  const isBackward = isTurning && turnDirection === 'backward';
  const isForward = isTurning && turnDirection === 'forward';
  
  const isFrontCover = viewState === 'front-cover';
  const isBackCover = viewState === 'back-cover';

  const isMagazine = book.type === 'magazine';
  const spreadAspectRatio = isMagazine ? 'aspect-[4/3]' : 'aspect-[3/2]';

  // Animation logic
  let xOffset = '0%';
  if (isFrontCover) xOffset = '-25%';
  if (isBackCover) xOffset = '25%';
  if (isTurning && turnDirection === 'backward' && !prevLeftPage) xOffset = '-25%';
  if (isTurning && turnDirection === 'forward' && !nextLeftPage && !nextRightPage) xOffset = '25%';

  // Flap Content
  let flapFront: React.ReactNode = null;
  if (isForward) {
      if (isFrontCover) flapFront = <CoverView book={book} type="front" />;
      else flapFront = <SinglePageContent page={rightPage} settings={settings} side="right" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />;
  } else if (isBackward) {
      if (isBackCover) flapFront = <CoverView book={book} type="back" />;
      else flapFront = <SinglePageContent page={leftPage} settings={settings} side="left" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />;
  }

  let flapBack: React.ReactNode = null;
  if (isForward) {
      if (!nextLeftPage && !nextRightPage) flapBack = <CoverView book={book} type="back" />;
      else flapBack = <SinglePageContent page={nextLeftPage} settings={settings} side="left" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />;
  } else if (isBackward) {
      if (!prevLeftPage && !prevRightPage) flapBack = <CoverView book={book} type="front" />;
      else flapBack = <SinglePageContent page={prevRightPage} settings={settings} side="right" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />;
  }

  // Underneath Content
  let underLeft: React.ReactNode = null;
  if (isBackward && (prevLeftPage || prevRightPage)) {
      underLeft = <SinglePageContent page={prevLeftPage} settings={settings} side="left" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />;
  }

  let underRight: React.ReactNode = null;
  if (isForward && (nextLeftPage || nextRightPage)) {
      underRight = <SinglePageContent page={nextRightPage} settings={settings} side="right" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />;
  }

  const isLeftPageVisible = !isFrontCover && !(isTurning && turnDirection === 'backward' && !prevLeftPage);
  const isRightPageVisible = !isBackCover && !(isTurning && turnDirection === 'forward' && !nextLeftPage && !nextRightPage);

  return (
    <div className="relative w-full h-full flex justify-center items-center perspective-2000">
      <motion.div 
        className={cn("relative w-full max-w-5xl h-[85%] flex shadow-2xl bg-transparent rounded-md", spreadAspectRatio)}
        animate={{ x: xOffset }}
        transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1.000] }}
      >
        {/* Navigation Layers */}
        {!isTurning && (
            <>
                <div onClick={onPrevPage} className="absolute inset-y-0 left-0 w-1/2 z-50 cursor-pointer" />
                <div onClick={onNextPage} className="absolute inset-y-0 right-0 w-1/2 z-50 cursor-pointer" />
            </>
        )}

        {/* LEFT PAGE SLOT */}
        <div className={cn("flex-1 relative preserve-3d", isBackward ? 'z-30' : 'z-10')}>
            {/* Spine Gutter Shadow overlaying the left page right edge */}
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/20 to-transparent z-40 pointer-events-none blur-[2px]" />
            <div className="absolute top-0 bottom-0 right-0 w-px bg-black/40 z-50 pointer-events-none" />

            <div className={cn(
                "absolute inset-0 rounded-l-sm overflow-hidden transition-all duration-300",
                isLeftPageVisible ? 'opacity-100' : 'opacity-0'
            )}>
                {!isTurning && !isFrontCover && (
                    isBackCover ? <CoverView book={book} type="back" /> :
                    <SinglePageContent page={leftPage} settings={settings} side="left" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />
                )}
                {isTurning && isBackward && underLeft}
                {isTurning && isForward && isFrontCover && <InsideCover type="front" />} 
            </div>

            <AnimatePresence>
                {isBackward && (
                    <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 180 }}
                        exit={{ rotateY: 180 }}
                        transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1.000] }}
                        style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d', zIndex: 100 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <div className="absolute inset-0 backface-hidden rounded-l-sm overflow-hidden bg-parchment-100 shadow-inner">
                            {flapFront}
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20 pointer-events-none" />
                        </div>
                        <div className="absolute inset-0 backface-hidden rounded-r-sm overflow-hidden bg-parchment-100 shadow-inner" style={{ transform: 'rotateY(180deg)' }}>
                             {flapBack}
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* RIGHT PAGE SLOT */}
        <div className={cn("flex-1 relative preserve-3d", isForward ? 'z-30' : 'z-10')}>
            {/* Spine Gutter Shadow overlaying the right page left edge */}
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/20 to-transparent z-40 pointer-events-none blur-[2px]" />
            <div className="absolute top-0 bottom-0 left-0 w-px bg-black/10 z-50 pointer-events-none" />

            <div className={cn(
                "absolute inset-0 rounded-r-sm overflow-hidden transition-all duration-300",
                isRightPageVisible ? 'opacity-100' : 'opacity-0'
            )}>
                {!isTurning && !isBackCover && (
                    isFrontCover ? <CoverView book={book} type="front" /> :
                    <SinglePageContent page={rightPage} settings={settings} side="right" bookType={book.type} bookTitle={book.title} bookAuthor={book.author} language={book.language} />
                )}
                {isTurning && isForward && underRight}
                {isTurning && isBackward && isBackCover && <InsideCover type="back" />}
            </div>

            <AnimatePresence>
                {isForward && (
                    <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: -180 }}
                        exit={{ rotateY: -180 }}
                        transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1.000] }}
                        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', zIndex: 100 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <div className="absolute inset-0 backface-hidden rounded-r-sm overflow-hidden bg-parchment-100 shadow-inner">
                            {flapFront}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
                        </div>
                        <div className="absolute inset-0 backface-hidden rounded-l-sm overflow-hidden bg-parchment-100 shadow-inner" style={{ transform: 'rotateY(180deg)' }}>
                            {flapBack}
                             <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20 pointer-events-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
