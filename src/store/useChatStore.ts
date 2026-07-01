import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  name?: string;
  tool_call_id?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isThinking: boolean;
  historyLimit: number;

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setThinking: (isThinking: boolean) => void;
  clearHistory: () => void;
  getHistoryForAI: () => { role: string; parts: { text: string }[] }[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: 'initial-1',
      role: 'assistant',
      content: "Welcome, traveler. The journey ahead is long, but I shall be your guide through the realms of Faerûn. Where shall we begin?",
      timestamp: Date.now()
    }
  ],
  isThinking: false,
  historyLimit: 20,

  addMessage: (msg) => set((state) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    const newMessages = [...state.messages, newMessage];

    // Maintain history limit, but keep the initial message if possible or just slice
    if (newMessages.length > state.historyLimit) {
      return { messages: newMessages.slice(-state.historyLimit) };
    }

    return { messages: newMessages };
  }),

  setThinking: (isThinking) => set({ isThinking }),

  clearHistory: () => set({
    messages: [{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "A fresh start. The mists of the Weave clear...",
      timestamp: Date.now()
    }]
  }),

  getHistoryForAI: () => {
    const { messages } = get();
    // Transform to Gemini format: { role: 'user'|'model', parts: [{ text: '...' }] }
    return messages
      .filter(m => m.role !== 'system') // System prompt is usually separate
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
  }
}));
