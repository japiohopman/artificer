import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  elevenlabs_key_1: string;
  elevenlabs_key_2: string;
  elevenlabs_key_3: string;
  gemini_key: string;
  openai_key: string;
  gemini_model: string;
  openai_model: string;
  user_alias: string;

  setSettings: (settings: Partial<Omit<SettingsState, 'setSettings'>>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      elevenlabs_key_1: '',
      elevenlabs_key_2: '',
      elevenlabs_key_3: '',
      gemini_key: '',
      openai_key: '',
      gemini_model: 'gemini-1.5-flash',
      openai_model: 'gpt-4o',
      user_alias: 'Adventurer',

      setSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'artificer-settings-storage', // key in LocalStorage
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).useSettingsStore = useSettingsStore;
}
