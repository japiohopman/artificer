import React from 'react';
import { GameIcon } from '../../../../game_icons';
import { getModifier } from '../../../../lib/npcGeneratorUtils';

interface MechanicalStatEditorProps {
  editingItem: any;
  updateField: (field: string, value: any) => void;
}

export const MechanicalStatEditor: React.FC<MechanicalStatEditorProps> = ({
  editingItem,
  updateField,
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-white/5 bg-black/5 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-dragon-red">
         <GameIcon name="adjust" size={16} color="currentColor" />
         <h3 className="text-[10px] font-bold uppercase tracking-widest">Mechanical Essence</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Armor Class</label>
          <div className="flex gap-1">
            <input type="number" title="Armor Class Value" value={editingItem.armor_class || 0} onChange={(e) => updateField('armor_class', parseInt(e.target.value))} className="w-16 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" />
            <input type="text" title="Armor Description" value={editingItem.armor_desc || ''} onChange={(e) => updateField('armor_desc', e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="natural armor" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Hit Points</label>
          <input type="number" title="Hit Points" value={editingItem.hit_points || 0} onChange={(e) => updateField('hit_points', parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">HP Dice</label>
          <input type="text" title="Hit Dice" value={editingItem.hit_dice || ''} onChange={(e) => updateField('hit_dice', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="1d6" />
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">CR</label>
          <input type="text" title="Challenge Rating" value={editingItem.challenge_rating || '0'} onChange={(e) => updateField('challenge_rating', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Initiative & Skills</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded w-1/3">
              <span className="text-[8px] text-white/30 font-bold">INIT</span>
              <input type="number" title="Initiative" value={editingItem.initiative || 0} onChange={(e) => updateField('initiative', parseInt(e.target.value))} className="bg-transparent border-none p-0 text-xs text-white w-full focus:outline-none" />
            </div>
            <input type="text" title="Skills" value={editingItem.skills || ''} onChange={(e) => updateField('skills', e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Stealth +4, Perception +2" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Senses & Languages</label>
          <div className="flex gap-2">
            <input type="text" title="Senses" value={editingItem.senses || ''} onChange={(e) => updateField('senses', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Darkvision 60ft" />
            <input type="text" title="Languages" value={editingItem.languages || ''} onChange={(e) => updateField('languages', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Common" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Habitat & Treasure</label>
          <div className="flex gap-2">
            <input type="text" title="Habitat" value={editingItem.habitat || ''} onChange={(e) => updateField('habitat', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Underdark" />
            <input type="text" title="Treasure" value={editingItem.treasure || ''} onChange={(e) => updateField('treasure', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Any here?" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
         {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(s => (
           <div key={s} className="space-y-1">
              <label className="text-[8px] font-bold text-white/20 uppercase text-center block">{s}</label>
              <input
                type="number"
                title={`${s.toUpperCase()} score`}
                value={editingItem.stats?.[s] || 10}
                onChange={(e) => {
                  const newStats = { ...(editingItem.stats || {}), [s]: parseInt(e.target.value) || 0 };
                  updateField('stats', newStats);
                }}
                className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-dragon-red font-bold text-center rounded focus:border-dragon-red/50 outline-none"
              />
              <div className="text-[8px] text-white/30 text-center font-mono">
                {getModifier(editingItem.stats?.[s] || 10) >= 0 ? '+' : ''}{getModifier(editingItem.stats?.[s] || 10)}
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Size & Type</label>
          <div className="flex gap-2">
            <input type="text" title="Size" value={editingItem.size || ''} onChange={(e) => updateField('size', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Medium" />
            <input type="text" title="Type" value={editingItem.type || ''} onChange={(e) => updateField('type', e.target.value)} className="w-1/2 bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Humanoid" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-white/20 uppercase">Alignment</label>
          <input type="text" title="Alignment" value={editingItem.alignment || ''} onChange={(e) => updateField('alignment', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded" placeholder="Lawful Neutral" />
        </div>
      </div>

      {/* Traits & Actions Editor */}
      <div className="space-y-4">
         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Special Abilities (Traits)</label>
               <button title="Add Special Ability" onClick={() => updateField('special_abilities', [...(editingItem.special_abilities || []), { name: 'New Trait', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Trait</button>
            </div>
            <div className="space-y-2">
               {(editingItem.special_abilities || []).map((sa: any, i: number) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                    <input title="Special Ability Name" value={sa.name} onChange={(e) => {
                       const newSAs = [...editingItem.special_abilities];
                       newSAs[i].name = e.target.value;
                       updateField('special_abilities', newSAs);
                    }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                    <textarea title="Special Ability Description" value={sa.desc} onChange={(e) => {
                       const newSAs = [...editingItem.special_abilities];
                       newSAs[i].desc = e.target.value;
                       updateField('special_abilities', newSAs);
                    }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                    <button title="Delete Special Ability" onClick={() => {
                       const newSAs = editingItem.special_abilities.filter((_: any, idx: number) => idx !== i);
                       updateField('special_abilities', newSAs);
                    }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Actions</label>
               <button title="Add Action" onClick={() => updateField('actions', [...(editingItem.actions || []), { name: 'New Action', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Action</button>
            </div>
            <div className="space-y-2">
               {(editingItem.actions || []).map((a: any, i: number) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                    <input title="Action Name" value={a.name} onChange={(e) => {
                       const newActions = [...editingItem.actions];
                       newActions[i].name = e.target.value;
                       updateField('actions', newActions);
                    }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                    <textarea title="Action Description" value={a.desc} onChange={(e) => {
                       const newActions = [...editingItem.actions];
                       newActions[i].desc = e.target.value;
                       updateField('actions', newActions);
                    }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                    <button title="Delete Action" onClick={() => {
                       const newActions = editingItem.actions.filter((_: any, idx: number) => idx !== i);
                       updateField('actions', newActions);
                    }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Bonus Actions</label>
               <button title="Add Bonus Action" onClick={() => updateField('bonus_actions', [...(editingItem.bonus_actions || []), { name: 'New Bonus Action', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Bonus</button>
            </div>
            <div className="space-y-2">
               {(editingItem.bonus_actions || []).map((ba: any, i: number) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                    <input title="Bonus Action Name" value={ba.name} onChange={(e) => {
                       const newBAs = [...editingItem.bonus_actions];
                       newBAs[i].name = e.target.value;
                       updateField('bonus_actions', newBAs);
                    }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                    <textarea title="Bonus Action Description" value={ba.desc} onChange={(e) => {
                       const newBAs = [...editingItem.bonus_actions];
                       newBAs[i].desc = e.target.value;
                       updateField('bonus_actions', newBAs);
                    }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                    <button title="Delete Bonus Action" onClick={() => {
                       const newBAs = editingItem.bonus_actions.filter((_: any, idx: number) => idx !== i);
                       updateField('bonus_actions', newBAs);
                    }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Reactions</label>
               <button title="Add Reaction" onClick={() => updateField('reactions', [...(editingItem.reactions || []), { name: 'New Reaction', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Reaction</button>
            </div>
            <div className="space-y-2">
               {(editingItem.reactions || []).map((r: any, i: number) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                    <input title="Reaction Name" value={r.name} onChange={(e) => {
                       const newRs = [...editingItem.reactions];
                       newRs[i].name = e.target.value;
                       updateField('reactions', newRs);
                    }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                    <textarea title="Reaction Description" value={r.desc} onChange={(e) => {
                       const newRs = [...editingItem.reactions];
                       newRs[i].desc = e.target.value;
                       updateField('reactions', newRs);
                    }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                    <button title="Delete Reaction" onClick={() => {
                       const newRs = editingItem.reactions.filter((_: any, idx: number) => idx !== i);
                       updateField('reactions', newRs);
                    }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Legendary Actions</label>
               <button title="Add Legendary Action" onClick={() => updateField('legendary_actions', [...(editingItem.legendary_actions || []), { name: 'New Legendary Action', desc: '' }])} className="text-[9px] text-dragon-red hover:text-white uppercase font-bold">+ Add Legendary</button>
            </div>
            <div className="space-y-2">
               {(editingItem.legendary_actions || []).map((la: any, i: number) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group">
                    <input title="Legendary Action Name" value={la.name} onChange={(e) => {
                       const newLAs = [...editingItem.legendary_actions];
                       newLAs[i].name = e.target.value;
                       updateField('legendary_actions', newLAs);
                    }} className="bg-transparent border-none p-0 text-[11px] font-bold text-dragon-red w-full focus:outline-none mb-1" />
                    <textarea title="Legendary Action Description" value={la.desc} onChange={(e) => {
                       const newLAs = [...editingItem.legendary_actions];
                       newLAs[i].desc = e.target.value;
                       updateField('legendary_actions', newLAs);
                    }} className="bg-transparent border-none p-0 text-[10px] text-white/60 w-full focus:outline-none resize-none" rows={2} />
                    <button title="Delete Legendary Action" onClick={() => {
                       const newLAs = editingItem.legendary_actions.filter((_: any, idx: number) => idx !== i);
                       updateField('legendary_actions', newLAs);
                    }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><GameIcon name="trash" size={12} /></button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
