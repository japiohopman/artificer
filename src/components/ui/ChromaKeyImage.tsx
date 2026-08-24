import React, { useEffect, useRef } from 'react';

export interface CropBounds {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

interface ChromaKeyImageProps {
  src: string;
  alt: string;
  className?: string;
  chromaColor?: { r: number; g: number; b: number };
  threshold?: number;
  crop?: CropBounds;
  onError?: () => void;
  style?: React.CSSProperties;
}

export const ChromaKeyImage: React.FC<ChromaKeyImageProps> = ({ 
  src, 
  alt, 
  className, 
  chromaColor = { r: 0, g: 255, b: 0 }, 
  threshold = 100,
  crop,
  onError,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = "anonymous";
    }
    img.src = src;

    img.onerror = () => {
      if (onErrorRef.current) onErrorRef.current();
    };

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const sourceWidth = crop ? crop.sw : img.width;
      const sourceHeight = crop ? crop.sh : img.height;
      const sourceX = crop ? crop.sx : 0;
      const sourceY = crop ? crop.sy : 0;

      if (!sourceWidth || !sourceHeight) return;

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const targetR = chromaColor.r;
      const targetG = chromaColor.g;
      const targetB = chromaColor.b;
      const isGreenKey = targetG > Math.max(targetR, targetB);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate Euclidean color distance from target chromaColor
        const dist = Math.sqrt(
          (r - targetR) ** 2 +
          (g - targetG) ** 2 +
          (b - targetB) ** 2
        );

        if (dist < threshold) {
          let alpha = 0;
          if (dist > threshold * 0.7) {
            // Smooth alpha feathering at edge threshold boundary
            const factor = (dist - threshold * 0.7) / (threshold * 0.3);
            alpha = Math.floor(255 * factor);
          }
          data[i + 3] = Math.min(data[i + 3], alpha);

          // Edge spill reduction
          if (isGreenKey && alpha < 255) {
            const maxOther = Math.max(r, b);
            data[i + 1] = maxOther;
          }
        }

        // Additional AI background green haze filter when chroma key target is green
        if (isGreenKey) {
          const maxOther = Math.max(r, b);
          const diff = g - maxOther;
          if (g > maxOther && diff > 35) {
            data[i + 3] = 0;
          } else if (g > 180 && g > r && g > b) {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
  }, [src, chromaColor, threshold, crop?.sx, crop?.sy, crop?.sw, crop?.sh]);

  return (
    <canvas 
      ref={canvasRef} 
      aria-label={alt}
      className={className}
      style={{ maxWidth: '100%', height: 'auto', ...style }}
    />
  );
};
