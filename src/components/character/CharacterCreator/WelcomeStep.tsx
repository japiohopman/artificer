import React from 'react';
import { GameIcon } from '../../../game_icons';

interface WelcomeStepProps {
  ruleset?: '2014' | '2024';
  isExplicitlySelected?: boolean;
  onSelectRuleset?: (ruleset: '2014' | '2024') => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  ruleset = '2014',
  isExplicitlySelected = false,
  onSelectRuleset
}) => {
  const is2014Selected = isExplicitlySelected && ruleset === '2014';
  const is2024Selected = isExplicitlySelected && ruleset === '2024';

  return (
    <div id="welcome-step" className="w-full h-full p-8 flex flex-col justify-between items-center text-center">
      <div className="max-w-4xl w-full mx-auto space-y-8 my-auto">
        {/* Welcome Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dragon-red/10 border border-dragon-red/20 text-dragon-red text-xs font-bold uppercase tracking-widest">
            <GameIcon name="devkit" size={14} color="#991B1B" />
            Character Creation
          </div>
          <h2 className="text-4xl font-bodoni font-black text-dragon-darkRed uppercase tracking-wide">
            Welcome to Character Creation
          </h2>
          <p className="text-sm text-parchment-600 font-medium max-w-xl mx-auto">
            Choose the ruleset framework for your champion and campaign session to begin.
          </p>
        </div>

        {/* Ruleset Selection Card */}
        <div className="w-full bg-white/60 border border-dragon-gold/30 rounded-sm p-6 shadow-sm space-y-4">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.25em]">
              Rules Context
            </span>
            <h3 className="text-base font-header font-black text-dragon-darkRed uppercase tracking-wider">
              Select Ruleset Framework
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* D&D 5e 2014 */}
            <button
              type="button"
              onClick={() => onSelectRuleset?.('2014')}
              className={`p-4 rounded-sm border-2 transition-all flex flex-col justify-between text-left cursor-pointer ${
                is2014Selected
                  ? 'border-dragon-red bg-dragon-red/10 shadow-md ring-1 ring-dragon-gold/40'
                  : 'border-parchment-300 bg-white/40 hover:border-dragon-gold/50 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <GameIcon name="book" size={18} color={is2014Selected ? '#991B1B' : '#8B7355'} />
                  <h4 className="font-header font-black text-sm uppercase text-dragon-darkRed tracking-wide">
                    D&D 5e (2014)
                  </h4>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-dragon-gold/20 text-dragon-darkRed border border-dragon-gold/30">
                  Classic SRD
                </span>
              </div>
              <p className="text-[11px] text-parchment-600 font-medium leading-normal mb-3">
                Traditional 5th Edition rules, classic origin backgrounds, and original spell/equipment indexing.
              </p>
              <div className={`text-[9px] font-bold uppercase tracking-wider ${is2014Selected ? 'text-dragon-red' : 'text-parchment-500'}`}>
                {is2014Selected ? '✓ Selected Ruleset' : 'Click to select 2014 Ruleset'}
              </div>
            </button>

            {/* D&D 5e 2024 */}
            <button
              type="button"
              onClick={() => onSelectRuleset?.('2024')}
              className={`p-4 rounded-sm border-2 transition-all flex flex-col justify-between text-left cursor-pointer ${
                is2024Selected
                  ? 'border-dragon-red bg-dragon-red/10 shadow-md ring-1 ring-dragon-gold/40'
                  : 'border-parchment-300 bg-white/40 hover:border-dragon-gold/50 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <GameIcon name="magic_effect" size={18} color={is2024Selected ? '#991B1B' : '#8B7355'} />
                  <h4 className="font-header font-black text-sm uppercase text-dragon-darkRed tracking-wide">
                    D&D 5.5e (2024)
                  </h4>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 border border-amber-500/30">
                  Revised 2024
                </span>
              </div>
              <p className="text-[11px] text-parchment-600 font-medium leading-normal mb-3">
                2024 Revised ruleset featuring Origin Feats, weapon masteries, updated species traits, and expanded rules references.
              </p>
              <div className={`text-[9px] font-bold uppercase tracking-wider ${is2024Selected ? 'text-dragon-red' : 'text-parchment-500'}`}>
                {is2024Selected ? '✓ Selected Ruleset' : 'Click to select 2024 Ruleset'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
