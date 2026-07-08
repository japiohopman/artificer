import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { FlagManager } from './FlagManager';
import { AssetExplorer } from './AssetExplorer';
import { WorldExplorer } from './WorldExplorer';
import { Jane } from './Jane';
import { Simulator } from './Simulator';
import { CombatTester } from './CombatTester';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export const DevKit: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('inspectors');
  const [activeTool, setActiveTool] = React.useState('world');
  const { setIsDevKitOpen } = useUIStore();

  const toolGroups = [
    {
      id: 'inspectors',
      label: 'Inspectors',
      icon: 'search',
      tools: [
        { id: 'world', label: 'World Explorer', icon: 'map' },
        { id: 'atlas', label: 'Asset Index', icon: 'scroll' },
        { id: 'flags', label: 'Flag Manager', icon: 'identity' }
      ]
    },
    {
      id: 'generators',
      label: 'Generators',
      icon: 'magic_effect',
      tools: [
        { id: 'jane', label: 'Jane (World Builder)', icon: 'compass' },
        { id: 'npcs', label: 'NPC Forge', icon: 'identity' },
        { id: 'enemies', label: 'Bestiary Smith', icon: 'dungeon' }
      ]
    },
    {
      id: 'testers',
      label: 'Testers',
      icon: 'swords',
      tools: [
        { id: 'combat', label: 'Combat Arena', icon: 'swords' },
        { id: 'simulator', label: 'Event Simulator', icon: 'history' }
      ]
    }
  ];

  const renderTool = () => {
    switch (activeTool) {
      case 'world': return <WorldExplorer />;
      case 'atlas': return <AssetExplorer />;
      case 'flags': return <FlagManager />;
      case 'jane': return <Jane />;
      case 'combat': return <CombatTester />;
      case 'simulator': return <Simulator />;
      default: return (
        <div className="flex-1 flex items-center justify-center text-white/20 uppercase font-black tracking-widest text-2xl">
          Tool_{activeTool}_Not_Implemented
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* DevKit Header */}
      <div className="h-14 border-b border-white/10 bg-[#121212] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-dragon-red rounded flex items-center justify-center shadow-lg shadow-dragon-red/20">
            <GameIcon name="dungeon" size={20} color="white" />
          </div>
          <div>
            <h1 className="text-white font-black uppercase tracking-widest text-sm leading-none">Arcane_Forge</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-tighter mt-1">Development Kit v3.0.0 // Prime Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsDevKitOpen(false)}
             className="p-2 hover:bg-white/5 text-white/40 hover:text-white rounded transition-all active:scale-95"
           >
             <GameIcon name="close" size={24} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#161616] flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {toolGroups.map(group => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <GameIcon name={group.icon as any} size={14} color="#555" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{group.label}</span>
                </div>
                <div className="space-y-1">
                  {group.tools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all active:scale-[0.98] group",
                        activeTool === tool.id 
                          ? "bg-dragon-red text-white shadow-lg shadow-dragon-red/20" 
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <GameIcon 
                        name={tool.icon as any} 
                        size={16} 
                        color={activeTool === tool.id ? "white" : "currentColor"} 
                        className={cn("transition-transform", activeTool === tool.id ? "scale-110" : "group-hover:scale-110")}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-tight">{tool.label}</span>
                      {activeTool === tool.id && (
                         <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20">
             <div className="flex items-center justify-between text-[9px] font-bold text-white/30 uppercase">
                <span>Session Time</span>
                <span className="font-mono">{new Date().toLocaleTimeString()}</span>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] relative">
          {renderTool()}
        </div>
      </div>
    </div>
  );
};
