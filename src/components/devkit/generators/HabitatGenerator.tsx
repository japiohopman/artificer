import React, { useState } from 'react';
import { BACKGROUND_CONFIGS, getSpriteThumbnailStyle } from '../../../lib/backgroundConfigs';
import { commitFile, playSuccessSound, playFailSound } from '../../../services/storageService';
import { GameIcon } from '../../../game_icons';

interface HabitatGeneratorProps {
  editingItem?: any | null;
}

export const HabitatGenerator: React.FC<HabitatGeneratorProps> = ({ editingItem }) => {
  const [selectedBgType, setSelectedBgType] = useState<string>('land_forest');
  const [selectedBgVariation, setSelectedBgVariation] = useState<number>(0);
  const [bgInstruction, setBgInstruction] = useState<string>('');
  const [generatedBackground, setGeneratedBackground] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const backgroundTypes = BACKGROUND_CONFIGS;

  const getBackgroundUrl = (type: string, variation: number) => {
    const repo = String(process.env.GITHUB_REPO || 'japiohopman/artificer').replace(/[^a-zA-Z0-9_/.-]/g, '');
    const branch = String(process.env.GITHUB_BRANCH || 'main').replace(/[^a-zA-Z0-9_/.-]/g, '');
    const cleanType = String(type).replace(/[^a-zA-Z0-9_-]/g, '');
    const suffix = variation === 0 ? '' : variation;
    return `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/images/enemy_backgrounds/${cleanType}${suffix}.webp?t=${Date.now()}`;
  };

  const generateBackground = async () => {
    setIsGeneratingBg(true);
    try {
      const { generateBackgroundImage } = await import('../../../services/ai/imageService');
      const isSmall = editingItem &&
                     ((editingItem.size || "").toLowerCase().includes('tiny') ||
                      (editingItem.size || "").toLowerCase().includes('small')) &&
                     (editingItem.type || "").toLowerCase().includes('beast');

      const base64 = await generateBackgroundImage(selectedBgType, selectedBgVariation, bgInstruction, !!isSmall);
      if (base64) {
        setGeneratedBackground(`data:image/png;base64,${base64}`);
      }
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const saveBackground = async () => {
    if (!generatedBackground) return;
    setIsChecking(true);
    try {
      const base64Data = generatedBackground.split(',')[1];
      const suffix = selectedBgVariation === 0 ? '' : selectedBgVariation;
      const path = `public/assets/images/enemy_backgrounds/${selectedBgType}${suffix}.webp`;
      const success = await commitFile(path, base64Data, true);
      if (success) {
        playSuccessSound();
        alert(`Global background for ${selectedBgType} (Variation ${selectedBgVariation}) updated!`);
        setGeneratedBackground(null);
      }
    } catch (err) {
      console.error(err);
      playFailSound();
      alert("Failed to save background.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">
            <GameIcon name="image" size={16} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Global_Environment_Layer</div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Habitat Generator</div>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden h-full">
        {/* Left Panel: Scrollable Configuration & Interactive Gallery */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#181818]/50">

          {/* Configuration Panel */}
          <section className="p-5 bg-black/30 border border-white/5 rounded-xl space-y-4">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Environment_Config</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">Select_Region</label>
                <select
                  title="Select Environment Region"
                  value={selectedBgType}
                  onChange={(e) => {
                    setSelectedBgType(e.target.value);
                    setGeneratedBackground(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 p-3 text-[11px] text-white/80 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer box-border"
                >
                  {backgroundTypes.map(b => (
                    <option key={b.id} value={b.id} className="bg-[#1a1a1a]">{b.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">Variation_Vector</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map(v => (
                    <button
                      key={v}
                      title={`Select Variation ${v === 0 ? 'Main' : v}`}
                      onClick={() => {
                        setSelectedBgVariation(v);
                        setGeneratedBackground(null);
                      }}
                      className={`py-2.5 rounded border text-[10px] font-bold transition-all ${
                        selectedBgVariation === v
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                          : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {v === 0 ? 'MAIN' : v === 3 ? 'WIDE' : v === 4 ? 'MAC' : v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">Entropy_Instructions</label>
              <textarea
                value={bgInstruction}
                onChange={(e) => setBgInstruction(e.target.value)}
                placeholder="Describe specific atmospheric conditions, weather, or local features..."
                className="w-full bg-white/5 border border-white/10 p-3 text-[11px] text-white/70 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all min-h-[80px] font-mono leading-relaxed"
                title="Entropy Instructions Textarea"
              />
            </div>
          </section>

          {/* Status Grid: Interactive Gallery / Asset Inventory Matrix */}
          <section className="p-5 bg-black/20 border border-white/5 rounded-xl space-y-4">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Asset_Inventory_Matrix (Interactive Gallery)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {BACKGROUND_CONFIGS.map(bg => (
                <div key={bg.id} className="bg-black/40 border border-white/5 rounded-lg p-2.5 space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="text-[10px] text-white/60 font-bold uppercase">{bg.label}</span>
                    <span className="text-[8px] text-white/20 font-mono">Row: {bg.row} | Sheet: {bg.sheet}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0, 1, 2, 3, 4].map(v => {
                      const isSelected = selectedBgType === bg.id && selectedBgVariation === v;
                      return (
                        <button
                          key={v}
                          onClick={() => {
                            setSelectedBgType(bg.id);
                            setSelectedBgVariation(v);
                            setGeneratedBackground(null);
                          }}
                          className={`aspect-[3/2] rounded border transition-all overflow-hidden relative group/thumb ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105 z-10'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          title={`${bg.label} (Variation ${v})`}
                        >
                          <div
                            className="w-full h-full"
                            style={getSpriteThumbnailStyle(bg.id, v)}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                          <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] text-white/60 px-0.5 rounded scale-90">
                            {v === 0 ? 'M' : v === 3 ? 'W' : v === 4 ? 'C' : v}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Panel: Sticky Live Feed & Preview Output Stream */}
        <div className="w-[480px] border-l border-white/5 bg-[#141414] p-6 flex flex-col space-y-6 shrink-0 h-full overflow-y-auto custom-scrollbar">
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block border-b border-white/5 pb-1">Visual_Output_Steam</label>
            <div className="aspect-[16/9] w-full bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
              {generatedBackground ? (
                <img src={generatedBackground} alt="Generated" className="w-full h-full object-cover animate-in zoom-in-95 fade-in duration-700" />
              ) : (
                <div className="relative w-full h-full group">
                  <img
                    src={getBackgroundUrl(selectedBgType, selectedBgVariation)}
                    alt="Current habitat preview"
                    className="w-full h-full object-cover opacity-60 grayscale-[0.3]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                    <div className="p-3 bg-black/60 rounded-full border border-white/20 mb-3">
                      <GameIcon name="image" size={24} className="text-white/40" />
                    </div>
                    <span className="text-[10px] text-white/60 font-mono tracking-[0.4em] uppercase">
                      LIVE_FEED: {selectedBgType.toUpperCase()}_{selectedBgVariation}
                    </span>
                  </div>
                </div>
              )}

              {isGeneratingBg && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-white/5 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-2 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-[11px] text-blue-400 font-mono tracking-[0.3em] font-bold uppercase block">Calculating_Voxels</span>
                    <span className="text-[9px] text-white/20 uppercase">Artificial Intelligence synthesis in progress</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Triggers */}
          <div className="flex flex-col gap-3">
            <button
              onClick={generateBackground}
              disabled={isGeneratingBg}
              className="w-full py-3 bg-blue-600 text-white text-[11px] font-bold rounded-lg uppercase hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg group"
              title="Execute Habitat Generation"
            >
              <GameIcon name="magic_effect" size={14} className={isGeneratingBg ? 'animate-spin' : 'group-hover:animate-pulse'} />
              {isGeneratingBg ? 'SYNTHESIZING_ENVIRONMENT...' : 'EXECUTE_GENERATE'}
            </button>
            {generatedBackground && (
              <button
                onClick={saveBackground}
                disabled={isChecking}
                className="w-full py-3 bg-green-600 text-white text-[11px] font-bold rounded-lg uppercase hover:bg-green-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
                title="Commit Habitat to Database"
              >
                <GameIcon name="save_data" size={14} color="currentColor" />
                {isChecking ? 'UPLOADING_TO_REPO...' : 'COMMIT_TO_DATABASE'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
