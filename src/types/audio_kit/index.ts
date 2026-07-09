
export type LocalConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export type SporeType = "ambient" | "action";
export type InterpolationType = "linear" | "hold" | "ease-in" | "ease-out";

export interface LightNode {
  time: number;
  brightness: number;
  color: string;
  interpolation: InterpolationType;
}

export interface AnimationAsset {
  id: string;
  name: string;
  sporeType: SporeType;
  loop: boolean;
  actionTimeline: LightNode[];
  ambientTimeline: LightNode[];
  soundRef?: string; // Links to audioIndex.json
}

export interface HueLight {
  id: string;
  rtype: string;
  metadata: {
    name: string;
    archetype?: string;
  };
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
    min_dim_level?: number;
  };
  color?: {
    xy: {
      x: number;
      y: number;
    };
    gamut?: {
      red: { x: number; y: number };
      green: { x: number; y: number };
      blue: { x: number; y: number };
    };
    gamut_type?: string;
  };
  color_temperature?: {
    mirek: number;
    mirek_valid: boolean;
    mirek_schema: {
      mirek_minimum: number;
      mirek_maximum: number;
    };
  };
  dynamics?: {
    status: string;
    status_values: string[];
    speed: number;
    speed_valid: boolean;
  };
  owner: {
    rid: string;
    rtype: string;
  };
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  color: string;
  hueSettings: any;
  imagePrompt: string;
}

export interface Spell {
  id: string;
  name: string;
  icon: string;
  color: string;
  hueSettings: any;
}
