import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useWorldStore } from '../../../store/useWorldStore';

interface FogOfWarProps {
  mapHeight: number;
  mapWidth: number;
  protoHeight: number;
  protoWidth: number;
}

export const FogOfWar: React.FC<FogOfWarProps> = ({ mapHeight, mapWidth, protoHeight, protoWidth }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exploredAreas = useWorldStore(state => state.exploredAreas);
  
  // Coordinate Rescaling (Match WorldMap.tsx logic)
  const getMapCoords = (x: number, y: number): [number, number] => {
    const px = (x / protoWidth) * mapWidth;
    const py = (1 - (y / protoHeight)) * mapHeight;
    return [py, px];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFog = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      // 1. Fill with semi-transparent shroud
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Clear explored areas
      ctx.globalCompositeOperation = 'destination-out';

      exploredAreas.forEach(area => {
        const [lat, lng] = getMapCoords(area.x, area.y);
        const point = map.latLngToContainerPoint([lat, lng]);
        
        // Scale radius based on zoom? 
        // Or keep it fixed in world units and translate to pixels.
        // Let's assume the radius is in "proto units" or similar.
        // We need to convert the radius to screen pixels.
        
        // To get radius in pixels:
        const center = L.latLng(lat, lng);
        const edge = L.latLng(lat, lng + area.radius * (mapWidth / protoWidth));
        const p1 = map.latLngToContainerPoint(center);
        const p2 = map.latLngToContainerPoint(edge);
        const radiusPx = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, radiusPx
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radiusPx, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
    };

    map.on('move zoom viewreset', renderFog);
    renderFog();

    return () => {
      map.off('move zoom viewreset', renderFog);
    };
  }, [map, exploredAreas, mapHeight, mapWidth, protoHeight, protoWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[450] pointer-events-none opacity-90 transition-opacity duration-1000"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};
