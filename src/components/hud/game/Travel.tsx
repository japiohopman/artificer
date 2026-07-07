import React, { useMemo, useCallback } from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

interface TravelProps {
  destination: any;
  onClose?: () => void;
  isMinimized?: boolean;
}

export const Travel: React.FC<TravelProps> = ({ destination, onClose, isMinimized }) => {
  const {
    partyLocation,
    startTravel,
    isTraveling,
    stopTravel,
    skipTravel,
    isFastForwarding,
    setIsFastForwarding,
    travelProgress,
    currentLocation,
    setCurrentLocation,
    fetchDetailedLocation,
    gameTime
  } = useWorldStore();

  const { setIsInsideSubMap } = useUIStore();
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

  const isAtDestination = partyLocation?.id === destination?.id;
  const terrain = partyLocation?.category || 'Wilderness';

  if (!stats && !isAtDestination) return null;

  if (isMinimized) {
    return (
      <div className="bg-parchment-100/95 p-3 border-t border-dragon-gold/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <GameIcon name="compass" size={14} color="#8B0000" className={isTraveling ? "animate-spin-slow" : ""} />
           <span className="text-[10px] font-black uppercase text-dragon-red tracking-widest">
             {isTraveling ? `Traveling to ${destination?.name}` : isAtDestination ? `Arrived at ${destination?.name}` : 'Expedition Ready'}
           </span>
        </div>
        {isTraveling && (
          <div className="w-24 h-1 bg-parchment-300 rounded-full overflow-hidden">
             <div className="h-full bg-dragon-red" style={{ width: `${travelProgress * 100}%` }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-parchment-100/95 w-full border-t border-dragon-gold/50 p-4 space-y-4">
      {/* Terrain & Environment */}
      <div className="flex items-center justify-between border-b border-dragon-red/10 pb-2">
        <div className="flex items-center gap-2">
          <GameIcon name="forest" size={14} color="#8B0000" />
          <span className="text-[9px] font-black uppercase text-dragon-red tracking-widest">Terrain: {terrain}</span>
        </div>
        <div className="flex items-center gap-2">
           <GameIcon name="clock" size={14} color="#8B0000" />
           <span className="text-[9px] font-black uppercase text-dragon-red tracking-widest">Rest Priority: Low</span>
        </div>
      </div>

      {isAtDestination ? (
        <div className="space-y-3">
          <p className="text-xs text-parchment-800 font-serif italic text-center">
            You have reached <strong className="text-dragon-darkRed">{destination?.name}</strong>.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                const detailed = await fetchDetailedLocation(destination);
                setCurrentLocation(detailed);
                setIsInsideSubMap(true);
              }}
              className="py-3 bg-dragon-red hover:bg-dragon-darkRed text-white font-bold text-xs uppercase tracking-widest rounded border-2 border-dragon-gold/30 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <GameIcon name="advance" size={14} color="#FFFFFF" />
              Enter Location
            </button>
            <button
              className="py-3 bg-parchment-200 hover:bg-parchment-300 text-dragon-red font-bold text-xs uppercase tracking-widest rounded border-2 border-dragon-gold/30 transition-all flex items-center justify-center gap-2"
            >
              <GameIcon name="sleep" size={14} color="#8B0000" />
              Rest Here
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-parchment-500">
              <span>Distance</span>
              <span className="text-dragon-darkRed">{stats?.miles.toFixed(1)} miles</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-parchment-500">
              <span>ETA</span>
              <span className="text-dragon-darkRed">
                {stats && (stats.eta > 1440
                  ? `${Math.floor(stats.eta / 1440)}d ${Math.floor((stats.eta % 1440)/60)}h`
                  : stats.eta > 60 ? `${Math.floor(stats.eta / 60)}h ${stats.eta % 60}m` : `${stats.eta}m`)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!isTraveling ? (
              <button
                onClick={() => startTravel(destination)}
                className="w-full py-3 bg-dragon-red hover:bg-dragon-darkRed text-white font-bold text-xs uppercase tracking-widest rounded border-2 border-dragon-gold/30 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <GameIcon name="compass" size={14} color="#FFFFFF" />
                Embark
              </button>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-2 bg-parchment-200 rounded-full overflow-hidden border border-dragon-red/10">
                  <div
                    className="h-full bg-dragon-red transition-all duration-500 ease-linear"
                    style={{ width: `${travelProgress * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsFastForwarding(!isFastForwarding)}
                    className={cn(
                      "py-2 rounded font-bold text-[9px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                      isFastForwarding ? "bg-amber-500 text-white border-amber-300" : "bg-parchment-200 text-dragon-red border-dragon-red/20"
                    )}
                  >
                    <GameIcon name="loading" size={12} className={isFastForwarding ? "animate-spin" : ""} />
                    {isFastForwarding ? "Slow" : "Fast"}
                  </button>

                  <button
                    onClick={() => skipTravel()}
                    className="py-2 bg-dragon-darkRed text-white font-bold text-[9px] uppercase tracking-widest rounded border border-dragon-gold/30 flex items-center justify-center gap-2"
                  >
                    <GameIcon name="advance" size={12} />
                    Skip
                  </button>
                </div>

                <button
                  onClick={() => stopTravel()}
                  className="w-full py-1 text-dragon-red font-bold text-[8px] uppercase tracking-widest hover:underline"
                >
                  Abort Expedition
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
