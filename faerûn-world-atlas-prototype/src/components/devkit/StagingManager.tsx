import React from 'react';
import { Trash2, FileJson, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAtlasStore } from '../../store/useAtlasStore';
import { GithubService } from '../../services/githubService';
import { toast } from 'sonner';

export const StagingManager = () => {
  const { stagedChanges, discardChange, githubConfig, clearStaging } = useAtlasStore();
  const [isBaking, setIsBaking] = React.useState(false);

  const stagedList = Object.entries(stagedChanges);

  if (stagedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#2D3139] rounded-sm opacity-40 grayscale">
        <FileJson className="h-6 w-6 mb-2" />
        <span className="text-[10px] uppercase font-bold tracking-widest">No_Staged_Changes</span>
      </div>
    );
  }

  const handleBakeAll = async () => {
    if (!githubConfig.token) {
      toast.error("Auth required to bake");
      return;
    }
    
    setIsBaking(true);
    const service = new GithubService(githubConfig);
    toast.loading("Batch baking staged updates...");

    try {
      let successCount = 0;
      for (const [id, change] of stagedList) {
        const content = change.isBinary 
          ? change.content 
          : (typeof change.content === 'string' ? change.content : JSON.stringify(change.content, null, 2));
          
        const res = await service.saveFile(
          content,
          `Bake update: ${change.label}`,
          change.path,
          change.isBinary
        );
        if (res.success) {
          successCount++;
          discardChange(id);
        }
      }
      
      toast.dismiss();
      if (successCount === stagedList.length) {
        toast.success(`Successfully baked ${successCount} world nodes.`);
      } else {
        toast.warning(`Baking partial: ${successCount} / ${stagedList.length} successful.`);
      }
    } catch (e) {
      toast.dismiss();
      toast.error("Baking protocol failed. Signal interrupted.");
    } finally {
      setIsBaking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Staging_Buffer</h4>
        <div className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-mono">
            {stagedList.length} UNBAKED
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
        {stagedList.map(([id, change]) => (
          <div key={id} className="p-3 bg-black/40 border border-[#2D3139] group relative hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2">
              <FileJson className="h-3 w-3 text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-slate-300 truncate">{change.label}</div>
                <div className="text-[8px] font-mono text-slate-500 truncate">{change.path}</div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => discardChange(id)}
                className="h-6 w-6 text-slate-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-2 w-2" />
                <span className="text-[7px] font-mono">{new Date(change.timestamp).toLocaleTimeString([], { hour12: false })}</span>
              </div>
              <Check className="h-2 w-2 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex gap-2">
        <Button 
          variant="ghost"
          onClick={clearStaging}
          className="flex-1 h-8 text-[9px] uppercase font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-none"
        >
          Discard_All
        </Button>
        <Button 
          onClick={handleBakeAll}
          disabled={isBaking}
          className="flex-[2] h-8 text-[10px] uppercase font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-none shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          {isBaking ? "Baking..." : "Bake_Selected"}
        </Button>
      </div>
    </div>
  );
};
