import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GameIcon } from '../../../game_icons';

interface SelectionHelpProps {
  isOpen: boolean;
  helpAssetPath: string;
  title: string;
  onClose: () => void;
}

export const SelectionHelp: React.FC<SelectionHelpProps> = ({
  isOpen,
  helpAssetPath,
  title,
  onClose
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && helpAssetPath) {
      setLoading(true);
      fetch(helpAssetPath)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load help file');
          return res.text();
        })
        .then(text => setContent(text))
        .catch(err => {
          console.error(err);
          setContent('# Guidance\n\nNo detailed help reference file found for this step.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, helpAssetPath]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="selection-help-backdrop"
        className="fixed inset-0 z-[250] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          id="selection-help-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-parchment-100 border-2 border-dragon-gold shadow-2xl rounded-sm p-6 max-h-[80vh] flex flex-col space-y-4 relative"
          style={{
            backgroundImage: `url('/assets/ui/parchment.webp')`,
            backgroundSize: 'cover'
          }}
        >
          <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-3">
            <div className="flex items-center gap-2 text-dragon-darkRed">
              <GameIcon name="info" size={20} color="#991B1B" />
              <h3 className="font-header font-black text-xl uppercase tracking-wide">
                {title} — Rules & Guidance
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 bg-dragon-red/10 hover:bg-dragon-red/20 text-dragon-darkRed rounded"
            >
              <GameIcon name="check" size={16} color="currentColor" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 markdown-body prose prose-slate prose-sm text-parchment-800">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <GameIcon name="refresh" size={24} color="#B8860B" className="animate-spin" />
              </div>
            ) : (
              <Markdown children={content} />
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-dragon-red text-white font-header font-black text-xs uppercase tracking-wider rounded shadow hover:bg-dragon-darkRed"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
