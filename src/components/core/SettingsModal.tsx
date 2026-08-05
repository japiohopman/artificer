import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { GameIcon } from '../../game_icons';
import { playClickSound, playSuccessSound } from '../../services/storageService';
import { AudioOptions } from './settings_modal/AudioOptions';
import { AuthOptions } from './settings_modal/AuthOptions';
import { HueOptions } from './settings_modal/HueOptions';
import { GeneralOptions } from './settings_modal/GeneralOptions';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
  const setIsSettingsOpen = useUIStore(state => state.setIsSettingsOpen);

  const [activeSection, setActiveSection] = useState<'audio' | 'auth' | 'hue' | 'general' | null>('audio');

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    playClickSound();
    setIsSettingsOpen(false);
  };

  const toggleSection = (section: 'audio' | 'auth' | 'hue' | 'general') => {
    playClickSound();
    setActiveSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg shadow-[0_0_50px_rgba(159,18,57,0.15)] flex flex-col h-[600px] overflow-hidden font-mono"
      >
        {/* Border accent lines */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-dragon-red/30" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-dragon-red/20 to-transparent" />

        {/* Header */}
        <div className="p-4 border-b border-zinc-850 bg-black/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-dragon-red/10 border border-dragon-red/30 rounded text-dragon-red">
              <GameIcon name="adjust" size={16} />
            </div>
            <div>
              <div className="text-[9px] text-dragon-red font-black tracking-[0.2em] uppercase">SYSTEM_OVR</div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">System Settings & Calibration</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-zinc-900 rounded-md transition-colors text-zinc-500 hover:text-white border border-zinc-850"
            aria-label="Close settings"
          >
            <GameIcon name="close" size={14} />
          </button>
        </div>

        {/* Vertical Stack Accordion Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/10">
          
          {/* 1. Audio & Geluid */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection('audio')}
              className={`flex items-center justify-between w-full p-3.5 rounded-lg border text-left transition-all font-mono group relative overflow-hidden ${
                activeSection === 'audio'
                  ? 'bg-zinc-900/90 border-dragon-red/40 text-white shadow-lg shadow-dragon-red/5'
                  : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs ${activeSection === 'audio' ? 'text-dragon-red' : 'text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Audio & Geluid</span>
                  <span className="text-[9px] text-zinc-500 font-normal">Volume mixer, channels and background layers calibration</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeSection === 'audio' && <span className="text-[9px] text-dragon-red/80 font-bold bg-dragon-red/10 border border-dragon-red/20 px-1.5 py-0.5 rounded">ACTIVE</span>}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 text-zinc-500 ${activeSection === 'audio' ? 'rotate-180 text-dragon-red' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {/* Highlight gradient */}
              {activeSection === 'audio' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-dragon-red" />
              )}
            </button>
            
            <AnimatePresence initial={false}>
              {activeSection === 'audio' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-950/40 border-x border-b border-zinc-900 rounded-b-lg p-4 -mt-1 mb-2">
                    <AudioOptions />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Authenticator */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection('auth')}
              className={`flex items-center justify-between w-full p-3.5 rounded-lg border text-left transition-all font-mono group relative overflow-hidden ${
                activeSection === 'auth'
                  ? 'bg-zinc-900/90 border-dragon-red/40 text-white shadow-lg shadow-dragon-red/5'
                  : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs ${activeSection === 'auth' ? 'text-dragon-red' : 'text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Authenticator</span>
                  <span className="text-[9px] text-zinc-500 font-normal">Secure API Key credentials vault for Gemini, OpenAI & ElevenLabs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeSection === 'auth' && <span className="text-[9px] text-dragon-red/80 font-bold bg-dragon-red/10 border border-dragon-red/20 px-1.5 py-0.5 rounded">ACTIVE</span>}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 text-zinc-500 ${activeSection === 'auth' ? 'rotate-180 text-dragon-red' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {/* Highlight gradient */}
              {activeSection === 'auth' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-dragon-red" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {activeSection === 'auth' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-950/40 border-x border-b border-zinc-900 rounded-b-lg p-4 -mt-1 mb-2">
                    <AuthOptions />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Philips Hue */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection('hue')}
              className={`flex items-center justify-between w-full p-3.5 rounded-lg border text-left transition-all font-mono group relative overflow-hidden ${
                activeSection === 'hue'
                  ? 'bg-zinc-900/90 border-dragon-red/40 text-white shadow-lg shadow-dragon-red/5'
                  : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs ${activeSection === 'hue' ? 'text-dragon-red' : 'text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A7.5 7.5 0 0 0 3 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                    <path d="M9 18h6"></path>
                    <path d="M10 22h4"></path>
                  </svg>
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Philips Hue</span>
                  <span className="text-[9px] text-zinc-500 font-normal">Sync interactive room atmospheric lighting with smart bulbs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeSection === 'hue' && <span className="text-[9px] text-dragon-red/80 font-bold bg-dragon-red/10 border border-dragon-red/20 px-1.5 py-0.5 rounded">ACTIVE</span>}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 text-zinc-500 ${activeSection === 'hue' ? 'rotate-180 text-dragon-red' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {/* Highlight gradient */}
              {activeSection === 'hue' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-dragon-red" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {activeSection === 'hue' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-950/40 border-x border-b border-zinc-900 rounded-b-lg p-4 -mt-1 mb-2">
                    <HueOptions />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. General & Models */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection('general')}
              className={`flex items-center justify-between w-full p-3.5 rounded-lg border text-left transition-all font-mono group relative overflow-hidden ${
                activeSection === 'general'
                  ? 'bg-zinc-900/90 border-dragon-red/40 text-white shadow-lg shadow-dragon-red/5'
                  : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs ${activeSection === 'general' ? 'text-dragon-red' : 'text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">General & Models</span>
                  <span className="text-[9px] text-zinc-500 font-normal">Personal alias and Large Language Model (LMM) version settings</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeSection === 'general' && <span className="text-[9px] text-dragon-red/80 font-bold bg-dragon-red/10 border border-dragon-red/20 px-1.5 py-0.5 rounded">ACTIVE</span>}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 text-zinc-500 ${activeSection === 'general' ? 'rotate-180 text-dragon-red' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {/* Highlight gradient */}
              {activeSection === 'general' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-dragon-red" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {activeSection === 'general' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-950/40 border-x border-b border-zinc-900 rounded-b-lg p-4 -mt-1 mb-2">
                    <GeneralOptions />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-black/40 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
          <span className="uppercase tracking-widest text-zinc-400">Arcane VTT // System Ready</span>
          <button
            onClick={() => {
              playSuccessSound();
              setIsSettingsOpen(false);
            }}
            className="px-5 py-2 bg-dragon-red hover:bg-red-700 active:scale-95 text-white font-bold rounded uppercase tracking-wider text-[10px] transition-all border border-transparent shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            Save & Apply Calibration
          </button>
        </div>
      </motion.div>
    </div>
  );
};
