import React from 'react';
import { GameIcon } from '../../../../game_icons';
import { EnemyImageGenerator } from '../../enemy-image_generator';
import { EquipmentImageGenerator } from '../../equipment-image_generator';
import { MaterialImageGenerator } from '../../material-image_generator';

interface SynthesisSectionProps {
  activeGenerator: 'monsters' | 'materials' | 'equipment';
  editingItem: any;
  updateField: (field: string, value: any) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  generatePrompt: () => void;
  setChecklist: React.Dispatch<React.SetStateAction<any>>;
  playClickSound: () => void;
}

export const SynthesisSection: React.FC<SynthesisSectionProps> = ({
  activeGenerator,
  editingItem,
  updateField,
  prompt,
  setPrompt,
  generatePrompt,
  setChecklist,
  playClickSound,
}) => {
  return (
    <div className="space-y-6">
      {/* Prompt Shell */}
      <div className="space-y-3 p-4 bg-black/40 border border-white/5 rounded-lg border-l-2 border-l-dragon-red">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
            <GameIcon name="identity" size={12} color="#8B0000" /> Synthesis_String
          </label>
          <button
            onClick={() => {
              generatePrompt();
              playClickSound();
            }}
            className="text-[9px] text-white/40 hover:text-white transition-colors flex items-center gap-1 font-bold uppercase"
            title="Recalculate Synthesis String"
          >
            <GameIcon name="refresh" size={10} color="currentColor" /> Recalculate
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-24 bg-transparent text-[11px] text-dragon-red/80 font-mono leading-relaxed focus:outline-none custom-scrollbar resize-none"
          placeholder="Prompt will be derived from metadata..."
          title="Synthesis String Textarea"
        />
      </div>

      {/* Visual Synthesis Engine */}
      <div className="space-y-4">
        <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-white/5 pb-1">
          <GameIcon name="package" size={12} color="currentColor" /> Visualization_Engine
        </label>
        <div className="bg-black/20 border border-white/5 rounded-xl p-6">
          {activeGenerator === 'monsters' && (
            <EnemyImageGenerator
              monsterName={editingItem.name || ''}
              monsterType={editingItem.type || ''}
              monsterSize={editingItem.size}
              monsterAlignment={editingItem.alignment}
              monsterSubtype={editingItem.subtype}
              monsterLore={editingItem.lore || (editingItem.desc ? editingItem.desc[0] : '')}
              initialHabitat={editingItem.background_type || 'land_forest'}
              initialImageUrl={editingItem.imageUrl || editingItem.image_url}
              onImageGenerated={(url) => {
                updateField('imageUrl', url);
                setChecklist((prev: any) => ({ ...prev, imageGenerated: true }));
              }}
              onHabitatChanged={(habitat) => {
                updateField('background_type', habitat);
              }}
            />
          )}
          {activeGenerator === 'equipment' && (
            <EquipmentImageGenerator
              itemName={editingItem.name || ''}
              itemType={editingItem.category || editingItem.type || ''}
              itemLore={editingItem.desc ? editingItem.desc[0] : ''}
              onImageGenerated={(url) => {
                updateField('imageUrl', url);
                setChecklist((prev: any) => ({ ...prev, imageGenerated: true }));
              }}
            />
          )}
          {activeGenerator === 'materials' && (
            <MaterialImageGenerator
              itemName={editingItem.name || ''}
              itemType={editingItem.material_sub_category || editingItem.category || ''}
              itemLore={editingItem.desc ? editingItem.desc[0] : ''}
              onImageGenerated={(url) => {
                updateField('imageUrl', url);
                setChecklist((prev: any) => ({ ...prev, imageGenerated: true }));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
