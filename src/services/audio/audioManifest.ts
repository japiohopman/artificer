import { AudioLayer } from "../../types/audio";

export interface ArcaneEffect {
  sound: string;
  layer: AudioLayer;
  lighting?: {
    color?: { xy: { x: number; y: number } };
    color_temperature?: { mirek: number };
    dimming: { brightness: number };
    pattern: 'pulse' | 'strobe' | 'fade' | 'living';
    duration: number; // in ms
  };
}

export const SOUND_MANIFEST: Record<string, ArcaneEffect> = {
  "fireball": {
    sound: "/assets/sounds/sfx/fireball.mp3",
    layer: 6, // Ability SFX
    lighting: {
      color: { xy: { x: 0.675, y: 0.322 } },
      dimming: { brightness: 100 },
      pattern: "pulse",
      duration: 1500
    }
  },
  "thunderwave": {
    sound: "/assets/sounds/sfx/thunderwave.mp3",
    layer: 6, // Ability SFX
    lighting: {
      color: { xy: { x: 0.2, y: 0.2 } },
      dimming: { brightness: 100 },
      pattern: "strobe",
      duration: 500
    }
  },
  "weather_thunder": {
    sound: "/assets/sounds/weather/weather_thunder.mp3",
    layer: 11, // Weather
    lighting: {
      color: { xy: { x: 0.3127, y: 0.329 } }, // White flash
      dimming: { brightness: 100 },
      pattern: "strobe",
      duration: 300
    }
  },
  "rain_loop": {
    sound: "/assets/sounds/weather/rain_loop.mp3",
    layer: 11, // Weather
    lighting: {
      color: { xy: { x: 0.15, y: 0.15 } }, // Deep Blue
      dimming: { brightness: 40 },
      pattern: "living",
      duration: 5000
    }
  }
};
