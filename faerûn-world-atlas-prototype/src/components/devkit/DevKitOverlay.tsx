import React from 'react';
import { Settings, Database, Github, Package, CheckCircle2, AlertCircle, Puzzle, Globe, BookOpen, Image as ImageIcon, FileUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAtlasStore } from '../../store/useAtlasStore';
import { GithubService } from '../../services/githubService';
import { WikiImportService } from '../../services/wikiImportService';
import { toast } from 'sonner';
import { StagingManager } from './StagingManager';
import { GameIcon } from '../../game_icons';
import { toSlug } from '../../lib/pathUtils';
import { WikiImportDialog } from '../Editor/WikiImportDialog';

interface DevKitProps {
  data: any;
  activeSegmentData: any;
  onBakeCurrent: () => Promise<void>;
  onModularBake: () => Promise<void>;
}

export const DevKitOverlay = ({ data, activeSegmentData, onBakeCurrent, onModularBake }: DevKitProps) => {
  const { 
    githubConfig, 
    setGithubConfig, 
    isDevKitOpen, 
    setDevKitOpen, 
    isEditMode, 
    setEditMode,
    isPlacementMode,
    setPlacementMode,
    isPickingCoordinate,
    setPickingCoordinate,
    isRulerMode,
    setRulerMode,
    mapScales,
    setScale,
    currentMapId,
    measuredUnits,
    setMeasuredUnits,
    currentHierarchy,
    stageChange,
    stagedChanges
  } = useAtlasStore();
  const stagesCount = Object.keys(stagedChanges).length;
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'sync' | 'wiki' | 'plugins'>('sync');
  const [wikiUrls, setWikiUrls] = React.useState({
    map: '',
    edit: ''
  });

  // Auto-fill placeholders if we are in a location
  React.useEffect(() => {
    if (currentHierarchy.location && activeTab === 'wiki' && !wikiUrls.map) {
      const city = currentHierarchy.location.split('/').pop() || "";
      const capitalized = city.charAt(0).toUpperCase() + city.slice(1);
      setWikiUrls({
        map: `https://forgottenrealms.fandom.com/wiki/Map:${capitalized}?action=mapedit`,
        edit: `https://forgottenrealms.fandom.com/wiki/Map:${capitalized}?action=edit`
      });
    }
  }, [currentHierarchy.location, activeTab]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [manualJson, setManualJson] = React.useState('');
  const [showManualInput, setShowManualInput] = React.useState(false);

  const activeMapId = currentHierarchy.location || currentHierarchy.subRegion || currentHierarchy.region || currentMapId;
  const currentScale = mapScales[activeMapId] || 1;
  const locationName = currentHierarchy.location?.split('/').pop() || activeSegmentData?.name || currentHierarchy.subRegion || currentHierarchy.region || currentMapId;

  const wikiService = React.useMemo(() => new WikiImportService(), []);

  const processImportedData = (mapData: any, wikiSections: Record<string, string> = {}) => {
    const locationId = currentHierarchy.location || "unknown_city";
    const result = wikiService.processWikiData(mapData, locationId);
    
    const citySlug = result.locationId;
    const basePath = `public/assets/atlas/world/toril/faerun/cities/${citySlug}`;

    const sublocations = result.sublocations as Record<string, any[]>;
    const sublocationFiles = Object.keys(sublocations)
      .filter(key => sublocations[key].length > 0)
      .map(key => `assets/atlas/world/toril/faerun/cities/${citySlug}/sublocations/${key}.json`);

    const cityData = {
      "$schema": "public/assets/atlas/schemas/city.schema.json",
      id: citySlug,
      name: mapData.description?.split('[[')?.[1]?.split(']]')?.[0] || citySlug,
      type: "metropolis",
      parent: "cities",
      title: `${mapData.description?.split('[[')?.[1]?.split(']]')?.[0] || citySlug}: Metropolis`,
      description: (wikiSections.lead || mapData.description || "").split('\n\n')[0], // Just the first paragraph for description
      wiki: wikiSections.history || wikiSections.description || "",
      image: `${citySlug}.webp`,
      thumbnail: `${citySlug}_thumb.webp`,
      banner: `${citySlug}_banner.webp`,
      tags: ["city", "metropolis"],
      map: `assets/atlas/world/toril/faerun/cities/${citySlug}/${citySlug}_map.webp`,
      children: [],
      sub_location_files: sublocationFiles,
      coordinates: {
        lat: 0,
        lng: 0
      },
      geography: wikiSections.description || wikiSections.geography || "",
      history: wikiSections.history || "",
      metadata: {
        government: wikiSections.government || "Council of Six",
        organizations: wikiSections.organizations || "",
        trade: wikiSections.trade || "",
        military: "The Mehelm",
        population: "100,000+"
      },
      bounds: result.metadata.bounds,
      origin: result.metadata.origin,
      unitsPerMile: currentScale
    };

    stageChange(`wiki-city-${citySlug}`, {
      path: `${basePath}/${citySlug}.json`,
      content: cityData,
      label: `City Meta: ${citySlug}`
    });

    Object.entries(sublocations).forEach(([cat, markers]) => {
      if (!Array.isArray(markers) || markers.length === 0) return;
      
      const subPath = `${basePath}/sublocations/${cat}.json`;
      stageChange(`wiki-sub-${citySlug}-${cat}`, {
        path: subPath,
        content: {
          category: cat,
          updatedAt: new Date().toISOString(),
          location_id: citySlug,
          sub_locations: markers.map((m: any) => ({
            id: m.id ? toSlug(m.id) : toSlug(m.popup.title),
            name: m.popup.title,
            categoryId: m.categoryId,
            type: "marker",
            position: [m.position[0], m.position[1]],
            popup: {
              title: m.popup.title,
              description: m.popup.description,
              image: m.popup.image || ""
            },
            day: { ambient: null, npcs: [], map: null, image: null },
            night: { ambient: null, npcs: [], map: null, image: null }
          }))
        },
        label: `Sub-locations: ${cat}`
      });
    });

    toast.success("Nodes successfully vectorized to staging!");
    setActiveTab('sync');
  };

  const handleWikiImport = async () => {
    if (showManualInput) {
      if (!manualJson) return toast.error("Please paste JSON data");
      try {
        const data = JSON.parse(manualJson);
        processImportedData(data);
      } catch (e) {
        toast.error("Invalid JSON format");
      }
      return;
    }

    if (!wikiUrls.map) return toast.error("Map URL is required");
    
    setIsImporting(true);
    try {
      // Parallel fetch if both URLs are provided
      const [mapData, pageText] = await Promise.all([
        wikiService.fetchMapData(wikiUrls.map),
        wikiUrls.edit ? wikiService.fetchPageData(wikiUrls.edit) : Promise.resolve("")
      ]);

      const sections = pageText ? wikiService.parseWikiSections(pageText) : {};
      processImportedData(mapData, sections);
    } catch (error: any) {
      const status = error.status || "Unknown";
      toast.error(`Import failed (${status}). Fandom may be blocking the proxy. Try manual paste.`);
      setShowManualInput(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentHierarchy.location) {
      toast.error("Set location target first");
      return;
    }

    const citySlug = currentHierarchy.location.split('/').pop() || "";
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const fileName = `${citySlug}_map.webp`;
      const path = `public/assets/atlas/world/toril/faerun/cities/${citySlug}/${fileName}`;

      stageChange(`media-${citySlug}`, {
        path,
        content: base64,
        label: `Map Alpha: ${fileName}`,
        isBinary: true
      });
      toast.success(`Vector Map Staged: ${fileName}`);
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDevKitOpen(!isDevKitOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevKitOpen, setDevKitOpen]);

  if (!isDevKitOpen) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    const service = new GithubService(githubConfig);
    const res = await service.testConnection();
    setIsVerifying(false);
    
    if (res.success) toast.success("GitHub Connection Verified");
    else toast.error("Verification Failed: Check token scope");
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-end p-6 pointer-events-none">
      {/* Ruler Calibration Panel - Moved to Left */}
      {isRulerMode && (
        <div className="absolute left-6 top-32 w-72 bg-[#0C0E12]/98 border-l-4 border-indigo-500 border-[#1E2228] shadow-2xl backdrop-blur-xl p-5 pointer-events-auto animate-in fade-in slide-in-from-left-6 z-[1101]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GameIcon name="ruler" size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Ruler_Calibration</span>
            </div>
            <button onClick={() => setRulerMode(false)} className="text-slate-500 hover:text-white">
              <AlertCircle className="h-3 w-3" />
            </button>
          </div>
          
          <div className="space-y-4">
             <div className="p-2 bg-white/5 border border-white/5 rounded-sm">
                <div className="text-[8px] text-slate-500 uppercase mb-1">Active_Grid_Node</div>
                <div className="text-[10px] font-mono text-indigo-300 truncate">{activeMapId || 'GLOBAL'}</div>
             </div>

             <div className="space-y-2">
                <Label className="text-[8px] text-slate-400 uppercase tracking-widest">Scale_Ratio (U/M)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={currentScale}
                    onChange={(e) => setScale(activeMapId, parseFloat(e.target.value) || 1)}
                    className="h-8 text-[11px] bg-black/40 border-[#2D3139] rounded-none px-2 font-mono text-indigo-400"
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 border-indigo-500/40 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10"
                    onClick={() => {
                      const miles = prompt("Enter distance in miles for the current blue line:");
                      if (miles && measuredUnits) {
                        const newScale = measuredUnits / parseFloat(miles);
                        setScale(activeMapId, newScale);
                        toast.success(`Recalibrated to ${newScale.toFixed(2)} units/mile`);
                      }
                    }}
                    disabled={!measuredUnits}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[7px] text-slate-600 italic leading-tight">Adjust scale manually or click the checkmark to calibrate via measurement.</p>
             </div>

             {measuredUnits ? (
               <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-sm animate-pulse-subtle">
                  <div className="text-[8px] text-indigo-400 font-bold uppercase mb-1">Live_Measurement</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">{ (measuredUnits / currentScale).toFixed(2) }</span>
                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">MILES</span>
                  </div>
                  <div className="text-[8px] text-slate-500 mt-1">
                    System Units: {Math.round(measuredUnits)}
                  </div>
               </div>
             ) : (
               <div className="p-3 border border-dashed border-slate-800 rounded-sm text-center">
                  <div className="text-[8px] text-slate-600 uppercase">Draw a line on the map to measure</div>
               </div>
             )}

             <Button 
               variant="ghost" 
               className="w-full h-6 text-[8px] uppercase font-bold text-slate-600 hover:text-slate-400 hover:bg-white/5"
               onClick={() => setMeasuredUnits(null)}
             >
               Clear_Measurement
             </Button>

             <Button 
               className="w-full h-8 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500/30 group"
               onClick={() => {
                 const citySlug = activeMapId.split('/').pop() || "world";
                 const basePath = `public/assets/atlas/world/toril/faerun/cities/${citySlug}`;
                 const targetPath = activeMapId === 'world' 
                  ? `public/assets/atlas/world/toril/faerun/world.json`
                  : `${basePath}/${citySlug}.json`;

                 stageChange(`scale-${activeMapId}`, {
                   path: targetPath,
                   content: { ...activeSegmentData, unitsPerMile: currentScale },
                   label: `Regrid Scale: ${locationName}`
                 });
                 toast.success(`Scale Ratio Staged: ${currentScale.toFixed(2)} units/mile`);
                 setActiveTab('sync');
               }}
             >
               <Save className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform" />
               Bake_Scale_Ratio
             </Button>
          </div>
        </div>
      )}

      <Card className="w-80 bg-[#0C0E12]/95 border-[#1E2228] shadow-2xl backdrop-blur-md pointer-events-auto border-l-4 border-l-emerald-500 flex flex-col max-h-[90vh]">
        <CardHeader className="p-4 border-b border-[#1E2228] flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Artificer_DevKit_v1</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDevKitOpen(false)} className="h-6 w-6">
            <Settings className="h-3 w-3 rotate-90" />
          </Button>
        </CardHeader>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E2228] bg-black/20 shrink-0">
          <button 
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-2 text-[9px] uppercase font-bold tracking-tighter transition-all ${activeTab === 'sync' ? 'text-emerald-500 border-b border-emerald-500 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Core_Sync
          </button>
          <button 
            onClick={() => setActiveTab('wiki')}
            className={`flex-1 py-2 text-[9px] uppercase font-bold tracking-tighter transition-all ${activeTab === 'wiki' ? 'text-amber-400 border-b border-amber-400 bg-amber-400/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Wiki_Importer
          </button>
          <button 
            onClick={() => setActiveTab('plugins')}
            className={`flex-1 py-2 text-[9px] uppercase font-bold tracking-tighter transition-all ${activeTab === 'plugins' ? 'text-blue-500 border-b border-blue-500 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Intelligence_Plugins
          </button>
        </div>
        
        <CardContent className="p-4 space-y-6 overflow-y-auto">
          {activeTab === 'sync' ? (
            <>
              {/* GitHub Config */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Github className="h-3 w-3" /> GitHub_Sync
                  </h3>
                  <StatusBadge success={!!githubConfig.token} />
                </div>
                
                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    onClick={() => setEditMode(!isEditMode)}
                    className={`flex-1 h-7 text-[9px] uppercase font-bold transition-all rounded-none ${isEditMode ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'}`}
                  >
                    <GameIcon name="edit" size={10} className="mr-1.5" />
                    {isEditMode ? "Edit_Session_Active" : "Start_Edit_Session"}
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-7 px-2 border-[#1E2228] bg-black/40 text-slate-500"
                    onClick={() => toast.info("Shift + D to toggle DevKit")}
                  >
                    <span className="text-[8px] font-mono">⌘D</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                  <Button 
                    onClick={() => setPickingCoordinate(!isPickingCoordinate)}
                    className={`h-7 text-[8px] uppercase font-bold transition-all rounded-none ${isPickingCoordinate ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'}`}
                  >
                    <GameIcon name="location" size={10} className="mr-1.5" />
                    {isPickingCoordinate ? "Picking..." : "Coord_Picker"}
                  </Button>
                  <Button 
                    onClick={() => setRulerMode(!isRulerMode)}
                    className={`h-7 text-[8px] uppercase font-bold transition-all rounded-none ${isRulerMode ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'}`}
                  >
                    <GameIcon name="ruler" size={10} className="mr-1.5" />
                    {isRulerMode ? "Ruler_On" : "Ruler_Tool"}
                  </Button>
                </div>

                <Button 
                  onClick={() => {
                    setPickingCoordinate(false);
                    setRulerMode(false);
                    setPlacementMode(!isPlacementMode);
                  }}
                  className={`w-full h-8 text-[9px] uppercase font-bold transition-all rounded-none mb-2 ${isPlacementMode ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'}`}
                >
                  <GameIcon name="location" size={12} className="mr-2" />
                  {isPlacementMode ? "Placement_Active" : "Node_Placement_Tool"}
                </Button>

                <div className="space-y-2 pt-2">
                  <Label className="text-[9px] text-slate-600">AUTH_TOKEN</Label>
                  <Input 
                    type="password"
                    value={githubConfig.token}
                    onChange={(e) => setGithubConfig({ token: e.target.value })}
                    className="h-7 text-[10px] bg-black/40 border-[#2D3139] rounded-none focus:ring-emerald-500/20"
                    placeholder="ghp_..."
                  />
                </div>

                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full h-7 text-[9px] uppercase font-bold bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-none"
                >
                  {isVerifying ? "Verifying..." : "Verify_Connection"}
                </Button>
              </div>

              <div className="h-px bg-[#1E2228]" />

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                   <Database className="h-3 w-3" /> Quick_Bake_Actions
                </h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={onBakeCurrent}
                    className="w-full h-8 text-[9px] uppercase font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20 rounded-none"
                  >
                    <GameIcon name="save" size={10} className="mr-2" />
                    Bake_Current_Map_State
                  </Button>
                  <Button 
                    onClick={onModularBake}
                    className="w-full h-8 text-[9px] uppercase font-bold bg-slate-600/10 text-slate-400 hover:bg-slate-600/20 border border-slate-500/20 rounded-none"
                  >
                    <GameIcon name="layers" size={10} className="mr-2" />
                    Segmented_Modular_Bake
                  </Button>
                </div>
              </div>

              <div className="h-px bg-[#1E2228]" />

              <StagingManager />
            </>
          ) : activeTab === 'wiki' ? (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/[0.05] border border-amber-500/20 rounded-md">
                   <Label className="text-[9px] text-amber-500/70 uppercase tracking-[0.2em] mb-2 block font-black">Active_Ingestion_Target</Label>
                   <div className="text-base font-black text-white flex items-center gap-3">
                     <div className="h-10 w-10 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                       <Globe className="h-6 w-6 text-amber-400" />
                     </div>
                     <div className="flex flex-col">
                        <span className="tracking-tight text-sm font-black leading-none">{locationName?.toUpperCase() || 'GLOBAL'}</span>
                        <span className="text-[8px] text-slate-500 font-mono mt-1">/{currentHierarchy.region || 'faerun'}/{currentHierarchy.subRegion || '...'}/{locationName || '...'}</span>
                     </div>
                   </div>
                </div>

                <div className="h-px bg-[#1E2228] opacity-50" />
                
                <h3 className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1.5 px-1">
                  <Package className="h-3.5 w-3.5 text-amber-400" /> Source_Ingestion_Protocol
                </h3>
                
                {/* Legacy Ingest Button moved from Sidebar */}
                <div className="px-1">
                   <WikiImportDialog 
                    currentContext={currentHierarchy} 
                    onImport={(markers) => {
                      // Adapt to new data structure if needed
                      processImportedData({ markers, categories: [] });
                    }} 
                  />
                </div>

                <div className="h-px bg-[#1E2228] opacity-30" />

                {showManualInput ? (
                  <div className="space-y-3 p-3 bg-black/40 border border-amber-500/20 rounded text-amber-100">
                    <Label className="text-[9px] text-amber-400 uppercase flex items-center justify-between px-1 font-black">
                      <span>Manual_JSON_Payload</span>
                      <Button variant="ghost" className="h-4 text-[7px] text-slate-500 hover:text-white" onClick={() => setShowManualInput(false)}>SWITCH_TO_URL</Button>
                    </Label>
                    <textarea 
                      value={manualJson}
                      onChange={(e) => setManualJson(e.target.value)}
                      className="w-full h-32 text-[10px] bg-[#0F1115] border-[#373D48] text-amber-100 rounded-sm p-2 font-mono focus:ring-amber-500/20 placeholder:text-slate-700"
                      placeholder='Paste JSON from ...action=mapedit here'
                    />
                    <p className="text-[8px] text-slate-600 px-1 italic">Format markers as an array of geographical nodes.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[9px] text-slate-400 uppercase flex items-center justify-between px-1 font-bold">
                        <span>1. Wiki_Map_Markers (JSON)</span>
                        <span className="text-[8px] text-amber-500/60 font-bold tracking-widest px-1 bg-amber-500/5 rounded">REQUIRED</span>
                      </Label>
                      <Input 
                        value={wikiUrls.map}
                        onChange={(e) => setWikiUrls(prev => ({ ...prev, map: e.target.value }))}
                        className="h-9 text-[11px] bg-[#22262E] border-[#373D48] text-white rounded-sm focus:border-amber-500/50 focus:ring-0 placeholder:text-slate-600"
                        placeholder="Enter ?action=mapedit URL"
                      />
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[8px] text-slate-600 italic">Primary source for coordinates.</p>
                        <button className="text-[8px] text-amber-500 hover:text-amber-400 underline font-bold" onClick={() => setShowManualInput(true)}>PASTE_MANUAL_JSON</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] text-slate-400 uppercase flex items-center justify-between px-1 font-bold">
                        <span>2. Wiki_Page_Context (Text)</span>
                        <span className="text-[8px] text-slate-600 font-normal">OPTIONAL</span>
                      </Label>
                      <Input 
                        value={wikiUrls.edit}
                        onChange={(e) => setWikiUrls(prev => ({ ...prev, edit: e.target.value }))}
                        className="h-9 text-[11px] bg-[#22262E] border-[#373D48] text-white rounded-sm focus:border-amber-500/50 focus:ring-0 placeholder:text-slate-600"
                        placeholder="Enter ?action=edit URL"
                      />
                    </div>
                  </>
                )}
                
                <Button 
                  onClick={handleWikiImport}
                  disabled={isImporting}
                  className="w-full h-10 text-[10px] uppercase font-black tracking-widest bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-sm mt-2 shadow-[0_0_20px_-5px_rgba(245,158,11,0.1)]"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {isImporting ? "Baking_Vector_Shards..." : showManualInput ? "Process_Manual_Payload" : "Execute_Vector_Import"}
                </Button>

                <div className="p-4 bg-black/40 border border-[#1E2228] rounded-sm mt-4">
                  <h4 className="text-[9px] font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase">
                    <AlertCircle className="h-3 w-3 text-amber-500" /> Pipeline_Note
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    This module parses Fandom map exports and segments them into modular <span className="text-amber-400/80 font-bold">.json</span> files. Changes will be staged in the <span className="text-blue-400 font-bold">Core_Sync</span> tab for verification before deployment.
                  </p>
                </div>

                <div className="h-px bg-[#1E2228] opacity-50 my-2" />

                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1.5 px-1">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-400" /> Image_Texture_Ingestion
                  </h3>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-[#2D3139] group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all p-4 rounded text-center">
                      <FileUp className="h-5 w-5 text-slate-600 mx-auto mb-1 group-hover:text-blue-400" />
                      <div className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">UPLOAD_CARTOGRAPHY_ASSET</div>
                      <div className="text-[8px] text-slate-700 mt-1 uppercase tracking-tighter">webp / png / jpg (Targets current node)</div>
                    </div>
                  </div>
                  {stagesCount > 0 && (
                    <Button 
                      onClick={() => setActiveTab('sync')}
                      className="w-full h-8 text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 mt-2"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      View {stagesCount} Staged Changes (Ready to Bake)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Puzzle className="h-3 w-3" /> Layer_Engines
                </h3>
                <div className="space-y-2">
                  <PluginItem name="Dynamic Weather" description="Real-time particle overlay" active={false} />
                  <PluginItem name="Monster Den Generator" description="AI injection for encounter nodes" active={true} color="blue" />
                  <PluginItem name="Trade Route Logic" description="Calculate economic distance" active={false} />
                  <PluginItem name="Wiki Syncer" description="Auto-pull history from FanDom" active={true} color="emerald" />
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-sm">
                <h4 className="text-[10px] font-bold text-blue-400 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> RESEARCH_NODE
                </h4>
                <p className="text-[9px] text-slate-400 leading-relaxed italic">
                  "Mapmaking is no longer about drawing lines, but about managing layers of intelligence."
                </p>
                <div className="mt-2 text-[8px] font-mono text-blue-500/50 uppercase tracking-tighter">
                  Source: Artificer Atlas Research Lab
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PluginItem = ({ name, description, active, color = 'emerald' }: { name: string; description: string; active: boolean; color?: string }) => (
  <div className={`p-2 border border-[#1E2228] bg-black/40 flex items-center justify-between group transition-all hover:border-${color}-500/30`}>
    <div>
      <div className="text-[10px] font-bold text-slate-300">{name}</div>
      <div className="text-[8px] text-slate-600">{description}</div>
    </div>
    <div className={`h-2 w-2 rounded-full ${active ? `bg-${color}-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]` : 'bg-slate-800'}`} />
  </div>
);

const StatusBadge = ({ success }: { success: boolean }) => (
  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
    {success ? <CheckCircle2 className="h-2 w-2 text-emerald-500" /> : <AlertCircle className="h-2 w-2 text-red-500" />}
    <span className={`text-[8px] font-bold uppercase ${success ? 'text-emerald-500' : 'text-red-500'}`}>
      {success ? 'Active' : 'Offline'}
    </span>
  </div>
);
