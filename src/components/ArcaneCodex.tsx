import React, { useEffect } from 'react';
import { SpellCard } from './SpellCard';
import { BookReader } from './bookreader/BookReader';
import { GameIcon, GameIconName } from '../game_icons';
import { CORE_ICONS } from '../assets/icons/core';
import { ARCANE_CODEX_ICONS } from '../assets/icons/arcane_codex';
import { Monster } from '../services/ai/monsterService';
import { playClickSound, playModalOpenSound, playModalCloseSound, normalizeImageUrl } from '../services/storageService';
import { ChromaKeyImage } from './ChromaKeyImage';
import { soundService } from '../services/soundService';
import { MonsterCard } from './MonsterCard';
import { MaterialCard } from './MaterialCard';
import { EquipmentCard } from './EquipmentCard';
import { FocusView } from './FocusView';
import { BookFocus } from './bookreader/BookFocus';
import { CharacterPanel } from './character/CharacterPanel';
import { SpellbookReader } from './character/SpellbookReader';
import { FullInventoryMenu } from './character/FullInventoryMenu';
import { CharacterProfile } from './character/CharacterProfile';
import { MonsterProfile } from './character/MonsterProfile';
import { TransportProfile } from './character/TransportProfile';
import { ProfileSettings } from './character/ProfileSettings';
import { CharacterCreator } from './character/CharacterCreator';
import { LevelUpOverlay } from './character/LevelUpOverlay';
import { PartyLogistics } from './PartyLogistics';
import { DraggableCard } from './DraggableCard';
import { ErrorBoundary } from './ErrorBoundary';
import { DevKit } from './devkit/DevKit';
import { cn } from '../lib/utils';
import { isBookLike } from '../lib/bookUtils';
import { loadBooksFromStaticJson } from '../lib/bookUtils';
import { useBookStore } from '../store/useBookStore';
import { useStore, ExplorerTab } from '../store/useStore';
import { Book } from '../types';
import { loginWithGoogle, logout } from './FirebaseProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDAndD } from '@fortawesome/free-brands-svg-icons';

import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { playGrabSound, playPlaceSound, playEquipSound } from '../services/storageService';
import { TitleScreen } from './TitleScreen';
import { ActionView } from './hud/ActionView';

