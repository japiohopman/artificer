import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { playClickSound, playModalCloseSound } from '../../services/storageService';

// Tabs
import { DiaryTab } from './journal/DiaryTab';
import { QuestTab } from './journal/QuestTab';
import { BestiaryTab } from './journal/BestiaryTab';
import { LoreTab } from './journal/LoreTab';

type JournalTab = 'diary' | 'quests' | 'bestiary' | 'lore';

export const Journal: React.FC = () => {
  const { isJournalOpen, setIsJournalOpen } = useStore();
  const [activeTab, setActiveTab] = useState<JournalTab>('diary');

  if (!isJournalOpen) return null;

  const tabs: { id: JournalTab; label: string; icon: any }[] = [
    { id: 'diary', label: 'Dagboek', icon: 'book' },
    { id: 'quests', label: 'Quest Log', icon: 'key' },
    { id: 'bestiary', label: 'Bestiarium', icon: 'sword' },
    { id: 'lore', label: 'Lore Codex', icon: 'lore' }
  ];

  return (
    <AnimatePresence>
      {isJournalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
        >
          {/* Main Journal Container */}
          <div
            className="w-full max-w-6xl h-[85vh] bg-parchment-100 rounded-lg shadow-2xl border-[12px] border-dragon-darkRed flex flex-col relative overflow-hidden"
            style={{
              backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
              backgroundSize: 'cover'
            }}
          >
            {/* Header / Ribbon */}
            <header className="h-20 bg-dragon-red shadow-lg flex items-center justify-between px-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-dragon-gold flex items-center justify-center border-2 border-white/20">
                  <GameIcon name="lore" size={24} color="#FFFFFF" />
                </div>
                <div>
                  <h1 className="font-header text-2xl text-white tracking-widest uppercase">Campagne Codex</h1>
                  <p className="text-[10px] text-dragon-gold font-bold tracking-[0.3em] uppercase">Het Eeuwige Geheugen</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsJournalOpen(false);
                  playModalCloseSound();
                }}
                className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <GameIcon name="close" size={20} color="#FFFFFF" />
              </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <nav className="w-20 md:w-48 bg-dragon-darkRed/95 flex flex-col pt-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      playClickSound();
                    }}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-3 px-4 py-6 md:py-4 transition-all relative group",
                      activeTab === tab.id
                        ? "bg-parchment-100 text-dragon-red"
                        : "text-parchment-400 hover:text-white"
                    )}
                  >
                    <GameIcon
                      name={tab.icon}
                      size={24}
                      color={activeTab === tab.id ? "#8B0000" : "currentColor"}
                    />
                    <span className="hidden md:block font-header text-sm tracking-widest uppercase">{tab.label}</span>

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeJournalTab"
                        className="absolute right-0 top-0 bottom-0 w-1 bg-dragon-gold md:hidden"
                      />
                    )}
                  </button>
                ))}
              </nav>

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-paper-texture">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activeTab === 'diary' && <DiaryTab />}
                    {activeTab === 'quests' && <QuestTab />}
                    {activeTab === 'bestiary' && <BestiaryTab />}
                    {activeTab === 'lore' && <LoreTab />}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>

            {/* Footer / Status bar */}
            <footer className="h-8 bg-dragon-darkRed/90 border-t border-white/5 flex items-center px-4 justify-between text-[9px] text-parchment-400 uppercase tracking-widest">
               <span>Versie 2.0.4 - Campaign Persistence Engine</span>
               <div className="flex gap-4">
                  <span>Context Cache: 94%</span>
                  <span>AI Narrator: Gekoppeld</span>
               </div>
            </footer>

            {/* Decorative Overlay */}
            <div className="absolute inset-0 border-[2px] border-dragon-gold/30 pointer-events-none m-2 rounded-sm" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
