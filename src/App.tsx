/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HUD } from './components/hud/HUD';
import { TitleScreen } from './components/core/TitleScreen';
import { DevKit } from './components/devkit/DevKit';
import { useUIStore } from './store/useUIStore';
import { useAtlasStore } from './store/useAtlasStore';
import { useWorldStore } from './store/useWorldStore';
import { useGameStore } from './store/useGameStore';
import { useCharacterStore } from './store/useCharacterStore';
import { useEffect } from 'react';
import { playModalOpenSound, playModalCloseSound } from './services/storageService';
import { DiceBoxCanvas } from './dice_roller/DiceBoxCanvas';
import { LoadingScreen } from './components/core/LoadingScreen';
import { AnimatePresence } from 'motion/react';
import { GameOverScreen } from './components/core/GameOverScreen';
import { SettingsModal } from './components/core/SettingsModal';

// Global Overlays
import { BookReader } from './components/bookreader/BookReader';
import { SpellbookReader } from './components/character/SpellbookReader';
import { FullInventoryMenu } from './components/character/FullInventoryMenu';
import { CharacterProfile } from './components/character/CharacterProfile';
import { MonsterProfile } from './components/character/MonsterProfile';
import { TransportProfile } from './components/character/TransportProfile';
import { CharacterCreator } from './components/character/CharacterCreator';
import { LevelUpOverlay } from './components/character/LevelUpOverlay';
import { useBookStore } from './store/useBookStore';

// Unified Loading Screen Implementation
export default function App() {
  const isDevKitOpen = useUIStore(state => state.isDevKitOpen);
  const setIsDevKitOpen = useUIStore(state => state.setIsDevKitOpen);
  const explorerTab = useUIStore(state => state.explorerTab);
  const isCharacterSpellbookOpen = useUIStore(state => state.isCharacterSpellbookOpen);
  const setIsCharacterSpellbookOpen = useUIStore(state => state.setIsCharacterSpellbookOpen);
  const isProfileMenuOpen = useUIStore(state => state.isProfileMenuOpen);
  const isJournalOpen = useUIStore(state => state.isJournalOpen);
  const setIsJournalOpen = useUIStore(state => state.setIsJournalOpen);
  const isCharacterCreatorOpen = useUIStore(state => state.isCharacterCreatorOpen);
  const isGameOver = useUIStore(state => state.isGameOver);
  const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
  
  const isGameStarted = useGameStore(state => state.isGameStarted);
  
  const updateSelectedItem = useAtlasStore(state => state.updateSelectedItem);
  const selectedItem = useAtlasStore(state => state.selectedItem);
  
  const inspectedLocation = useWorldStore(state => state.inspectedLocation);
  const currentLocation = useWorldStore(state => state.currentLocation);

  const registeredBooks = useBookStore(state => state.books);
  const activeBookId = useBookStore(state => state.activeBookId);
  const isBookOpen = useBookStore(state => state.isBookOpen);
  const closeBook = useBookStore(state => state.closeBook);

  const activeBook = registeredBooks.find(b => b.id === activeBookId);

  useEffect(() => {
    // Initial data load - execute only on mount
    const { loadAllLists } = useAtlasStore.getState();
    const { loadCharacters } = useCharacterStore.getState();
    loadCharacters();
    loadAllLists();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const { isDevKitOpen: currentDevKitOpen, setIsDevKitOpen: setDevKitOpen } = useUIStore.getState();
        const nextState = !currentDevKitOpen;
        setDevKitOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }

      if (e.altKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const { isJournalOpen: currentJournalOpen, setIsJournalOpen: setJournalOpen } = useUIStore.getState();
        const nextState = !currentJournalOpen;
        setJournalOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }

      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const { isGridVisible, setIsGridVisible } = useUIStore.getState();
        setIsGridVisible(!isGridVisible);
      }

      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const { chatExpanded, setChatExpanded } = useUIStore.getState();
        setChatExpanded(!chatExpanded);
      }

      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const { isWorldPanelOpen, setIsWorldPanelOpen } = useUIStore.getState();
        setIsWorldPanelOpen(!isWorldPanelOpen);
      }

      if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        const { isSettingsOpen: currentSettingsOpen, setIsSettingsOpen: setSettingsOpen } = useUIStore.getState();
        const nextState = !currentSettingsOpen;
        setSettingsOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {!isGameStarted ? (
        <TitleScreen />
      ) : (
        <>
          {!isCharacterCreatorOpen && <HUD />}

          {/* Global Overlays Layer */}
          <AnimatePresence>
            {isBookOpen && activeBook && (
              <BookReader
                isOpen={true}
                onClose={closeBook}
                book={activeBook}
                className="z-[15000]"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isCharacterSpellbookOpen && (
              <SpellbookReader
                isOpen={true}
                onClose={() => setIsCharacterSpellbookOpen(false)}
              />
            )}
          </AnimatePresence>

          <FullInventoryMenu />
          <AnimatePresence>
            {isProfileMenuOpen && <CharacterProfile />}
          </AnimatePresence>
          <MonsterProfile />
          <TransportProfile />
          <CharacterCreator />
          <LevelUpOverlay />

          <AnimatePresence>
            {isSettingsOpen && <SettingsModal />}
          </AnimatePresence>

          {isGameOver && <GameOverScreen />}

          {/* DevKit Modal */}
          <DevKit
            isOpen={isDevKitOpen}
            onClose={() => setIsDevKitOpen(false)}
            initialMonster={selectedItem}
            initialLocation={inspectedLocation || currentLocation}
            currentExplorerTab={explorerTab}
            onMonsterUpdated={(m) => {
              updateSelectedItem(m);
            }}
          />
        </>
      )}
      
      {/* Global Dice Layer */}
      <DiceBoxCanvas />
      <LoadingScreen />
    </div>
  );
}
