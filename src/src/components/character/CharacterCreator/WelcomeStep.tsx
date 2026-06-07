import React from 'react';
import { motion } from 'motion/react';
import { GameIcon } from '../../../game_icons';

export const WelcomeStep: React.FC = () => (
  <div id="welcome-step" className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-12 py-12">
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
          <GameIcon name="sparkles" size={40} color="currentColor" />
        </div>
        <h2 className="text-6xl font-header font-black text-dragon-darkRed uppercase tracking-tight leading-none drop-shadow-sm">The Genesis Ritual</h2>
        <div className="w-24 h-1 bg-dragon-gold/30 mx-auto rounded-full" />
        <p className="text-xl text-parchment-600 font-medium leading-relaxed italic max-w-xl mx-auto">
          "Before the Atlas can hold your weight, your essence must be woven from the threads of ancient lineages and chosen paths. Seek your truth, traveler."
        </p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
        {[
          { label: 'Bloodline', desc: 'Scribe your ancestry into the great records of the Atlas.', icon: 'dna' },
          { label: 'Archetype', desc: 'Channel your innate talents into a disciplined calling.', icon: 'weapon' },
          { label: 'Epithet', desc: 'Identify your moral compass and manifested form.', icon: 'scroll_text' },
        ].map((feat, i) => (
          <div key={i} className="p-8 bg-white/40 border border-dragon-gold/10 rounded-sm space-y-4 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-dragon-red/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
             <div className="text-dragon-red relative z-10"><GameIcon name={feat.icon as any} size={24} color="currentColor" /></div>
             <h4 className="font-header font-black text-sm uppercase tracking-[0.2em] text-dragon-darkRed relative z-10">{feat.label}</h4>
             <p className="text-[11px] text-parchment-600 font-bold leading-relaxed relative z-10">{feat.desc}</p>
          </div>
        ))}
     </div>
  </div>
);
