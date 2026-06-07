import { commitFile, deleteFile, normalizeImageUrl, REPO, BRANCH } from './storageService';
import { Character } from '../store/useStore';

export const saveService = {
  async saveCharacter(character: Character, slot?: number): Promise<boolean> {
    const id = slot ? `slot${slot}` : (character.id || `char_${Date.now()}`);
    const path = `data/character_save/json/${id}.json`;
    
    // Normalize and sanitize for storage if needed
    const dataToSave = {
      ...character,
      id,
      lastSaved: new Date().toISOString()
    };

    return await commitFile(path, JSON.stringify(dataToSave, null, 2));
  },

  async saveCharacterImage(id: string, base64: string, type: 'portrait' | 'avatar' | 'matrix'): Promise<string | null> {
    const filename = `${id}_${type}.webp`;
    const path = `data/character_save/images/${id}/${filename}`;
    
    // Clean base64 if it includes the data:image/... prefix
    let cleanBase64 = base64;
    if (base64.includes(';base64,')) {
      cleanBase64 = base64.split(';base64,')[1];
    }
    
    const success = await commitFile(path, cleanBase64, true);
    if (success) {
      return `data/character_save/images/${id}/${filename}`;
    }
    return null;
  },

  async deleteCharacter(id: string): Promise<boolean> {
    const jsonPath = `data/character_save/json/${id}.json`;
    return await deleteFile(jsonPath, `Delete character: ${id}`);
  },

  async loadCharacters(): Promise<Character[]> {
    const githubUrl = `https://api.github.com/repos/${REPO}/contents/data/character_save/json?ref=${BRANCH}&t=${Date.now()}`;
    const url = `/api/fetch?url=${encodeURIComponent(githubUrl)}`;
    
    let files = [];
    try {
      const res = await fetch(url);
      if (res.ok) {
        files = await res.json();
      }
    } catch (e) {
      console.warn("GitHub fetch failed, attempting local fallback:", e);
    }

    if (!Array.isArray(files) || files.length === 0) {
      // Fallback to local public/data slots if github is empty or fails
      const localSlots = ['slot1', 'slot2', 'slot3'];
      const localChars = await Promise.all(
        localSlots.map(async (slot) => {
          try {
            const res = await fetch(`/data/${slot}.json?t=${Date.now()}`);
            if (res.ok) {
              const data = await res.json();
              if (data) {
                data.id = slot;
                if (data.avatarUrl) data.avatarUrl = normalizeImageUrl(data.avatarUrl, 'character', slot);
                if (data.imageUrl) data.imageUrl = normalizeImageUrl(data.imageUrl, 'character', slot);
                return data;
              }
            }
          } catch (e) {}
          return null;
        })
      );
      return localChars.filter(c => c !== null) as Character[];
    }

    try {
      const characters = await Promise.all(
        files
          .filter((f: any) => f.name.endsWith('.json'))
          .map(async (f: any) => {
            const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}?t=${Date.now()}`;
            const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
            if (rawRes.ok) {
              const data = await rawRes.json();
              if (data) {
                // Ensure the ID matches the filename for proper slot mapping
                const id = f.name.replace('.json', '');
                data.id = id;
                
                // Ensure avatar/portrait URLs are normalized for the current environment
                if (data.avatarUrl) data.avatarUrl = normalizeImageUrl(data.avatarUrl, 'character', id);
                if (data.imageUrl) data.imageUrl = normalizeImageUrl(data.imageUrl, 'character', id);
                if (data.matrixUrl) data.matrixUrl = normalizeImageUrl(data.matrixUrl, 'character', id);
              }
              return data;
            }
            return null;
          })
      );

      return characters
        .filter(c => c !== null)
        .sort((a, b) => new Date(b.lastSaved || 0).getTime() - new Date(a.lastSaved || 0).getTime());
    } catch (e) {
      console.error("Error loading characters:", e);
      return [];
    }
  }
};
