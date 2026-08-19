import { useCharacterStore, Character } from '../../store/useCharacterStore';

export const selectActiveCharacter = (state: ReturnType<typeof useCharacterStore.getState>): Character | undefined => {
  return state.characters.find(c => c.id === state.activeCharacterId) || state.characters[0];
};

export const selectCharacterById = (
  state: ReturnType<typeof useCharacterStore.getState>,
  id: string
): Character | undefined => {
  return state.characters.find(c => c.id === id);
};

export const selectMainCharacterSlots = (
  state: ReturnType<typeof useCharacterStore.getState>
): (Character | null)[] => {
  return state.mainCharacterSlots;
};

export const selectPartyCharacters = (
  state: ReturnType<typeof useCharacterStore.getState>
): Character[] => {
  return state.characters;
};

export function useActiveCharacter(): Character | undefined {
  return useCharacterStore(selectActiveCharacter);
}

export function useCharacter(id: string): Character | undefined {
  return useCharacterStore(state => selectCharacterById(state, id));
}
