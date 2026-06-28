import { useState, useCallback } from "react";
import { MapMarker } from "../types";

const MILES_PER_UNIT = 0.315; // Rough scale for Faerun map

export function useTravel() {
  const [route, setRoute] = useState<MapMarker[]>([]);

  const addToRoute = useCallback((marker: MapMarker) => {
    setRoute(prev => [...prev, marker]);
  }, []);

  const clearRoute = useCallback(() => {
    setRoute([]);
  }, []);

  const calculateDistance = useCallback(() => {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const p1 = route[i].position;
      const p2 = route[i+1].position;
      const dx = p1[0] - p2[0];
      const dy = p1[1] - p2[1];
      distance += Math.sqrt(dx*dx + dy*dy);
    }
    return distance * MILES_PER_UNIT;
  }, [route]);

  // D&D 5e travel speeds (miles per day)
  const getTravelTime = useCallback((miles: number) => {
    return {
      slow: miles / 18,
      normal: miles / 24,
      fast: miles / 30
    };
  }, []);

  return {
    route,
    addToRoute,
    clearRoute,
    calculateDistance,
    getTravelTime
  };
}
