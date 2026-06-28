import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GameIcon } from "../../game_icons";
import JSZip from 'jszip';
import { toSlug } from '../../lib/pathUtils';

interface CityImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hierarchy: { region?: string; subRegion?: string; location?: string };
  onImportComplete: (data: any) => void;
}

export function CityImportDialog({ open, onOpenChange, hierarchy, onImportComplete }: CityImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [mapUrlInput, setMapUrlInput] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const processImport = async () => {
    if (!jsonInput) return;
    setIsProcessing(true);
    setStatus("Parsing JSON...");

    try {
      const raw = JSON.parse(jsonInput);
      const { categories, markers, mapImage, geography, history } = raw;

      if (!categories || !markers) {
        throw new Error("Invalid format: categories and markers are required.");
      }

      const zip = new JSZip();
      const citySlug = toSlug(hierarchy.location || "");
      const baseFolder = `public/assets/atlas/world/toril/faerun/cities/${citySlug}`;
      
      const submapUrl = mapUrlInput || (mapImage ? `https://raw.githubusercontent.com/japiohopman/artificer/main/${baseFolder}/${citySlug}_submap.webp` : "");

      // 1. Create main location.json
      const mainData = {
        geography: geography || "",
        history: history || "",
        submapUrl: submapUrl,
        categories: categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon
        })),
        markers: [] // Main markers are kept empty or moved to sublocations
      };

      zip.file(`${citySlug}.json`, JSON.stringify(mainData, null, 2));

      // 2. Split markers into sublocation files based on category
      const sublocationsFolder = zip.folder("sublocations");
      if (sublocationsFolder) {
        categories.forEach((cat: any) => {
          const catMarkers = markers.filter((m: any) => m.categoryId === cat.id).map((m: any) => {
            const x = m.x !== undefined ? Number(m.x) : (m.position ? Number(m.position[0]) : NaN);
            const y = m.y !== undefined ? Number(m.y) : (m.position ? Number(m.position[1]) : NaN);
            
            return {
              id: m.id || `m-${cat.id}-${Math.random().toString(36).substr(2, 5)}`,
              categoryId: cat.id,
              position: [x, y],
              title: m.title || m.popup?.title || "Unknown",
              description: m.description || m.popup?.description || "",
              wikiSlug: m.wikiSlug || m.popup?.link?.url?.split('/').pop() || ""
            };
          });

          if (catMarkers.length > 0) {
            let fileName = cat.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            
            // Explicit mapping for common Fandom categories to requested filenames
            const mapping: Record<string, string> = {
              "districts": "districts",
              "temples__shrines": "temples",
              "temples": "temples",
              "landmarks": "landmarks",
              "shops__coasters": "shops",
              "shops": "shops",
              "taverns__eateries": "taverns",
              "taverns": "taverns",
              "points_of_interest": "poi",
              "residences__estates": "residences",
              "residences": "residences",
              "gates": "gates",
              "streets__roads": "streets",
              "streets": "streets"
            };

            const finalFileName = mapping[fileName] || fileName;
            sublocationsFolder.file(`${finalFileName}.json`, JSON.stringify({ markers: catMarkers }, null, 2));
          }
        });
      }

      setStatus("Generating Package...");
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${citySlug}_atlas_bundle.zip`;
      link.click();

      setStatus("Import Successful! ZIP downloaded.");
      onImportComplete(mainData);
      
      setTimeout(() => {
        onOpenChange(false);
        setJsonInput("");
        setStatus("");
      }, 2000);

    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-[#16191E] border-[#2D3139] text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GameIcon name="map" className="text-blue-400" />
            City Knowledge Importer
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Paste the raw JSON export from the Fandom Map Editor. This will generate a structured ZIP containing 
            the main location data and individual category files (districts, temples, etc.) for the GitHub repo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-500 uppercase tracking-wider">Hierarchy Context</Label>
            <div className="p-2 bg-[#0F1115] border border-[#23262D] rounded flex gap-4 text-[11px] font-mono text-blue-400">
              <span>REGION: {hierarchy.region}</span>
              <span>SUB: {hierarchy.subRegion}</span>
              <span>LOC: {hierarchy.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wider">Map Image URL (Optional)</Label>
              <Input 
                placeholder="https://.../baldurs_gate_submap.webp"
                className="bg-[#0F1115] border-[#2D3139] text-slate-300 text-[11px]"
                value={mapUrlInput}
                onChange={(e) => setMapUrlInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-500 uppercase tracking-wider">Fandom Map JSON</Label>
            <Textarea
              placeholder='Paste JSON here (starts with { "mapImage": ... })'
              className="h-[250px] bg-[#0F1115] border-[#2D3139] text-[11px] font-mono focus:ring-blue-500 focus:border-blue-500 text-slate-300"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>

          {status && (
            <div className={`p-2 text-[11px] rounded border ${status.startsWith('Error') ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-blue-900/10 border-blue-900/30 text-blue-400'}`}>
              {status}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[#2D3139] pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button 
            onClick={processImport} 
            disabled={isProcessing || !jsonInput}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 transition-all"
          >
            {isProcessing ? (
               <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
               <GameIcon name="export" size={14} />
            )}
            Process & Export ZIP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
