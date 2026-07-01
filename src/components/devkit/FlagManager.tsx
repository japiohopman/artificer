import React, { useState } from 'react';
import { useWorldStore } from '../../store/useWorldStore';
import { GameIcon } from '../../game_icons';
import { motion } from 'motion/react';

export const FlagManager: React.FC = () => {
  const { worldFlags, setWorldFlag } = useWorldStore();
  const [newFlagKey, setNewFlagKey] = useState('');
  const [newFlagValue, setNewFlagValue] = useState('');

  const handleAddFlag = () => {
    if (newFlagKey.trim()) {
      setWorldFlag(newFlagKey, newFlagValue);
      setNewFlagKey('');
      setNewFlagValue('');
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GameIcon name="save_data" size={16} className="text-dragon-red" />
          <h2 className="text-[10px] font-bold text-white uppercase tracking-widest">World Flags Manager</h2>
        </div>
        <span className="text-[8px] text-white/20 font-mono">FACTION_STATE_v1.0</span>
      </div>

      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-white/20 uppercase">Flag Key</label>
            <input 
              type="text" 
              value={newFlagKey}
              onChange={(e) => setNewFlagKey(e.target.value)}
              placeholder="e.g. dragon_slain"
              title="Flag Key"
              className="w-full bg-black/40 border border-white/10 p-2 text-xs text-white rounded focus:border-dragon-red/50 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-white/20 uppercase">Initial Value</label>
            <input 
              type="text" 
              value={newFlagValue}
              onChange={(e) => setNewFlagValue(e.target.value)}
              placeholder="true, 10, 'friendly'"
              title="Initial Value"
              className="w-full bg-black/40 border border-white/10 p-2 text-xs text-white rounded focus:border-dragon-red/50 outline-none"
            />
          </div>
        </div>
        <button 
          onClick={handleAddFlag}
          title="Initialize Flag"
          className="w-full py-2 bg-dragon-red/10 border border-dragon-red/30 text-dragon-red text-[10px] font-bold uppercase hover:bg-dragon-red hover:text-white transition-all rounded"
        >
          Initialize Flag
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {Object.entries(worldFlags).length > 0 ? (
          Object.entries(worldFlags).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded group hover:border-white/10">
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-bold text-dragon-red/80 uppercase truncate">{key}</div>
                <input 
                  type="text" 
                  value={String(value)}
                  onChange={(e) => setWorldFlag(key, e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[11px] text-white/60 focus:outline-none"
                  title={`Value for ${key}`}
                  placeholder="Flag value"
                />
              </div>
              <button 
                onClick={() => {
                  const newFlags = { ...worldFlags };
                  delete newFlags[key];
                  useWorldStore.setState({ worldFlags: newFlags });
                }}
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"
                title={`Delete flag: ${key}`}
              >
                <GameIcon name="trash" size={12} />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <GameIcon name="save_data" size={48} />
            <p className="text-[10px] uppercase font-bold mt-2">No active flags</p>
          </div>
        )}
      </div>
    </div>
  );
};
