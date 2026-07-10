import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './components/core/FirebaseProvider.tsx';
import { useCharacterStore } from './store/useCharacterStore';
import { useUIStore } from './store/useUIStore';
import { useGameStore } from './store/useGameStore';
import { useChatStore } from './store/useChatStore';

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).useCharacterStore = useCharacterStore;
  (window as any).useUIStore = useUIStore;
  (window as any).useGameStore = useGameStore;
  (window as any).useChatStore = useChatStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </StrictMode>,
);
