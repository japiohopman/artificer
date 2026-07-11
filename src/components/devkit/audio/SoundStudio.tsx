import { useState, useMemo } from "react";
import { FileJson, Mic, Music, SlidersHorizontal, Activity, FolderSearch, Settings2, ScrollText, Network, Lightbulb, Sun, Moon } from "lucide-react";
import { Environment, HueLight } from "../../../types/audio_kit";
import { GenerateVoice } from "./generate_voice";
import { GenerateSfx } from "./generate_sfx";
import { SpectralManipulation } from "./SoundEventEditor";
import { SoundExplorer } from "./SoundExplorer";
import { QuestBoard } from "./QuestBoard";
import { CommunicationBridge } from "./CommunicationBridge";
import { LampCard } from "./LampCard";
import { LampControls } from "./LampControls";
import { useHueStore } from "../../../store/useHueStore";

type VoiceModel = {
  id: string;
  label: string;
  accountIndex: number;
};

interface SoundStudioProps {
  activeEnvironment: Environment | null;
  voiceOptions: VoiceModel[];
  selectedVoiceId: string;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onSelectVoice: (voiceId: string) => void;
  onGenerateVoice: (text: string) => Promise<void>;
  onGenerateAudio: (data: { prompt: string; category: string; filename: string; isLoop: boolean; duration: number; accountIndex?: number }) => Promise<void>;
}

type SoundStudioTab = "voice" | "sfx" | "events" | "quests" | "bridge" | "lamps";

const TABS: { id: SoundStudioTab; label: string; icon: any }[] = [
  { id: "voice", label: "Voice", icon: Mic },
  { id: "sfx", label: "SFX", icon: Music },
  { id: "quests", label: "Quests", icon: ScrollText },
  { id: "bridge", label: "Bridge", icon: Network },
  { id: "events", label: "Events", icon: FileJson },
  { id: "lamps", label: "Lamps", icon: Lightbulb }
];

export function SoundStudio({
  activeEnvironment,
  voiceOptions,
  selectedVoiceId,
  isLightMode,
  onToggleTheme,
  onSelectVoice,
  onGenerateVoice,
  onGenerateAudio
}: SoundStudioProps) {
  const [activeTab, setActiveTab] = useState<SoundStudioTab>("bridge");
  const { lights, triggerHue } = useHueStore();
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);

  const selectedLight = useMemo(() => lights.find(l => l.id === selectedLightId), [lights, selectedLightId]);

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-200 overflow-hidden font-sans">
      <div className="border-b border-stone-800 bg-stone-900/30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 py-3 pr-6 border-r border-stone-800">
          <SlidersHorizontal className="w-4 h-4 text-stone-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Sound Studio</span>
        </div>
        <div className="flex items-center flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-stone-200 text-stone-200"
                    : "border-transparent text-stone-500 hover:text-stone-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center pl-6 border-l border-stone-800">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-stone-800/50 border border-stone-700 text-stone-400 hover:text-stone-200 transition-all flex items-center gap-2"
          >
            {isLightMode ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Panel: Sound Explorer (IDE Style) */}
        <div className="w-64 flex-shrink-0 border-r border-stone-800">
          <SoundExplorer />
        </div>

        {/* Center Panel: Asset Workspace */}
        <main className="flex-1 min-w-0 bg-stone-950 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "voice" && (
              <GenerateVoice
                voiceOptions={voiceOptions}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={onSelectVoice}
                onGenerate={onGenerateVoice}
              />
            )}
            {activeTab === "sfx" && (
              <GenerateSfx activeEnvironment={activeEnvironment} onGenerate={onGenerateAudio} />
            )}
            {activeTab === "quests" && <QuestBoard />}
            {activeTab === "events" && <SpectralManipulation />}
            {activeTab === "bridge" && <CommunicationBridge onGenerateAudio={onGenerateAudio} />}
            {activeTab === "lamps" && (
                <div className="h-full flex flex-col p-6 space-y-6">
                    {selectedLight ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <button 
                                onClick={() => setSelectedLightId(null)}
                                className="mb-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-300 flex items-center gap-2"
                            >
                                ← Back to Lamp List
                            </button>
                            <div className="flex-1 min-h-0">
                                <LampControls 
                                    light={selectedLight} 
                                    onUpdate={(settings) => triggerHue(settings, selectedLight.id)} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lights.map(light => (
                                <LampCard 
                                    key={light.id}
                                    light={light}
                                    isSelected={false}
                                    onSelect={() => setSelectedLightId(light.id)}
                                    onToggle={(e) => {
                                        e.stopPropagation();
                                        triggerHue({ on: { on: !light.on?.on } }, light.id);
                                    }}
                                    onBrightnessChange={(val) => triggerHue({ dimming: { brightness: val } }, light.id)}
                                />
                            ))}
                            {lights.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-600 border border-dashed border-stone-800 rounded-3xl">
                                    <Lightbulb className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-[0.2em]">No Luminaries Detected</p>
                                    <p className="text-[10px] uppercase tracking-tighter mt-1">Connect to Hue Bridge in the sidebar</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
