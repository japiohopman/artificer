import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../../store/useUIStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';

import { ChatMessage } from '../../../store/useChatStore';

interface ChatHistoryProps {
  history: ChatMessage[];
}

import { useChatStore } from '../../../store/useChatStore';

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  const { currentNPC } = useCharacterStore();
  const { isThinking } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      // Small delay to ensure layout is settled
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [history, isThinking]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-parchment-200/20 pointer-events-auto"
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
                <span className="text-[8px] font-roboto-condensed uppercase tracking-[0.15em] text-dragon-darkRed/60 italic font-black">{msg.content}</span>
              </div>
            ) : (
              <div className={`flex flex-col gap-1 max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 px-1 opacity-60">
                  {msg.role === 'user' ? <GameIcon name="user" size={8} color="#8B0000" /> : <GameIcon name="identity" size={8} color="#8B0000" />}
                  <span className="text-[7px] font-roboto-condensed uppercase tracking-widest font-black text-dragon-darkRed">
                    {msg.role === 'user' ? 'Traveler' : (msg.role === 'assistant' ? (currentNPC?.name || 'Narrator') : 'System')}
                  </span>
                </div>
                <div className={`p-3 rounded-xl text-[11px] leading-relaxed transition-all shadow-sm ${
                  msg.role === 'user' 
                    ? 'font-roboto bg-dragon-red text-parchment-50 rounded-tr-none border border-dragon-gold shadow-dragon-red/10'
                    : 'font-roboto-slab bg-parchment-50 text-dragon-darkRed border border-dragon-gold/30 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start items-center gap-2 p-3 bg-parchment-50/50 rounded-xl border border-dragon-gold/20 w-fit"
        >
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-dragon-red/60 animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1.5 h-1.5 rounded-full bg-dragon-red/60 animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1.5 h-1.5 rounded-full bg-dragon-red/60 animate-bounce" />
          </div>
          <span className="text-[9px] font-roboto-condensed uppercase tracking-widest text-dragon-darkRed/40 font-black">Narrator is weaving...</span>
        </motion.div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
};
