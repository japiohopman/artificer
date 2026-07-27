import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { LAYER_NAMES, AudioLayer } from '../../types/audio';
import { GameIcon } from '../../game_icons';
import { playClickSound, playSuccessSound } from '../../services/storageService';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
  const setIsSettingsOpen = useUIStore(state => state.setIsSettingsOpen);

  const { layerStates, updateLayerVolume, toggleLayerMute } = useAudioStore();
  const settings = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'audio' | 'auth' | 'general'>('audio');

  // Local state for passwords show/hide
  const [showKey1, setShowKey1] = useState(false);
  const [showKey2, setShowKey2] = useState(false);
  const [showKey3, setShowKey3] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    playClickSound();
    setIsSettingsOpen(false);
  };

  const sortedLayers = (Object.keys(layerStates) as unknown as string[])
    .map(key => parseInt(key) as AudioLayer)
    .sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-3xl bg-zinc-950 border-2 border-dragon-gold text-zinc-300 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col h-[580px] overflow-hidden font-mono"
      >
        {/* Border accents */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-dragon-red/20" />

        {/* Header */}
        <div className="p-4 border-b border-zinc-850 bg-black/40 flex items-center justify-between">
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

        {/* Tab Controls */}
        <div className="flex bg-black/20 border-b border-zinc-850 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => { setActiveTab('audio'); playClickSound(); }}
            className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest border ${
              activeTab === 'audio'
                ? 'bg-dragon-red border-dragon-gold text-white shadow-md'
                : 'bg-zinc-900/40 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
            }`}
          >
            Audio & Geluid
          </button>
          <button
            onClick={() => { setActiveTab('auth'); playClickSound(); }}
            className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest border ${
              activeTab === 'auth'
                ? 'bg-dragon-red border-dragon-gold text-white shadow-md'
                : 'bg-zinc-900/40 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
            }`}
          >
            Authenticator
          </button>
          <button
            onClick={() => { setActiveTab('general'); playClickSound(); }}
            className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest border ${
              activeTab === 'general'
                ? 'bg-dragon-red border-dragon-gold text-white shadow-md'
                : 'bg-zinc-900/40 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
            }`}
          >
            General & Models
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/10">
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                Mixer Channel Calibrations
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedLayers.map((layerId) => {
                  const state = layerStates[layerId];
                  if (!state) return null;
                  return (
                    <div
                      key={layerId}
                      className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-300 truncate max-w-[150px]">
                            {LAYER_NAMES[layerId]}
                          </span>
                          <span className="text-[9px] text-zinc-500 tabular-nums font-mono font-bold">
                            {Math.round(state.volume * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={state.volume}
                          onChange={(e) => updateLayerVolume(layerId, parseFloat(e.target.value))}
                          className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-dragon-red"
                        />
                      </div>
                      <button
                        onClick={() => { toggleLayerMute(layerId); playClickSound(); }}
                        className={`px-2 py-1 text-[9px] font-black rounded border transition-all shrink-0 ${
                          state.isMuted
                            ? 'bg-red-950/40 border-red-500 text-red-500 shadow-lg animate-pulse'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {state.isMuted ? 'MUTED' : 'MUTE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                Secure Key Vault & Tokens
              </div>

              {/* ElevenLabs Account 1 */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex justify-between">
                  <span>ElevenLabs API Key (Account 1)</span>
                  <span className="text-zinc-600">PRIMARY</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKey1 ? 'text' : 'password'}
                    value={settings.elevenlabs_key_1}
                    onChange={(e) => settings.setSettings({ elevenlabs_key_1: e.target.value })}
                    placeholder="sk_..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowKey1(!showKey1); playClickSound(); }}
                    className="px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-zinc-400 font-bold"
                  >
                    {showKey1 ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* ElevenLabs Account 2 */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex justify-between">
                  <span>ElevenLabs API Key (Account 2)</span>
                  <span className="text-zinc-600">SECONDARY</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKey2 ? 'text' : 'password'}
                    value={settings.elevenlabs_key_2}
                    onChange={(e) => settings.setSettings({ elevenlabs_key_2: e.target.value })}
                    placeholder="sk_..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowKey2(!showKey2); playClickSound(); }}
                    className="px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-zinc-400 font-bold"
                  >
                    {showKey2 ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* ElevenLabs Account 3 */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex justify-between">
                  <span>ElevenLabs API Key (Account 3)</span>
                  <span className="text-zinc-600">TERTIARY</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKey3 ? 'text' : 'password'}
                    value={settings.elevenlabs_key_3}
                    onChange={(e) => settings.setSettings({ elevenlabs_key_3: e.target.value })}
                    placeholder="sk_..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowKey3(!showKey3); playClickSound(); }}
                    className="px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-zinc-400 font-bold"
                  >
                    {showKey3 ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Gemini Token */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                  Google Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={settings.gemini_key}
                    onChange={(e) => settings.setSettings({ gemini_key: e.target.value })}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowGemini(!showGemini); playClickSound(); }}
                    className="px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-zinc-400 font-bold"
                  >
                    {showGemini ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* OpenAI Token */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                  OpenAI API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showOpenAI ? 'text' : 'password'}
                    value={settings.openai_key}
                    onChange={(e) => settings.setSettings({ openai_key: e.target.value })}
                    placeholder="sk-proj-..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowOpenAI(!showOpenAI); playClickSound(); }}
                    className="px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-zinc-400 font-bold"
                  >
                    {showOpenAI ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                General Settings & Model Selections
              </div>

              {/* User Alias */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                  Personal Identity Alias
                </label>
                <input
                  type="text"
                  value={settings.user_alias}
                  onChange={(e) => settings.setSettings({ user_alias: e.target.value })}
                  placeholder="Adventurer"
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono"
                />
              </div>

              {/* Gemini Model */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                  Google Gemini LMM Model
                </label>
                <select
                  value={settings.gemini_model}
                  onChange={(e) => settings.setSettings({ gemini_model: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono cursor-pointer"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Analytical)</option>
                  <option value="gemini-pro">Gemini 1.0 Pro (Legacy)</option>
                </select>
              </div>

              {/* OpenAI Model */}
              <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/40">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                  OpenAI GPT LMM Model
                </label>
                <select
                  value={settings.openai_model}
                  onChange={(e) => settings.setSettings({ openai_model: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-gold transition-all font-mono cursor-pointer"
                >
                  <option value="gpt-4o">GPT-4o (High Intelligence)</option>
                  <option value="gpt-4o-mini">GPT-4o-mini (Speed & Utility)</option>
                  <option value="gpt-4-turbo">GPT-4-Turbo (Legacy)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-black/40 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
          <span className="uppercase tracking-widest">Arcane VTT // System Ready</span>
          <button
            onClick={() => {
              playSuccessSound();
              setIsSettingsOpen(false);
            }}
            className="px-5 py-2 bg-dragon-red border border-dragon-gold text-white font-bold rounded uppercase tracking-wider text-[10px] hover:bg-red-700 active:scale-95 transition-all"
          >
            Save & Apply Calibration
          </button>
        </div>
      </motion.div>
    </div>
  );
};
