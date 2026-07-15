import React, { useState, useEffect } from 'react';
import { useAtlasStore } from '../../store/useAtlasStore';
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
  region?: string;
  sub_region?: string;
  continent?: string;
  world?: string;
  plain?: string;
  geography?: string;
  history?: string;
  [key: string]: any;
}

interface JaneProps {
  initialData?: any;
}

export const Jane: React.FC<JaneProps> = ({ initialData }) => {
  const { loadAllLists } = useAtlasStore();

  const [location, setLocation] = useState<Partial<WorldLocation>>({
    id: '',
    name: '',
    type: 'settlement',
    category: 'settlement',
    title: '',
    description: '',
    coordinates: { lat: 0, lng: 0 },
    tags: [],
    metadata: {
      government: '',
      population: '',
      economy: '',
      religion: '',
      factions: ''
    },
    region: 'Sword Coast',
    sub_region: '',
    continent: 'Faerûn',
    world: 'Toril',
    plain: 'Material Plane'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');
  const [newMetaKey, setNewMetaKey] = useState('');

  useEffect(() => {
    loadAllLists();
  }, []);

  useEffect(() => {
    if (initialData) {
      setLocation(prev => ({
        ...prev,
        id: initialData.id || prev.id,
        name: initialData.name || prev.name,
        type: initialData.type || initialData.category || prev.type,
        category: initialData.category || initialData.type || prev.category,
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        coordinates: initialData.coordinates || prev.coordinates,
        region: initialData.region || prev.region,
        sub_region: initialData.sub_region || prev.sub_region,
        continent: initialData.continent || prev.continent,
        world: initialData.world || prev.world,
        plain: initialData.plain || prev.plain,
        metadata: {
          ...prev.metadata,
          ...(initialData.metadata || {})
        }
      }));
    }
  }, [initialData]);

  const handleBake = async () => {
    if (!location.id || !location.name) {
      alert("Location ID and Name are required for baking.");
      return;
    }

    setIsBaking(true);
    try {
      // Determine logical parent and directory path based on type
      let parentCategory = 'poi';
      let path = `public/assets/atlas/world/toril/faerun/`;
      const type = location.type || 'poi';
      
      if (type === 'city') {
        parentCategory = 'cities';
        path += `cities/${location.id}/${location.id}.json`;
      } else if (type === 'town' || type === 'village' || type === 'settlement') {
        parentCategory = 'towns_settlements';
        path += `towns_settlements/${location.id}/${location.id}.json`;
      } else if (type === 'forest') {
        parentCategory = 'forests';
        path += `forests/${location.id}/${location.id}.json`;
      } else if (type === 'mountain' || type === 'mountains') {
        parentCategory = 'mountains';
        path += `mountains/${location.id}/${location.id}.json`;
      } else if (type === 'wetland' || type === 'wetlands') {
        parentCategory = 'wetlands';
        path += `wetlands/${location.id}/${location.id}.json`;
      } else if (type === 'water' || type === 'lake' || type === 'river' || type === 'sea') {
        parentCategory = 'waters';
        path += `waters/${location.id}/${location.id}.json`;
      } else if (type === 'road' || type === 'trail') {
        parentCategory = 'roads_trails';
        path += `roads_trails/${location.id}/${location.id}.json`;
      } else if (type === 'region') {
        parentCategory = 'regions';
        path += `regions/${location.id}/${location.id}.json`;
      } else {
        path += `poi/${location.id}.json`;
      }

      // Merge and align with strict JSON Schemas (like city.schema.json)
      const alignedLocation = {
        id: location.id,
        name: location.name,
        type: location.type || 'settlement',
        category: location.category || location.type || 'settlement',
        plain: location.plain || 'Material Plane',
        world: location.world || 'Toril',
        continent: location.continent || 'Faerûn',
        region: location.region || 'Sword Coast',
        sub_region: location.sub_region || '',
        parent: parentCategory,
        title: location.title || '',
        description: location.description || '',
        wiki: location.wiki || '',
        image: location.image || '',
        thumbnail: location.thumbnail || '',
        banner: location.banner || '',
        tags: location.tags || [],
        map: location.map || '',
        sub_map: location.sub_map || '',
        children: location.children || [],
        sub_location_files: location.sub_location_files || [],
        coordinates: {
          lat: location.coordinates?.lat ?? 0,
          lng: location.coordinates?.lng ?? 0
        },
        bounds: location.bounds || [[0, 0], [1000, 1000]],
        origin: location.origin || 'top-left',
        unitsPerMile: location.unitsPerMile || 1,
        geography: location.geography || '',
        history: location.history || '',
        bestiary: location.bestiary || '',
        politics: location.politics || '',
        religion: location.religion || '',
        trade: location.trade || '',
        metadata: {
          government: location.metadata?.government || '',
          military: location.metadata?.military || '',
          population: location.metadata?.population || '',
          organizations: location.metadata?.organizations || '',
          trade: location.metadata?.trade || '',
          ...(location.metadata || {})
        },
        categories: location.categories || [],
        lore: location.lore || ''
      };

      const success = await commitFile(path, JSON.stringify(alignedLocation, null, 2));
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
               <GameIcon name="magic_effect" size={12} className={isGenerating ? 'animate-spin' : ''} />
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
            <div className="space-y-8">
              {/* Core Identity */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Location_ID (Slug)</label>
                  <input
                    type="text"
                    value={location.id}
                    onChange={(e) => setLocation({ ...location, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="waterdeep_north_district"
                    title="Location ID"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Type / Category</label>
                  <select
                    value={location.type}
                    onChange={(e) => setLocation({ ...location, type: e.target.value, category: e.target.value })}
                    title="Location Type"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all"
                  >
                    <option value="city">City</option>
                    <option value="settlement">Settlement/Town/Village</option>
                    <option value="forest">Forest</option>
                    <option value="mountain">Mountain/Range</option>
                    <option value="wetland">Wetland/Swamp/Marsh</option>
                    <option value="water">Water (Lake/River/Sea)</option>
                    <option value="road">Road/Trail</option>
                    <option value="region">Geographic Region</option>
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
                  title="Location Name"
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
                  title="Formal Title"
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
                      title="Latitude"
                      className="w-full bg-black/40 border border-white/5 p-2 text-sm text-white rounded font-mono"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Longitude</label>
                    <input
                      type="number"
                      value={location.coordinates?.lng}
                      onChange={(e) => setLocation({ ...location, coordinates: { ...location.coordinates!, lng: parseFloat(e.target.value) } })}
                      title="Longitude"
                      className="w-full bg-black/40 border border-white/5 p-2 text-sm text-white rounded font-mono"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Atmospheric Description</label>
                <textarea
                  value={location.description}
                  onChange={(e) => setLocation({ ...location, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the atmosphere, architecture, and mood..."
                  title="Location Description"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Dynamic Metadata Editor */}
              <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Dynamic_Metadata</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={newMetaKey}
                         onChange={(e) => setNewMetaKey(e.target.value)}
                         placeholder="New key (e.g. Flora)"
                         className="bg-black/40 border border-white/5 p-1.5 text-[10px] text-white rounded outline-none focus:border-dragon-red/30"
                       />
                       <button 
                         onClick={() => {
                           if (!newMetaKey) return;
                           setLocation({
                             ...location,
                             metadata: { ...location.metadata!, [newMetaKey.toLowerCase()]: '' }
                           });
                           setNewMetaKey('');
                         }}
                         className="bg-dragon-red/20 hover:bg-dragon-red/40 text-dragon-red p-1.5 rounded transition-colors"
                       >
                         <GameIcon name="add" size={12} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    {Object.entries(location.metadata || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-tighter">{key}</label>
                          <button 
                            onClick={() => {
                              const newMeta = { ...location.metadata };
                              delete newMeta[key];
                              setLocation({ ...location, metadata: newMeta });
                            }}
                            className="text-white/10 hover:text-dragon-red transition-colors"
                          >
                             <GameIcon name="close" size={10} />
                          </button>
                        </div>
                        <input 
                          type="text" 
                          value={value} 
                          onChange={(e) => setLocation({ ...location, metadata: { ...location.metadata!, [key]: e.target.value } })}
                          className="w-full bg-black/40 border border-white/5 p-2 text-xs text-white rounded focus:border-white/20 outline-none"
                        />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                 {['sub_region', 'region', 'continent', 'world', 'plain'].map(key => (
                    <div key={key} className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-widest">{key.replace('_', ' ')}</label>
                       <input 
                         type="text" 
                         value={(location as any)[key] || ''} 
                         onChange={(e) => setLocation({ ...location, [key]: e.target.value })}
                         className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white rounded font-mono"
                       />
                    </div>
                 ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Historical Lore (Markdown)</label>
                <textarea
                  value={location.history || ''}
                  onChange={(e) => setLocation({ ...location, history: e.target.value })}
                  rows={4}
                  placeholder="Record the chronicles of this place..."
                  title="Location History"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white rounded-xl focus:border-dragon-red/50 outline-none transition-all resize-none font-serif leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-[#f9f4e8] text-[#523b23] p-12 rounded-lg shadow-2xl border border-[#d4af37]/20 min-h-[600px] font-serif">
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
            <div>
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
