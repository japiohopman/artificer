import React from 'react';
import { motion } from 'framer-motion';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export interface TokenProps {
  id: string;
  name: string;
  imageUrl?: string;
  hp?: number;
  maxHp?: number;
  x: number;
  y: number;
  rotation?: number;
  cellSize: number;
  size?: 'Medium' | 'Large';
  isPlayer?: boolean;
  isAlly?: boolean;
  isActive?: boolean;
  isTargeting?: boolean;
  isHovered?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDrag?: (e: any, info: any) => void;
  onDragEnd?: (e: any, info: any) => void;
  draggedPos?: { x: number; y: number } | null;
  actionEconomy?: any;
  spellSlots?: any;
}

export const Token: React.FC<TokenProps> = ({
  id,
  name,
  imageUrl,
  hp,
  maxHp,
  x,
  y,
  rotation = 0,
  cellSize,
  size = 'Medium',
  isPlayer = false,
  isAlly = false,
  isActive = false,
  isTargeting = false,
  isHovered = false,
  onClick,
  onDrag,
  onDragEnd,
  draggedPos,
  actionEconomy,
  spellSlots
}) => {
  const mSize = size === 'Large' ? 2 : 1;
  const healthPercent = hp !== undefined && maxHp !== undefined ? (hp / maxHp) * 100 : null;
  const isTopDownToken = imageUrl && (
    imageUrl.includes('/tokens/') ||
    imageUrl.includes('/enemies/tokens/') ||
    imageUrl.includes('%2Ftokens%2F') ||
    imageUrl.includes('%2Fenemies%2Ftokens%2F')
  );

  const isDraggable = isPlayer || isAlly;

  // Compute borders and background styles cleanly without heavy nesting
  let tokenBorderBgStyle = "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]";
  if (isPlayer) {
    tokenBorderBgStyle = "border-blue-500 bg-blue-900/80 shadow-[0_0_20px_rgba(59,130,246,0.4)]";
  } else if (isAlly) {
    tokenBorderBgStyle = "border-emerald-500 bg-emerald-900/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
  }

  const renderResourceDots = () => {
    const dots: React.ReactNode[] = [];

    // 1. Actions (Green)
    if (actionEconomy?.actions) {
      const { current = 0, max = 0 } = actionEconomy.actions;
      for (let i = 0; i < max; i++) {
        const isSpent = i >= current;
        dots.push(
          <span
            key={`action-${i}`}
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-300",
              isSpent
                ? "bg-emerald-950/40 border border-emerald-500/30"
                : "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)] border border-emerald-300"
            )}
            title={`Action ${isSpent ? '(Spent)' : '(Available)'}`}
          />
        );
      }
    }

    // 2. Bonus Actions (Orange)
    if (actionEconomy?.bonusActions) {
      const { current = 0, max = 0 } = actionEconomy.bonusActions;
      for (let i = 0; i < max; i++) {
        const isSpent = i >= current;
        dots.push(
          <span
            key={`bonus-${i}`}
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-300",
              isSpent
                ? "bg-amber-950/40 border border-amber-500/30"
                : "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)] border border-amber-400"
            )}
            title={`Bonus Action ${isSpent ? '(Spent)' : '(Available)'}`}
          />
        );
      }
    }

    // 3. Spell Slots (1-9)
    if (spellSlots) {
      const slotColors: Record<number, { fill: string, spentBorder: string, glow: string }> = {
        1: { fill: 'bg-[rgb(160,224,255)]', spentBorder: 'border-[rgb(160,224,255)]/30', glow: 'shadow-[0_0_4px_rgba(160,224,255,0.8)] border-[rgb(200,240,255)]' },
        2: { fill: 'bg-[rgb(120,200,255)]', spentBorder: 'border-[rgb(120,200,255)]/30', glow: 'shadow-[0_0_4px_rgba(120,200,255,0.8)] border-[rgb(180,225,255)]' },
        3: { fill: 'bg-[rgb(90,170,255)]', spentBorder: 'border-[rgb(90,170,255)]/30', glow: 'shadow-[0_0_4px_rgba(90,170,255,0.8)] border-[rgb(150,200,255)]' },
        4: { fill: 'bg-[rgb(110,130,255)]', spentBorder: 'border-[rgb(110,130,255)]/30', glow: 'shadow-[0_0_4px_rgba(110,130,255,0.8)] border-[rgb(160,180,255)]' },
        5: { fill: 'bg-[rgb(140,110,255)]', spentBorder: 'border-[rgb(140,110,255)]/30', glow: 'shadow-[0_0_4px_rgba(140,110,255,0.8)] border-[rgb(180,160,255)]' },
        6: { fill: 'bg-[rgb(170,90,255)]', spentBorder: 'border-[rgb(170,90,255)]/30', glow: 'shadow-[0_0_4px_rgba(170,90,255,0.8)] border-[rgb(200,150,255)]' },
        7: { fill: 'bg-[rgb(200,60,255)]', spentBorder: 'border-[rgb(200,60,255)]/30', glow: 'shadow-[0_0_4px_rgba(200,60,255,0.8)] border-[rgb(220,120,255)]' },
        8: { fill: 'bg-[rgb(220,30,255)]', spentBorder: 'border-[rgb(220,30,255)]/30', glow: 'shadow-[0_0_4px_rgba(220,30,255,0.8)] border-[rgb(240,100,255)]' },
        9: { fill: 'bg-[rgb(240,0,255)]', spentBorder: 'border-[rgb(240,0,255)]/30', glow: 'shadow-[0_0_6px_rgba(240,0,255,0.9)] border-[rgb(255,100,255)]' },
      };

      for (let level = 1; level <= 9; level++) {
        const slots = spellSlots[level.toString()];
        if (slots) {
          const { current = 0, max = 0 } = slots;
          for (let i = 0; i < max; i++) {
            const isSpent = i >= current;
            const colors = slotColors[level] || slotColors[1];
            dots.push(
              <span
                key={`spell-${level}-${i}`}
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  isSpent
                    ? `bg-stone-950/60 border ${colors.spentBorder}`
                    : `${colors.fill} ${colors.glow}`
                )}
                title={`Lvl ${level} Spell Slot ${isSpent ? '(Spent)' : '(Available)'}`}
              />
            );
          }
        }
      }
    }

    if (dots.length === 0) return null;

    return (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5 bg-stone-950/90 border border-white/10 px-1 py-0.5 rounded-full shadow-md z-30">
        {dots}
      </div>
    );
  };

  return (
    <motion.div
      key={id}
      layoutId={id}
      initial={false}
      animate={draggedPos ? {} : { x: x * cellSize, y: y * cellSize }}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0.1}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "absolute p-1 pointer-events-auto",
        isDraggable ? "cursor-grab active:cursor-grabbing z-[100]" : "cursor-pointer z-20",
        isActive && "z-[110]"
      )}
      style={{ width: cellSize * mSize, height: cellSize * mSize }}
    >
      {renderResourceDots()}
      <div className={cn(
        "w-full h-full relative transition-all duration-300 flex items-center justify-center",
        isTopDownToken 
          ? "bg-transparent shadow-none" 
          : cn(
              "rounded-full border-2 overflow-hidden shadow-xl",
              tokenBorderBgStyle
            ),
        isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
        isHovered && "scale-105 brightness-110"
      )}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            className={cn(
              "w-full h-full transition-all",
              isTopDownToken ? "object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.7)]" : "object-cover"
            )} 
            style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
            alt={name} 
          />
        ) : (
          <div style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}>
            <GameIcon name={isPlayer ? "user" : "identity"} size={24 * mSize} color="#FFF" />
          </div>
        )}

        {/* Health Bar */}
        {healthPercent !== null && (
          <div className={cn(
            "absolute bottom-0 left-0 w-full h-1.5 bg-black/60",
            isTopDownToken && "bottom-1 px-1 rounded-sm overflow-hidden"
          )}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${healthPercent}%` }}
              className={cn(
                "h-full transition-colors",
                healthPercent > 50 ? "bg-green-500" : healthPercent > 20 ? "bg-yellow-500" : "bg-red-500"
              )} 
            />
          </div>
        )}
      </div>

      {/* Name Tag */}
      <div className={cn(
        "absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-sm border uppercase whitespace-nowrap shadow-lg tracking-wider text-[8px] font-elan transition-colors",
        isPlayer 
          ? "bg-blue-900/95 text-white border-blue-400/50" 
          : (isAlly
              ? "bg-emerald-900/95 text-white border-emerald-400/50"
              : "bg-dragon-darkRed/95 text-white border-dragon-red/50")
      )}>
        {name}
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -inset-2 border-2 border-dragon-gold rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.div>
  );
};
