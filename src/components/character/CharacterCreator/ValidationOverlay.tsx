import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../../game_icons';

export interface MissingStepItem {
  stepId: string;
  label: string;
  icon: string;
  reason: string;
}

interface ValidationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  missingSteps: MissingStepItem[];
  onGoToStep: (stepId: string) => void;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({
  isOpen,
  onClose,
  missingSteps,
  onGoToStep,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-parchment-100 border-2 border-dragon-gold/60 p-6 rounded-sm max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col space-y-5"
        >
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-dragon-gold/30 pb-3 relative z-10">
            <div className="w-10 h-10 bg-dragon-red/10 border border-dragon-red/30 rounded-sm flex items-center justify-center text-dragon-red shrink-0">
              <GameIcon name="alert" size={20} color="currentColor" />
            </div>
            <div>
              <h3 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-wider leading-none">
                Complete Your Character
              </h3>
              <p className="text-[11px] font-bold text-parchment-700 tracking-wide mt-1">
                Required character choices are missing before manifestation.
              </p>
            </div>
          </div>

          {/* Missing items list */}
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1 relative z-10">
            {missingSteps.map((item) => (
              <div
                key={item.stepId}
                className="p-3 bg-white/70 border border-dragon-gold/30 rounded-sm flex items-center justify-between gap-3 shadow-sm hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-dragon-red/5 border border-dragon-red/20 rounded-sm text-dragon-red shrink-0">
                    <GameIcon name={item.icon as any} size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-header font-black text-dragon-darkRed uppercase tracking-wide block truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-parchment-600 font-medium block truncate">
                      {item.reason}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onGoToStep(item.stepId);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-dragon-red text-white hover:bg-dragon-darkRed text-[10px] font-header font-black uppercase tracking-wider rounded-sm shadow transition-all shrink-0 flex items-center gap-1"
                >
                  Jump
                  <GameIcon name="direction_right" size={12} color="currentColor" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer controls */}
          <div className="flex justify-end pt-2 border-t border-dragon-gold/20 relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-parchment-200 border border-parchment-400 text-parchment-800 hover:bg-parchment-300 text-[10px] font-header font-black uppercase tracking-widest rounded-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
