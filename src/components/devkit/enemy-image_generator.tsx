import React, { useState } from 'react';
import { generateCodexImage, generateBackgroundImage } from '../../services/ai/imageService';
import { commitFile } from '../../services/storageService';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { GameIcon } from '../../game_icons';

interface EnemyImageGeneratorProps {
  monsterName: string;
  monsterType: string;
  monsterSize?: string;
  monsterAlignment?: string;
  monsterSubtype?: string;
  monsterLore?: string;
  initialHabitat?: string;
  initialCategory?: 'bestiary' | 'characters' | 'equipment';
  level?: number;
  onImageGenerated: (url: string) => void;
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
  level = 1,
  onImageGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedHabitat, setSelectedHabitat] = useState('land_forest');
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [category, setCategory] = useState<'bestiary' | 'characters' | 'equipment'>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState(level);

  // Sync with initialHabitat prop
  React.useEffect(() => {
    if (initialHabitat) {
      // Parse initialHabitat (e.g., "air2" -> habitat: "air", variation: 2)
      const match = initialHabitat.match(/^([a-z_]+)(\d)?$/);
      if (match) {
        const base = match[1];
        const variation = match[2] ? parseInt(match[2]) : 0;
        setSelectedHabitat(base);
        setSelectedVariation(variation);
      }
    }
  }, [initialHabitat]);

  const backgroundTypes = [
    { id: 'air', label: 'Air' },
    { id: 'water', label: 'Water' },
    { id: 'land_forest', label: 'Forest' },
    { id: 'land_urban', label: 'Urban' },
    { id: 'land_plains', label: 'Plains' },
    { id: 'land_mountains', label: 'Mountains' },
    { id: 'jungle', label: 'Jungle' },
    { id: 'desert', label: 'Desert' },
    { id: 'underdark', label: 'Underdark' },
    { id: 'beach', label: 'Beach' },
    { id: 'church', label: 'Church' },
    { id: 'castle', label: 'Castle' },
    { id: 'fort', label: 'Fort' },
    { id: 'ruins', label: 'Ruins' },
    { id: 'cave', label: 'Cave' },
    { id: 'snowy', label: 'Snowy' },
    { id: 'swamp', label: 'Swamp' },
    { id: 'dragon_cave', label: 'Dragon Cave' },
    { id: 'fey', label: 'Fey' },
    { id: 'volcano', label: 'Volcano' },
    { id: 'ethereal', label: 'Ethereal' },
    { id: 'void', label: 'Void' }
  ];

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
    return `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/images/enemy_backgrounds/${type}${suffix}.webp?t=${Date.now()}`;
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
        category === 'characters' ? selectedLevel.toString() : monsterSubtype,
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
            {category === 'bestiary' ? 'Enemy Designer' : category === 'characters' ? 'NPC Portraitist' : 'Item Forger'}
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

      <div className="flex gap-2 mb-2">
        {(['bestiary', 'characters', 'equipment'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "flex-1 py-1 text-[10px] font-black uppercase tracking-widest rounded border transition-all",
              category === cat ? "bg-dragon-red text-white border-dragon-red" : "bg-white/50 text-dragon-red border-dragon-red/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {category === 'characters' && (
        <div className="space-y-1 mb-2">
          <label className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest flex items-center gap-1">
            Level / Experience
          </label>
          <input 
            type="range" min="1" max="20" 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
            className="w-full accent-dragon-red"
          />
          <div className="flex justify-between text-[8px] font-bold text-dragon-red">
            <span>LEVEL 1</span>
            <span className="text-[10px]">CURRENT: {selectedLevel}</span>
            <span>LEVEL 20</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest flex items-center gap-1">
            <GameIcon name="globe" size={10} color="currentColor" /> Preview Habitat
          </label>
          <select 
            value={selectedHabitat}
            onChange={(e) => setSelectedHabitat(e.target.value)}
            className="w-full bg-white/50 border border-dragon-red/10 p-1.5 text-[10px] text-parchment-900 rounded focus:outline-none focus:border-dragon-red transition-colors"
          >
            {backgroundTypes.map(b => (
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
                onClick={() => setSelectedVariation(v)}
                className={`flex-1 py-1 text-[9px] rounded border transition-all ${selectedVariation === v ? 'bg-dragon-red text-white border-dragon-red' : 'bg-white/50 text-parchment-600 border-dragon-red/10 hover:border-dragon-red/30'}`}
              >
                {v === 0 ? 'M' : v === 4 ? '4 (Macro)' : v}
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
