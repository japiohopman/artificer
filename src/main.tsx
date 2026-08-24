import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './components/core/FirebaseProvider.tsx';
import { useCharacterStore } from './store/useCharacterStore';
import { useUIStore } from './store/useUIStore';
import { useGameStore } from './store/useGameStore';
import { useChatStore } from './store/useChatStore';
import { useWorldStore } from './store/useWorldStore';

import { useInventoryStore } from './store/useInventoryStore';

if (typeof window !== 'undefined') {
  (window as any).useCharacterStore = useCharacterStore;
  (window as any).useUIStore = useUIStore;
  (window as any).useGameStore = useGameStore;
  (window as any).useChatStore = useChatStore;
  (window as any).useWorldStore = useWorldStore;
  (window as any).useInventoryStore = useInventoryStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </StrictMode>,
);
