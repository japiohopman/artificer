import { Howl } from 'howler';
import { AudioLayer } from '../../types/audio';
import { useAudioStore } from '../../store/useAudioStore';

export interface PlaybackOptions {
  volume?: number;
  pitch?: number;
  loop?: boolean;
}

export class SoundInstance {
  private howl: Howl;
  private layer: AudioLayer;
  private instanceId: number | null = null;
  private baseVolume: number;

  constructor(path: string, layer: AudioLayer, options: PlaybackOptions = {}) {
    this.layer = layer;
    this.baseVolume = options.volume ?? 1.0;
    
    this.howl = new Howl({
      src: [path],
      volume: this.calculateEffectiveVolume(),
      rate: options.pitch ?? 1.0,
      loop: options.loop ?? false,
      html5: true,
    });
  }

  private calculateEffectiveVolume(): number {
    const state = useAudioStore.getState();
    const layerState = state.layerStates[this.layer];
    const anySolo = Object.values(state.layerStates).some(s => s.isSolo);
    
    let volume = this.baseVolume * layerState.volume;
    
    if (layerState.isMuted) {
      volume = 0;
    } else if (anySolo && !layerState.isSolo) {
      volume = 0;
    }
    
    return volume;
  }

  play() {
    this.instanceId = this.howl.play();
    return this.instanceId;
  }

  pause() {
    this.howl.pause();
  }

  stop() {
    this.howl.stop();
  }

  fadeAndStop(durationMs: number) {
    const currentVol = this.howl.volume();
    const targetId = this.instanceId !== null ? this.instanceId : undefined;
    this.howl.fade(currentVol, 0, durationMs, targetId);
    this.howl.once('fade', () => {
      this.howl.stop();
    });
  }

  updateVolume() {
    const volume = this.calculateEffectiveVolume();
    if (this.instanceId !== null) {
      this.howl.volume(volume, this.instanceId);
    } else {
      this.howl.volume(volume);
    }
  }

  getLayer() {
    return this.layer;
  }
}

export class AudioEngine {
  private activeInstances: Set<SoundInstance> = new Set();

  play(path: string, layer: AudioLayer, options: PlaybackOptions = {}): SoundInstance {
    const instance = new SoundInstance(path, layer, options);
    this.activeInstances.add(instance);
    instance.play();
    return instance;
  }

  updateVolumes() {
    for (const instance of this.activeInstances) {
      instance.updateVolume();
    }
  }

  stopAll(layer?: AudioLayer) {
    for (const instance of this.activeInstances) {
      if (layer === undefined || instance.getLayer() === layer) {
        instance.stop();
        this.activeInstances.delete(instance);
      }
    }
  }

  fadeOut(layer?: AudioLayer, durationMs: number = 1000) {
    const toFade: SoundInstance[] = [];
    for (const instance of this.activeInstances) {
      if (layer === undefined || instance.getLayer() === layer) {
        toFade.push(instance);
      }
    }
    for (const instance of toFade) {
      instance.fadeAndStop(durationMs);
      this.activeInstances.delete(instance);
    }
  }
}

export const audioEngine = new AudioEngine();
