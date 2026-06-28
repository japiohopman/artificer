import React, { useState, useEffect, useMemo } from 'react';
import { Polyline, Tooltip, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasStore } from '../../store/useAtlasStore';

interface RulerToolProps {
  active: boolean;
  onDistanceChange?: (miles: number) => void;
}

export const RulerTool: React.FC<RulerToolProps> = ({ active, onDistanceChange }) => {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [mousePos, setMouseCoords] = useState<[number, number] | null>(null);
  const { 
    currentHierarchy, 
    mapScales, 
    setScale, 
    currentMapId, 
    setMeasuredUnits 
  } = useAtlasStore();
  
  const mapId = currentHierarchy.location || currentMapId;
  const scale = mapScales[mapId] || 1;

  useMapEvents({
    click(e) {
      if (!active) return;
      
      const { lat, lng } = e.latlng;
      if (points.length >= 2) {
        setPoints([[lat, lng]]);
        setMeasuredUnits(null);
      } else {
        const nextPoints = [...points, [lat, lng]] as [number, number][];
        setPoints(nextPoints);
        
        // Report distance if we just finished a line
        if (nextPoints.length === 2) {
          const p1 = L.latLng(nextPoints[0]);
          const p2 = L.latLng(nextPoints[1]);
          const dist = p1.distanceTo(p2);
          setMeasuredUnits(dist);
          onDistanceChange?.(dist);
        }
      }
    },
    mousemove(e) {
      if (!active) return;
      setMouseCoords([e.latlng.lat, e.latlng.lng]);
    },
    contextmenu() {
      if (!active) return;
      setPoints([]);
    }
  });

  const distance = useMemo(() => {
    if (points.length < 2) return 0;
    const p1 = L.latLng(points[0]);
    const p2 = L.latLng(points[1]);
    return p1.distanceTo(p2);
  }, [points]);

  const previewDistance = useMemo(() => {
    if (points.length !== 1 || !mousePos) return 0;
    const p1 = L.latLng(points[0]);
    const p2 = L.latLng(mousePos);
    return p1.distanceTo(p2);
  }, [points, mousePos]);

  if (!active) return null;

  const currentDist = points.length === 2 ? distance : previewDistance;
  const linePoints = points.length === 2 ? points : (points.length === 1 && mousePos ? [points[0], mousePos] : []);

  return (
    <>
      {linePoints.length >= 2 && (
        <Polyline
          positions={linePoints}
          pathOptions={{
            color: '#6366f1',
            weight: 3,
            dashArray: '5, 10',
            opacity: 0.8
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]} className="ruler-tooltip">
            <div className="bg-[#1e2228] border border-indigo-500/30 px-2 py-1 rounded text-[10px] font-bold text-indigo-400">
               {(currentDist / scale).toFixed(1)} MILES
               <div className="text-[8px] text-slate-500 font-normal mt-0.5">
                 {Math.round(currentDist)} UNITS @ {scale.toFixed(2)} U/M
               </div>
            </div>
          </Tooltip>
        </Polyline>
      )}

      {/* Point Handles */}
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={p}
          radius={4}
          pathOptions={{
            fillColor: '#6366f1',
            fillOpacity: 1,
            color: '#fff',
            weight: 1
          }}
        />
      ))}
    </>
  );
};
