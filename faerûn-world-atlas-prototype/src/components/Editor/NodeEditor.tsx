import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapMarker, MapCategory } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Trash2, Plus, X, Code, Edit3 } from "lucide-react";

interface EditorProps {
  marker: MapMarker | null;
  categories: MapCategory[];
  onSave: (marker: MapMarker) => void;
  onDelete: (id: string) => void;
  onLoadSubMap: (id: string) => void;
  onClose: () => void;
}

export default function NodeEditor({ marker, categories, onSave, onDelete, onLoadSubMap, onClose }: EditorProps) {
  const [formData, setFormData] = useState<MapMarker | null>(null);
  const [jsonContent, setJsonContent] = useState("");
  const [activeTab, setActiveTab] = useState("visual");

  useEffect(() => {
    setFormData(marker);
    if (marker) setJsonContent(JSON.stringify(marker, null, 2));
  }, [marker]);

  if (!formData) return null;

  const handleChange = (field: string, value: any) => {
    if (field.startsWith("popup.")) {
      const popupField = field.split(".")[1];
      const newData = {
        ...formData,
        popup: { ...formData.popup, [popupField]: value }
      };
      setFormData(newData);
      setJsonContent(JSON.stringify(newData, null, 2));
    } else {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      setJsonContent(JSON.stringify(newData, null, 2));
    }
  };

  const handleRegionChange = (val: string) => {
    // Sub-region mapping
    const mappings: Record<string, { region: string; subRegion?: string }> = {
      "utter_north": { region: "northwest_faerun", subRegion: "utter_north" },
      "sword_coast_north": { region: "northwest_faerun", subRegion: "sword_coast_north" },
      "silver_marches": { region: "northwest_faerun", subRegion: "silver_marches" },
      "savage_frontier": { region: "northwest_faerun", subRegion: "savage_frontier" },
      "high_forest": { region: "northwest_faerun", subRegion: "high_forest" },
      "the_frozenfar": { region: "northwest_faerun", subRegion: "the_frozenfar" },
      "damara": { region: "northeast_faerun", subRegion: "damara" },
      "great_dale": { region: "northeast_faerun", subRegion: "great_dale" },
      "impiltur": { region: "northeast_faerun", subRegion: "impiltur" },
      "narfell": { region: "northeast_faerun", subRegion: "narfell" },
      "rashemen": { region: "northeast_faerun", subRegion: "rashemen" },
      "the_ride": { region: "northeast_faerun", subRegion: "the_ride" },
      "thar": { region: "northeast_faerun", subRegion: "thar" },
      "tortured_land": { region: "northeast_faerun", subRegion: "tortured_land" },
      "vaasa": { region: "northeast_faerun", subRegion: "vaasa" },
      "western_heartlands": { region: "west_faerun", subRegion: "western_heartlands" },
      "lands_of_intrigue": { region: "west_faerun", subRegion: "lands_of_intrigue" },
      "island_kingdoms": { region: "west_faerun", subRegion: "island_kingdoms" },
      "moonshae_isles": { region: "west_faerun", subRegion: "moonshae_isles" },
    };

    const map = mappings[val];
    if (map) {
      setFormData({
        ...formData!,
        region: map.region,
        subRegion: map.subRegion
      });
    } else {
      setFormData({
        ...formData!,
        region: val,
        subRegion: undefined
      });
    }
  };

  const handleCommit = () => {
    if (activeTab === "json") {
        try {
          const parsed = JSON.parse(jsonContent);
          onSave(parsed);
        } catch (e) {
          toast.error("Invalid JSON structure");
        }
    } else {
        onSave(formData);
    }
  };

  return (
    <Card className="absolute top-20 right-4 w-96 z-[1050] bg-[#0C0E12]/95 border-l-4 border-l-emerald-500 border-[#1E2228] shadow-2xl backdrop-blur-md overflow-hidden rounded-none animate-in fade-in slide-in-from-right-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 h-12 px-4 py-0 border-b border-[#1E2228] bg-black/20">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/70 flex items-center gap-2">
          {marker?.id ? <Edit3 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {marker?.id ? "Entity_Registry // Active_Node" : "Initialize_Signal_Shard"}
        </CardTitle>
        <div className="flex items-center gap-2">
           <div className="px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-500 font-mono uppercase">
             {marker?.categoryId || 'UNSET'}
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/5">
             <X className="h-3 w-3" />
           </Button>
        </div>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-[#0F1115] border-b border-[#1E2228] rounded-none h-9 p-0">
          <TabsTrigger value="visual" className="flex-1 text-[9px] uppercase font-bold rounded-none data-[state=active]:bg-[#16191E] data-[state=active]:text-emerald-400 border-r border-[#1E2228] h-full">Visual_Matrix</TabsTrigger>
          <TabsTrigger value="json" className="flex-1 text-[9px] uppercase font-bold rounded-none data-[state=active]:bg-[#16191E] data-[state=active]:text-emerald-400 h-full">Raw_Shards</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-4 px-4 pb-4">
          <TabsContent value="visual" className="mt-0 space-y-4">
            <ScrollArea className="h-[480px] pr-4">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Node_Identification_Label</Label>
                  <Input 
                    id="title" 
                    value={formData.popup.title} 
                    onChange={(e) => handleChange("popup.title", e.target.value)}
                    className="bg-[#0F1115] border-[#1E2228] h-9 text-[11px] focus:ring-1 focus:ring-emerald-500/50 rounded-none text-emerald-400 font-bold"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Data_Payload</Label>
                  <textarea 
                    id="description" 
                    className="flex min-h-[100px] w-full rounded-none border border-[#2D3139] bg-[#0F1115] px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors text-slate-400 font-sans leading-relaxed"
                    value={formData.popup.description} 
                    onChange={(e) => handleChange("popup.description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="category" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Class</Label>
                    <Select 
                        value={formData.categoryId} 
                        onValueChange={(val) => handleChange("categoryId", val)}
                    >
                        <SelectTrigger className="bg-[#0F1115] border-[#2D3139] h-8 text-xs rounded-none">
                        <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#16191E] border-[#2D3139] text-slate-300">
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="text-[11px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                    {cat.name}
                                </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="biome" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Domain</Label>
                    <Select 
                        value={formData.biome || "none"} 
                        onValueChange={(val) => handleChange("biome", val === "none" ? undefined : val)}
                    >
                        <SelectTrigger className="bg-[#0F1115] border-[#2D3139] h-8 text-xs rounded-none">
                        <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#16191E] border-[#2D3139] text-slate-300">
                        <SelectItem value="none" className="text-[11px] text-slate-500 italic">Unassigned</SelectItem>
                        <SelectItem value="arctic" className="text-[11px]">Arctic</SelectItem>
                        <SelectItem value="coast" className="text-[11px]">Coast</SelectItem>
                        <SelectItem value="desert" className="text-[11px]">Desert</SelectItem>
                        <SelectItem value="forest" className="text-[11px]">Forest</SelectItem>
                        <SelectItem value="grassland" className="text-[11px]">Grassland</SelectItem>
                        <SelectItem value="mountain" className="text-[11px]">Mountain</SelectItem>
                        <SelectItem value="swamp" className="text-[11px]">Swamp</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="type" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Entity_Type</Label>
                    <Select 
                        value={formData.type || "marker"} 
                        onValueChange={(val) => handleChange("type", val)}
                    >
                        <SelectTrigger className="bg-[#0F1115] border-[#2D3139] h-8 text-xs rounded-none">
                        <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#16191E] border-[#2D3139] text-slate-300">
                        <SelectItem value="marker" className="text-[11px]">MARKER_NODE</SelectItem>
                        <SelectItem value="area" className="text-[11px]">AREA_REGION</SelectItem>
                        <SelectItem value="path" className="text-[11px]">TRANSIT_PATH</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subMapId" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">SubMap_ID (Transition)</Label>
                    <Input 
                      id="subMapId" 
                      value={formData.subMapId || ""} 
                      onChange={(e) => handleChange("subMapId", e.target.value)}
                      placeholder="e.g. baldurs-gate"
                      className="bg-[#0F1115] border-[#2D3139] h-8 text-xs focus:ring-1 focus:ring-blue-500/50 rounded-none text-emerald-400"
                    />
                    {formData.subMapId && (
                      <div className="space-y-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-emerald-900 text-emerald-400 hover:text-emerald-300 font-bold text-[9px] uppercase h-7 rounded-none"
                          onClick={(e) => {
                             e.preventDefault();
                             onLoadSubMap(formData.subMapId!);
                          }}
                        >
                          LOAD_SUBMAP_ENVIRONMENT
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#2D3139]">
                  <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Hierarchical_Context (Relational_Path)</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] text-slate-600">REGION</Label>
                      <Select 
                        value={formData.subRegion || formData.region || ""} 
                        onValueChange={handleRegionChange}
                      >
                        <SelectTrigger className="bg-[#0F1115] border-[#2D3139] h-7 text-[10px] focus:ring-1 focus:ring-blue-500/50 rounded-none text-slate-400">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#16191E] border-[#2D3139] text-slate-300">
                          <SelectItem value="northwest_faerun" className="text-[11px]">Northwest Faerûn</SelectItem>
                          <SelectItem value="utter_north" className="text-[11px]">↳ Utter North</SelectItem>
                          <SelectItem value="sword_coast_north" className="text-[11px]">↳ Sword Coast North</SelectItem>
                          <SelectItem value="silver_marches" className="text-[11px]">↳ Silver Marches</SelectItem>
                          <SelectItem value="savage_frontier" className="text-[11px]">↳ Savage Frontier</SelectItem>
                          <SelectItem value="high_forest" className="text-[11px]">↳ High Forest</SelectItem>
                          <SelectItem value="the_frozenfar" className="text-[11px]">↳ The Frozenfar</SelectItem>
                          <SelectItem value="north_faerun" className="text-[11px]">North Faerûn</SelectItem>
                          <SelectItem value="northeast_faerun" className="text-[11px]">Northeast Faerûn</SelectItem>
                          <SelectItem value="damara" className="text-[11px]">↳ Damara</SelectItem>
                          <SelectItem value="great_dale" className="text-[11px]">↳ The Great Dale</SelectItem>
                          <SelectItem value="impiltur" className="text-[11px]">↳ Impiltur</SelectItem>
                          <SelectItem value="narfell" className="text-[11px]">↳ Narfell</SelectItem>
                          <SelectItem value="rashemen" className="text-[11px]">↳ Rashemen</SelectItem>
                          <SelectItem value="the_ride" className="text-[11px]">↳ The Ride</SelectItem>
                          <SelectItem value="thar" className="text-[11px]">↳ Thar</SelectItem>
                          <SelectItem value="tortured_land" className="text-[11px]">↳ Tortured Land</SelectItem>
                          <SelectItem value="vaasa" className="text-[11px]">↳ Vaasa</SelectItem>
                          <SelectItem value="west_faerun" className="text-[11px]">West Faerûn</SelectItem>
                          <SelectItem value="western_heartlands" className="text-[11px]">↳ Western Heartlands</SelectItem>
                          <SelectItem value="lands_of_intrigue" className="text-[11px]">↳ Lands of Intrigue</SelectItem>
                          <SelectItem value="island_kingdoms" className="text-[11px]">↳ Island Kingdoms</SelectItem>
                          <SelectItem value="moonshae_isles" className="text-[11px]">↳ Moonshae Isles</SelectItem>
                          <SelectItem value="interior_faerun" className="text-[11px]">Interior Faerûn</SelectItem>
                          <SelectItem value="sea_of_the_fallen_stars" className="text-[11px]">Sea of Fallen Stars</SelectItem>
                          <SelectItem value="southeast_faerun" className="text-[11px]">Southeast Faerûn</SelectItem>
                          <SelectItem value="east_faerun" className="text-[11px]">East Faerûn</SelectItem>
                          <SelectItem value="south_faerun" className="text-[11px]">South Faerûn</SelectItem>
                          <SelectItem value="southwest_faerun" className="text-[11px]">Southwest Faerûn</SelectItem>
                          <SelectItem value="water" className="text-[11px]">Waters</SelectItem>
                          <SelectItem value="underdark" className="text-[11px]">Underdark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] text-slate-600">SUB_REGION</Label>
                      <Input 
                        value={formData.subRegion || ""} 
                        onChange={(e) => handleChange("subRegion", e.target.value)}
                        placeholder="e.g. sword_coast"
                        className="bg-[#0F1115] border-[#2D3139] h-7 text-[10px] focus:ring-1 focus:ring-blue-500/50 rounded-none text-slate-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] text-slate-600">LOCATION</Label>
                      <Input 
                        value={formData.location || ""} 
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="e.g. baldurs_gate"
                        className="bg-[#0F1115] border-[#2D3139] h-7 text-[10px] focus:ring-1 focus:ring-blue-500/50 rounded-none text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {formData.type === "area" && (
                  <div className="space-y-3 pt-2 border-t border-[#2D3139]">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Region_Boundary_Vectors</Label>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-blue-400 hover:text-blue-300"
                        onClick={() => {
                          const newPath = [...(formData.path || []), [formData.position[0], formData.position[1]] as [number, number]];
                          handleChange("path", newPath);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {(formData.path || []).map((point, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-[9px] font-mono text-slate-600 w-4">{idx}</span>
                          <Input 
                            type="number"
                            value={point[0]}
                            onChange={(e) => {
                              const newPath = [...(formData.path || [])];
                              newPath[idx] = [parseFloat(e.target.value), point[1]];
                              handleChange("path", newPath);
                            }}
                            className="bg-[#0F1115] border-[#2D3139] h-7 text-[10px] font-mono text-blue-400 rounded-none w-full"
                          />
                          <Input 
                            type="number"
                            value={point[1]}
                            onChange={(e) => {
                              const newPath = [...(formData.path || [])];
                              newPath[idx] = [point[0], parseFloat(e.target.value)];
                              handleChange("path", newPath);
                            }}
                            className="bg-[#0F1115] border-[#2D3139] h-7 text-[10px] font-mono text-blue-400 rounded-none w-full"
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-red-500 hover:text-red-400"
                            onClick={() => {
                              const newPath = (formData.path || []).filter((_, i) => i !== idx);
                              handleChange("path", newPath);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(formData.path || []).length === 0 && (
                        <div className="text-center py-4 border border-dashed border-[#2D3139] text-[9px] text-slate-600 uppercase">
                          No boundary vectors defined. Click + to add current position.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2D3139]">
                  <div className="space-y-2">
                    <Label htmlFor="posX" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vector_X</Label>
                    <Input 
                      id="posX" 
                      type="number"
                      value={formData.position[0]} 
                      onChange={(e) => handleChange("position", [parseFloat(e.target.value), formData.position[1]])}
                      className="bg-[#0F1115] border-[#2D3139] h-8 text-xs font-mono text-blue-400 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posY" className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vector_Y</Label>
                    <Input 
                      id="posY" 
                      type="number"
                      value={formData.position[1]} 
                      onChange={(e) => handleChange("position", [formData.position[0], parseFloat(e.target.value)])}
                      className="bg-[#0F1115] border-[#2D3139] h-8 text-xs font-mono text-blue-400 rounded-none"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            <div className="space-y-4">
              <textarea 
                className="w-full h-80 bg-[#0F1115] text-blue-300 font-mono text-[10px] p-4 rounded-none border border-[#2D3139] focus:outline-none focus:border-blue-500/30 transition-colors leading-relaxed"
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                spellCheck={false}
              />
              <div className="p-2 border border-blue-900/30 bg-blue-900/10">
                <p className="text-[9px] text-blue-300/70 italic leading-relaxed uppercase">Read/Write access granted to node source. Caution: format errors will break regional connectivity.</p>
              </div>
            </div>
          </TabsContent>

          <div className="flex gap-2 mt-4 pt-4 border-t border-[#1E2228]">
            <Button 
                className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 h-10 text-[11px] font-black uppercase tracking-widest rounded-none shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]" 
                onClick={handleCommit}
            >
                <Save className="h-4 w-4 mr-2" />
                Commit_Node_State
            </Button>
            {marker?.id && (
                <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => onDelete(formData.id)}
                className="h-9 w-9 border border-red-900/50 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-none"
                >
                <Trash2 className="h-4 w-4" />
                </Button>
            )}
            </div>
        </CardContent>
      </Tabs>
    </Card>
  );
}
