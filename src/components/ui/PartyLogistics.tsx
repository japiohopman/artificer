import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useUIStore } from '../../store/useUIStore';
import { useAtlasStore } from '../../store/useAtlasStore';
import { GameIcon } from '../../game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { calculateCurrencyWeight } from '../../lib/currencyUtils';

export const LogisticsManifest: React.FC<{ onTransportRequest?: () => void }> = ({ onTransportRequest }) => {
  const { partyStats, updatePartyStats, partyInventory, partyVehicles, addVehicle, removeVehicle } = useInventoryStore();
  const { characters } = useCharacterStore();

  const memberCount = Math.max(partyStats.memberCount, characters.length, 1);
  const vehicleBonusFromAssets = partyVehicles.reduce((acc, v) => acc + (v.capacity || 0), 0);
  const totalCapacity = (memberCount * partyStats.baseCapacityPerMember) + partyStats.vehicleCapacityBonus + vehicleBonusFromAssets;
  
  const totalWeight = React.useMemo(() => {
    const parseWeight = (weight: any): number => {
      if (!weight) return 0;
      if (typeof weight === 'number') return weight;
      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
      return weightMatch ? parseFloat(weightMatch[0]) : 0;
    };

    const calculateItemWeight = (item: any): number => {
      if (!item) return 0;
      return parseWeight(item.weight) * (item.quantity || 1);
    };

    const sharedWeight = partyInventory.reduce((acc, item) => acc + calculateItemWeight(item), 0);
    
    const characterWeights = characters.reduce((acc, char) => {
       let personalWeight = 0;

       if (char.saveVersion === 2 && char.items) {
          personalWeight = Object.values(char.items).reduce((cAcc, item) => {
             return cAcc + calculateItemWeight(item);
          }, 0);
       } else {
          const equippedWeight = Object.values(char.inventory || {}).reduce((cAcc, item) => cAcc + calculateItemWeight(item), 0);
          const backpackWeight = (char.backpack || []).reduce((cAcc, item) => cAcc + calculateItemWeight(item), 0);
          personalWeight = equippedWeight + backpackWeight;
       }

       const moneyWeight = calculateCurrencyWeight(char.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });

       return acc + personalWeight + moneyWeight;
    }, 0);

    return sharedWeight + characterWeights;
  }, [partyInventory, characters, partyStats]);

  const weightPercentage = Math.min((totalWeight / totalCapacity) * 100, 100);
  const isOverburdened = totalWeight > totalCapacity;

  return (
    <div className="space-y-8 py-2">
       {/* Summary & Capacity Section */}
       <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-dragon-red uppercase tracking-widest flex items-center gap-2">
               <GameIcon name="party_stats" size={14} /> Personnel & Status
            </label>
            <div className="grid grid-cols-1 gap-3">
               <StatItem label="Personnel" value={`${memberCount} Active Members`} icon="users" />
               <StatItem label="Transport" value={`${partyVehicles.length} Active Vehicles`} icon="horse" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-dragon-red uppercase tracking-widest flex items-center gap-2">
               <GameIcon name="package" size={14} /> Total Carry Weight
            </label>
            <div className="bg-white/40 p-4 rounded-lg border-2 border-dragon-gold/20 shadow-inner">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-[14px] font-bold text-parchment-900">{totalWeight.toFixed(1)} <span className="text-[10px] text-parchment-400 font-normal">LBS</span></span>
                  <span className="text-[11px] font-mono text-dragon-red font-black">/ {totalCapacity} LBS</span>
               </div>
               <div className="h-4 bg-black/10 rounded-full overflow-hidden border-2 border-black/5 p-0.5">
                  <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${weightPercentage}%` }}
                     className={cn("h-full rounded-full transition-all duration-1000", isOverburdened ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-dragon-red")}
                  />
               </div>
               <div className="mt-4 grid grid-cols-3 gap-2">
                  <CapBadge label="Personnel" value={`${memberCount * partyStats.baseCapacityPerMember}`} />
                  <CapBadge label="Vehicles" value={`+${vehicleBonusFromAssets}`} color="gold" />
                  <CapBadge label="Utility" value={`+${partyStats.vehicleCapacityBonus}`} color="gold" />
               </div>
               {isOverburdened && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 animate-pulse">
                     <GameIcon name="warning" size={12} />
                     <span className="text-[9px] font-black uppercase tracking-widest">Movement Speed Reduced</span>
                  </div>
               )}
            </div>
          </div>
       </div>

       {/* Vehicles List */}
       <div className="space-y-3 pt-4 border-t border-dragon-red/10">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest">Vehicle Hangar</span>
             <button 
               onClick={onTransportRequest}
               title="Add Transport"
               aria-label="Add Transport"
               className="text-[8px] font-black bg-dragon-red text-white px-2 py-1 rounded uppercase tracking-widest hover:bg-dragon-darkRed transition-colors"
             >
                Add Transport
             </button>
          </div>
          <div className="space-y-2">
             {partyVehicles.map((v, i) => (
               <div key={i} className="flex items-center justify-between p-2 bg-white/40 border border-dragon-red/5 rounded group hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                     <GameIcon name="horse" size={14} color="#8B0000" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-parchment-900 uppercase leading-none">{v.name}</span>
                        <span className="text-[8px] text-parchment-400 uppercase tracking-tighter">+{v.capacity} lbs Capacity</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => removeVehicle(i)}
                    title={`Remove ${v.name}`}
                    aria-label={`Remove ${v.name}`}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-dragon-red transition-all"
                  >
                     <GameIcon name="trash" size={10} />
                  </button>
               </div>
             ))}
             {partyVehicles.length === 0 && (
                <div className="text-center py-4 border border-dashed border-dragon-red/10 rounded opacity-30">
                   <span className="text-[8px] font-black uppercase tracking-widest">No Transports Active</span>
                </div>
             )}
          </div>
       </div>

       <div className="bg-dragon-darkRed p-3 text-[9px] text-parchment-400 font-mono flex justify-between items-center -mx-4">
          <span className="ml-4">LOGISTICS_v2.0.4</span>
          <span className="mr-4 text-dragon-gold/40 italic">STRATEGIC_SURPLUS</span>
       </div>
    </div>
  );
};

export const PartyLogistics: React.FC = () => {
  const { partyStats, partyVehicles, partyInventory } = useInventoryStore();
  const { characters } = useCharacterStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const memberCount = Math.max(partyStats.memberCount, characters.length, 1);
  const vehicleBonusFromAssets = partyVehicles.reduce((acc, v) => acc + (v.capacity || 0), 0);
  const totalCapacity = (memberCount * partyStats.baseCapacityPerMember) + partyStats.vehicleCapacityBonus + vehicleBonusFromAssets;
  
  const totalWeight = React.useMemo(() => {
    const parseWeight = (weight: any): number => {
      if (!weight) return 0;
      if (typeof weight === 'number') return weight;
      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
      return weightMatch ? parseFloat(weightMatch[0]) : 0;
    };

    const calculateItemWeight = (item: any): number => {
      if (!item) return 0;
      return parseWeight(item.weight) * (item.quantity || 1);
    };

    const sharedWeight = partyInventory.reduce((acc, item) => acc + calculateItemWeight(item), 0);
    
    const characterWeights = characters.reduce((acc, char) => {
       let personalWeight = 0;

       if (char.saveVersion === 2 && char.items) {
          personalWeight = Object.values(char.items).reduce((cAcc, item) => {
             return cAcc + calculateItemWeight(item);
          }, 0);
       } else {
          const equippedWeight = Object.values(char.inventory || {}).reduce((cAcc, item) => cAcc + calculateItemWeight(item), 0);
          const backpackWeight = (char.backpack || []).reduce((cAcc, item) => cAcc + calculateItemWeight(item), 0);
          personalWeight = equippedWeight + backpackWeight;
       }

       const moneyWeight = calculateCurrencyWeight(char.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });

       return acc + personalWeight + moneyWeight;
    }, 0);

    return sharedWeight + characterWeights;
  }, [partyInventory, characters, partyStats]);

  const weightPercentage = Math.min((totalWeight / totalCapacity) * 100, 100);
  const isOverburdened = totalWeight > totalCapacity;

  return (
    <div className="relative h-full flex items-center">
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className={cn(
           "flex items-center gap-3 px-4 h-10 rounded border-2 transition-all relative group",
           isOpen ? "bg-dragon-red border-dragon-gold text-white" : "bg-white/40 border-dragon-red/10 text-dragon-red hover:bg-parchment-200"
         )}
       >
          <GameIcon name="package" size={16} color="currentColor" />
          <div className="flex flex-col items-start leading-none">
             <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Logistics</span>
             <span className={cn("text-[10px] font-black tabular-nums", isOverburdened && "text-red-500 animate-pulse")}>
               {totalWeight.toFixed(1)} / {totalCapacity} lbs
             </span>
          </div>
          <div className="w-12 h-1.5 bg-black/10 rounded-full overflow-hidden border border-black/5">
             <div 
               className={cn("h-full transition-all duration-1000", isOverburdened ? "bg-red-500" : "bg-dragon-red")}
               style={{ width: `${weightPercentage}%` }}
             />
          </div>
       </button>

       <AnimatePresence>
         {isOpen && (
           <>
             <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-parchment-100 rounded-lg shadow-2xl border-[8px] border-dragon-darkRed overflow-hidden z-[7000] flex flex-col"
               style={{
                 backgroundImage: `url('/assets/ui/old_paper.webp')`,
                 backgroundSize: 'cover'
               }}
             >
                <div className="bg-dragon-red p-4 text-white flex items-center justify-between border-b-2 border-dragon-gold/30">
                   <div>
                      <h3 className="font-header text-xl uppercase tracking-widest">Logistics Manifest</h3>
                      <p className="text-[10px] text-dragon-gold font-bold tracking-[0.3em] uppercase">Unified Strategic Readout</p>
                   </div>
                   <button
                     onClick={() => setIsOpen(false)}
                     className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                   >
                     <GameIcon name="close" size={16} color="#FFFFFF" />
                   </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                   <LogisticsManifest 
                     onTransportRequest={() => {
                        const { setIsTransportProfileOpen } = useUIStore.getState();
                        const { selectItem } = useAtlasStore.getState();
                        setIsOpen(false);
                     }} 
                   />
                </div>
             </motion.div>
           </>
         )}
       </AnimatePresence>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string, icon: any }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-2 bg-white/40 border border-dragon-red/5 rounded">
     <div className="w-8 h-8 rounded bg-dragon-red/5 flex items-center justify-center text-dragon-red">
        <GameIcon name={icon} size={16} />
     </div>
     <div className="flex flex-col">
        <span className="text-[7px] font-black text-parchment-400 uppercase tracking-widest leading-none mb-0.5">{label}</span>
        <span className="text-[10px] font-bold text-parchment-900 uppercase leading-none">{value}</span>
     </div>
  </div>
);

const CapBadge: React.FC<{ label: string, value: string, color?: 'red' | 'gold' }> = ({ label, value, color = 'red' }) => (
  <div className="flex flex-col items-center py-1 bg-black/5 rounded">
     <span className="text-[6px] font-black text-parchment-400 uppercase tracking-widest mb-0.5">{label}</span>
     <span className={cn("text-[9px] font-black", color === 'gold' ? 'text-dragon-gold' : 'text-dragon-red')}>{value}</span>
  </div>
);
