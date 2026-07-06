import React, { useMemo, useCallback } from 'react';
import { useWorldStore } from '../../store/useWorldStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

interface TravelProps {
  destination: any;
  onClose?: () => void;
}

export const Travel: React.FC<TravelProps> = ({ destination, onClose }) => {
  const {
    partyLocation,
    startTravel,
    isTraveling,
    stopTravel,
    skipTravel,
    isFastForwarding,
    setIsFastForwarding,
    travelProgress
  } = useWorldStore();

  const { partyVehicles, partyInventory, partyStats } = useInventoryStore();
  const { characters } = useCharacterStore();

  const calcTravelStats = useCallback((dest: any) => {
    if (!dest || !partyLocation) return null;

    const x1 = partyLocation.coordinates?.x ?? partyLocation.position?.[0] ?? 0;
    const y1 = partyLocation.coordinates?.y ?? partyLocation.position?.[1] ?? 0;
    const x2 = dest.coordinates?.x ?? dest.position?.[0] ?? 0;
    const y2 = dest.coordinates?.y ?? dest.position?.[1] ?? 0;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const distProto = Math.sqrt(dx * dx + dy * dy);
    const milesRemaining = distProto / (4763 / 4000);

    let speedMph = 3.0;

    const parseWeight = (weight: any): number => {
      if (!weight) return 0;
      if (typeof weight === 'number') return weight;
      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
      return weightMatch ? parseFloat(weightMatch[0]) : 0;
    };
    const calculateItemWeight = (item: any): number => parseWeight(item.weight) * (item.quantity || 1);
    const totalWeight = (partyInventory || []).reduce((acc, item) => acc + calculateItemWeight(item), 0) +
                       characters.reduce((acc, char) => acc + (char.backpack || []).reduce((cAcc: number, item: any) => cAcc + calculateItemWeight(item), 0), 0);
    const totalCapacity = (Math.max(partyStats.memberCount, characters.length, 1) * partyStats.baseCapacityPerMember) +
                          partyStats.vehicleCapacityBonus + (partyVehicles || []).reduce((acc, v) => acc + (v.capacity || 0), 0);

    if (totalWeight > totalCapacity) speedMph *= 0.5;
    if (partyVehicles && partyVehicles.length > 0) speedMph *= 1.5;

    const hoursRemaining = milesRemaining / speedMph;
    const minsRemaining = Math.round(hoursRemaining * 60);

    const rationsNeeded = Math.ceil(hoursRemaining / 24) * partyStats.memberCount;
    const waterNeeded = Math.ceil(hoursRemaining / 24) * partyStats.memberCount;

    return {
      speed: speedMph,
      miles: milesRemaining,
      eta: minsRemaining,
      isOverburdened: totalWeight > totalCapacity,
      rationsNeeded,
      waterNeeded
    };
  }, [partyLocation, partyInventory, characters, partyStats, partyVehicles]);

  const stats = useMemo(() => calcTravelStats(destination), [destination, calcTravelStats]);

  if (!stats) return null;

  return (
    <div className="bg-parchment-100 w-full max-w-sm rounded border-2 border-dragon-gold shadow-2xl p-6 relative bg-paper-texture">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dragon-red/60 hover:text-dragon-red transition-colors"
          aria-label="Close Travel Panel"
        >
          <GameIcon name="close" size={20} />
        </button>
      )}

      <div className="flex flex-col mb-4">
        <span className="text-[8px] font-black uppercase text-dragon-red tracking-[0.3em] leading-none mb-1">Expedition_Journal</span>
        <h3 className="font-header text-xl text-dragon-red font-black uppercase tracking-widest border-b-2 border-dragon-red/20 pb-2">Preparation</h3>
      </div>

      <p className="text-sm text-parchment-800 font-serif mb-4 italic">
        Plotting the course to <strong className="text-dragon-darkRed">{destination?.name}</strong>.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center border-b border-dragon-red/10 pb-2">
          <span className="text-xs uppercase font-black text-parchment-500">Distance</span>
          <span className="text-sm font-bold text-dragon-darkRed">{stats.miles.toFixed(1)} miles</span>
        </div>
        <div className="flex justify-between items-center border-b border-dragon-red/10 pb-2">
          <span className="text-xs uppercase font-black text-parchment-500">Est. Time</span>
          <span className="text-sm font-bold text-dragon-darkRed">
            {stats.eta > 1440
              ? `${Math.floor(stats.eta / 1440)}d ${Math.floor((stats.eta % 1440)/60)}h`
              : stats.eta > 60 ? `${Math.floor(stats.eta / 60)}h ${stats.eta % 60}m` : `${stats.eta}m`}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-dragon-red/10 pb-2">
          <span className="text-xs uppercase font-black text-parchment-500">Pace / Status</span>
          <span className={cn("text-sm font-bold", stats.isOverburdened ? "text-red-500" : "text-green-700")}>
            {stats.speed.toFixed(1)} mph {stats.isOverburdened && '(Overburdened)'}
          </span>
        </div>

        <div className="bg-white/40 p-3 rounded border border-dragon-red/10 space-y-2">
          <h4 className="text-[10px] font-black uppercase text-dragon-red flex items-center gap-2">
            <GameIcon name="package" size={10} />
            Required Provisions
          </h4>
          <div className="flex justify-between text-xs font-serif text-parchment-800">
            <span>Rations:</span> <strong>{stats.rationsNeeded} units</strong>
          </div>
          <div className="flex justify-between text-xs font-serif text-parchment-800">
            <span>Water:</span> <strong>{stats.waterNeeded} skins</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!isTraveling ? (
          <button
            onClick={() => {
              startTravel(destination);
              if (onClose) onClose();
            }}
            className="w-full py-3 bg-dragon-red hover:bg-dragon-darkRed text-white font-bold text-xs uppercase tracking-widest rounded border-2 border-dragon-gold/30 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <GameIcon name="compass" size={14} color="#FFFFFF" />
            Embark on Journey
          </button>
        ) : (
          <div className="space-y-3">
            {/* Travel Progress Bar */}
            <div className="w-full h-2 bg-parchment-200 rounded-full overflow-hidden border border-dragon-red/10">
              <div
                className="h-full bg-dragon-red transition-all duration-500 ease-linear"
                style={{ width: `${travelProgress * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsFastForwarding(!isFastForwarding)}
                className={cn(
                  "py-2 px-4 rounded font-bold text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                  isFastForwarding
                    ? "bg-amber-500 text-white border-amber-300"
                    : "bg-parchment-200 text-dragon-red border-dragon-red/20 hover:bg-parchment-300"
                )}
              >
                <GameIcon name="loading" size={12} className={isFastForwarding ? "animate-spin" : ""} />
                {isFastForwarding ? "Slow Down" : "Fast Forward"}
              </button>

              <button
                onClick={() => skipTravel()}
                className="py-2 px-4 bg-dragon-darkRed text-white font-bold text-[10px] uppercase tracking-widest rounded border border-dragon-gold/30 hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <GameIcon name="advance" size={12} />
                Skip Travel
              </button>
            </div>

            <button
              onClick={() => stopTravel()}
              className="w-full py-2 bg-white/50 text-dragon-red font-bold text-[10px] uppercase tracking-widest rounded border border-dragon-red/20 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <GameIcon name="close" size={12} />
              Abort Expedition
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
