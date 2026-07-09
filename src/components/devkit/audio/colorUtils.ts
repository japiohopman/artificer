// Based on Philips Hue's color conversion formulas
// https://developers.meethue.com/develop/application-development/hue-api-v2/core-concepts/#color_representation_xy_and_rgb

export function hexToXy(hex: string): { x: number; y: number } {
  let r = 0, g = 0, b = 0;

  // Handle different hex formats
  if (hex.length === 4) { // #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return { x: 0, y: 0 }; // Default to black or handle error
  }

  r /= 255;
  g /= 255;
b /= 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ
  const X = r * 0.649926 + g * 0.103455 + b * 0.197109;
  const Y = r * 0.234327 + g * 0.743075 + b * 0.022598;
  const Z = r * 0.000000 + g * 0.053077 + b * 1.035763;

  // Convert to xy
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);

  // Check for NaN and return a default if necessary
  if (isNaN(x)) x = 0;
  if (isNaN(y)) y = 0;

  return { x, y };
}

export function xyToHex(x: number, y: number, brightness: number = 100): string {
  // Safeguard against division by zero/edge gamut
  if (y === 0) return '#000000';

  // Clamp brightness to 0-100 range
  brightness = Math.max(0, Math.min(100, brightness));
  const Y_val = brightness / 100; // Y value for XYZ conversion

  // Calculate Z from x and y
  const Z = Y_val * ((1 - x - y) / y);
  const X = (x / y) * Y_val;

  // Convert to RGB (inverse gamma correction)
  let r = X * 1.612 - Y_val * 0.203 - Z * 0.302;
  let g = X * -0.509 + Y_val * 1.412 + Z * 0.066;
  let b = X * 0.026 - Y_val * 0.072 + Z * 0.962;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  // Clamp to 0-255 and convert to hex
  const toHex = (c: number) => {
    const val = Math.round(Math.max(0, Math.min(255, c * 255)));
    return ("0" + val.toString(16)).slice(-2);
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function maximizeVibrancy(hex: string): string {
  // Convert hex to RGB (0-1 range)
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  if (max === 0) return '#FFFFFF'; // Handle black selection by defaulting to white

  // Scale components so the brightest is 1.0 (maximizing Value/Lightness)
  const toHex = (c: number) => {
    const val = Math.round((c / max) * 255);
    return ("0" + val.toString(16)).slice(-2);
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  export function hexToHsv(hex: string): { h: number; s: number; v: number } {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
  }

  export function hsvToHex(h: number, s: number, v: number): string {
    h /= 360; s /= 100; v /= 100;
    let r = 0, g = 0, b = 0;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    const toHex = (c: number) => {
        const val = Math.round(c * 255);
        return ("0" + val.toString(16)).slice(-2);
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }