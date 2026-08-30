import React from 'react';
import { GameIcon } from '../../../game_icons';

interface WelcomeStepProps {
  ruleset?: '2014' | '2024';
  onSelectRuleset?: (ruleset: '2014' | '2024') => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ ruleset = '2014', onSelectRuleset }) => (
  <div id="welcome-step" className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-6 py-6">
    {/* Clean, quiet codex icon badge */}
    <div className="w-20 h-20 bg-dragon-red/5 border border-dragon-gold/30 rounded-sm flex items-center justify-center text-dragon-red relative shadow-sm">
      <GameIcon name="book" size={40} />
      <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none" />
    </div>

    {/* Concise introductory block */}
    <div className="space-y-2">
      <h2 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-wider">
        Choose Campaign Ruleset
      </h2>
      <p className="text-sm text-parchment-600 font-medium leading-relaxed max-w-lg mx-auto">
        Select the ruleset framework for this character. This choice governs available species traits, background origins, equipment, and spell indexing throughout character creation.
      </p>
    </div>

    {/* Ruleset Selection Section */}
    <div className="w-full bg-white/50 border border-dragon-gold/20 rounded-md p-5 shadow-sm space-y-4">
      <div className="flex flex-col items-center space-y-1">
        <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.3em]">Campaign Contract</span>
        <h3 className="text-base font-header font-black text-dragon-darkRed uppercase tracking-wider">
          Select Ruleset Framework
        </h3>
        <p className="text-[11px] text-parchment-600 font-medium">
          Choose the ruleset context for this champion and campaign session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {/* D&D 5e 2014 */}
        <button
          type="button"
          onClick={() => onSelectRuleset?.('2014')}
          className={`p-4 rounded-md border-2 transition-all flex flex-col justify-between relative overflow-hidden text-left ${
            ruleset === '2014'
              ? 'border-dragon-red bg-dragon-red/10 shadow-md ring-1 ring-dragon-gold/30'
              : 'border-dragon-gold/20 bg-white/40 hover:border-dragon-gold/40 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-2">
              <GameIcon name="book" size={18} color={ruleset === '2014' ? '#991B1B' : '#B8860B'} />
              <h4 className="font-header font-black text-sm uppercase text-dragon-darkRed tracking-wide">D&D 5e (2014)</h4>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-dragon-gold/20 text-dragon-darkRed border border-dragon-gold/30">
              Classic SRD
            </span>
          </div>
          <p className="text-[11px] text-parchment-600 font-medium leading-normal mb-3">
            Traditional 5th Edition rules, classic origin backgrounds, and original spell and equipment indexing.
          </p>
          <div className="text-[9px] font-bold text-dragon-red/70 uppercase tracking-wider">
            {ruleset === '2014' ? '✓ Active Ruleset Context' : 'Click to select 2014 Ruleset'}
          </div>
        </button>

        {/* D&D 5e 2024 */}
        <button
          type="button"
          onClick={() => onSelectRuleset?.('2024')}
          className={`p-4 rounded-md border-2 transition-all flex flex-col justify-between relative overflow-hidden text-left ${
            ruleset === '2024'
              ? 'border-dragon-red bg-dragon-red/10 shadow-md ring-1 ring-dragon-gold/30'
              : 'border-dragon-gold/20 bg-white/40 hover:border-dragon-gold/40 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-2">
              <GameIcon name="magic_effect" size={18} color={ruleset === '2024' ? '#991B1B' : '#B8860B'} />
              <h4 className="font-header font-black text-sm uppercase text-dragon-darkRed tracking-wide">D&D 5.5e (2024)</h4>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 border border-amber-500/30">
              Revised 2024
            </span>
          </div>
          <p className="text-[11px] text-parchment-600 font-medium leading-normal mb-3">
            2024 Revised ruleset featuring Origin Feats, weapon masteries, updated species traits, and expanded rules references.
          </p>
          <div className="text-[9px] font-bold text-dragon-red/70 uppercase tracking-wider">
            {ruleset === '2024' ? '✓ Active Ruleset Context' : 'Click to select 2024 Ruleset'}
          </div>
        </button>
      </div>
    </div>
  </div>
);
