import React, { useState } from 'react';
import { useStore, Emotion } from '../../store/useStore';
import { ChatHistory } from './chat/ChatHistory';
import { ChatInput } from './chat/ChatInput';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'npc' | 'system';
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  isCollapsed?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isCollapsed: propCollapsed }) => {
  const { 
    currentNPC, 
    setEmotion, 
    addLog, 
    setTestAnimalInteraction, 
    testAnimalInteraction, 
    getActiveBackground, 
    gameTime, 
    isNight,
    chatExpanded,
    setChatExpanded
  } = useStore();

  const isCollapsed = propCollapsed !== undefined ? propCollapsed : !chatExpanded;
  const bgUrl = getActiveBackground();
  
  // Use isNight() logic from store
  const yPos = isNight() ? '100.1%' : '0%';

  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { 
      role: 'npc', 
      text: `Welcome to my shop, traveler. I am ${currentNPC?.name || 'the Innkeeper'}. What can I do for you today?`,
      timestamp: Date.now() 
    }
  ]);

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

  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = { 
      role: 'user', 
      text: message, 
      timestamp: Date.now() 
    };
    
    setHistory(prev => [...prev, userMsg]);
    setMessage('');

    const lowerMessage = message.toLowerCase().trim();

    // Check for /roll command
    if (lowerMessage.startsWith('/roll ')) {
      const notation = lowerMessage.substring(6).trim();
      if (notation) {
        const { rollDice3D } = useStore.getState();
        rollDice3D(notation, "Chat Roll");
        return;
      }
    }
    
    // Animal Test Trigger
    const animalTriggers = ['talk to', 'speak to', 'commune with', 'interact with'];
    const matchedTrigger = animalTriggers.find(t => lowerMessage.includes(t));

    if (matchedTrigger) {
      const { beastRegistry } = useStore.getState();
      
      let target = lowerMessage.split(matchedTrigger)[1]?.trim() || '';
      if (target.startsWith('the ')) {
        target = target.replace('the ', '');
      }
      target = target.split(' ')[0]; // First word

      const beastEntry = beastRegistry[target.toLowerCase()];
      
      setTimeout(() => {
        addLog(`Initiating animal interaction test for: ${target}`, 'info');
        if (beastEntry) {
          addLog(`Registry match found: Row ${beastEntry.row} on ${beastEntry.url.split('/').pop()}`, 'success');
        } else {
          addLog(`No registry entry for "${target}". Using default beast matrix.`, 'warning');
        }

        setTestAnimalInteraction({
          active: true,
          animals: beastEntry ? [target] : [target, 'Dire Wolf', 'Giant Raven'],
          currentAnimalIndex: beastEntry ? beastEntry.row : 0,
          frameIndex: 0,
          url: beastEntry ? beastEntry.url : 'https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/animals/images/bat_black_bear_boar_matrix.webp'
        });

        const systemMsg: ChatMessage = {
          role: 'system',
          text: `You focus your attention on the ${target}. A primitive psychic link is established.`,
          timestamp: Date.now()
        };
        
        const animalMsg: ChatMessage = {
          role: 'npc',
          text: beastEntry 
            ? `*The ${target} perceives your intent. Its rhythmic movements synchronize with your psychic frequency.*`
            : `*The ${target} looks at you with ancient, knowing eyes, its mouth moving in a subtle, rhythmic sequence.*`,
          timestamp: Date.now()
        };
        
        setHistory(prev => [...prev, systemMsg, animalMsg]);
      }, 600);
      return;
    }

    const triggeredEmotion = detectEmotion(message);
    
    setTimeout(() => {
      if (triggeredEmotion) {
        setEmotion(triggeredEmotion);
        addLog(`NPC emotion changed to ${triggeredEmotion} via chat trigger.`, 'info');
        
        const systemMsg: ChatMessage = {
          role: 'system',
          text: `${currentNPC?.name || 'The NPC'} is now feeling ${triggeredEmotion.toLowerCase()}.`,
          timestamp: Date.now()
        };
        
        const npcResponse: ChatMessage = {
          role: 'npc',
          text: getEmotionResponse(triggeredEmotion),
          timestamp: Date.now()
        };
        
        setHistory(prev => [...prev, systemMsg, npcResponse]);
      } else {
        setHistory(prev => [...prev, { 
          role: 'npc', 
          text: "I'm listening, but I'm not sure I understand your intent, traveler.",
          timestamp: Date.now()
        }]);
      }
    }, 600);
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
    <div className="flex flex-col w-full rounded-md overflow-hidden relative transition-all duration-500 bg-transparent pointer-events-none">
      {/* Dynamic Background Layer - only for history area */}
      <AnimatePresence>
        {bgUrl && !isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-t-md"
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
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col relative z-10 justify-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {!isCollapsed && (
            <motion.div 
              key="chat-history"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '30vh', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 180 }}
              className="overflow-hidden pointer-events-auto bg-black/20 backdrop-blur-sm border-t border-x border-white/5 rounded-t-md"
            >
              <ChatHistory history={history} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="shrink-0 p-3 bg-black/80 backdrop-blur-xl border border-white/10 pointer-events-auto rounded-b-md shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <ChatInput 
            message={message} 
            setMessage={setMessage} 
            onSend={handleSend} 
            placeholder={testAnimalInteraction?.active ? "Commune with the beast..." : `Speak to ${currentNPC?.name || 'NPC'}...`}
          />
        </div>
      </div>
    </div>
  );
};
