import React from 'react';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';

export interface AtlasSheetFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderColor?: string;
  badgeText?: string;
  badgeColor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const AtlasSheetFrame: React.FC<AtlasSheetFrameProps> = ({
  children,
  className,
  style,
  borderColor = '#8B4513',
  badgeText,
  badgeColor = 'text-dragon-red',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full max-w-[460px] min-h-[580px] max-h-[85vh] sm:h-[680px] bg-parchment-100 border-[12px] sm:border-[14px] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 relative overflow-hidden shadow-2xl group shrink-0 select-none text-stone-900 font-body",
        className
      )}
      style={{
        borderColor,
        backgroundImage: `url('/assets/ui/parchment.jpg')`,
        backgroundColor: '#f5ebd0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style
      }}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-dragon-gold/40 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-dragon-gold/40 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-dragon-gold/40 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-dragon-gold/40 rounded-br-lg pointer-events-none" />

      {/* Badge / Rarity at the bottom center */}
      {badgeText && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
          <div className="w-8 h-[1px] bg-dragon-gold/30" />
          <span className={cn("text-[8px] font-bold uppercase tracking-[0.2em]", badgeColor)}>
            {badgeText}
          </span>
          <div className="w-8 h-[1px] bg-dragon-gold/30" />
        </div>
      )}

      {/* Sheet Content Stack */}
      {children}
    </div>
  );
};

export interface AtlasSheetHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  topRight?: React.ReactNode;
  actionControls?: React.ReactNode;
  titleClassName?: string;
  className?: string;
}

export const AtlasSheetHeader: React.FC<AtlasSheetHeaderProps> = ({
  title,
  subtitle,
  topRight,
  actionControls,
  titleClassName,
  className
}) => {
  return (
    <div className={cn("relative z-10 border-b-2 border-dragon-gold/30 pb-2 flex flex-col gap-1", className)}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className={cn("font-header text-xl sm:text-2xl font-black uppercase tracking-tight text-dragon-darkRed leading-snug drop-shadow-sm truncate", titleClassName)}>
            {title}
          </h3>
          {actionControls}
        </div>
        {topRight}
      </div>
      {subtitle && (
        <div className="text-[11px] sm:text-[12px] font-playfair italic text-parchment-600 mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export interface AtlasSheetMediaProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AtlasSheetMedia: React.FC<AtlasSheetMediaProps> = ({
  children,
  className,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative aspect-square h-36 sm:h-44 mx-auto bg-parchment-200 border-2 border-dragon-gold/20 rounded-lg overflow-hidden shadow-inner group/image shrink-0 flex items-center justify-center p-2",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
    </div>
  );
};

export interface AtlasSheetInfoGridProps {
  children: React.ReactNode;
  cols?: number;
  className?: string;
}

export const AtlasSheetInfoGrid: React.FC<AtlasSheetInfoGridProps> = ({
  children,
  cols = 2,
  className
}) => {
  const gridColClass = cols === 3 ? "grid-cols-3" : cols === 4 ? "grid-cols-4" : "grid-cols-2";
  return (
    <div className={cn("relative z-10 grid gap-2 sm:gap-3", gridColClass, className)}>
      {children}
    </div>
  );
};

export interface AtlasSheetInfoBlockProps {
  iconName?: string;
  iconPath?: string;
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const AtlasSheetInfoBlock: React.FC<AtlasSheetInfoBlockProps> = ({
  iconName,
  iconPath,
  label,
  value,
  tooltip,
  className
}) => {
  return (
    <div className={cn("flex flex-col min-w-0", className)} title={tooltip}>
      <div className="flex items-center gap-1 opacity-60">
        <GameIcon name={iconName} path={iconPath} size={10} color="#8B0000" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-parchment-500">{label}</span>
      </div>
      <span className="text-[11px] font-bold text-parchment-800 truncate leading-tight mt-0.5">
        {value || '—'}
      </span>
    </div>
  );
};

export interface AtlasSheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const AtlasSheetBody: React.FC<AtlasSheetBodyProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-3", className)}>
      {children}
    </div>
  );
};

export interface AtlasSheetFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export const AtlasSheetFooter: React.FC<AtlasSheetFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("relative z-10 pt-2 border-t border-dragon-gold/20 mt-auto flex justify-between items-center", className)}>
      {children}
    </div>
  );
};
