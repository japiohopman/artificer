# Save & Storage Service Modules

## Purpose
`saveService.ts` and `storageService.ts` handle the persistence of character data, campaign states, and the retrieval of the Atlas index.

## Owner
Jules Agent

## Dependencies
- Firebase Firestore (for user profiles)
- GitHub API (via `server.ts` proxy) for character saves.
- `useStore.ts`

## Architecture
- **GitHub as DB**: Character saves are stored as JSON files in the repository.
- **Proxy-Based Commits**: `server.ts` handles the authentication and GitHub API calls to bypass CORS and secure tokens.
- **Firebase Auth**: Manages user sessions and basic profile data.

## API
- `loadCharacters()`: Fetches all character saves from the user's storage path.
- `saveCharacter(character)`: Commits character state to GitHub.
- `fetchMonsterList()`: Retrieves the master index for monsters.

## Known Issues
- GitHub API rate limits can affect rapid saving.
- Syncing between multiple devices can occasionally lag.

## TODO's
- [ ] Implement conflict resolution for concurrent saves.
- [ ] Add local-first persistence (IndexedDB) with background sync.
