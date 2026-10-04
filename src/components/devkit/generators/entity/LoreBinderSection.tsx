import React from 'react';
import { GameIcon } from '../../../../game_icons';

interface LoreBinderSectionProps {
  editingItem: any;
  updateField: (field: string, value: any) => void;
  wikiTab: 'editor' | 'raw';
  setWikiTab: (tab: 'editor' | 'raw') => void;
}

export const LoreBinderSection: React.FC<LoreBinderSectionProps> = ({
  editingItem,
  updateField,
  wikiTab,
  setWikiTab,
}) => {
  return (
    <div className="space-y-4 pt-6 border-t border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-dragon-red">
          <GameIcon name="scroll" size={16} color="currentColor" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest">Chronicle Binder</h3>
        </div>
        <div className="flex bg-white/5 rounded p-0.5 border border-white/10">
          <button
            onClick={() => setWikiTab('editor')}
            className={`px-3 py-1 text-[9px] font-bold rounded transition-all ${wikiTab === 'editor' ? 'bg-dragon-red text-white' : 'text-white/40 hover:text-white/60'}`}
            title="Switch to Editor Tab"
          >
            EDITOR
          </button>
          <button
            onClick={() => setWikiTab('raw')}
            className={`px-3 py-1 text-[9px] font-bold rounded transition-all ${wikiTab === 'raw' ? 'bg-dragon-red text-white' : 'text-white/40 hover:text-white/60'}`}
            title="Switch to Raw JSON Tab"
          >
            WIKI_RAW
          </button>
        </div>
      </div>

      {wikiTab === 'editor' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Atmospheric Lore (Display Summary)</label>
            <textarea
              value={editingItem.lore || ''}
              onChange={(e) => updateField('lore', e.target.value)}
              rows={4}
              placeholder="Write a beautifully written summary for players..."
              className="w-full bg-white/5 border border-white/10 p-3 text-[11px] text-white/80 rounded focus:outline-none focus:border-dragon-red/50 transition-all font-playfair leading-relaxed custom-scrollbar"
              title="Atmospheric Lore Textarea"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Wiki Sections (Detailed Data)</label>
            {editingItem.wikiData ? (
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(editingItem.wikiData).map(([key, val]: [string, any]) => (
                  <div key={key} className="p-3 bg-white/5 rounded border border-white/10 space-y-2 group hover:border-dragon-red/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-dragon-red/80 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                      <button
                        onClick={() => {
                          const newData = { ...editingItem.wikiData };
                          delete newData[key];
                          updateField('wikiData', newData);
                        }}
                        className="text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title={`Delete wiki section: ${key}`}
                      >
                        <GameIcon name="trash" size={12} color="currentColor" />
                      </button>
                    </div>
                    <textarea
                      value={typeof val === 'string' ? val : JSON.stringify(val)}
                      onChange={(e) => {
                        const newData = { ...editingItem.wikiData, [key]: e.target.value };
                        updateField('wikiData', newData);
                      }}
                      rows={2}
                      className="w-full bg-transparent border-none p-0 text-[11px] text-white/60 focus:outline-none resize-none custom-scrollbar leading-tight italic"
                      title={`Wiki section content: ${key}`}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const section = window.prompt("New section name (e.g. Personality, Rituals):");
                    if (section) {
                      updateField('wikiData', { ...(editingItem.wikiData || {}), [section]: '' });
                    }
                  }}
                  className="w-full py-2 border border-dashed border-white/10 rounded flex items-center justify-center gap-2 text-[10px] text-white/30 hover:text-white/50 hover:border-white/20 transition-all"
                  title="Add New Wiki Section"
                >
                  <GameIcon name="plus" size={12} /> ADD_NEW_BUREAUCRATIC_RECORD
                </button>
              </div>
            ) : (
              <div className="py-8 text-center bg-white/5 rounded border border-dashed border-white/10">
                <p className="text-[10px] text-white/20 italic">No detailed records found. Use the Scraper or add manually.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Raw JSON (Lore Data)</label>
          <textarea
            value={JSON.stringify(editingItem.wikiData, null, 2)}
            onChange={(e) => {
              try {
                const data = JSON.parse(e.target.value);
                updateField('wikiData', data);
              } catch (err) {}
            }}
            rows={12}
            className="w-full bg-black/40 border border-white/10 p-4 text-[10px] text-dragon-red/80 rounded focus:outline-none focus:border-dragon-red/50 transition-all font-mono custom-scrollbar"
            title="Raw JSON Wiki Data Textarea"
          />
        </div>
      )}
    </div>
  );
};
