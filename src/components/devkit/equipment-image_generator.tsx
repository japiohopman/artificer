import React, { useState } from 'react';
import { generateCodexImage } from '../../services/ai/imageService';
import { commitFile } from '../../services/storageService';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { GameIcon } from '../../game_icons';

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

interface EquipmentImageGeneratorProps {
  itemName: string;
  itemType: string;
  itemLore?: string;
  onImageGenerated: (url: string) => void;
}

export const EquipmentImageGenerator: React.FC<EquipmentImageGeneratorProps> = ({ 
  itemName, 
  itemType, 
  itemLore,
  onImageGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(0);

  const handleGenerate = async () => {
    if (!itemName) {
      setError("Item name is required");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      // Append tier info to name and lore if tier > 0
      let enhancedName = itemName;
      let enhancedLore = itemLore || '';
      
      if (selectedTier === 1) {
        enhancedName = `${itemName}, +1`;
        enhancedLore = `This is an uncommon version of ${itemName}. ` + enhancedLore;
      } else if (selectedTier === 2) {
        enhancedName = `${itemName}, +2`;
        enhancedLore = `This is a rare version of ${itemName}. ` + enhancedLore;
      } else if (selectedTier === 3) {
        enhancedName = `${itemName}, +3`;
        enhancedLore = `This is a legendary version of ${itemName}. ` + enhancedLore;
      }

      const base64Data = await generateCodexImage(
        enhancedName, 
        itemType, 
        undefined, 
        undefined, 
        undefined,
        enhancedLore,
        'equipment'
      );
      if (base64Data) {
        const url = `data:image/png;base64,${base64Data}`;
        setPreviewImage(url);
        onImageGenerated(url);
      } else {
        setError("Failed to generate image");
      }
    } catch (err) {
      setError("An error occurred during generation");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white/30 rounded-lg border border-dragon-red/20 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-cinzel text-dragon-red flex items-center gap-2">
            <GameIcon name="image" size={20} color="#8B0000" />
            Equipment Designer
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {[0, 1, 2, 3].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                  selectedTier === t 
                    ? 'bg-dragon-red text-white border-dragon-red shadow-[0_0_10px_rgba(139,0,0,0.3)]' 
                    : 'bg-white/50 text-dragon-red/60 border-dragon-red/20 hover:border-dragon-red/50 hover:bg-white/80'
                }`}
                title={t === 0 ? 'Base' : t === 1 ? 'Uncommon (+1)' : t === 2 ? 'Rare (+2)' : 'Legendary (+3)'}
              >
                {t === 0 ? 'B' : `+${t}`}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-dragon-red text-parchment-light rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md"
        >
          {isGenerating ? <GameIcon name="loading" size={18} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="sparkles" size={18} color="#FFFFFF" />}
          {isGenerating ? 'Forging...' : 'Generate Art'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <div className="aspect-[9/16] w-full max-w-[300px] mx-auto bg-parchment-200/50 rounded-lg border-2 border-dashed border-dragon-red/20 flex items-center justify-center overflow-hidden relative shadow-inner">
        {previewImage ? (
          <>
            <img 
              src={ITEM_BACKGROUND} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/10 z-[5]" />
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
              <ChromaKeyImage 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]" 
              />
            </div>
          </>
        ) : (
          <div className="text-parchment-600 flex flex-col items-center gap-2">
            <GameIcon name="image" size={48} color="currentColor" className="opacity-30" />
            <p className="font-crimson italic">No gear forged yet...</p>
          </div>
        )}
      </div>
      
      <p className="text-xs text-parchment-600 italic font-crimson">
        * Follows BG3/Classic D&D artistic guidelines (skills/atlas-equipment/SKILL.md)
      </p>
    </div>
  );
};
