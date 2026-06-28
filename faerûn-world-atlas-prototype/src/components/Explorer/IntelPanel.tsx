import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameIcon } from "../../game_icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface IntelPanelProps {
  data: any;
  onBack: () => void;
  onMarkerSelect?: (marker: any) => void;
}

export const IntelPanel: React.FC<IntelPanelProps> = ({ data, onBack, onMarkerSelect }) => {
  if (!data) return null;

  const metadata = data.metadata || {};
  const isCity = data.type === 'Metropolis' || data.type === 'City';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-[#16191E]"
    >
      <div className="p-4 border-b border-[#2D3139] bg-[#0F1115]/50">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="h-8 w-8 text-slate-400 hover:text-white"
          >
            <GameIcon name="chevron_left" size={16} />
          </Button>
          <div className="flex flex-col min-w-0">
             <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 truncate">
               {data.type || "Coordinates Node"}
             </span>
             <h2 className="text-lg font-serif font-bold text-white truncate leading-tight">
               {data.title || data.name}
             </h2>
          </div>
        </div>

        {data.image && (
          <div className="relative aspect-video rounded overflow-hidden border border-[#2D3139] shadow-2xl mb-4">
             <img 
               src={data.image} 
               alt={data.title} 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] to-transparent opacity-60" />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <GameIcon name="layers" size={10} />
               Executive Summary
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans first-letter:text-2xl first-letter:font-serif first-letter:mr-1 first-letter:text-amber-500">
              {typeof data.description === 'object' ? JSON.stringify(data.description) : data.description}
            </p>
          </div>

          {/* Geography & History (Dynamic fields from JSON) */}
          {(data.geography || data.history || data.content) && (
            <div className="space-y-4 pt-4 border-t border-[#2D3139]/30">
              {data.geography && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                    <GameIcon name="location" size={10} />
                    Geography
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {typeof data.geography === 'object' ? JSON.stringify(data.geography) : data.geography}
                  </p>
                </div>
              )}
              {data.history && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                    <GameIcon name="shield" size={10} />
                    Lore & Legend
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {typeof data.history === 'object' ? JSON.stringify(data.history) : data.history}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Topological Scan: Marker List for Cities/Regions */}
          {data.markers && data.markers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#2D3139]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  <GameIcon name="location" size={10} />
                  Topological Scan
                </div>
                <span className="text-[10px] font-mono text-slate-500">{data.markers.length} NODES</span>
              </div>
              <div className="space-y-1">
                {data.markers.slice(0, 10).map((m: any) => (
                  <div 
                    key={m.id} 
                    onClick={() => onMarkerSelect?.(m)}
                    className="flex items-center gap-2 p-2 rounded bg-[#0F1115]/30 border border-[#2D3139]/30 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <div className="p-1 rounded bg-slate-800 text-slate-500 group-hover:text-blue-400">
                      <GameIcon name="map_pin" size={10} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-white truncate flex-1">{m.popup?.title || m.name}</span>
                    <span className="text-[8px] font-mono text-slate-600 uppercase">{m.categoryId?.substring(0, 4)}</span>
                  </div>
                ))}
                {data.markers.length > 10 && (
                  <div className="text-[9px] text-center text-slate-600 mt-2 italic font-mono">
                    + {data.markers.length - 10} additional nodes identified
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          {Object.keys(metadata).length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#2D3139]/30">
               {Object.entries(metadata).map(([key, value]) => {
                  if (typeof value !== 'string' && typeof value !== 'number') return null;
                  return (
                    <div key={key} className="p-2 bg-[#0F1115]/50 border border-[#2D3139]/50 rounded">
                       <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{key.replace(/_/g, ' ')}</div>
                       <div className="text-[10px] font-mono text-slate-300 truncate">{String(value)}</div>
                    </div>
                  );
               })}
            </div>
          )}

          {/* Administrative / Navigation */}
          <div className="pt-8 opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex justify-between">
                <span>Node_ID: {data.id?.substring(0, 8)}</span>
                <span>Status: Synchronized</span>
             </div>
          </div>
        </div>
      </ScrollArea>

      {/* Action Footer */}
      <div className="p-4 bg-[#0F1115]/80 border-t border-[#2D3139]">
        <Button 
          className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-black tracking-widest gap-2"
          onClick={() => {
            // Optional: Action for the whole location
          }}
        >
          <GameIcon name="globe" size={14} />
          Synchronize Sector
        </Button>
      </div>
    </motion.div>
  );
};