const ArcaneCodex: React.FC = () => {
  const controls = useAnimation();
  const {
    viewMode, setViewMode,
    explorerTab, setExplorerTab,
    activeCards, addToPreview, removeFromPreview, clearPreview,
    monstersList, monsterCategories, monsterCategoryMapping, materialsList, equipmentList, keyItemsList, booksList, 
    spellsList, spellCategories, spellCategoryMapping,
    transportList, transportCategories, transportCategoryMapping,
    isLoadingList, loadList,
    searchQuery, setSearchQuery,
    selectedItem, selectItem, isLoadingItem,
    focusedItem, setFocusedItem,
    isDevKitOpen, setIsDevKitOpen,
    isInventoryOpen, setIsInventoryOpen,
    isInventoryMenuOpen, setIsInventoryMenuOpen,
    isProfileMenuOpen, setIsProfileMenuOpen,
    isCharacterCreatorOpen, setIsCharacterCreatorOpen,
    isExplorerOpen, setIsExplorerOpen,
    isMonsterProfileOpen, setIsMonsterProfileOpen,
    isTransportProfileOpen, setIsTransportProfileOpen,
    characters, activeCharacterId, setActiveCharacter,
    addToBackpack,
    updateSelectedItem,
    equipmentCategories,
    materialCategories,
    user, userProfile, isAuthReady,
    isGameStarted, setIsGameStarted,
    isCharacterSpellbookOpen,
    setIsCharacterSpellbookOpen,
    transferItem,
    equipItem,
    reorderCharacters
  } = useStore();

  const [activeDragItem, setActiveDragItem] = React.useState<any>(null);
  const [overData, setOverData] = React.useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current?.item);
    soundService.playEffect('UI_ITEM_GRAB');
  };

  const handleDragOver = (event: any) => {
    setOverData(event.over?.data.current || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    setOverData(null);

    if (!over) {
      soundService.playEffect('UI_ITEM_PLACE');
      return;
    }

    const dragData = active.data.current;
    const dropData = over.data.current;

    if (!dragData) {
      // Handle party reordering (activeId and overId are strings)
      const activeId = active.id.toString();
      const overId = over.id.toString();

      if (activeId.startsWith('tab-') && overId.startsWith('tab-')) {
        const oldIndex = characters.findIndex(c => `tab-${c.id}` === activeId);
        const newIndex = characters.findIndex(c => `tab-${c.id}` === overId);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderCharacters(oldIndex, newIndex);
        }
      }
      soundService.playEffect('UI_ITEM_PLACE');
      return;
    }

    const item = dragData.item;

    // Handle transfer between characters or party inventory
    if (dropData?.characterId || over.id === 'party') {
      const sourceId = dragData.sourceId;
      const targetId = dropData?.characterId || 'party';
      const itemId = item.id;

      if (sourceId && targetId && sourceId !== targetId && itemId) {
        transferItem({ sourceId, targetId, itemId });
        soundService.playEffect('UI_ITEM_PLACE');
        return;
      }
    }

    // Handle equip on equipment slot
    if (dropData?.slot) {
      if (item._type === 'equipment' || item.equipment_category || item.armor_category || item.weapon_category || item.tool) {
        const itemType = item._type || 'equipment';
        // For simple check, we check if the item is equipment
        // In a more robust system we'd check if categories match
        equipItem(item, dropData.slot);
        soundService.playEffect('UI_ITEM_EQUIP');
        return;
      }
    }

    soundService.playEffect('UI_ITEM_PLACE');
  };

  const {
    books: registeredBooks,
    activeBookId,
    isBookOpen,
    closeBook
  } = useBookStore();

  const activeBook = registeredBooks.find(b => b.id === activeBookId);

  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [grimoireMode, setGrimoireMode] = React.useState(false);
  const [manualBook, setManualBook] = React.useState<Book | null>(null);

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  const backpack = activeCharacter?.backpack || [];

  useEffect(() => {
    if (backpack?.length > 0) {
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [backpack?.length]);

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  useEffect(() => {
    loadList();
    setSelectedCategory(null);

    // Initial books loading
    loadBooksFromStaticJson([
      {
        id: 'ancient-tome-1',
        title: 'The Prophesy of Artificer',
        author: 'Japio Hopman',
        type: 'tome',
        coverIndex: 3,
        spineIndex: 1,
        pages: [
            { title: 'The Awakening', content: 'In the era of silicon and soul, the first machine breathed...' },
            { title: 'The Great Convergence', content: 'When the code met the canvas, the Arcane Codex was born.' }
        ]
      },
      {
        id: 'arcane-manual-1',
        title: 'Basic Infusions',
        author: 'Master Verrick',
        type: 'magazine',
        coverIndex: 7,
        spineIndex: 4,
        pages: [
            { title: 'Enhanced Defense', content: 'By etching the rune of iron onto a plate of steel...' },
            { title: 'Repeating Shot', content: 'The clockwork mechanism within the crossbow must be wound with care.' }
        ]
      }
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const nextState = !isDevKitOpen;
        setIsDevKitOpen(nextState);
        if (nextState) playModalOpenSound();
        else playModalCloseSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [explorerTab, isDevKitOpen]);

  const itemList = explorerTab === 'enemies' 
                    ? (selectedCategory 
                        ? monsterCategories.find(c => c.index === selectedCategory)?.monsters || []
                        : monsterCategories)
                    : explorerTab === 'materials' 
                    ? (selectedCategory 
                        ? materialCategories.find(c => c.index === selectedCategory)?.materials || []
                        : materialCategories)
                    : explorerTab === 'equipment'
                      ? (selectedCategory 
                          ? equipmentCategories.find(c => c.index === selectedCategory)?.equipment || []
                          : equipmentCategories)
                      : explorerTab === 'transport' ? transportList
                    : explorerTab === 'spells'
                        ? (selectedCategory
                            ? spellCategories.find(c => c.index === selectedCategory)?.spells || []
                            : (searchQuery.includes('lvl:') ? spellsList : spellCategories))
                      : explorerTab === 'key' ? keyItemsList : booksList;

  const safeString = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.name || val.value || val.index || "";
    }
    return String(val);
  };

  const filteredList = itemList.filter(m => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();

    // Advanced search for spells
    if (explorerTab === 'spells' && (selectedCategory || searchQuery.includes('lvl:') || searchQuery.includes('class:'))) {
      // Check for level filter: lvl:3
      const lvlMatch = search.match(/lvl:(\d+)/);
      if (lvlMatch) {
         const targetLvl = parseInt(lvlMatch[1]);
         if (m.level !== targetLvl) return false;
         // Continue filtering with the rest of the search query if any
         const remnant = search.replace(/lvl:\d+/, '').trim();
         if (!remnant) return true;
         return safeString(m.name || m.index).toLowerCase().includes(remnant);
      }

      // Check for class filter: class:wizard
      const classMatch = search.match(/class:(\w+)/);
      if (classMatch) {
        const targetClass = classMatch[1];
        const hasClass = m.classes?.some((c: any) => 
          safeString(c).toLowerCase().includes(targetClass)
        );
        if (!hasClass) return false;
        const remnant = search.replace(/class:\w+/, '').trim();
        if (!remnant) return true;
        return safeString(m.name || m.index).toLowerCase().includes(remnant);
      }
    }

    const nameMatch = safeString(m.name || m.index).toLowerCase().includes(search);
    const sizeMatch = safeString(m.size).toLowerCase().includes(search);
    const alignmentMatch = safeString(m.alignment).toLowerCase().includes(search);
    const typeMatch = safeString(m.type).toLowerCase().includes(search);
    const tagsMatch = m.tags ? m.tags.some((t: any) => safeString(t).toLowerCase().includes(search)) : false;
    
    return nameMatch || sizeMatch || alignmentMatch || typeMatch || tagsMatch;
  });

  if (!isGameStarted) {
    return <TitleScreen />;
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-screen flex flex-col bg-parchment-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-paper-texture opacity-30 mix-blend-multiply pointer-events-none" />
      
      {/* Global Book Reader Portal */}
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

      {/* Spellbook Reader Layer (Over everything) */}
      <AnimatePresence>
        {isCharacterSpellbookOpen && (
          <SpellbookReader 
            isOpen={true} 
            onClose={() => setIsCharacterSpellbookOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Full Screen Inventory Menu */}
      <FullInventoryMenu />

      {/* Character Profile View */}
      <CharacterProfile />

      {/* Monster Profile View */}
      <MonsterProfile />

      {/* Transport Profile View */}
      <TransportProfile />

      {/* Character Creator Modal */}
      <CharacterCreator />

      {/* Level Up Reward Overlay */}
      <LevelUpOverlay />

      {/* DevKit Modal */}
      <DevKit 
        isOpen={isDevKitOpen} 
        onClose={() => setIsDevKitOpen(false)}
        initialMonster={selectedItem as Monster}
        currentExplorerTab={explorerTab}
        onMonsterUpdated={(m) => {
          updateSelectedItem(m);
        }}
      />

      {/* Navbar */}
      <nav className="h-16 shrink-0 border-b-2 border-dragon-red bg-parchment-50 flex items-center justify-between px-4 md:px-8 z-[1100] shadow-md">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            onClick={() => {
              if (isMonsterProfileOpen) {
                 setIsMonsterProfileOpen(false);
                 setFocusedItem(null);
              } else if (isTransportProfileOpen) {
                 setIsTransportProfileOpen(false);
                 setFocusedItem(null);
              } else if (isProfileMenuOpen) {
                 setIsProfileMenuOpen(false);
              } else if (isCharacterCreatorOpen) {
                 setIsCharacterCreatorOpen(false);
                 setIsGameStarted(false);
              } else {
                 setIsExplorerOpen(!isExplorerOpen);
              }
              playClickSound();
            }}
            className={cn(
              "p-2 rounded transition-all border-2",
              (isExplorerOpen || isProfileMenuOpen || isMonsterProfileOpen || isCharacterCreatorOpen)
                ? "bg-dragon-red text-white border-dragon-red shadow-lg" 
                : "text-dragon-red bg-white/50 border-dragon-red/20 hover:bg-parchment-200"
            )}
            title={isCharacterCreatorOpen ? "Back to Title" : isMonsterProfileOpen ? "Back to Bestiary" : isProfileMenuOpen ? "Back to Collection" : "Toggle Explorer"}
            aria-label={isCharacterCreatorOpen ? "Back to Title" : isMonsterProfileOpen ? "Back to Bestiary" : isProfileMenuOpen ? "Back to Collection" : "Toggle Explorer"}
          >
            {(isProfileMenuOpen || isMonsterProfileOpen || isCharacterCreatorOpen) ? (
              <GameIcon path={CORE_ICONS.arrow_left} size={24} />
            ) : (
              <div className="flex items-center justify-center w-6 h-6">
                <FontAwesomeIcon 
                  icon={faDAndD} 
                  className={isExplorerOpen ? "text-white text-xl" : "text-dragon-red text-xl"} 
                />
              </div>
            )}
          </button>
        </div>

        <div className="flex-1 flex justify-center items-center px-2 md:px-8 min-w-0">
          <div className="flex items-center gap-1 md:gap-3 overflow-x-auto no-scrollbar py-2">
            {!isProfileMenuOpen && (
              <>
                <button 
                  onClick={() => {
                    setViewMode('combat');
                    playClickSound();
                  }}
                  title="Combat Actions"
                  aria-label="Combat Actions"
                  className={cn(
                    "flex items-center gap-2 px-3 md:px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-inner transition-all shrink-0 border border-dragon-red/10",
                    viewMode === 'combat' ? 'bg-dragon-red text-white shadow-lg ring-2 ring-white/20' : 'bg-white/40 text-parchment-600 hover:bg-parchment-200'
                  )}
                >
                  <GameIcon path={CORE_ICONS.weapon} size={16} /> <span className="hidden lg:inline">Actions</span>
                </button>
                <button 
                  onClick={() => {
                    playClickSound();
                  }}
                  title="View Map"
                  aria-label="View Map"
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-black text-[10px] uppercase transition-all bg-white/40 text-parchment-600 hover:bg-parchment-200 hover:text-dragon-red shrink-0 border border-dragon-red/5"
                >
                  <GameIcon name="compass" size={16} /> <span className="hidden lg:inline">Map</span>
                </button>
                <button 
                  onClick={() => {
                    playClickSound();
                  }}
                  title="View Journal"
                  aria-label="View Journal"
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-black text-[10px] uppercase transition-all bg-white/40 text-parchment-600 hover:bg-parchment-200 hover:text-dragon-red shrink-0 border border-dragon-red/5"
                >
                  <GameIcon path={ARCANE_CODEX_ICONS.book} size={16} /> <span className="hidden lg:inline">Journal</span>
                </button>
                <button 
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    playClickSound();
                  }}
                  title="Account Options"
                  aria-label="Account Options"
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-black text-[10px] uppercase transition-all bg-white/40 text-parchment-600 hover:bg-parchment-200 hover:text-dragon-red shrink-0 border border-dragon-red/5"
                >
                  <GameIcon path={CORE_ICONS.settings} size={16} /> <span className="hidden lg:inline">Options</span>
                </button>
              </>
            )}

            {(isProfileMenuOpen || isMonsterProfileOpen || isTransportProfileOpen) && (
              <div className="flex items-center gap-3 px-6 py-1 bg-dragon-red/5 border border-dragon-red/20 rounded shrink-0">
                 <span className="text-[10px] font-black text-dragon-red uppercase tracking-[0.2em]">
                   {isMonsterProfileOpen ? 'BESTIARY_DATA_LINKED' : isTransportProfileOpen ? 'TRANSPORT_MANIFEST_ACTIVE' : 'Profile_Interface_Active'}
                 </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden lg:flex items-center">
            <div className="h-8 w-px bg-parchment-300 mx-1" />
            <PartyLogistics />
            <div className="h-8 w-px bg-parchment-300 mx-1" />
          </div>
          
          <button 
            onClick={() => {
              setIsInventoryOpen(!isInventoryOpen);
              soundService.playEffect('UI_CLICK_LIGHT');
            }}
            className={cn(
              "p-2 rounded transition-all border-2",
              isInventoryOpen
                ? "bg-dragon-red text-white border-dragon-red shadow-lg" 
                : "text-dragon-red bg-white/50 border-dragon-red/20 hover:bg-parchment-200"
            )}
            title="Toggle Character Panel"
            aria-label="Toggle Character Panel"
          >
            <GameIcon path={CORE_ICONS.party_stats} size={24} />
          </button>

          <div className="h-8 w-px bg-parchment-300 mx-2" />
          
          {/* Profile & Options */}
          <div className="relative">
            {isAuthReady && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-parchment-900 uppercase tracking-wider leading-none mb-1">
                      {userProfile?.displayName || user.displayName || 'Traveler'}
                    </span>
                    <span className="text-[8px] font-bold text-dragon-red/60 uppercase tracking-widest">
                      {userProfile?.role || 'Traveler'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      soundService.playEffect('UI_CLICK_LIGHT');
                    }}
                    title="User Profile Menu"
                    aria-label="User Profile Menu"
                    className="relative group z-[50]"
                  >
                    <div className="w-10 h-10 rounded bg-parchment-100 border border-parchment-300 overflow-hidden group-hover:border-dragon-red/50 transition-all shadow-md">
                      {(userProfile?.photoURL || user.photoURL) ? (
                        <img src={userProfile?.photoURL || user.photoURL || ''} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-parchment-400">
                          <GameIcon path={CORE_ICONS.user} size={20} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-parchment-50 rounded border border-parchment-300 flex items-center justify-center text-parchment-500 group-hover:text-dragon-red transition-colors shadow-sm">
                      <GameIcon path={CORE_ICONS.chevron_down} size={10} color="currentColor" />
                    </div>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    loginWithGoogle();
                    soundService.playEffect('TRANSACTION_SUCCESS');
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-dragon-red text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md hover:bg-dragon-darkRed"
                >
                  <GameIcon name="login" size={14} />
                  <span>Login</span>
                </button>
              )
            )}

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[40]" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 bg-parchment-50 border-2 border-dragon-red rounded shadow-xl overflow-hidden z-[50]"
                  >
                    <div className="p-4 border-b border-dragon-red/10 bg-parchment-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-parchment-50 border border-parchment-300 overflow-hidden shadow-sm">
                          {(userProfile?.photoURL || user?.photoURL) ? (
                            <img src={userProfile?.photoURL || user?.photoURL || ''} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-parchment-300">
                              <GameIcon path={CORE_ICONS.user} size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold text-parchment-900 truncate">
                            {userProfile?.displayName || user?.displayName || 'Traveler'}
                          </span>
                          <span className="text-[10px] text-parchment-500 truncate">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="px-3 py-2">
                        <p className="text-[9px] font-bold text-parchment-400 uppercase tracking-[0.2em] mb-2">Account</p>
                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(true);
                            setShowProfileMenu(false);
                            soundService.playEffect('UI_MODAL_OPEN');
                          }}
                          title="View Profile"
                          aria-label="View Profile"
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-parchment-200 rounded text-parchment-600 hover:text-dragon-red transition-all text-xs font-medium group text-left"
                        >
                          <GameIcon path={CORE_ICONS.shield} size={14} color="currentColor" className="text-dragon-red/40 group-hover:text-dragon-red" />
                          <span>View Profile</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsSettingsModalOpen(true);
                            setShowProfileMenu(false);
                            soundService.playEffect('UI_MODAL_OPEN');
                          }}
                          title="Account Settings"
                          aria-label="Account Settings"
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-parchment-200 rounded text-parchment-600 hover:text-dragon-red transition-all text-xs font-medium group text-left"
                        >
                          <GameIcon path={CORE_ICONS.gear} size={14} color="currentColor" className="text-parchment-400 group-hover:text-dragon-red" />
                          <span>Account Settings</span>
                        </button>
                      </div>

                      <div className="h-px bg-dragon-red/10 my-1 mx-2" />

                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-bold text-parchment-400 uppercase tracking-[0.2em]">Characters</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-dragon-red/40 mr-1">{characters.length}/3</span>
                            <button 
                              onClick={() => {
                                setIsCharacterCreatorOpen(true);
                                setShowProfileMenu(false);
                                soundService.playEffect('UI_MODAL_OPEN');
                              }}
                              title="Start New Game"
                              aria-label="Start New Game"
                              className="flex items-center gap-1.5 px-2 py-1 bg-dragon-red text-white rounded text-[8px] font-black uppercase tracking-tighter hover:bg-dragon-darkRed transition-all shadow-sm"
                            >
                              <GameIcon path={CORE_ICONS.plus} size={10} color="#FFFFFF" />
                              New Game
                            </button>
                          </div>
                        </div>
                        {explorerTab === 'spells' && (
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={() => {
                              setGrimoireMode(!grimoireMode);
                              playClickSound();
                            }}
                            title={grimoireMode ? 'Exit Grimoire' : 'Open Grimoire'}
                            aria-label={grimoireMode ? 'Exit Grimoire' : 'Open Grimoire'}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-header uppercase tracking-wider text-xs",
                              grimoireMode 
                                ? "bg-dragon-red text-white border-dragon-red shadow-lg shadow-dragon-red/20" 
                                : "bg-parchment-200 text-dragon-red border-dragon-gold/30 hover:border-dragon-red/50"
                            )}
                          >
                            <GameIcon path={ARCANE_CODEX_ICONS.book} size={16} />
                            {grimoireMode ? 'Exit Grimoire' : 'Open Grimoire'}
                          </button>
                        </div>
                      )}

                      <div className="space-y-1">
                          {characters.map((char, index) => (
                            <button 
                              key={char.id} 
                              onClick={() => {
                                setActiveCharacter(char.id);
                                soundService.playEffect('UI_CLICK_LIGHT');
                              }}
                              title={`Switch to ${char.name}`}
                              aria-label={`Switch to ${char.name}`}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all group ${activeCharacterId === char.id ? 'bg-dragon-red text-white shadow-md' : 'text-parchment-600 hover:text-dragon-red hover:bg-parchment-200 border border-transparent'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded bg-parchment-100 border flex items-center justify-center transition-colors ${activeCharacterId === char.id ? 'border-dragon-red text-white' : 'border-parchment-300 text-parchment-400 group-hover:text-dragon-red'}`}>
                                  {index === 0 ? <GameIcon path={CORE_ICONS.shield} size={12} /> : <GameIcon path={CORE_ICONS.users} size={12} />}
                                </div>
                                <div className="flex flex-col items-start">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[11px] font-medium leading-none mb-1">{char.name}</span>
                                     {index === 0 && <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Hero</span>}
                                  </div>
                                  <span className={`text-[9px] ${activeCharacterId === char.id ? 'text-dragon-red/20' : 'text-parchment-400 group-hover:text-parchment-500'}`}>Lvl {char.level} {char.class}</span>
                                </div>
                              </div>
                              {activeCharacterId === char.id && (
                                <div className="w-1 h-1 rounded-full bg-white shadow-sm" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-dragon-red/10 my-1 mx-2" />

                      <button 
                        onClick={() => { 
                          logout(); 
                          setShowProfileMenu(false); 
                          soundService.playEffect('UI_BACK_EXIT');
                        }}
                        title="Logout"
                        aria-label="Logout"
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-dragon-red/10 rounded text-parchment-600 hover:text-dragon-red transition-all text-xs font-medium"
                      >
                        <GameIcon path={CORE_ICONS.logout} size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden flex">
        {/* Collection Mode */}
        {viewMode === 'collection' && (
          <>
            {/* Sidebar List */}
            <AnimatePresence>
              {isExplorerOpen && (
                <motion.div 
                  initial={{ x: -320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -320, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-80 border-r border-parchment-300 bg-parchment-50/50 flex flex-col z-10"
                >
                  {/* Explorer Tabs */}
                  <div className="flex border-b border-parchment-300 bg-parchment-100/50">
                    {[
                      { id: 'enemies', icon: 'monsters', label: 'Monsters' },
                      { id: 'materials', icon: 'materials', label: 'Materials' },
                      { id: 'spells', icon: 'spells', label: 'Spells' },
                      { id: 'equipment', icon: 'package', label: 'Equipment' },
                      { id: 'transport', icon: 'horse', label: 'Transport' },
                      { id: 'key', icon: 'key', label: 'Key Items' },
                      { id: 'books', icon: 'book', label: 'Books' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        title={tab.label}
                        aria-label={tab.label}
                        onClick={() => {
                          setExplorerTab(tab.id as ExplorerTab);
                          playClickSound();
                        }}
                        className={cn(
                          "flex-1 flex flex-col items-center py-3 px-1 transition-all relative border-r border-parchment-300 last:border-r-0",
                          explorerTab === tab.id ? "bg-dragon-red text-white" : "text-parchment-600 hover:bg-parchment-200"
                        )}
                      >
                        <GameIcon name={tab.icon as GameIconName} size={18} />
                      </button>
                    ))}
                  </div>

                  {/* Common Name Box */}
                  <div className="bg-white/40 border-b border-parchment-300 py-2 px-4 text-center">
                    <h2 className="text-xs font-bold text-dragon-red uppercase tracking-[0.2em] font-header">
                      {explorerTab === 'enemies' ? 'Monsters' : 
                       explorerTab === 'materials' ? 'Materials' : 
                       explorerTab === 'spells' ? 'Spells' :
                       explorerTab === 'equipment' ? 'Equipment' :
                       explorerTab === 'transport' ? 'Transport' :
                       explorerTab === 'key' ? 'Key Items' : 'Books'}
                    </h2>
                  </div>

                  {/* Spell Level Tabs */}
                  {explorerTab === 'spells' && (
                    <div className="grid grid-cols-10 border-b border-parchment-300 bg-white/30 backdrop-blur-sm">
                      {['C', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((lvl, i) => {
                        const levelStr = `lvl:${i}`;
                        const isActive = searchQuery.includes(levelStr);
                        return (
                          <button
                            key={lvl}
                            onClick={() => {
                              if (isActive) {
                                setSearchQuery(searchQuery.replace(levelStr, '').trim());
                              } else {
                                // Remove any existing lvl: search
                                const cleaned = searchQuery.replace(/lvl:\d+/g, '').trim();
                                setSearchQuery(`${levelStr} ${cleaned}`.trim());
                                // Automatically clear category if we search globally by level
                                if (!selectedCategory) {
                                  // This is handled by itemList calculation now
                                }
                              }
                              playClickSound();
                            }}
                            className={cn(
                              "h-10 flex flex-col items-center justify-center transition-all border-r border-parchment-300 last:border-r-0 relative group",
                              isActive 
                                ? "bg-dragon-red text-white shadow-inner" 
                                : "text-parchment-400 hover:bg-parchment-200 hover:text-dragon-red"
                            )}
                            title={i === 0 ? "Cantrips" : `Level ${i} Spells`}
                          >
                            <span className="text-[11px] font-black uppercase tracking-tighter">{lvl}</span>
                            {isActive && (
                              <motion.div 
                                layoutId="spell-lvl-active"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-dragon-gold"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-4 border-b border-parchment-300 space-y-3">
                    {(explorerTab === 'equipment' || explorerTab === 'materials' || explorerTab === 'enemies' || explorerTab === 'spells') && selectedCategory && (
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setGrimoireMode(false);
                          playClickSound();
                        }}
                        title="Back to Categories"
                        aria-label="Back to Categories"
                        className="w-full flex items-center gap-2 p-2 text-[10px] font-bold uppercase text-dragon-red bg-dragon-red/5 hover:bg-dragon-red/10 border border-dragon-red/20 rounded-lg transition-all"
                      >
                        <GameIcon path={CORE_ICONS.chevron_right} size={14} className="rotate-180" color="#8B0000" />
                        Back to Categories
                      </button>
                    )}
                    <div className="relative">
                      <GameIcon path={CORE_ICONS.search} className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color="#8B4513" />
                      <input 
                        type="text"
                        placeholder="Search archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-parchment-100 border border-parchment-300 rounded-lg text-sm focus:outline-none focus:border-dragon-red"
                      />
                    </div>
                    {explorerTab === 'spells' && selectedCategory && (
                      <div className="flex flex-wrap gap-1.5 px-1">
                        <span className="text-[8px] font-black uppercase text-dragon-red/40 tracking-widest w-full mb-1">Search Helpers:</span>
                        {['lvl:0', 'lvl:1', 'class:wizard', 'class:cleric'].map(hint => (
                          <button 
                            key={hint}
                            onClick={() => setSearchQuery(hint)}
                            title={`Search for ${hint}`}
                            aria-label={`Search for ${hint}`}
                            className="px-1.5 py-0.5 rounded bg-dragon-red/5 border border-dragon-red/10 text-[9px] font-black text-dragon-red hover:bg-dragon-red/10 transition-colors uppercase"
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoadingList ? (
                      <div className="flex flex-col items-center justify-center p-12 text-parchment-400">
                        <GameIcon name="refresh" className="animate-spin mb-2" />
                        <span className="text-xs font-bold uppercase">Consulting Archives...</span>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {filteredList.map((m, idx) => {
                          const isSelected = selectedItem?.index === m.index || (m.versions && Object.values(m.versions).some((v: any) => v.index === selectedItem?.index));
                          
                          return (
                            <div
                              key={`${m.index || 'unnamed'}-${idx}`}
                              onClick={() => {
                                if ((explorerTab === 'equipment' || explorerTab === 'materials' || explorerTab === 'enemies' || explorerTab === 'spells') && !selectedCategory) {
                                  setSelectedCategory(m.index);
                                  playClickSound();
                                } else {
                                  selectItem(m.index);
                                  if (explorerTab === 'transport') {
                                    setIsTransportProfileOpen(true);
                                  }
                                  playClickSound();
                                }
                              }}
                              className={cn(
                                "w-full flex items-center justify-between transition-all text-left group cursor-pointer relative",
                                  !selectedCategory && (explorerTab === 'enemies' || explorerTab === 'equipment' || explorerTab === 'materials' || explorerTab === 'spells')
                                  ? "bg-[#fcddaf] rounded-[15px] my-0.5 p-0 overflow-hidden border border-dragon-gold/20" 
                                  : isSelected 
                                    ? "bg-dragon-red text-white shadow-md rounded-lg p-3" 
                                    : "hover:bg-parchment-200 text-parchment-800 rounded-lg p-3"
                              )}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                {(explorerTab === 'enemies' || explorerTab === 'equipment' || explorerTab === 'materials' || explorerTab === 'spells') && !selectedCategory && (
                                  <div className="w-[80px] h-[80px] flex items-center justify-center -mr-[30px] shrink-0">
                                    <GameIcon 
                                      name={m.index as any} 
                                      size={80} 
                                      color="#8B0000"
                                      className="w-[80px] h-[80px] opacity-20"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col overflow-hidden relative z-10 px-4">
                                  {(!selectedCategory && (explorerTab === 'enemies' || explorerTab === 'equipment' || explorerTab === 'materials' || explorerTab === 'spells')) ? (
                                    <>
                                      <span 
                                        className="text-[24px] font-bold truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] font-header tracking-tight" 
                                        style={{ color: '#981d1d' }}
                                      >
                                        {safeString(m.name || m.index)}
                                      </span>
                                      <span 
                                        className="text-[12px] font-black uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] font-sans tracking-widest"
                                        style={{ color: '#b48a4e' }}
                                      >
                                        {m.totalAssets || (m.equipment?.length || m.materials?.length || m.monsters?.length || m.spells?.length || 0)} Items
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-header text-sm uppercase tracking-wider truncate">{safeString(m.name || m.index)}</span>
                                      {selectedCategory && (m.size || m.type || m.alignment) && (
                                        <span className={cn(
                                          "text-[9px] font-bold uppercase tracking-tighter",
                                          isSelected ? "text-white/70" : "text-parchment-500"
                                        )}>
                                          {(typeof m.size === 'object' ? m.size?.name || m.size?.value : m.size)} {(typeof m.type === 'object' ? m.type?.name || m.type?.value : m.type)} {m.alignment && `• ${(typeof m.alignment === 'object' ? m.alignment?.name || m.alignment?.value : m.alignment)}`}
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {explorerTab === 'equipment' && selectedCategory && m.versions && Object.keys(m.versions).length > 1 && (
                                    <div className="flex gap-1 mt-1.5 pointer-events-auto">
                                      {Object.keys(m.versions).sort().map((tierStr) => {
                                        const tierNum = parseInt(tierStr);
                                        const version = m.versions[tierNum];
                                        const isSelectTier = selectedItem?.index === version.index;
                                        return (
                                          <button
                                            key={tierStr}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              selectItem(version.index);
                                              playClickSound();
                                            }}
                                            title={tierNum === 0 ? 'Base Version' : `Tier ${tierNum} Version`}
                                            aria-label={tierNum === 0 ? 'Base Version' : `Tier ${tierNum} Version`}
                                            className={cn(
                                              "w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border transition-all",
                                              isSelectTier 
                                                ? "bg-dragon-red text-white border-dragon-red shadow-sm" 
                                                : isSelected 
                                                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                                  : "bg-parchment-100/50 text-dragon-red border-dragon-gold/30 hover:bg-white hover:border-dragon-red/30"
                                            )}
                                          >
                                            {tierNum === 0 ? 'B' : `+${tierNum}`}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {selectedCategory && (m.size || m.type || m.alignment) && (
                                    <span className={cn(
                                      "text-[9px] font-bold uppercase tracking-tighter",
                                      isSelected ? "text-white/70" : "text-parchment-500"
                                    )}>
                                      {(typeof m.size === 'object' ? m.size?.name || m.size?.value : m.size)} {(typeof m.type === 'object' ? m.type?.name || m.type?.value : m.type)} {m.alignment && `• ${(typeof m.alignment === 'object' ? m.alignment?.name || m.alignment?.value : m.alignment)}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <GameIcon path={CORE_ICONS.chevron_right} size={14} className={cn(
                                "transition-transform",
                                isSelected || ((explorerTab === 'equipment' || explorerTab === 'materials' || explorerTab === 'enemies') && !selectedCategory) ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                              )} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Display */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden relative transition-all duration-500">
              {isLoadingItem ? (
                <div className="flex flex-col items-center gap-4">
                  <GameIcon path={CORE_ICONS.loading} className="animate-spin" size={48} color="#8B0000" />
                  <p className="font-header text-xl text-dragon-darkRed animate-pulse">Summoning Entity Data...</p>
                </div>
              ) : selectedItem ? (
                <div className="flex flex-col items-center gap-4 md:gap-8 animate-in fade-in zoom-in-95 duration-500 max-h-full overflow-y-auto custom-scrollbar p-4">
                  <div className="relative group/card-container">
                    <motion.div 
                      animate={{ 
                        scale: (isExplorerOpen && isInventoryOpen) ? 0.75 : (isExplorerOpen || isInventoryOpen) ? 0.85 : 1 
                      }}
                      className="origin-center transition-transform"
                    >
                      <ErrorBoundary name="ArcaneCard" fallback={(
                        <div className="w-[450px] h-[280px] bg-parchment-200/50 border-4 border-dashed border-dragon-gold/20 rounded-[24px] flex flex-col items-center justify-center p-8 text-center space-y-3">
                          <GameIcon path={CORE_ICONS.alert_triangle} size={48} color="#8B0000" className="opacity-40" />
                          <p className="font-header text-dragon-darkRed uppercase tracking-widest text-lg">Mystical Distortion</p>
                          <p className="font-body text-xs italic text-parchment-600">The essence of this entity is currently unstable or corrupted.</p>
                        </div>
                      )}>
                        {explorerTab === 'enemies' && <MonsterCard monster={selectedItem} />}
                        {explorerTab === 'materials' && <MaterialCard material={selectedItem} />}
                        {explorerTab === 'spells' && (
                          grimoireMode 
                            ? <BookReader 
                                isOpen={true}
                                onClose={() => setGrimoireMode(false)}
                                book={{
                                  id: 'grimoire',
                                  title: "The Arcanist's Lexicon",
                                  author: "Ancient Lorekeepers",
                                  type: "spellbook",
                                  coverIndex: 0,
                                  spineIndex: 0,
                                  pages: (selectedCategory ? (spellCategories.find(c => c.index === selectedCategory)?.spells || []) : spellsList).map((spell: any) => ({
                                    id: spell.index,
                                    content: (
                                      <div className="flex justify-center py-4">
                                        <div className="scale-[0.85] origin-top">
                                           <SpellCard spell={spell} className="shadow-none border-none !bg-transparent" />
                                        </div>
                                      </div>
                                    ),
                                    headerContent: (
                                      <div className="mb-4 border-b border-black/10 pb-2 flex justify-between items-center text-black/40">
                                         <span className="text-[10px] font-bold uppercase tracking-widest">Enchanted Collection</span>
                                         <GameIcon path={ARCANE_CODEX_ICONS.wand} size={12} color="#000000" className="opacity-40" />
                                      </div>
                                    )
                                  }))
                                }}
                                initialPageIndex={Math.max(0, (selectedCategory ? (spellCategories.find(c => c.index === selectedCategory)?.spells || []) : spellsList).findIndex((s: any) => s.index === selectedItem?.index))}
                              />
                            : <SpellCard spell={selectedItem} />
                        )}
                        {(explorerTab === 'equipment' || explorerTab === 'key' || explorerTab === 'books') && <EquipmentCard equipment={selectedItem} />}
                      </ErrorBoundary>
                    </motion.div>
                    <button 
                      onClick={() => {
                        addToBackpack(selectedItem);
                        playClickSound();
                      }}
                      className="absolute -top-2 -left-2 z-30 w-10 h-10 bg-dragon-red text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-700 transition-all hover:scale-110 border-2 border-parchment-100"
                      title="Add to Inventory"
                      aria-label="Add to Inventory"
                    >
                      <GameIcon path={CORE_ICONS.plus} size={24} color="#FFFFFF" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-30">
                  <GameIcon path={ARCANE_CODEX_ICONS.knowledge} size={120} color="#8B4513" className="mx-auto" />
                  <h3 className="font-header text-3xl text-parchment-600 uppercase">Select a legend to view</h3>
                  <p className="font-body italic text-parchment-500">The archives contain many secrets, waiting to be revealed.</p>
                </div>
              )}
            </div>

            {/* Character Panel */}
            <CharacterPanel />
          </>
        )}

        {/* Combat Mode (HUD / Card Simulator) */}
        {viewMode === 'combat' && <ActionView />}
      </main>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] min-h-[500px] overflow-hidden rounded-3xl shadow-2xl border-2 border-dragon-red bg-parchment-50 z-10 flex flex-col"
            >
               <ProfileSettings onClose={() => setIsSettingsModalOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Focus View Overlay (Global) */}
      {focusedItem && isBookLike(focusedItem) ? (
        <BookFocus 
          book={focusedItem as unknown as Book} 
          onOpen={() => setManualBook(focusedItem as unknown as Book)} 
          onClose={() => setFocusedItem(null)} 
        />
      ) : (focusedItem && !isMonsterProfileOpen) ? (
        <FocusView />
      ) : null}

      {/* Book Reader (Global Manual Open) */}
      {manualBook && (
        <BookReader 
          book={manualBook} 
          isOpen={true}
          onClose={() => setManualBook(null)} 
        />
      )}
    </div>

    {/* Unified Drag Overlay with Contextual Pointers */}
    <DragOverlay dropAnimation={null}>
      {activeDragItem ? (
        <div className="relative pointer-events-none group z-[1000]">
          {/* The Item Shadow/Ghost */}
          <div className="w-24 aspect-[9/16] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-3">
             <ChromaKeyImage 
              src={normalizeImageUrl(activeDragItem.imageUrl, activeDragItem._type || 'equipment', activeDragItem.index || activeDragItem.id)} 
              alt="" 
              className="w-full h-full object-contain scale-125" 
             />
          </div>

          {/* Contextual Pointer Icon */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-6 -right-6 w-12 h-12 flex items-center justify-center p-2 rounded-full border-2 border-dragon-red bg-parchment-100 shadow-xl z-50"
          >
            <GameIcon 
              path={overData?.slot ? CORE_ICONS.equip : overData?.characterId ? CORE_ICONS.place : CORE_ICONS.grab} 
              size={24} 
              color="#8B0000" 
            />
          </motion.div>

          {/* Hint Tag */}
          {overData?.slot && (
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-dragon-red text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-lg whitespace-nowrap border border-white/20">
                Ready to Equip: {overData.slot.replace('_', ' ')}
             </div>
          )}
           {overData?.characterId && (
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-parchment-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-lg whitespace-nowrap border border-white/20">
                Transfer to Inventory
             </div>
          )}
        </div>
      ) : null}
    </DragOverlay>
    </DndContext>
  );
};

export default ArcaneCodex;
