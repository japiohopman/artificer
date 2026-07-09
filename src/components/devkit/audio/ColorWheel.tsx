import React, { useRef, useEffect, useState, useCallback } from "react";
import { hsvToHex, hexToHsv } from "./colorUtils";

interface ColorWheelProps {
  color: string;
  onChange: (hex: string) => void;
  size?: number;
}

export function ColorWheel({ color, onChange, size = 180 }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const nextHsv = hexToHsv(color);
    // Only update if the change is significant to avoid feedback loops
    if (Math.abs(nextHsv.h - hsv.h) > 0.1 || Math.abs(nextHsv.s - hsv.s) > 0.1 || Math.abs(nextHsv.v - hsv.v) > 0.1) {
        setHsv(nextHsv);
    }
  }, [color]);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = size / 2;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const dx = x - radius;
        const dy = y - radius;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          const angle = Math.atan2(dy, dx) + Math.PI;
          const h = (angle / (2 * Math.PI)) * 360;
          const s = (distance / radius);
          
          const rgb = hsvToRgb(h, s, hsv.v / 100);
          const index = (y * size + x) * 4;
          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
          data[index + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw cursor
    const angle = (hsv.h / 360) * 2 * Math.PI - Math.PI;
    const r = (hsv.s / 100) * radius;
    const cx = radius + r * Math.cos(angle);
    const cy = radius + r * Math.sin(angle);
    
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.strokeStyle = hsv.v > 50 ? "#000" : "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.strokeStyle = hsv.v > 50 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsv, size]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const handlePointer = (e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e as any).clientX - rect.left;
    const y = (e as any).clientY - rect.top;
    const radius = size / 2;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.min(radius, Math.sqrt(dx * dx + dy * dy));
    
    const angle = Math.atan2(dy, dx) + Math.PI;
    const h = (angle / (2 * Math.PI)) * 360;
    const s = (distance / radius) * 100;
    
    const nextHsv = { ...hsv, h, s };
    setHsv(nextHsv);
    onChange(hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v));
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
        if (isDragging) handlePointer(e);
    };
    const handleUp = () => setIsDragging(false);

    if (isDragging) {
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    }
    return () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, hsv]);

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="relative group" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full bg-stone-800 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="relative rounded-full cursor-crosshair shadow-2xl border border-stone-800/50 touch-none"
          onPointerDown={(e) => {
            setIsDragging(true);
            handlePointer(e);
          }}
        />
      </div>
    </div>
  );
}

// Helper for canvas drawing
function hsvToRgb(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}
