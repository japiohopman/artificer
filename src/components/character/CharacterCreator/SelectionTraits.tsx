import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../../game_icons';
import { getTraitIcon, getProficiencyIcon } from '../../../lib/atlasUtils';

interface SelectionTraitsProps {
  traits: any[];
  hydratedTraits?: Record<string, any>;
  title?: string;
}

export const SelectionTraits: React.FC<SelectionTraitsProps> = ({
  traits,
  hydratedTraits = {},
  title = "Innate Traits & Proficiencies"
}) => {
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);

  if (!traits || traits.length === 0) return null;

  return (
    <div className="space-y-2 pt-2">
      <h4 className="text-[10px] font-black text-dragon-red uppercase tracking-[0.25em] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-dragon-red" />
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {traits.slice(0, 20).map((t: any, i: number) => {
          const pName = typeof t === 'string' ? t : (t.name || t.index || '');
          const pIndex = typeof t === 'object' && t.index ? t.index.toLowerCase() : pName.toLowerCase().replace(/\s+/g, '_');

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredTrait(pIndex || pName)}
              onMouseLeave={() => setHoveredTrait(null)}
              className="px-2.5 py-1 bg-dragon-red/5 border border-dragon-red/15 rounded-sm text-[9px] font-black text-dragon-red uppercase tracking-tighter flex items-center gap-1.5 hover:bg-dragon-red/10 transition-colors shadow-sm relative group/trait cursor-default"
            >
              <GameIcon
                name={getTraitIcon(pIndex) || getProficiencyIcon(pName)}
                size={11}
                color="currentColor"
                fallbackName="award"
              />
              <span>{pName}</span>

              <AnimatePresence>
                {hoveredTrait === (pIndex || pName) && hydratedTraits[pIndex || pName] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-dragon-darkRed text-white p-3 rounded-sm shadow-2xl border border-dragon-gold/30 z-[100] pointer-events-none"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center border-b border-dragon-gold/20 pb-1 mb-1">
                        <span className="text-[10px] font-black tracking-widest text-dragon-gold uppercase">
                          {pName}
                        </span>
                        <span className="text-[8px] opacity-40 uppercase">Trait Info</span>
                      </div>
                      <p className="text-[10px] font-bold leading-relaxed text-parchment-100 italic normal-case tracking-normal">
                        {(() => {
                          const d = hydratedTraits[pIndex || pName].desc;
                          if (Array.isArray(d)) return d[0];
                          if (typeof d === 'string') return d;
                          return "Archives are silent on this particular essence.";
                        })()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
