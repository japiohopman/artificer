import { AudioLayer } from '../types/audio.ts';

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/japiohopman/artificer/main/public";

class SoundEngine {
  private layers: Map<AudioLayer, HTMLAudioElement> = new Map();
  private effects: Map<string, HTMLAudioElement> = new Map();
  private masterVolume: number = 1.0;
  private currentMusicIndex: number = 0;
  private playlists = {
    startup: [
      '/assets/sounds/music/archives_of_the_elder1.mp3',
      '/assets/sounds/music/archives_of_the_elder2.mp3'
    ],
    game: [
      '/assets/sounds/music/the_Mages_study1.mp3',
      '/assets/sounds/music/the_Mages_study2.mp3'
    ]
  };
  private activePlaylist: 'startup' | 'game' = 'startup';

  constructor() {
    if (typeof window === 'undefined') return;
  }

  private getUrl(path: string): string {
    return `${GITHUB_RAW_BASE}${path}`;
  }

  playMusic(playlistOverride?: 'startup' | 'game') {
    if (playlistOverride) {
      this.activePlaylist = playlistOverride;
      this.currentMusicIndex = 0;
    }
    
    const playlist = this.playlists[this.activePlaylist];
    const path = playlist[this.currentMusicIndex];
    this.playLayer(1, path, true);
    
    import('../store/useStore').then(({ useStore }) => {
      useStore.getState().setMusicPlaying(true);
    });
  }

  stopMusic() {
    this.stopLayer(1);
    import('../store/useStore').then(({ useStore }) => {
      useStore.getState().setMusicPlaying(false);
    });
  }

  skipMusic() {
    const playlist = this.playlists[this.activePlaylist];
    this.currentMusicIndex = (this.currentMusicIndex + 1) % playlist.length;
    this.playMusic();
  }

  playLayer(layerId: AudioLayer, path: string, loop: boolean = false) {
    if (typeof window === 'undefined') return;

    // Remove any existing one immediately to avoid race conditions
    this.stopLayer(layerId);

    const audio = new Audio(this.getUrl(path));
    audio.loop = loop;
    
    // Register immediately so subsequent calls to playLayer or stopLayer find it
    this.layers.set(layerId, audio);

    import('../store/useStore').then(({ useStore }) => {
      // Check if this audio is still the active one for this layer
      if (this.layers.get(layerId) !== audio) {
        audio.pause();
        return;
      }

      const state = useStore.getState().layerStates[layerId];
      audio.volume = state.isMuted ? 0 : state.volume * this.masterVolume;
      const anySolo = Object.values(useStore.getState().layerStates).some(s => s.isSolo);
      
      if (anySolo && !state.isSolo) {
        audio.volume = 0;
      }
      
      audio.play().catch(e => {
        console.warn(`Layer ${layerId} playback failed:`, e.message);
      });
    });
  }

  stopLayer(layerId: AudioLayer) {
    const audio = this.layers.get(layerId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.layers.delete(layerId);
    }
  }

  updateLayerVolume(layerId: AudioLayer, volume: number) {
    const audio = this.layers.get(layerId);
    if (audio) {
      import('../store/useStore').then(({ useStore }) => {
        const state = useStore.getState().layerStates[layerId];
        const anySolo = Object.values(useStore.getState().layerStates).some(s => s.isSolo);
        
        if (state.isMuted) {
          audio.volume = 0;
        } else if (anySolo && !state.isSolo) {
          audio.volume = 0;
        } else {
          audio.volume = volume * this.masterVolume;
        }
      });
    }
  }

  updateLayerMute(layerId: AudioLayer, isMuted: boolean) {
    const audio = this.layers.get(layerId);
    if (audio) {
      if (isMuted) {
        audio.volume = 0;
      } else {
        import('../store/useStore').then(({ useStore }) => {
          const state = useStore.getState().layerStates[layerId];
          const anySolo = Object.values(useStore.getState().layerStates).some(s => s.isSolo);
          if (anySolo && !state.isSolo) {
            audio.volume = 0;
          } else {
            audio.volume = state.volume * this.masterVolume;
          }
        });
      }
    }
  }

  updateLayerSolo(layerId: AudioLayer, isSolo: boolean) {
    // If any layer is soloed, normalize all volumes
    import('../store/useStore').then(({ useStore }) => {
      const { layerStates } = useStore.getState();
      const anySolo = Object.values(layerStates).some(s => s.isSolo);

      this.layers.forEach((audio, id) => {
        const state = layerStates[id];
        if (anySolo) {
          audio.volume = state.isSolo ? state.volume * this.masterVolume : 0;
        } else {
          audio.volume = state.isMuted ? 0 : state.volume * this.masterVolume;
        }
      });
    });
  }

  stopAll() {
    this.layers.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.layers.clear();
  }

  playEffect(effect: string) {
    if (typeof window === 'undefined') return;

    let path = "";
    switch (effect) {
      case 'UI_CLICK_LIGHT': path = '/assets/sounds/system/ui_menu_select.mp3'; break;
      case 'TRANSACTION_SUCCESS': path = '/assets/sounds/system/feedback_success.mp3'; break;
      case 'UI_BACK_EXIT': path = '/assets/sounds/system/ui_modal_close.mp3'; break;
      case 'UI_MODAL_OPEN': path = '/assets/sounds/system/ui_modal_open.mp3'; break;
      case 'UI_ERROR': path = '/assets/sounds/system/feedback_error.mp3'; break;
      case 'DICE_ROLL': path = '/assets/sounds/sfx/dice_roll.mp3'; break;
      case 'EQUIP_ARMOR': path = '/assets/sounds/sfx/equip_armor.mp3'; break;
      case 'EQUIP_WEAPON': path = '/assets/sounds/sfx/equip_weapon.mp3'; break;
      case 'UI_ITEM_PLACE': path = '/assets/sounds/system/ui/ui_item_place.wav'; break;
      case 'UI_ITEM_GRAB': path = '/assets/sounds/system/ui/ui_item_grab.wav'; break;
      case 'UI_ITEM_EQUIP': path = '/assets/sounds/system/ui/ui_item_equip.wav'; break;
      case 'ITEM_SLOT': path = '/assets/sounds/system/ui/ui_item_place.wav'; break;
      case 'ITEM_GRAB': path = '/assets/sounds/system/ui/ui_item_grab.wav'; break;
      case 'ITEM_EQUIP': path = '/assets/sounds/system/ui/ui_item_equip.wav'; break;
      case 'LEVEL_UP': path = '/assets/sounds/sfx/sfx_level_up.wav'; break;
      default: path = '/assets/sounds/system/ui_menu_select.mp3';
    }

    const audio = new Audio(this.getUrl(path));
    // Use UI layer volume (Layer 8)
    import('../store/useStore').then(({ useStore }) => {
      const uiLayer = useStore.getState().layerStates[8];
      audio.volume = uiLayer.isMuted ? 0 : uiLayer.volume * this.masterVolume;
      audio.play().catch(e => console.warn("Effect playback failed", e.message));
    });
  }
}

export const soundService = new SoundEngine();
