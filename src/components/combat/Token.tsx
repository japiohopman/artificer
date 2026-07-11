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
  draggedPos
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
      <div className={cn(
        "w-full h-full relative transition-all duration-300 flex items-center justify-center",
        isTopDownToken 
          ? "bg-transparent shadow-none" 
          : cn(
              "rounded-full border-2 overflow-hidden shadow-xl",
tokenBorderBgStyle ?? (
              isPlayer 
                ? "border-blue-500 bg-blue-900/80 shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                : isAlly
                    ? "border-emerald-500 bg-emerald-900/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            )
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
          : isAlly
            ? "bg-emerald-900/95 text-white border-emerald-400/50"
            : "bg-dragon-darkRed/95 text-white border-dragon-red/50"
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
