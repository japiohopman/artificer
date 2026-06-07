import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { cn } from '../../lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiceText } from '../DiceText';
import { normalizeImageUrl, playSuccessSound } from '../../services/storageService';

export const TransportProfile: React.FC = () => {
  const { 
    isTransportProfileOpen, 
    setIsTransportProfileOpen, 
    selectedItem: transport,
    addVehicle
  } = useStore();

  if (!isTransportProfileOpen || !transport) return null;

  const formatName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getImageUrl = () => {
    if (!transport) return '';
    return normalizeImageUrl(transport.imageUrl || transport.image, 'transport', transport.index || "");
  };

  const renderValue = (val: any) => {
    if (!val) return "—";
    if (typeof val === 'object') return val.name || val.value || JSON.stringify(val);
    return val;
  };

  const StatSection = ({ label, value, icon }: { label: string, value: string, icon?: string }) => (
    <div className="flex items-center gap-2 py-2 border-b border-dragon-red/10">
      {icon && <GameIcon name={icon as any} size={14} color="#8B0000" className="opacity-70" />}
      <span className="text-[#8B0000] font-black uppercase text-[10px] tracking-widest w-24">{label}</span>
      <span className="text-sm text-parchment-900 font-bold">{value}</span>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 top-16 bg-black/60 backdrop-blur-md z-[100] overflow-hidden flex flex-col items-center justify-center p-4 md:p-6"
      >
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        
        {/* Main Sheet Container */}
        <div 
          className="w-full max-w-7xl h-[90vh] rounded-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden font-sans border-t-8 border-dragon-darkRed/20"
          style={{
            backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Close Button Header */}
          <div className="h-12 flex justify-end px-4 items-center border-b border-dragon-red/10 bg-white/10 relative z-50">
             <button 
               onClick={() => setIsTransportProfileOpen(false)}
               title="Close Profile"
               aria-label="Close Profile"
               className="p-2 hover:bg-dragon-red/10 rounded-full text-dragon-red transition-all"
             >
               <GameIcon name="close" size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
            <div className="p-8 md:p-16 lg:p-20 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                
                {/* Left Area: Lore & Illustration */}
                <div className="lg:col-span-6 flex flex-col space-y-12">
                   <div className="space-y-4">
                      <div className="flex flex-col items-center lg:items-start">
                        <h1 className="font-bodoni text-[50px] lg:text-[70px] font-black text-dragon-darkRed tracking-tighter leading-none mb-6 drop-shadow-sm text-center lg:text-left">
                          {formatName(transport.name)}
                        </h1>

                        {/* Giant Illustration */}
                        <div className="relative group w-full mb-8 flex items-center justify-center">
                           <div className="relative w-full aspect-[3/2] drop-shadow-[0_45px_100px_rgba(0,0,0,0.4)] bg-black/5 rounded-lg flex items-center justify-center p-8">
                              <ChromaKeyImage 
                                src={getImageUrl()}
                                alt={transport.name} 
                                className="w-full h-full object-contain relative z-20 group-hover:scale-105 transition-transform duration-1000"
                              />
                              <div className="absolute inset-0 bg-dragon-red/5 blur-[100px] rounded-full pointer-events-none z-10" />
                           </div>
                        </div>
                      </div>

                      <div className="prose prose-sm prose-slate max-w-none text-parchment-900 font-stix italic text-xl leading-relaxed border-t-4 border-[#D4AF37] pt-6 mt-4">
                        {transport.desc && Array.isArray(transport.desc) ? (
                          transport.desc.map((line: any, i: number) => (
                            <div key={i} className="mb-4"><Markdown remarkPlugins={[remarkGfm]}>{renderValue(line)}</Markdown></div>
                          ))
                        ) : (
                          <div><Markdown remarkPlugins={[remarkGfm]}>{renderValue(transport.desc) || "The blueprints for this vessel were lost in the great fire of '82."}</Markdown></div>
                        )}
                      </div>

                      {/* Transport Specifics */}
                      {transport.transport_specific && (
                        <div className="mt-12 space-y-8 border-t border-[#D4AF37]/30 pt-8">
                           {transport.transport_specific.stat_block && (
                             <div className="space-y-3">
                               <h3 className="font-bodoni-sc text-2xl font-bold text-dragon-red uppercase tracking-widest border-b border-dragon-red/10 pb-1">Mount Stat Block</h3>
                               <div className="bg-red-900/5 p-4 border-l-4 border-red-900 font-serif text-lg leading-relaxed">
                                 <p className="font-bold">{transport.transport_specific.stat_block.name}</p>
                                 <p className="text-sm italic text-parchment-600">Refer to bestiary for complete combat capabilities.</p>
                               </div>
                             </div>
                           )}
                           {transport.transport_specific.feed && (
                             <div className="space-y-3">
                               <h3 className="font-bodoni-sc text-2xl font-bold text-emerald-900 uppercase tracking-widest border-b border-emerald-900/10 pb-1">Sustenance Requirements</h3>
                               <div className="bg-emerald-900/5 p-4 border-l-4 border-emerald-900 font-serif text-lg leading-relaxed">
                                 <p>Requires <span className="font-bold">{transport.transport_specific.feed.name}</span> daily.</p>
                                 <p className="text-sm italic text-parchment-600">Failure to provide may result in exhaustion or loss of loyalty.</p>
                               </div>
                             </div>
                           )}
                        </div>
                      )}
                   </div>
                </div>

                {/* Right Area: Technical Sheet */}
                <div className="lg:col-span-6">
                  <div className="bg-[#fdf1dc] p-10 shadow-[0_15px_40px_rgba(0,0,0,0.2)] relative border-y-[4px] border-[#D4AF37] max-w-[600px] mx-auto lg:ml-auto lg:mr-0">
                     <div className="space-y-6 flex flex-col">
                        <header className="space-y-1">
                           <h2 className="font-bodoni text-5xl font-black text-[#8B0000] tracking-tight">Technical Manifest</h2>
                           <p className="italic text-lg text-parchment-800 font-serif border-b-2 border-[#8B0000] pb-2 mb-4">
                             {renderValue(transport.vehicle_category)} • {transport.transport_type}
                           </p>
                        </header>

                        <div className="space-y-2">
                           <StatSection label="Cost" value={`${renderValue(transport.cost?.quantity)} ${renderValue(transport.cost?.unit)}`} icon="coins" />
                           <StatSection label="Weight" value={`${renderValue(transport.weight)} lb.`} icon="weight" />
                           
                           {transport.capacity && (
                             <StatSection 
                               label="Cargo Cap." 
                               value={renderValue(transport.capacity?.cargo || transport.capacity)} 
                               icon="box" 
                             />
                           )}
                        </div>

                        {/* Speed Section */}
                        {transport.speed && (
                          <div className="bg-white/30 p-4 border border-[#D4AF37]/30 rounded-sm space-y-3">
                             <h4 className="text-[12px] font-black uppercase text-[#8B0000] tracking-widest border-b border-[#8B0000]/10 pb-1">Operational Speed</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {transport.speed.land && (
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded bg-[#8B0000]/10 flex items-center justify-center text-[#8B0000]">
                                        <GameIcon name="target" size={14} />
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase opacity-60">Land</span>
                                        <span className="text-sm font-bold">{transport.speed.land.quantity} {transport.speed.land.unit}</span>
                                     </div>
                                  </div>
                                )}
                                {transport.speed.water && (
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded bg-sky-900/10 flex items-center justify-center text-sky-900">
                                        <GameIcon name="ship" size={14} />
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase opacity-60">Water</span>
                                        <span className="text-sm font-bold">{transport.speed.water.quantity} {transport.speed.water.unit}</span>
                                     </div>
                                  </div>
                                )}
                                {transport.speed.air && (
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded bg-amber-900/10 flex items-center justify-center text-amber-900">
                                        <GameIcon name="plane" size={14} />
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase opacity-60">Air</span>
                                        <span className="text-sm font-bold">{transport.speed.air.quantity} {transport.speed.air.unit}</span>
                                     </div>
                                  </div>
                                )}
                             </div>
                          </div>
                        )}

                        {/* Asset Slots */}
                        {(transport.slot || transport.slots) && (
                          <div className="space-y-3 pt-4 border-t border-[#8B0000]/10">
                             <h4 className="text-[12px] font-black uppercase text-[#8B0000] tracking-widest">Modification Slots</h4>
                             <div className="flex flex-wrap gap-2">
                                {(transport.slot || transport.slots || []).map((s: string, i: number) => (
                                  <div key={i} className="px-4 py-2 bg-dragon-red/5 border-2 border-dashed border-dragon-red/20 rounded flex items-center gap-2">
                                     <GameIcon name="plus" size={10} color="#8B0000" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-[#8B0000] opacity-70">{s} Slot</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}

                        {/* Action Area */}
                        <div className="pt-12 mt-auto border-t border-[#8B0000]/20 flex flex-col items-center gap-6">
                           <button 
                             onClick={() => {
                               addVehicle({ 
                                 name: transport.name, 
                                 capacity: typeof transport.capacity === 'number' ? transport.capacity : parseInt(String(transport.capacity?.cargo || transport.capacity || "0")),
                                 type: transport.vehicle_category || transport.transport_type,
                                 speed: transport.speed ? (transport.speed.land?.quantity ? `${transport.speed.land.quantity} ${transport.speed.land.unit}` : transport.speed.water?.quantity ? `${transport.speed.water.quantity} ${transport.speed.water.unit}` : "Standard") : "Standard"
                               });
                               playSuccessSound();
                               setIsTransportProfileOpen(false);
                             }}
                             title="Log Asset Manifest"
                             aria-label="Log Asset Manifest"
                             className="w-full py-4 bg-dragon-red text-white text-lg font-black uppercase tracking-[0.3em] hover:bg-dragon-darkRed transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                           >
                             Log Asset Manifest
                           </button>
                           
                           <div className="flex flex-col items-center opacity-40">
                             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#8B0000]">Registered Transport Unit</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

