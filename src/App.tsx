/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HUD } from './components/hud/HUD';
import { TitleScreen } from './components/core/TitleScreen';
import { DevKit } from './components/devkit/DevKit';
import { useStore } from './store/useStore';
import { useCharacterStore } from './store/useCharacterStore';
import { useEffect } from 'react';
import { playModalOpenSound, playModalCloseSound } from './services/storageService';
import { DiceBoxCanvas } from './dice_roller/DiceBoxCanvas';
import { DiceRollOverlay } from './dice_roller/DiceRollOverlay';
import { AdvancedRoller } from './components/dice/DiceRollerPanel';
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

export default function App() {
  const { 
    isGameStarted, isDevKitOpen, setIsDevKitOpen, updateSelectedItem, selectedItem, explorerTab,
    isCharacterSpellbookOpen, setIsCharacterSpellbookOpen, isProfileMenuOpen, isJournalOpen, setIsJournalOpen
  } = useStore();

  const {
    books: registeredBooks,
    activeBookId,
    isBookOpen,
    closeBook
  } = useBookStore();

  const activeBook = registeredBooks.find(b => b.id === activeBookId);

  useEffect(() => {
    // Initial data load
    const { loadAllLists } = useStore.getState();
    const { loadCharacters } = useCharacterStore.getState();
    loadCharacters();
    loadAllLists();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const nextState = !isDevKitOpen;
        setIsDevKitOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }

      if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const nextState = !isJournalOpen;
        setIsJournalOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevKitOpen]);

  if (!isGameStarted) {
    return <TitleScreen />;
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <HUD />
      
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
        currentExplorerTab={explorerTab}
        onMonsterUpdated={(m) => {
          updateSelectedItem(m);
        }}
      />
      
      {/* Global Dice Layer */}
      <DiceRollOverlay />
      <DiceBoxCanvas />
      <AdvancedRoller />
    </div>
  );
}
