import React, { useState } from 'react';
import { generateCodexImage } from '../../services/ai/imageService';
import { commitFile } from '../../services/storageService';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { GameIcon } from '../../game_icons';

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

interface MaterialImageGeneratorProps {
  itemName: string;
  itemType: string;
  itemLore?: string;
  onImageGenerated: (url: string) => void;
}

export const MaterialImageGenerator: React.FC<MaterialImageGeneratorProps> = ({ 
  itemName, 
  itemType, 
  itemLore,
  onImageGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!itemName) {
      setError("Material name is required");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const base64Data = await generateCodexImage(
        itemName, 
        itemType, 
        undefined, 
        undefined, 
        undefined,
        itemLore,
        'materials'
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
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-cinzel text-dragon-red flex items-center gap-2">
            <GameIcon name="image" size={20} color="#8B0000" />
            Material Designer
          </h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-dragon-red text-parchment-light rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md"
        >
          {isGenerating ? <GameIcon name="loading" size={18} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="magic_effect" size={18} color="#FFFFFF" />}
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
            <p className="font-crimson italic">No material refined yet...</p>
          </div>
        )}
      </div>
      
      <p className="text-xs text-parchment-600 italic font-crimson">
        * Follows BG3/Classic D&D artistic guidelines (skills/atlas-materials/SKILL.md)
      </p>
    </div>
  );
};
