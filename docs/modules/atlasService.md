# Atlas Service Module

## Purpose
The `atlasService.ts` is the backbone of Artificer's data layer. It provides a resilient, multi-path fetch strategy to ensure game data is always available, whether running locally or in production.

## Owner
Jules Agent

## Dependencies
- `storageService.ts`
- GitHub Raw Content API (via proxy)
- Local `/public/assets/atlas` directory

## Architecture
1. **Local Resolution**: Attempts to fetch from `/assets/atlas/...` first.
2. **Path Normalization**: Handles naming inconsistencies (e.g., `_` vs `-`).
3. **Remote Proxy**: Falls back to GitHub Raw via `server.ts` proxy.
4. **Caching**: In-memory cache for session-heavy tasks.

## API
- `fetchData(path: string)`: Generic fetch with fallback logic.
- `loadLevelData(classIndex: string, level: number)`: Fetches specific leveling rules.

## Known Issues
- Some assets still use legacy hardcoded GitHub URLs.
- Case-sensitivity issues on certain platforms for snake_case paths.

## TODO's
- [ ] Implement full schema validation on every fetch.
- [ ] Add vector-indexing for faster search.
