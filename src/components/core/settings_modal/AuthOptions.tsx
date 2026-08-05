import React, { useState } from 'react';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { playClickSound } from '../../../services/storageService';

export const AuthOptions: React.FC = () => {
  const settings = useSettingsStore();

  const [showKey1, setShowKey1] = useState(false);
  const [showKey2, setShowKey2] = useState(false);
  const [showKey3, setShowKey3] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);

  return (
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
            className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
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
            className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
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
            className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
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
            className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
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
            className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
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
  );
};
