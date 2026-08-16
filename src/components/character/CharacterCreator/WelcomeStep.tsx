import React from 'react';
import { motion } from 'motion/react';
import { GameIcon } from '../../../game_icons';

interface WelcomeStepProps {
  ruleset?: '2014' | '2024';
  onSelectRuleset?: (ruleset: '2014' | '2024') => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ ruleset = '2014', onSelectRuleset }) => (
  <div id="welcome-step" className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-10 py-8">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-60px] border-2 border-dragon-gold/10 rounded-full border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-30px] border border-dragon-red/20 rounded-full border-dashed"
        />
        <div className="w-40 h-40 bg-dragon-red/5 border-2 border-dragon-gold/20 rounded-sm flex items-center justify-center text-dragon-red relative z-10 shadow-[0_0_50px_rgba(153,27,27,0.2)] transition-transform hover:scale-110">
           <GameIcon name="avatar" size={80} />
           <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none" />
        </div>
      </div>

     <div className="space-y-6 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-dragon-gold opacity-30">
          <GameIcon name="magic_effect" size={40} color="currentColor" />
        </div>
        <h2 className="text-6xl font-header font-black text-dragon-darkRed uppercase tracking-tight leading-none drop-shadow-sm">The Genesis Ritual</h2>
        <div className="w-24 h-1 bg-dragon-gold/30 mx-auto rounded-full" />
        <p className="text-xl text-parchment-600 font-medium leading-relaxed italic max-w-xl mx-auto">
          "Before the Atlas can hold your weight, your essence must be woven from the threads of ancient lineages and chosen paths. Seek your truth, traveler."
        </p>
     </div>

     {/* Explicit Ruleset Selection Section */}
     <div className="w-full bg-white/50 border border-dragon-gold/20 rounded-md p-6 shadow-md space-y-4">
        <div className="flex flex-col items-center space-y-1">
           <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.3em]">Campaign Contract</span>
           <h3 className="text-lg font-header font-black text-dragon-darkRed uppercase tracking-wider">Select Ruleset Framework</h3>
           <p className="text-[11px] text-parchment-600 font-medium">Choose the ruleset context for this champion and campaign session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
           {/* D&D 5e 2014 */}
           <button
             type="button"
             onClick={() => onSelectRuleset?.('2014')}
             className={`p-4 rounded-md border-2 transition-all flex flex-col justify-between relative overflow-hidden text-left ${
               ruleset === '2014'
                 ? 'border-dragon-red bg-dragon-red/10 shadow-lg shadow-dragon-red/10 ring-1 ring-dragon-gold/30'
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
               Traditional 5th Edition rules, classic origin backgrounds, and original spell/equipment indexing.
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
                 ? 'border-dragon-red bg-dragon-red/10 shadow-lg shadow-dragon-red/10 ring-1 ring-dragon-gold/30'
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

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        {[
          { label: 'Bloodline', desc: 'Scribe your ancestry into the great records of the Atlas.', icon: 'ancestry' },
          { label: 'Archetype', desc: 'Channel your innate talents into a disciplined calling.', icon: 'weapon' },
          { label: 'Epithet', desc: 'Identify your moral compass and manifested form.', icon: 'document' },
        ].map((feat, i) => (
          <div key={i} className="p-6 bg-white/40 border border-dragon-gold/10 rounded-sm space-y-3 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-dragon-red/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
             <div className="text-dragon-red relative z-10"><GameIcon name={feat.icon as any} size={20} color="currentColor" /></div>
             <h4 className="font-header font-black text-xs uppercase tracking-[0.2em] text-dragon-darkRed relative z-10">{feat.label}</h4>
             <p className="text-[10px] text-parchment-600 font-bold leading-relaxed relative z-10">{feat.desc}</p>
          </div>
        ))}
     </div>
  </div>
);
