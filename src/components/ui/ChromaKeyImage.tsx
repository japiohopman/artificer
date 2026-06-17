import React, { useEffect, useRef } from 'react';

interface ChromaKeyImageProps {
  src: string;
  alt: string;
  className?: string;
  chromaColor?: { r: number; g: number; b: number };
  threshold?: number;
}

export const ChromaKeyImage: React.FC<ChromaKeyImageProps> = ({ 
  src, 
  alt, 
  className, 
  chromaColor = { r: 0, g: 255, b: 0 }, 
  threshold = 100 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Maintain aspect ratio while fitting in the canvas
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Aggressive Chroma key logic for AI-generated "noisy" green screens
        // We look for any pixel where green is the dominant channel
        const maxOther = Math.max(r, b);
        const diff = g - maxOther;
        
        // If green is dominant, we treat it as background
        // We use a very low threshold to catch the "vague" greenish haze
        if (g > maxOther) {
          // Confidence score: how sure are we this is background green?
          // If diff is > 10, we start fading. If diff is > 35, it's gone.
          let alpha = 255;
          
          if (diff > 5) {
            // Map diff 5-35 to alpha 255-0
            const factor = Math.max(0, Math.min(1, (diff - 5) / 30));
            alpha = Math.floor(255 * (1 - factor));
            
            // For clear green dominance, force transparency
            if (diff > 35) alpha = 0;
            
            // Also check for high-brightness greens which are common in AI backgrounds
            if (g > 160 && diff > 15) alpha = 0;
            
            data[i + 3] = Math.min(data[i + 3], alpha);

            // Aggressive spill reduction: remove green tint from edges entirely
            if (alpha < 255) {
              data[i + 1] = maxOther;
            }
          }
        }
        
        // Special case for desaturated greenish grays (common in AI haze)
        // If it's bright and slightly greenish, fade it out
        if (g > 180 && g > r && g > b) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
  }, [src, chromaColor, threshold]);

  return (
    <canvas 
      ref={canvasRef} 
      aria-label={alt}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
