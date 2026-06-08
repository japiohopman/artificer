import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { atlasService } from '../../services/atlasService';
import { commitFile, playSuccessSound, playFailSound, playClickSound } from '../../services/storageService';
import { GameIcon } from '../../game_icons';

// Types for Jane's World Builder
interface WorldLocation {
  id: string;
  name: string;
  type: string;
  title: string;
  description: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  tags: string[];
  metadata: Record<string, string>;
  [key: string]: any;
}

export const Jane: React.FC = () => {
  const { loadAllLists } = useStore();

  const [location, setLocation] = useState<Partial<WorldLocation>>({
    id: '',
    name: '',
    type: 'settlement',
    title: '',
    description: '',
    coordinates: { lat: 0, lng: 0 },
    tags: [],
    metadata: {},
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');

  useEffect(() => {
    loadAllLists();
  }, []);

  const handleBake = async () => {
    if (!location.id || !location.name) {
      alert("Location ID and Name are required for baking.");
      return;
    }

    setIsBaking(true);
    try {
      // Determine path based on type
      let path = `public/assets/atlas/world/toril/faerun/`;
      if (location.type === 'city') path += `cities/${location.id}/${location.id}.json`;
      else if (location.type === 'settlement') path += `towns_settlements/${location.id}/${location.id}.json`;
      else if (location.type === 'road') path += `roads_trails/${location.id}/${location.id}.json`;
      else path += `poi/${location.id}.json`;

      const success = await commitFile(path, JSON.stringify(location, null, 2));
      if (success) {
        playSuccessSound();
        alert(`Location ${location.name} baked successfully to ${path}`);
      } else {
        throw new Error("Commit failed");
      }
    } catch (error) {
      console.error(error);
      playFailSound();
      alert("Baking failed. Check console for details.");
    } finally {
      setIsBaking(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Placeholder for AI generation logic
    setTimeout(() => {
      setLocation(prev => ({
        ...prev,
        description: "Generated atmospheric description for the location...",
        title: "The " + (prev.name || "Unknown") + " Epithet",
      }));
      setIsGenerating(false);
      playSuccessSound();
    }, 1500);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1a1a1a] text-parchment-50">
      {/* Sidebar - Location List/History */}
      <div className="w-64 border-r border-white/5 flex flex-col bg-[#1e1e1e]">
        <div className="p-4 border-b border-white/5 bg-black/20">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">World_Atlas</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
           <div className="text-[10px] text-white/20 uppercase font-bold">Recent_Bakes</div>
           <div className="text-[10px] text-white/40 italic">No locations baked in this session.</div>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dragon-red/10 rounded border border-dragon-red/20 text-dragon-red">
              <GameIcon name="map" size={16} />
            </div>
            <div>
              <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Jane_Cartographer_v1.0</div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">Location Forge</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={handleGenerate}
               disabled={isGenerating}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-50"
             >
               <GameIcon name="sparkles" size={12} className={isGenerating ? 'animate-spin' : ''} />
               {isGenerating ? 'Synthesizing...' : 'AI_Gen_Details'}
             </button>
             <button
               onClick={handleBake}
               disabled={isBaking}
               className="flex items-center gap-2 bg-dragon-red hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all disabled:opacity-50 shadow-lg"
             >
               <GameIcon name="save_data" size={14} />
               {isBaking ? 'Baking...' : 'Bake_to_Reality'}
             </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-black/10 px-4">
          {(['editor', 'preview', 'json'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); playClickSound(); }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab ? 'border-dragon-red text-white bg-white/5' : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'editor' && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Core Identity */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Location_ID (Slug)</label>
                  <input
                    type="text"
                    value={location.id}
                    onChange={(e) => setLocation({ ...location, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="waterdeep_north_district"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Type</label>
                  <select
                    value={location.type}
                    onChange={(e) => setLocation({ ...location, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all"
                  >
                    <option value="city">City</option>
                    <option value="settlement">Settlement</option>
                    <option value="road">Road/Trail</option>
                    <option value="poi">Point of Interest</option>
                    <option value="shop">Shop/Building</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  value={location.name}
                  onChange={(e) => setLocation({ ...location, name: e.target.value })}
                  placeholder="Waterdeep"
                  className="w-full bg-white/5 border border-white/10 p-4 text-2xl font-black text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all uppercase"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Formal Title / Epithet</label>
                <input
                  type="text"
                  value={location.title}
                  onChange={(e) => setLocation({ ...location, title: e.target.value })}
                  placeholder="City of Splendors"
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white rounded-xl italic"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Latitude</label>
                    <input
                      type="number"
                      value={location.coordinates?.lat}
                      onChange={(e) => setLocation({ ...location, coordinates: { ...location.coordinates!, lat: parseFloat(e.target.value) } })}
                      className="w-full bg-black/40 border border-white/5 p-2 text-sm text-white rounded font-mono"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Longitude</label>
                    <input
                      type="number"
                      value={location.coordinates?.lng}
                      onChange={(e) => setLocation({ ...location, coordinates: { ...location.coordinates!, lng: parseFloat(e.target.value) } })}
                      className="w-full bg-black/40 border border-white/5 p-2 text-sm text-white rounded font-mono"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Atmospheric Description</label>
                <textarea
                  value={location.description}
                  onChange={(e) => setLocation({ ...location, description: e.target.value })}
                  rows={6}
                  placeholder="Describe the atmosphere, architecture, and mood..."
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="max-w-3xl mx-auto bg-[#f9f4e8] text-[#523b23] p-12 rounded-lg shadow-2xl border border-[#d4af37]/20 min-h-[600px] font-serif">
               <div className="text-center space-y-2 mb-8">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Location_Record</div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter font-display text-dragon-red">{location.name || 'Unknown Location'}</h1>
                  <p className="text-lg italic opacity-70">{location.title || 'The Unnamed Reach'}</p>
                  <div className="w-24 h-px bg-dragon-red/20 mx-auto mt-4" />
               </div>

               <div className="prose prose-stone max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-dragon-red">
                    {location.description || 'The cartographer has yet to ink the chronicles of this place...'}
                  </p>
               </div>

               <div className="mt-12 pt-8 border-t border-black/5 grid grid-cols-2 gap-8 text-[10px] font-bold uppercase tracking-widest opacity-40">
                  <div>Type: {location.type}</div>
                  <div className="text-right">Coords: {location.coordinates?.lat}, {location.coordinates?.lng}</div>
               </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="max-w-4xl mx-auto">
               <pre className="bg-black/40 p-6 rounded-2xl border border-white/10 text-xs text-blue-300 font-mono overflow-x-auto shadow-inner">
                  {JSON.stringify(location, null, 2)}
               </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
