import React from 'react';
import { useSettingsStore } from '../../../store/useSettingsStore';

export const GeneralOptions: React.FC = () => {
  const settings = useSettingsStore();

  return (
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
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono"
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
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono cursor-pointer"
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
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs rounded text-zinc-300 focus:outline-none focus:border-dragon-red transition-all font-mono cursor-pointer"
        >
          <option value="gpt-4o">GPT-4o (High Intelligence)</option>
          <option value="gpt-4o-mini">GPT-4o-mini (Speed & Utility)</option>
          <option value="gpt-4-turbo">GPT-4-Turbo (Legacy)</option>
        </select>
      </div>
    </div>
  );
};
