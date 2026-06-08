# Sound Service Module

## Purpose
The `soundService.ts` manages the atmospheric soundscape of Artificer. It supports multi-layered audio mixing, allowing for simultaneous background music, ambient loops, and directional sound effects.

## Owner
Sound Agent

## Resources
- [Audio Registry](../systems/AUDIO_REGISTRY.md) - Complete index of audio assets.
- [Audio Requests](../reports/AUDIO_REQUESTS.md) - Missing assets and roadmap.

## Dependencies
- `AudioLayer` type definitions
- `useStore.ts` (for volume and mute state)
- `public/assets/sounds/` assets

## Architecture
- **Layer-Based Mixing**: Audio is divided into layers (Music, Ambient, UI, SFX, etc.).
- **Master Volume**: Global control over all audio output.
- **Playlist Management**: Supports dynamic switching between "Startup" and "Game" playlists.
- **Proxy Loading**: Assets are loaded via GitHub Raw proxy to ensure availability.

## API
- `playMusic(playlist)`: Starts the music engine.
- `playLayer(layerId, path, loop)`: Plays a specific audio file on a layer.
- `playEffect(effectName)`: Triggers a short-lived sound effect (e.g., UI_CLICK).

## Known Issues
- Browser autoplay policies can block initial music playback.
- Restructuring of `public/assets/sounds` requires path updates in the service.

## TODO's
- [ ] Implement cross-fading between music tracks.
- [ ] Add spatial audio (3D panning) for SFX.
