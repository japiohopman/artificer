import React from 'react';
import { useChatStore } from '../../../store/useChatStore';
import { GameIcon } from '../../../game_icons';
import { motion } from 'motion/react';

export const Choice: React.FC = () => {
  const { choices, setChoices, addMessage } = useChatStore();

  if (!choices || choices.length === 0) return null;

  const handleChoiceClick = async (label: string, action?: () => void | Promise<void>) => {
    // 1. Add user choice message to history
    addMessage({ role: 'user', content: label });

    // 2. Clear choices
    setChoices(null);

    // 3. Execute the action if provided
    if (action) {
      try {
        await action();
      } catch (err) {
        console.error("Error executing choice action:", err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-[9px] font-black uppercase text-dragon-red/50 tracking-widest text-center mb-1">
        Make a Choice
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {choices.map((choice, index) => {
          const isPrimary = index === 0; // Usually Enter Location is first
          return (
            <motion.button
              key={choice.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChoiceClick(choice.label, choice.action)}
              className={`py-3 px-4 font-bold text-xs uppercase tracking-widest rounded border-2 transition-all flex items-center justify-center gap-2 shadow-sm ${
                isPrimary
                  ? 'bg-dragon-red hover:bg-dragon-darkRed text-white border-dragon-gold/30 hover:border-dragon-gold shadow-dragon-red/10'
                  : 'bg-parchment-200 hover:bg-parchment-300 text-dragon-red border-dragon-red/20 hover:border-dragon-red/40'
              }`}
            >
              {choice.label.toLowerCase().includes('enter') ? (
                <GameIcon name="advance" size={14} color={isPrimary ? '#FFFFFF' : '#8B0000'} />
              ) : choice.label.toLowerCase().includes('rest') || choice.label.toLowerCase().includes('sleep') ? (
                <GameIcon name="sleep" size={14} color={isPrimary ? '#FFFFFF' : '#8B0000'} />
              ) : (
                <GameIcon name="magic_effect" size={14} color={isPrimary ? '#FFFFFF' : '#8B0000'} />
              )}
              {choice.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
