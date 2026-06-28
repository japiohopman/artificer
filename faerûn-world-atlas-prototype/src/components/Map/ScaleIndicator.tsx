import { useAtlasStore } from "../../store/useAtlasStore";

export function ScaleIndicator({ mapId }: { mapId: string }) {
  const { mapScales } = useAtlasStore();
  const scale = mapScales[mapId] || mapScales['world'] || 1;
  
  return (
    <div className="absolute bottom-8 left-8 z-[1000] pointer-events-none">
      <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 flex items-center gap-4 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">Cartographic_Grid</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-mono text-indigo-400 font-black tabular-nums">{scale.toFixed(3)}</span>
            <span className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Units / Mile</span>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">Active_Node</span>
          <span className="text-[10px] font-mono text-white/60 uppercase font-bold tracking-tight">{mapId.split('/').pop()?.slice(0, 12) || 'GLOBAL'}</span>
        </div>
      </div>
    </div>
  );
}
