import React, { useState } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useGameStore } from '../../../store/useGameStore';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore, Emotion } from '../../../store/useCharacterStore';
import { useChatStore } from '../../../store/useChatStore';
import { useJournalStore } from '../../../store/useJournalStore';
import { narratorService } from '../../../services/narratorService';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { Choice } from './Choice';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';
import { MapLegend } from '../game/MapLegend';
import { GameIcon } from '../../../game_icons';

interface ChatMessage {
  role: 'user' | 'npc' | 'system';
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  isCollapsed?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isCollapsed = false }) => {
  const { getActiveBackground, isNight, currentLocation, mapZoom, mapMode, setMapMode } = useWorldStore();
  const { currentNPC, setEmotion, setTestAnimalInteraction, testAnimalInteraction } = useCharacterStore();
  const { addLog, rollDice3D } = useGameStore();
  const { setChatExpanded, gameMode, isWorldPanelOpen, isMapLegendOpen, searchQuery, setSearchQuery } = useUIStore();
  const { messages: history, isThinking, choices } = useChatStore();
  const { unlockedLore, unlockLore } = useJournalStore();

  const bgUrl = getActiveBackground();
  
  // Use isNight() logic from store
  const yPos = isNight() ? '100.1%' : '0%';

  const [message, setMessage] = useState('');

  const detectEmotion = (text: string): Emotion | null => {
    const lowerText = text.toLowerCase();
    
    // Simple direct matching for now
    const emotions: Emotion[] = ['Neutral', 'Curious', 'Skeptical', 'Happy', 'Greedy', 'Angry', 'Sad', 'Surprised', 'Proud'];
    for (const emo of emotions) {
      if (lowerText.includes(emo.toLowerCase())) {
        return emo;
      }
    }

    // Contextual triggers
    if (lowerText.includes('hello') || lowerText.includes('hi')) return 'Happy';
    if (lowerText.includes('how much') || lowerText.includes('gold') || lowerText.includes('price')) return 'Greedy';
    if (lowerText.includes('why') || lowerText.includes('what is')) return 'Curious';
    if (lowerText.includes('liar') || lowerText.includes('fake')) return 'Skeptical';
    if (lowerText.includes('die') || lowerText.includes('hate')) return 'Angry';
    
    return null;
  };

  const handleSend = async () => {
    if (!message.trim() || isThinking) return;

    const userMsg = message;
    setMessage('');

    try {
      await narratorService.generateResponse(userMsg);
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  const handleClearHistory = () => {
    useChatStore.getState().clearHistory();
    addLog("Chat history cleared.", 'info');
  };

  const getEmotionResponse = (emo: Emotion): string => {
    switch (emo) {
      case 'Happy': return "It's a fine day for business, isn't it?";
      case 'Greedy': return "Ah, talking about gold now? I like your style.";
      case 'Curious': return "That is an interesting question. Let me think...";
      case 'Skeptical': return "You doubt my wares? I assure you, they are of the highest quality.";
      case 'Angry': return "Watch your tongue, traveler! I don't take kindly to insults.";
      case 'Sad': return "The world is a heavy place sometimes, is it not?";
      case 'Surprised': return "I... I wasn't expecting that!";
      case 'Proud': return "My craftsmanship is known throughout the realm.";
      default: return "Indeed.";
    }
  };

  return (
    <div className="flex flex-col w-full overflow-hidden relative transition-all duration-500 bg-parchment-100 border-t-2 border-dragon-gold shadow-2xl pointer-events-none bg-paper-texture min-h-[64px]">
      {/* Dynamic Background Layer - only for history area */}
      <AnimatePresence>
        {bgUrl && !isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-t-xl"
          >
            <div 
              className="absolute inset-0 scale-110 transition-all duration-1000"
              style={{
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: '100% 200%',
                backgroundPosition: `center ${yPos}`,
                backgroundRepeat: 'no-repeat'
              }}
            />
            <div className="absolute inset-0 bg-parchment-100/40" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col relative z-10 justify-end pointer-events-none h-full">
        <AnimatePresence mode="popLayout">
          {!isCollapsed && (
            <motion.div 
              key="expanded-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '30vh', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 180 }}
              className="overflow-hidden pointer-events-auto bg-transparent border-b border-dragon-gold/20 flex flex-col"
            >
              {isMapLegendOpen && !isCollapsed ? (
                <div className="flex flex-col h-full">
                   <div className="flex items-center justify-between px-6 py-2 bg-dragon-red/5 border-b border-dragon-gold/10 relative">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black uppercase text-dragon-red/40 tracking-widest">Map_Overlay</span>
                           <span className="text-xs font-header font-black text-dragon-red uppercase tracking-widest">
                             {currentLocation?.name || 'World Atlas'}
                           </span>
                        </div>
                        <div className="h-8 w-px bg-dragon-gold/20 shrink-0" />
                        <div className="flex-1 pr-4">
                           <MapLegend currentZoom={mapZoom} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Atlas..."
                            className="bg-parchment-200 border-2 border-dragon-gold/20 rounded px-3 py-1 text-[10px] font-bold text-dragon-red placeholder:text-dragon-red/30 focus:border-dragon-gold outline-none w-48 transition-all"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-dragon-red/40 flex items-center gap-1">
                             {searchQuery && (
                               <button onClick={() => setSearchQuery('')} className="hover:text-dragon-red transition-colors">
                                 <GameIcon name="close" size={10} />
                               </button>
                             )}
                             <GameIcon name="search" size={12} />
                          </div>
                        </div>
                      </div>
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <ChatHistory history={history} />
                   </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                   {/* Map/Exploration Hub Extras */}
                   <div className="flex items-center justify-between px-6 py-2 bg-dragon-red/5 border-b border-dragon-gold/10 relative">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black uppercase text-dragon-red/40 tracking-widest">Active_Domain</span>
                           <span className="text-xs font-header font-black text-dragon-red uppercase tracking-widest">
                             {currentLocation?.name || 'The Wilds'}
                           </span>
                        </div>
                        <div className="h-8 w-px bg-dragon-gold/20" />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleClearHistory}
                          className="bg-parchment-200 hover:bg-parchment-300 border-2 border-dragon-gold/20 rounded px-3 py-1 text-[8px] font-black uppercase text-dragon-red transition-all"
                          title="Clear History"
                        >
                          Clear
                        </button>
                        <div className="relative group">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Atlas..."
                            className="bg-parchment-200 border-2 border-dragon-gold/20 rounded px-3 py-1 text-[10px] font-bold text-dragon-red placeholder:text-dragon-red/30 focus:border-dragon-gold outline-none w-48 transition-all"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-dragon-red/40 flex items-center gap-1">
                             {searchQuery && (
                               <button onClick={() => setSearchQuery('')} className="hover:text-dragon-red transition-colors">
                                 <GameIcon name="close" size={10} />
                               </button>
                             )}
                             <GameIcon name="search" size={12} />
                          </div>
                        </div>
                      </div>

                   </div>
                   <div className="flex-1 overflow-hidden">
                     <ChatHistory history={history} />
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isCollapsed && (
          <div className="shrink-0 p-3 bg-parchment-100/95 border-t border-dragon-gold/30 pointer-events-auto rounded-b-xl shadow-inner">
            {choices && choices.length > 0 ? (
              <Choice />
            ) : (
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSend={handleSend}
                placeholder={testAnimalInteraction?.active ? "Commune with the beast..." : `Speak to ${currentNPC?.name || 'NPC'}...`}
              />
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="px-6 py-3 flex items-center justify-between pointer-events-auto border-t border-dragon-gold/30">
            <div className="flex items-center gap-4">
              <div className="flex flex-col shrink-0">
                <span className="text-[8px] font-black uppercase text-dragon-red/40 tracking-widest">Map_Navigation</span>
                <span className="text-[10px] font-header font-black text-dragon-red uppercase tracking-widest">
                  {currentLocation?.name || 'Sword Coast Map'}
                </span>
              </div>
              <div className="h-8 w-px bg-dragon-gold/20 shrink-0" />
            </div>

            {/* Navigation / Travel Mode Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setMapMode('pan')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer rounded border border-dragon-gold/20",
                  mapMode === 'pan'
                    ? "bg-dragon-red text-white shadow-md border-dragon-red"
                    : "text-dragon-red bg-parchment-200 hover:bg-parchment-300"
                )}
              >
                <GameIcon name="map" size={12} color={mapMode === 'pan' ? "#FFFFFF" : "#8B0000"} />
                Navigate & Pan
              </button>
              <button
                onClick={() => setMapMode('travel')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer rounded border border-dragon-gold/20",
                  mapMode === 'travel'
                    ? "bg-dragon-red text-white shadow-md border-dragon-red"
                    : "text-dragon-red bg-parchment-200 hover:bg-parchment-300"
                )}
              >
                <GameIcon name="compass" size={12} color={mapMode === 'travel' ? "#FFFFFF" : "#8B0000"} />
                Set Wilderness Target
              </button>
            </div>
            
            {/* Quick search input also integrated beautifully */}
            <div className="relative group shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Map..."
                className="bg-parchment-200 border-2 border-dragon-gold/20 rounded px-3 py-1 text-[10px] font-bold text-dragon-red placeholder:text-dragon-red/30 focus:border-dragon-gold outline-none w-36 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-dragon-red/40 flex items-center gap-1">
                 {searchQuery && (
                   <button onClick={() => setSearchQuery('')} className="hover:text-dragon-red transition-colors">
                     <GameIcon name="close" size={10} />
                   </button>
                 )}
                 <GameIcon name="search" size={12} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
