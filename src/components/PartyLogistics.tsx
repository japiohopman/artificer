import React from 'react';
import { useStore } from '../store/useStore';
import { GameIcon } from '../game_icons';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const PartyLogistics: React.FC = () => {
  const { partyStats, updatePartyStats, characters, partyInventory, partyVehicles, addVehicle, removeVehicle } = useStore();
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

    const calculateMoneyWeight = (money: any): number => {
      if (!money) return 0;
      const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.ep || 0) + (money.gp || 0) + (money.pp || 0);
      return totalCoins * (partyStats.currencyWeightPerCoin || 0.02);
    };

    // Calculate characters weight (equipped + backpack + money)
    const charactersWeight = characters.reduce((partyAcc, char) => {
      const equippedWeight = Object.values(char.inventory || {}).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
      const backpackWeight = (char.backpack || []).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
      const moneyWeight = calculateMoneyWeight(char.money);
      
      return partyAcc + equippedWeight + backpackWeight + moneyWeight;
    }, 0);

    // Calculate common party inventory weight
    const partyInvWeight = partyInventory.reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);

    return charactersWeight + partyInvWeight;
  }, [characters, partyInventory, partyStats.currencyWeightPerCoin]);

  const weightPercentage = Math.min((totalWeight / totalCapacity) * 100, 100);
  const isOverburdened = totalWeight > totalCapacity;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg transition-all flex items-center gap-2 border",
          isOverburdened 
            ? "bg-red-50 border-red-200 text-red-600 animate-pulse" 
            : "bg-parchment-100 border-parchment-300 text-parchment-600 hover:bg-parchment-200"
        )}
        title="Party Logistics"
      >
        <GameIcon name="weight" size={20} color={isOverburdened ? "#DC2626" : "#8B4513"} />
        <div className="flex flex-col items-start leading-none">
          <span className="text-[8px] font-bold uppercase tracking-tighter">Party Load</span>
          <span className="text-[10px] font-mono font-bold">{totalWeight.toFixed(1)} lb</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 bg-parchment-50 border-2 border-dragon-red rounded-xl shadow-2xl z-50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-dragon-red/20 pb-2">
                <h3 className="text-xs font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
                  <GameIcon name="weight" size={14} color="#8B0000" /> Logistics Center
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-parchment-400 hover:text-dragon-red">
                  <GameIcon name="close" size={14} color="currentColor" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Wallet/Purse Section */}
                <div className="bg-white/40 p-3 rounded-lg border border-dragon-red/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-dragon-red/60 tracking-widest">Party Purse</span>
                    <GameIcon name="coins" size={12} color="#D97706" />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(() => {
                      const total = characters.reduce((acc, char) => ({
                        pp: acc.pp + (char.money?.pp || 0),
                        gp: acc.gp + (char.money?.gp || 0),
                        ep: acc.ep + (char.money?.ep || 0),
                        sp: acc.sp + (char.money?.sp || 0),
                        cp: acc.cp + (char.money?.cp || 0),
                      }), { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 });
                      
                      return (
                        <>
                          <CurrencyModule label="PP" value={total.pp} color="#38BDF8" />
                          <CurrencyModule label="GP" value={total.gp} color="#F59E0B" />
                          <CurrencyModule label="EP" value={total.ep} color="#D946EF" pulse />
                          <CurrencyModule label="SP" value={total.sp} color="#94A3B8" />
                          <CurrencyModule label="CP" value={total.cp} color="#B45309" />
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 2. Weight Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-parchment-600 uppercase">Load Status</span>
                    <span className={cn("text-[10px] font-mono font-bold", isOverburdened ? "text-red-600" : "text-dragon-red")}>
                      {totalWeight.toFixed(1)} / {totalCapacity} lb
                    </span>
                  </div>
                  <div className="h-3 bg-black/10 rounded-full overflow-hidden border border-black/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${weightPercentage}%` }}
                      className={cn("h-full rounded-full transition-colors duration-500", isOverburdened ? "bg-red-600" : "bg-dragon-red")}
                    />
                  </div>
                </div>

                {/* 3. Detailed Breakdown */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {characters.map(char => {
                    const equippedWeight = Object.values(char.inventory || {}).reduce((acc: number, item: any) => {
                      if (!item) return acc;
                      const w = typeof item.weight === 'number' ? item.weight : parseFloat(String(item.weight).match(/(\d+(\.\d+)?)/)?.[0] || '0');
                      return acc + (w * (item.quantity || 1));
                    }, 0);
                    
                    const backpackWeight = (char.backpack || []).reduce((acc: number, item: any) => {
                      const w = typeof item.weight === 'number' ? item.weight : parseFloat(String(item.weight).match(/(\d+(\.\d+)?)/)?.[0] || '0');
                      return acc + (w * (item.quantity || 1));
                    }, 0);
                    
                    const moneyWeight = char.money ? (((char.money.cp || 0) + (char.money.sp || 0) + (char.money.ep || 0) + (char.money.gp || 0) + (char.money.pp || 0)) * (partyStats.currencyWeightPerCoin || 0.02)) : 0;
                    const totalCharWeight = equippedWeight + backpackWeight + moneyWeight;

                    return (
                      <div key={char.id} className="space-y-1 group">
                        <div className="flex justify-between items-center text-[10px] pb-0.5 font-bold text-parchment-800">
                          <span className="truncate max-w-[120px]">{char.name}</span>
                          <span className="font-mono text-dragon-red">{totalCharWeight.toFixed(1)} lb</span>
                        </div>
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-black/5">
                           <div title={`Equipped: ${equippedWeight.toFixed(1)}lb`} style={{ width: `${(equippedWeight / (totalCharWeight || 1)) * 100}%` }} className="bg-dragon-red/60 h-full" />
                           <div title={`Backpack: ${backpackWeight.toFixed(1)}lb`} style={{ width: `${(backpackWeight / (totalCharWeight || 1)) * 100}%` }} className="bg-dragon-gold/60 h-full" />
                           <div title={`Currency: ${moneyWeight.toFixed(2)}lb`} style={{ width: `${(moneyWeight / (totalCharWeight || 1)) * 100}%` }} className="bg-blue-400/60 h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Vehicles & Assets Section */}
                <div className="bg-white/40 p-3 rounded-lg border border-dragon-red/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-dragon-red/60 tracking-widest">Vehicles & Real Estate</span>
                    <div className="flex gap-1">
                       <button 
                        onClick={() => {
                          const name = prompt("Asset Name (e.g., Heavy Wagon, Tavern):");
                          const capacity = parseInt(prompt("Carry Capacity Bonus (lb) - use 0 for Real Estate:") || "0");
                          if (name) addVehicle({ name, capacity });
                        }}
                        className="p-1 hover:bg-dragon-red/10 rounded transition-colors"
                       >
                         <GameIcon name="plus" size={10} color="#8B0000" />
                       </button>
                       <GameIcon name="land_vehicles" size={12} color="#8B0000" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {partyVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {partyVehicles.map((v, i) => (
                          <div key={v.id || i} className="flex flex-col bg-parchment-100/50 rounded-lg p-2 border border-dragon-red/10 group relative overflow-hidden">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const { selectItem, setIsTransportProfileOpen } = useStore.getState();
                                      // We need the index/id for selectItem. 
                                      // If we don't have it, we might need to store more data in partyVehicles.
                                      // For now, let's assume we can try to find it or at least open a generic view.
                                      setIsTransportProfileOpen(true);
                                      selectItem(v.name); // Using name as index if that works
                                    }}
                                    className="flex items-center gap-2 hover:text-dragon-red transition-colors"
                                  >
                                    <GameIcon 
                                      name={v.type?.toLowerCase().includes('water') ? 'ship' : (v.type?.toLowerCase().includes('air') ? 'plane' : 'land_vehicles')} 
                                      size={14} 
                                      color="#8B0000" 
                                    />
                                    <span className={cn("text-[10px] font-black text-parchment-800", v.capacity === 0 && "text-dragon-darkRed")}>
                                      {v.name}
                                    </span>
                                  </button>
                                </div>
                                <button 
                                  onClick={() => removeVehicle(i)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-dragon-red transition-all"
                                >
                                  <GameIcon name="close" size={8} color="currentColor" />
                                </button>
                             </div>
                             
                             <div className="mt-1 flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-tight">
                                {v.capacity > 0 && (
                                  <div className="flex items-center gap-1 text-parchment-600 bg-white/40 px-1.5 py-0.5 rounded border border-black/5">
                                    <GameIcon name="weight" size={8} color="#8B4513" />
                                    <span>+{v.capacity} lb</span>
                                  </div>
                                )}
                                {v.speed && (
                                  <div className="flex items-center gap-1 text-sky-700 bg-sky-50/40 px-1.5 py-0.5 rounded border border-sky-200/30">
                                    <GameIcon name="loading" size={8} color="currentColor" className="animate-spin-slow" />
                                    <span>{v.speed}</span>
                                  </div>
                                )}
                                {v.type && (
                                  <div className="flex items-center gap-1 text-dragon-gold bg-dragon-gold/10 px-1.5 py-0.5 rounded border border-dragon-gold/20">
                                    <span>{v.type}</span>
                                  </div>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[8px] text-parchment-400 italic text-center py-2 border border-dashed border-parchment-300 rounded">
                        No active vehicles or permanent estates.
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-dragon-red/5">
                      <div className="flex-1 bg-parchment-200/50 rounded px-2 py-1 flex items-center justify-between shadow-inner">
                         <span className="text-[9px] font-black text-dragon-red/60 uppercase">Manual Override</span>
                         <div className="flex items-center gap-1">
                            <input 
                              type="number"
                              value={partyStats.vehicleCapacityBonus}
                              onChange={(e) => updatePartyStats({ vehicleCapacityBonus: parseInt(e.target.value) || 0 })}
                              className="w-12 bg-transparent text-[10px] font-mono text-dragon-red text-right focus:outline-none"
                            />
                            <span className="text-[7px] text-parchment-400 font-bold uppercase">lb</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isOverburdened && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                    <GameIcon name="alert_triangle" size={14} color="#DC2626" className="shrink-0" />
                    <p className="text-[8px] text-red-700 font-bold uppercase leading-tight">
                      Overburdened! Movement speed and vehicle efficiency reduced.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-dragon-red/10">
                  <p className="text-[7px] text-parchment-400 italic text-center">
                    Capacity based on {memberCount} members ({partyStats.baseCapacityPerMember}lb each) + vehicles.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CurrencyModule: React.FC<{ label: string; value: number; color: string; pulse?: boolean }> = ({ label, value, color, pulse }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="w-full bg-parchment-100/50 rounded border border-parchment-300 py-1 flex items-center justify-center">
      <span className={cn("text-[10px] font-mono font-black tabular-nums", pulse && "animate-pulse")} style={{ color }}>{value}</span>
    </div>
    <span className="text-[6px] font-black text-parchment-400 uppercase tracking-widest">{label}</span>
  </div>
);
