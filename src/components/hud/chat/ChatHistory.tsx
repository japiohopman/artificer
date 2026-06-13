import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../../store/useStore';
import { GameIcon } from '../../../game_icons';

interface ChatMessage {
  role: 'user' | 'npc' | 'system';
  text: string;
  timestamp: number;
}

interface ChatHistoryProps {
  history: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  const { currentNPC } = useCharacterStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-parchment-200/20 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {history.map((msg, i) => (
          <motion.div
            key={msg.timestamp + i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex pointer-events-auto ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
          >
            {msg.role === 'system' ? (
              <div className="px-3 py-1 bg-parchment-200/50 border border-dragon-gold/20 rounded-full flex items-center gap-2 shadow-sm">
                <GameIcon name="magic_effect" size={8} className="text-dragon-red/60" />
                <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-dragon-darkRed/60 italic font-black">{msg.text}</span>
              </div>
            ) : (
              <div className={`flex flex-col gap-1 max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 px-1 opacity-60">
                  {msg.role === 'user' ? <GameIcon name="user" size={8} color="#8B0000" /> : <GameIcon name="identity" size={8} color="#8B0000" />}
                  <span className="text-[7px] font-mono uppercase tracking-widest font-black text-dragon-darkRed">
                    {msg.role === 'user' ? 'Traveler' : currentNPC?.name || 'Unknown'}
                  </span>
                </div>
                <div className={`p-3 rounded-xl text-[11px] font-serif leading-relaxed transition-all shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-dragon-red text-parchment-50 rounded-tr-none border border-dragon-gold shadow-dragon-red/10' 
                    : 'bg-parchment-50 text-dragon-darkRed border border-dragon-gold/30 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
