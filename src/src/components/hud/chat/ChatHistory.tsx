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
  const { currentNPC } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20 pointer-events-none"
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
              <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full flex items-center gap-2">
                <GameIcon name="sparkles" size={8} className="text-emerald-500/60" />
                <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/30 italic">{msg.text}</span>
              </div>
            ) : (
              <div className={`flex flex-col gap-1 max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 px-1 opacity-30">
                  {msg.role === 'user' ? <GameIcon name="user" size={8} /> : <GameIcon name="bot" size={8} />}
                  <span className="text-[7px] font-mono uppercase tracking-widest font-bold text-white">
                    {msg.role === 'user' ? 'Traveler' : currentNPC?.name || 'Unknown'}
                  </span>
                </div>
                <div className={`p-3 rounded-md text-[11px] font-mono leading-relaxed transition-all ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600/30 text-white rounded-tr-none border border-emerald-500/50 backdrop-blur-sm' 
                    : 'bg-transparent text-white border border-white/10 rounded-tl-none'
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
