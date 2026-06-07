import React from 'react';
import { useStore } from '../../../store/useStore';
import { GameIcon } from '../../../game_icons';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ message, setMessage, onSend, placeholder }) => {
  const { isDiceReady, isAdvancedRollerOpen, setIsAdvancedRollerOpen } = useStore();

  return (
    <div className="p-3 bg-black/40 border-t border-white/10 backdrop-blur-xl">
      <div className="relative flex items-center gap-2 group">
        <button
          onClick={() => setIsAdvancedRollerOpen(!isAdvancedRollerOpen)}
          className={`shrink-0 p-2.5 rounded-full transition-all border ${
            isDiceReady || isAdvancedRollerOpen
              ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
              : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'
          } shadow-lg active:scale-90`}
          title="Toggle Advanced Roller"
          aria-label="Toggle Advanced Roller"
        >
          <GameIcon name="dice" size={16} />
        </button>

        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-[10px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all shadow-inner"
          />
          <button
            onClick={onSend}
            disabled={!message.trim()}
            className="absolute right-1.5 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-full transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
          >
            <GameIcon name="send" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
