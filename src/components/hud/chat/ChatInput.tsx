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
  const { isDiceReady, isAdvancedRollerOpen, setIsAdvancedRollerOpen, chatExpanded, setChatExpanded } = useStore();

  return (
    <div className="p-3 bg-parchment-100/40 border-t border-dragon-gold/10 backdrop-blur-xl">
      <div className="relative flex items-center gap-2 group">
        <button
          onClick={() => setIsAdvancedRollerOpen(!isAdvancedRollerOpen)}
          className={`shrink-0 p-2.5 rounded-full transition-all border-2 ${
            isDiceReady || isAdvancedRollerOpen
              ? 'bg-dragon-gold border-dragon-red text-dragon-darkRed shadow-lg' 
              : 'bg-parchment-200 border-dragon-gold/30 text-dragon-red/40 hover:text-dragon-red hover:bg-parchment-300'
          } shadow-sm active:scale-90`}
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
            className="w-full bg-parchment-50 border-2 border-dragon-gold/30 rounded-full py-2.5 pl-4 pr-12 text-[10px] font-mono text-dragon-darkRed placeholder:text-dragon-red/20 focus:outline-none focus:border-dragon-red focus:bg-white transition-all shadow-inner"
          />
          <button
            onClick={onSend}
            disabled={!message.trim()}
            className="absolute right-1.5 p-2 bg-dragon-red hover:bg-dragon-darkRed disabled:opacity-50 disabled:hover:bg-dragon-red text-white rounded-full transition-all shadow-lg shadow-dragon-red/40 active:scale-95"
          >
            <GameIcon name="send" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
