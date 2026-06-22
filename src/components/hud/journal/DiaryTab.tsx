import React from 'react';
import { useJournalStore } from '../../../store/useJournalStore';
import { GameIcon } from '../../../game_icons';

export const DiaryTab: React.FC = () => {
  const { summaries } = useJournalStore();

  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-parchment-600 italic font-quintessential space-y-4">
        <GameIcon name="book" size={48} className="opacity-20" />
        <p>The pages are still empty...</p>
        <p className="text-sm">A new summary appears after the first Long Rest.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4">
      {summaries.map((summary, idx) => (
        <article key={idx} className="relative group">
          {/* Header */}
          <div className="flex items-baseline justify-between border-b border-dragon-red/20 mb-6 pb-2">
            <h2 className="font-header text-3xl text-dragon-red">
              Day {summary.day}
            </h2>
            <span className="font-quintessential text-parchment-700">
              {summary.gameDay}/{summary.gameMonth}/{summary.gameYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body text-lg leading-relaxed text-parchment-900">
            {/* Left Column: Events & Conversations */}
            <div className="space-y-6">
              <section>
                <h3 className="font-header text-xl text-dragon-darkRed mb-2 underline decoration-dragon-gold/30">Events</h3>
                <p className="whitespace-pre-wrap italic">{summary.events}</p>
              </section>
              <section>
                <h3 className="font-header text-xl text-dragon-darkRed mb-2 underline decoration-dragon-gold/30">Conversations</h3>
                <p className="whitespace-pre-wrap italic">{summary.conversations}</p>
              </section>
            </div>

            {/* Right Column: Discoveries, Combat, Items */}
            <div className="space-y-6">
               <section className="bg-dragon-gold/5 p-4 rounded-lg border border-dragon-gold/20 shadow-inner">
                  <h3 className="font-header text-xl text-dragon-darkRed mb-2 flex items-center gap-2">
                    <GameIcon name="lore" size={16} /> Discoveries
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {summary.locationsDiscovered.map((loc, i) => <li key={i}>{loc}</li>)}
                    {summary.newNPCs.map((npc, i) => <li key={i}>Meeting with {npc}</li>)}
                  </ul>
               </section>

               <section>
                  <h3 className="font-header text-xl text-dragon-darkRed mb-2">Battles</h3>
                  <p className="whitespace-pre-wrap">{summary.battles}</p>
               </section>

               <section className="flex gap-4">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-green-700 mb-1">Gained</h4>
                    <ul className="text-sm">
                      {summary.itemsGained.map((item, i) => <li key={i} className="flex items-center gap-1"><GameIcon name="package" size={12} /> {item}</li>)}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-red-700 mb-1">Lost</h4>
                    <ul className="text-sm">
                      {summary.itemsLost.map((item, i) => <li key={i} className="flex items-center gap-1 opacity-60 line-through"><GameIcon name="package" size={12} /> {item}</li>)}
                    </ul>
                  </div>
               </section>
            </div>
          </div>

          {/* Current Path / Goal - Footer of the day */}
          <footer className="mt-8 pt-6 border-t-2 border-double border-dragon-gold/30">
            <div className="bg-parchment-200/50 p-6 rounded-sm border border-dragon-gold/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-5">
                  <GameIcon name="key" size={64} />
               </div>
               <h4 className="font-header text-xl text-dragon-red mb-3">Current Storyline</h4>
               <div className="space-y-4 text-parchment-800 italic">
                  <div className="flex gap-4">
                    <span className="font-bold uppercase text-[10px] tracking-widest w-20">Location:</span>
                    <span>{summary.currentLocationId || "Unknown"}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-bold uppercase text-[10px] tracking-widest w-20">Goal:</span>
                    <span>{summary.currentGoal}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-bold uppercase text-[10px] tracking-widest w-20">Next Step:</span>
                    <span>{summary.nextStep}</span>
                  </div>
               </div>
            </div>
          </footer>

          {/* Decorative flourish */}
          <div className="flex justify-center mt-12 mb-4 opacity-30">
            <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-dragon-gold to-transparent" />
          </div>
        </article>
      ))}
    </div>
  );
};
