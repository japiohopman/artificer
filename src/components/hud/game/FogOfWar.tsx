import React from 'react';
import { SVGOverlay } from 'react-leaflet';
import { useWorldStore } from '../../../store/useWorldStore';

interface FogOfWarProps {
  mapHeight: number;
  mapWidth: number;
  protoHeight: number;
  protoWidth: number;
}

export const FogOfWar: React.FC<FogOfWarProps> = ({ mapHeight, mapWidth, protoHeight, protoWidth }) => {
  const exploredAreas = useWorldStore(state => state.exploredAreas);
  
  // Coordinate Rescaling (Match WorldMap.tsx logic)
  // Note: SVGOverlay uses Cartesian coordinates: [0, 0] is top-left, [mapWidth, mapHeight] is bottom-right.
  const getMapCoords = (x: number, y: number): [number, number] => {
    const px = (x / protoWidth) * mapWidth;
    const py = (1 - (y / protoHeight)) * mapHeight;
    return [px, py]; // [x, y] for SVG attributes cx, cy
  };

  return (
    <SVGOverlay bounds={[[0, 0], [mapHeight, mapWidth]]} zIndex={450}>
      <defs>
        <filter id="fog-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="150" />
        </filter>
        <mask id="fog-mask">
          {/* White fills the mask, meaning fully visible fog */}
          <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="white" />
          {/* Black circles cut holes in the mask, revealing the map underneath */}
          {exploredAreas.map((area, index) => {
            const [px, py] = getMapCoords(area.x, area.y);
            const radius = area.radius * (mapWidth / protoWidth);
            return (
              <circle 
                key={index}
                cx={px} 
                cy={py} 
                r={radius} 
                fill="black" 
                filter="url(#fog-blur)"
              />
            );
          })}
        </mask>
        <pattern id="fog-pattern" patternUnits="userSpaceOnUse" width="512" height="512">
          <image href="/assets/images/ui/map_fog_cloud.webp" x="0" y="0" width="512" height="512" preserveAspectRatio="none" />
        </pattern>
      </defs>
      <rect 
        x="0" 
        y="0" 
        width={mapWidth} 
        height={mapHeight} 
        fill="url(#fog-pattern)" 
        mask="url(#fog-mask)"
        style={{ mixBlendMode: 'multiply', opacity: 0.85, pointerEvents: 'none' }}
      />
    </SVGOverlay>
  );
};
