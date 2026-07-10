import React from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useGameStore } from '../../../store/useGameStore';
import { GameIcon } from '../../../game_icons';

import { cn } from '../../../lib/utils';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ message, setMessage, onSend, placeholder }) => {
  const { isAdvancedRollerOpen, setIsAdvancedRollerOpen, chatExpanded, setChatExpanded, isMapLegendOpen, setIsMapLegendOpen } = useUIStore();
  const { isDiceReady } = useGameStore();

  return (
    <div className="p-3 bg-parchment-100/40 border-t border-dragon-gold/10">
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
          <GameIcon name="dice_roll" size={16} />
        </button>

        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder={placeholder}
            className="w-full bg-parchment-50 border-2 border-dragon-gold/30 rounded-full py-2.5 pl-4 pr-12 text-[10px] font-roboto text-dragon-darkRed placeholder:text-dragon-red/20 focus:outline-none focus:border-dragon-red focus:bg-white transition-all shadow-inner"
          />
          <button
            onClick={onSend}
            disabled={!message.trim()}
            className="absolute right-1.5 p-2 bg-dragon-red hover:bg-dragon-darkRed disabled:opacity-50 disabled:hover:bg-dragon-red text-white rounded-full transition-all shadow-lg shadow-dragon-red/40 active:scale-95"
            title="Send Message"
            aria-label="Send Message"
          >
            <GameIcon name="sent" size={14} />
          </button>
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col gap-1.5 shrink-0 ml-1">
           <button
             onClick={() => setIsMapLegendOpen(!isMapLegendOpen)}
             className={cn(
                "pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all shadow-md cursor-pointer active:scale-90",
                isMapLegendOpen 
                  ? "bg-dragon-gold border-dragon-red text-dragon-darkRed" 
                  : "bg-parchment-200 border-dragon-gold/40 text-dragon-red hover:bg-parchment-300"
              )}
             title="Toggle Map Legend"
             aria-label="Toggle Map Legend"
           >
              <GameIcon name="legend" size={14} />
           </button>
           <button
             onClick={() => setChatExpanded(!chatExpanded)}
             className={cn(
                "pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all shadow-md cursor-pointer active:scale-90",
                chatExpanded
                  ? "bg-dragon-red border-dragon-gold text-white"
                  : "bg-parchment-200 border-dragon-gold/40 text-dragon-red hover:bg-parchment-300"
             )}
             title={chatExpanded ? "Collapse Chat" : "Expand Chat"}
             aria-label={chatExpanded ? "Collapse Chat" : "Expand Chat"}
           >
              <GameIcon name="chat_interface" size={12} />
           </button>
        </div>
      </div>
    </div>
  );
};
