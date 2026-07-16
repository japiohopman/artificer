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
import { useInventoryStore } from './store/useInventoryStore';
import { useEffect } from 'react';
import { playModalOpenSound, playModalCloseSound } from './services/storageService';
import { DiceBoxCanvas } from './dice_roller/DiceBoxCanvas';
import { LoadingScreen } from './components/core/LoadingScreen';
import { AnimatePresence } from 'motion/react';

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

      // Alt+D: Toggle DevKit
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const { isDevKitOpen: currentDevKitOpen, setIsDevKitOpen: setDevKitOpen } = useUIStore.getState();
        const nextState = !currentDevKitOpen;
        setDevKitOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }

      // Alt+J: Toggle Journal
      if (e.altKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const { isJournalOpen: currentJournalOpen, setIsJournalOpen: setJournalOpen } = useUIStore.getState();
        const nextState = !currentJournalOpen;
        setJournalOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }

      // Alt+C: Toggle Chat expanded/collapsed state
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const { chatExpanded, setChatExpanded } = useUIStore.getState();
        setChatExpanded(!chatExpanded);
      }

      // Alt+G: Toggle Grid lines visibility
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const { isGridVisible, setIsGridVisible } = useUIStore.getState();
        setIsGridVisible(!isGridVisible);
      }

      // Alt+M: Toggle Atlas / World Panel
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const { isWorldPanelOpen, setIsWorldPanelOpen } = useUIStore.getState();
        setIsWorldPanelOpen(!isWorldPanelOpen);
      }

      // Alt+P: Toggle Profile/Stats menu
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const { isProfileMenuOpen, setIsProfileMenuOpen } = useUIStore.getState();
        setIsProfileMenuOpen(!isProfileMenuOpen);
      }

      // Alt+L: Toggle Logistics tab / Character Panel
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const { isCharacterPanelOpen, setIsCharacterPanelOpen, activeCharacterTab, setActiveCharacterTab, setIsInventoryOpen } = useUIStore.getState() as any;
        const { setIsInventoryOpen: setInvOpen } = useInventoryStore.getState();
        if (isCharacterPanelOpen && activeCharacterTab === 'logistics') {
          setIsCharacterPanelOpen(false);
          setInvOpen(false);
        } else {
          setActiveCharacterTab('logistics');
          setIsCharacterPanelOpen(true);
          setInvOpen(true);
        }
      }

      // Alt+H: Toggle Hero / Party Panel
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        const { isCharacterPanelOpen, setIsCharacterPanelOpen, activeCharacterTab, setActiveCharacterTab } = useUIStore.getState();
        const { setIsInventoryOpen: setInvOpen } = useInventoryStore.getState();
        if (isCharacterPanelOpen && activeCharacterTab !== 'logistics') {
          setIsCharacterPanelOpen(false);
          setInvOpen(false);
        } else {
          setActiveCharacterTab('party');
          setIsCharacterPanelOpen(true);
          setInvOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isCharacterCreatorOpen = useUIStore(state => state.isCharacterCreatorOpen);

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
