import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ValidationError, CreationStep } from './validation';
import { GameIcon } from '../../../game_icons';

interface ValidationOverlayProps {
  isOpen: boolean;
  errors: ValidationError[];
  onClose: () => void;
  onNavigateToStep: (step: CreationStep) => void;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({
  isOpen,
  errors,
  onClose,
  onNavigateToStep
}) => {
  if (!isOpen || errors.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        id="validation-overlay-backdrop"
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          id="validation-overlay-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-parchment-100 border-2 border-dragon-red shadow-[0_0_60px_rgba(153,27,27,0.5)] rounded-sm overflow-hidden p-6 relative flex flex-col space-y-6"
          style={{
            backgroundImage: `url('/assets/ui/parchment.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-dragon-red/20 pb-4">
            <div className="p-3 bg-dragon-red text-white rounded-sm shadow-lg">
              <GameIcon name="alert" size={24} color="#FFFFFF" />
            </div>
            <div>
              <h2 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-wide">
                COMPLETE YOUR CHARACTER
              </h2>
              <p className="text-xs font-bold text-parchment-600 uppercase tracking-widest italic">
                "Your character isn't ready yet."
              </p>
            </div>
          </div>

          {/* Missing Requirements List */}
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            <p className="text-[11px] font-bold text-parchment-700 uppercase tracking-wider">
              The following required choices are incomplete:
            </p>
            {errors.map((err, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white/60 border border-dragon-gold/20 rounded-sm shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-dragon-red" />
                  <span className="text-[11px] font-bold text-dragon-darkRed">
                    {err.message}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onNavigateToStep(err.step);
                    onClose();
                  }}
                  className="px-3 py-1 bg-dragon-red text-white rounded-sm text-[9px] font-black uppercase tracking-wider hover:bg-dragon-darkRed transition-all shadow-sm"
                >
                  {err.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Dismiss Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-parchment-200 border border-dragon-gold/30 rounded-sm text-[10px] font-black text-parchment-700 uppercase tracking-widest hover:bg-parchment-300 transition-all"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
