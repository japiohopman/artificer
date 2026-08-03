import React, { useState } from 'react';
import { generateCodexImage, generateBackgroundImage } from '../../services/ai/imageService';
import { commitFile } from '../../services/storageService';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { GameIcon } from '../../game_icons';
import { BACKGROUND_CONFIGS, getBackgroundFilename, getSpriteThumbnailStyle, inferBackgroundFromMonster } from '../../lib/backgroundConfigs';

interface EnemyImageGeneratorProps {
  monsterName: string;
  monsterType: string;
  monsterSize?: string;
  monsterAlignment?: string;
  monsterSubtype?: string;
  monsterLore?: string;
  initialHabitat?: string;
  initialCategory?: 'bestiary' | 'characters' | 'equipment';
  initialImageUrl?: string;
  level?: number;
  onImageGenerated: (url: string) => void;
  onHabitatChanged?: (habitat: string) => void;
}

export const EnemyImageGenerator: React.FC<EnemyImageGeneratorProps> = ({ 
  monsterName, 
  monsterType, 
  monsterSize,
  monsterAlignment,
  monsterSubtype,
  monsterLore,
  initialHabitat = 'land_forest',
  initialCategory = 'bestiary',
  initialImageUrl,
  level = 1,
  onImageGenerated,
  onHabitatChanged
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [selectedHabitat, setSelectedHabitat] = useState('land_forest');
  const [selectedVariation, setSelectedVariation] = useState(0);
  const category = 'bestiary';

  // Sync with initialHabitat prop
  React.useEffect(() => {
    if (initialHabitat) {
      let resolvedHabitat = initialHabitat;
      if (resolvedHabitat === 'generic') {
        resolvedHabitat = inferBackgroundFromMonster({ type: monsterType, name: monsterName });
      }
      // Parse resolvedHabitat (e.g., "air2" -> habitat: "air", variation: 2)
      const match = resolvedHabitat.match(/^([a-z_]+)(\d)?$/);
      if (match) {
        const base = match[1];
        const variation = match[2] ? parseInt(match[2]) : 0;
        setSelectedHabitat(base);
        setSelectedVariation(variation);
      }
    }
  }, [initialHabitat, monsterType, monsterName]);

  // Sync with initialImageUrl prop when it changes
  React.useEffect(() => {
    if (initialImageUrl) {
      setPreviewImage(initialImageUrl);
    }
  }, [initialImageUrl]);

  const updateHabitatAndVariation = (base: string, variation: number) => {
    setSelectedHabitat(base);
    setSelectedVariation(variation);
    if (onHabitatChanged) {
      const suffix = variation === 0 ? '' : String(variation);
      onHabitatChanged(`${base}${suffix}`);
    }
  };

  const handleGenerateBg = async () => {
    setIsGenerating(true);
    try {
      const isSmall = (monsterSize || "").toLowerCase().includes('tiny') || (monsterSize || "").toLowerCase().includes('small');
      const base64 = await generateBackgroundImage(selectedHabitat, selectedVariation, '', isSmall);
      if (base64) {
        // This is just a preview, in a real scenario we might want to save it
        console.log("Background generated for preview");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getBackgroundUrl = (type: string, variation: number) => {
    const repo = process.env.GITHUB_REPO || "japiohopman/artificer";
    const branch = process.env.GITHUB_BRANCH || "main";
    const suffix = variation === 0 ? '' : variation;
    const resolvedBase = getBackgroundFilename(type);
    return `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/images/enemy_backgrounds/${resolvedBase}${suffix}.webp?t=${Date.now()}`;
  };

  const handleGenerate = async () => {
    if (!monsterName) {
      setError("Name is required");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const base64Data = await generateCodexImage(
        monsterName, 
        monsterType, 
        monsterSize, 
        monsterAlignment, 
        monsterSubtype,
        monsterLore,
        category as any
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
            Enemy Designer
          </h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-dragon-red text-parchment-light rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md"
          title="Generate Art"
        >
          {isGenerating ? <GameIcon name="loading" size={18} color="#FFFFFF" className="animate-spin" /> : <GameIcon name="magic_effect" size={18} color="#FFFFFF" />}
          {isGenerating ? 'Forging...' : 'Generate Art'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      {/* Visual Habitat Gallery Grid */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest flex items-center gap-1">
          <GameIcon name="globe" size={10} color="currentColor" /> Habitat Gallery
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1">
          {BACKGROUND_CONFIGS.map(b => {
            const isSelected = selectedHabitat === b.id;
            return (
              <button
                key={b.id}
                onClick={() => updateHabitatAndVariation(b.id, selectedVariation)}
                className="w-full text-center focus:outline-none group"
                title={`Select ${b.label}`}
              >
                <div
                  className={`aspect-[16/11] w-full rounded border-2 transition-all overflow-hidden ${
                    isSelected
                      ? 'border-dragon-red scale-105 shadow-[0_0_8px_rgba(139,0,0,0.3)]'
                      : 'border-dragon-red/10 hover:border-dragon-red/30'
                  }`}
                  style={getSpriteThumbnailStyle(b.id, selectedVariation)}
                />
                <span className={`text-[8px] font-black block mt-1 truncate ${isSelected ? 'text-dragon-red' : 'text-parchment-600 group-hover:text-parchment-800'}`}>
                  {b.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest flex items-center gap-1">
            <GameIcon name="globe" size={10} color="currentColor" /> Preview Habitat
          </label>
          <select 
            title="Preview Habitat"
            value={selectedHabitat}
            onChange={(e) => updateHabitatAndVariation(e.target.value, selectedVariation)}
            className="w-full bg-white/50 border border-dragon-red/10 p-1.5 text-[10px] text-parchment-900 rounded focus:outline-none focus:border-dragon-red transition-colors"
          >
            {BACKGROUND_CONFIGS.map(b => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest flex items-center gap-1">
            Variation
          </label>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(v => (
              <button
                key={v}
                onClick={() => updateHabitatAndVariation(selectedHabitat, v)}
                className={`flex-1 aspect-[3/2] rounded border-2 overflow-hidden transition-all relative ${
                  selectedVariation === v
                    ? 'border-dragon-red ring-2 ring-dragon-red/40 scale-105 z-10'
                    : 'border-dragon-red/10 hover:border-dragon-red/30'
                }`}
                title={`Variation ${v === 0 ? 'Main' : v === 3 ? '3 (Wide)' : v === 4 ? '4 (Macro)' : v}`}
                aria-label={`Variation ${v === 0 ? 'Main' : v === 3 ? '3 (Wide)' : v === 4 ? '4 (Macro)' : v}`}
              >
                <div
                  className="w-full h-full"
                  style={getSpriteThumbnailStyle(selectedHabitat, v)}
                />
                <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-[7px] font-bold text-white px-0.5 rounded">
                  {v === 0 ? 'M' : v === 3 ? 'W' : v === 4 ? 'C' : v
                  }
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="aspect-[3/2] w-full bg-parchment-200/50 rounded-lg border-2 border-dashed border-dragon-red/20 flex items-center justify-center overflow-hidden relative shadow-inner">
        {/* Background Layer */}
        <img 
          src={getBackgroundUrl(selectedHabitat, selectedVariation)}
          alt="Habitat Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0';
          }}
        />
        
        {previewImage ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
            <ChromaKeyImage 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
            />
          </div>
        ) : (
          <div className="text-parchment-600 flex flex-col items-center gap-2 relative z-10">
            <GameIcon name="image" size={48} color="currentColor" className="opacity-30" />
            <p className="font-crimson italic">No essence captured yet...</p>
          </div>
        )}
      </div>
      
      <p className="text-xs text-parchment-600 italic font-crimson">
        * Follows BG3/Classic D&D artistic guidelines (skills/atlas-monsters/SKILL.md)
      </p>
    </div>
  );
};
