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
          <feGaussianBlur stdDeviation="80" />
        </filter>
        <mask id="fog-mask">
          {/* White fills the mask, meaning fully visible fog */}
          <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="white" />
          {/* Black circles cut holes in the mask, revealing the map underneath */}
          {exploredAreas.map((area, index) => {
            const [px, py] = getMapCoords(area.x, area.y);
            // Dynamic radius based on zoom/scale could be here, but we use area.radius for consistency
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

        {/* Volumetric Cloud Pattern */}
        <pattern id="fog-pattern-1" patternUnits="userSpaceOnUse" width="1024" height="1024">
          <image href="/assets/ui/map_fog_cloud.webp" x="0" y="0" width="1024" height="1024" opacity="0.9" />
        </pattern>
        <pattern id="fog-pattern-2" patternUnits="userSpaceOnUse" width="800" height="800">
          <image href="/assets/ui/map_fog_cloud.webp" x="100" y="100" width="800" height="800" opacity="0.6" />
        </pattern>
      </defs>

      <g mask="url(#fog-mask)" style={{ pointerEvents: 'none' }}>
        {/* Layer 1: Dark Base Fog */}
        <rect 
          x="0" y="0" width={mapWidth} height={mapHeight} 
          fill="#0a0a0c" 
          style={{ opacity: 0.95 }}
        />
        
        {/* Layer 2: Texture Pattern 1 */}
        <rect 
          x="0" y="0" width={mapWidth} height={mapHeight} 
          fill="url(#fog-pattern-1)" 
          style={{ mixBlendMode: 'screen', opacity: 0.4 }}
        />

        {/* Layer 3: Texture Pattern 2 (Offset and Scaled for Depth) */}
        <rect 
          x="0" y="0" width={mapWidth} height={mapHeight} 
          fill="url(#fog-pattern-2)" 
          style={{ mixBlendMode: 'overlay', opacity: 0.3 }}
        />
      </g>
    </SVGOverlay>
  );
};
