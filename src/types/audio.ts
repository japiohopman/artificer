
export type AudioLayer = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface LayerState {
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
  isPlaying: boolean;
}

export const LAYER_NAMES: Record<AudioLayer, string> = {
  1: 'Master Theme',
  2: 'Atmosphere',
  3: 'Environment',
  4: 'Combat / Action',
  5: 'Narrator / NPC',
  6: 'Ability SFX',
  7: 'Equipment SFX',
  8: 'UI Feedback',
  9: 'Aux 1 (Magic)',
  10: 'Aux 2 (Technical)',
  11: 'Weather',
};
