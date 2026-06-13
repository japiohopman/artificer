import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { GameIcon } from '../../game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const PartyLogistics: React.FC = () => {
  const { partyStats, updatePartyStats, partyInventory, partyVehicles, addVehicle, removeVehicle } = useInventoryStore();
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
       const equippedWeight = Object.values(char.inventory || {}).reduce((cAcc, item) => cAcc + calculateItemWeight(item), 0);
       const backpackWeight = (char.backpack || []).reduce((cAcc, item) => cAcc + calculateItemWeight(item), 0);
       const money = char.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
       const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.ep || 0) + (money.gp || 0) + (money.pp || 0);
       const moneyWeight = totalCoins * (partyStats.currencyWeightPerCoin || 0.02);
       return acc + equippedWeight + backpackWeight + moneyWeight;
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
             <div className="fixed inset-0 z-[1900]" onClick={() => setIsOpen(false)} />
             <motion.div
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute top-full right-0 mt-2 w-80 bg-parchment-50 border-2 border-dragon-red rounded-xl shadow-2xl overflow-hidden z-[2000]"
             >
                <div className="bg-dragon-darkRed p-4 text-white">
                   <h3 className="font-header text-lg uppercase tracking-widest">Party Manifest</h3>
                   <p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">Unified Logistics Readout</p>
                </div>

                <div className="p-4 space-y-6">
                   {/* Summary Stats */}
                   <div className="grid grid-cols-2 gap-4">
                      <StatItem label="Personnel" value={`${memberCount} Active`} icon="users" />
                      <StatItem label="Transport" value={`${partyVehicles.length} Registered`} icon="horse" />
                   </div>

                   {/* Capacity Breakdown */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest">Load Capacity</span>
                         <span className="text-[9px] font-mono text-parchment-400">{totalWeight.toFixed(1)} / {totalCapacity} lbs</span>
                      </div>
                      <div className="h-2 bg-black/5 rounded-full overflow-hidden border border-black/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${weightPercentage}%` }}
                           className={cn("h-full", isOverburdened ? "bg-red-500" : "bg-dragon-red")}
                         />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                         <CapBadge label="Base" value={`${memberCount * partyStats.baseCapacityPerMember}`} />
                         <CapBadge label="Vehicles" value={`+${vehicleBonusFromAssets}`} color="gold" />
                         <CapBadge label="Bonus" value={`+${partyStats.vehicleCapacityBonus}`} color="gold" />
                      </div>
                   </div>

                   {/* Vehicles List */}
                   <div className="space-y-3 pt-4 border-t border-dragon-red/10">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest">Vehicle Hangar</span>
                         <button 
                           onClick={() => {
                              const { selectItem, setIsTransportProfileOpen } = useCharacterStore.getState();
                              setIsOpen(false);
                           }}
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
                </div>

                <div className="bg-parchment-200 p-2 text-[8px] text-parchment-400 font-mono text-center border-t border-parchment-300">
                   LOG_SYS_v2.0_ENABLED
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
