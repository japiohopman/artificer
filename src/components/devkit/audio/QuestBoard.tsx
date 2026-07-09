import React, { useState } from 'react';
import { ScrollText, Plus, Trash2, CheckCircle2, Circle, Sparkles, Sword, Ghost, Wand2, Hammer } from 'lucide-react';

interface AudioQuest {
  id: string;
  title: string;
  description: string;
  type: 'voice' | 'sfx' | 'ambient';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'completed';
}

const INITIAL_QUESTS: AudioQuest[] = [
  { id: '1', title: 'Tavern Barkeep Greeting', description: 'Warm, slightly husky voice greeting the party.', type: 'voice', priority: 'medium', status: 'todo' },
  { id: '2', title: 'Arcane Portal Hum', description: 'Low-frequency pulsating energy sound for a portal.', type: 'ambient', priority: 'high', status: 'todo' },
  { id: '3', title: 'Sword Clang (Steel)', description: 'Sharp, metallic impact of a longsword on a shield.', type: 'sfx', priority: 'medium', status: 'completed' },
  { id: '4', title: 'Whispering Shadows', description: 'Eerie, unintelligible whispers for a haunted forest.', type: 'ambient', priority: 'low', status: 'todo' }
];

export function QuestBoard() {
  const [quests, setQuests] = useState<AudioQuest[]>(INITIAL_QUESTS);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', type: 'sfx' as const, priority: 'medium' as const });

  const addQuest = () => {
    if (!newQuest.title) return;
    const quest: AudioQuest = {
      id: Math.random().toString(36).slice(2, 9),
      ...newQuest,
      status: 'todo'
    };
    setQuests([quest, ...quests]);
    setNewQuest({ title: '', description: '', type: 'sfx', priority: 'medium' });
    setIsAdding(false);
  };

  const toggleQuest = (id: string) => {
    setQuests(quests.map(q => q.id === id ? { ...q, status: q.status === 'completed' ? 'todo' : 'completed' } : q));
  };

  const deleteQuest = (id: string) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  const typeIcons = {
    voice: <Ghost className="w-3 h-3" />,
    sfx: <Sword className="w-3 h-3" />,
    ambient: <Sparkles className="w-3 h-3" />
  };

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-200 overflow-hidden font-sans">
      <div className="border-b border-stone-800 p-8 bg-stone-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-800 rounded-2xl border border-stone-700 shadow-xl">
              <ScrollText className="w-6 h-6 text-stone-300" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold uppercase tracking-[0.1em]">The Quest Board</h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Audio Asset Bridge & Pipeline</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-200 text-stone-950 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Post New Quest
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {isAdding && (
          <div className="mb-8 p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <label className="space-y-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Asset Title</span>
                   <input 
                     type="text" 
                     value={newQuest.title}
                     onChange={e => setNewQuest({ ...newQuest, title: e.target.value })}
                     placeholder="e.g., Tavern Crowd Chatter"
                     className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-600"
                   />
                </label>
                <label className="space-y-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Asset Type</span>
                   <select 
                     value={newQuest.type}
                     onChange={e => setNewQuest({ ...newQuest, type: e.target.value as any })}
                     className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs focus:outline-none focus:border-stone-600"
                   >
                      <option value="voice">Voice Line</option>
                      <option value="sfx">Sound Effect</option>
                      <option value="ambient">Ambient Loop</option>
                   </select>
                </label>
             </div>
             <label className="space-y-2 block mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Description / Directions</span>
                <textarea 
                  value={newQuest.description}
                  onChange={e => setNewQuest({ ...newQuest, description: e.target.value })}
                  placeholder="Describe the mood, texture, and technical requirements..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-xs min-h-[80px] focus:outline-none focus:border-stone-600 resize-none"
                />
             </label>
             <div className="flex gap-3 justify-end">
                <button onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors">Cancel</button>
                <button onClick={addQuest} className="px-8 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all">Scribe Quest</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {quests.map(quest => (
            <div 
              key={quest.id}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                quest.status === 'completed' 
                ? 'bg-stone-900/20 border-stone-900 opacity-60' 
                : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:shadow-2xl'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleQuest(quest.id)}
                    className={`transition-colors ${quest.status === 'completed' ? 'text-emerald-500' : 'text-stone-700 hover:text-stone-500'}`}
                  >
                    {quest.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <h3 className={`text-sm font-bold tracking-tight ${quest.status === 'completed' ? 'line-through text-stone-600' : 'text-stone-200'}`}>
                    {quest.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-950 border border-stone-800 text-[8px] font-bold uppercase tracking-widest text-stone-500">
                      {typeIcons[quest.type]}
                      {quest.type}
                   </div>
                   <button 
                     onClick={() => deleteQuest(quest.id)}
                     className="p-1.5 text-stone-700 hover:text-rose-500 transition-colors"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
              
              <p className={`text-[11px] leading-relaxed mb-4 font-serif ${quest.status === 'completed' ? 'text-stone-700' : 'text-stone-400'}`}>
                {quest.description}
              </p>

              <div className="flex items-center justify-between">
                 <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border ${
                   quest.priority === 'high' ? 'bg-rose-900/20 border-rose-900/50 text-rose-500' :
                   quest.priority === 'medium' ? 'bg-amber-900/20 border-amber-900/50 text-amber-500' :
                   'bg-stone-800 border-stone-700 text-stone-500'
                 }`}>
                   {quest.priority} priority
                 </div>
                 
                 {quest.status === 'todo' && (
                    <button className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-200 transition-colors">
                       <Hammer className="w-3 h-3" />
                       Craft Now
                    </button>
                 )}
              </div>
            </div>
          ))}
        </div>

        {quests.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-stone-700 border-2 border-dashed border-stone-900 rounded-3xl">
             <ScrollText className="w-8 h-8 mb-4 opacity-20" />
             <p className="text-[10px] uppercase font-bold tracking-widest">The Quest Board is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
