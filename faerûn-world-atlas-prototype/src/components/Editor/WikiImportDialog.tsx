import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { GameIcon } from "../../game_icons";
import { transformWikiJson } from "../../lib/wikiImporter";
import { MapMarker } from "../../types";
import { toast } from "sonner";

interface WikiImportDialogProps {
  currentContext: { region?: string; subRegion?: string; location?: string };
  onImport: (markers: MapMarker[]) => void;
}

export function WikiImportDialog({ currentContext, onImport }: WikiImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const newMarkers = transformWikiJson(parsed, currentContext);
      
      if (newMarkers.length > 0) {
        onImport(newMarkers);
        toast.success(`Successfully ingested ${newMarkers.length} entities from wiki!`);
        setJsonInput("");
        setOpen(false);
      } else {
        toast.error("No valid markers found in the provided JSON.");
      }
    } catch (e) {
      toast.error("Invalid JSON format. Please check the export from the wiki.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase border-[#2D3139] bg-[#0F1115]/50 hover:bg-blue-600 hover:text-white transition-all group">
          <GameIcon name="layers" size={12} className="mr-2 opacity-50 group-hover:opacity-100" />
          Ingest Wiki_Data
        </Button>
      } />
      <DialogContent className="bg-[#16191E] border-[#2D3139] text-[#E0E2E5] rounded-none sm:max-w-[600px] outline-none">
        <DialogHeader>
          <DialogTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
            WIKI_DATA_INGESTION_ENGINE
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-none space-y-2">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-2">
                <GameIcon name="info" size={10} />
                Ingestion_Protocol
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                To bypass CORS restrictions, visit the Fandom Map Editor (URL provided by user), 
                click "Edit", and copy the raw JSON from the editor textarea into the field below.
            </p>
            <div className="font-mono text-[9px] text-slate-500">
              TARGET_PATH: toril/faerun/{currentContext.region || '?'}/{currentContext.subRegion || '?'}/{currentContext.location || '?'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source_Metadata (Fandom JSON)</label>
                <div className="text-[8px] text-blue-500/70 animate-pulse font-mono uppercase">Listening_for_buffer...</div>
            </div>
            <Textarea 
              placeholder="Paste the JSON from Fandom Map Edit/Export here..."
              className="h-64 bg-[#0F1115] border-[#2D3139] text-xs font-mono rounded-none focus:ring-blue-500/50 resize-none text-slate-400"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center bg-[#0F1115] p-3 border border-[#2D3139]">
             <div className="text-[9px] text-slate-600 flex items-center gap-2">
                <GameIcon name="compass" size={10} />
                MapLevel: {currentContext.location ? 'LOCATION' : currentContext.subRegion ? 'SUB_REGION' : 'WORLD'}
             </div>
             <Button 
               onClick={handleImport}
               disabled={!jsonInput}
               className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase h-8 px-6 rounded-none shadow-[0_0_15px_rgba(37,99,235,0.3)]"
             >
               Start_Resolution_Bake
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
