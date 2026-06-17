import { commitFile, deleteFile, normalizeImageUrl, REPO, BRANCH } from './storageService';
import { Character } from '../store/useCharacterStore';

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

    // Attempt to load from local slots regardless of GitHub status
    const localSlots = ['slot1', 'slot2', 'slot3'];
    const characters: Character[] = [];

    if (Array.isArray(files) && files.length > 0) {
      const githubChars = await Promise.all(
        files
          .filter((f: any) => f.name.endsWith('.json'))
          .map(async (f: any) => {
            const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f.path}?t=${Date.now()}`;
            const rawRes = await fetch(`/api/raw?url=${encodeURIComponent(rawUrl)}`);
            if (rawRes.ok) {
              const data = await rawRes.json();
              if (data) {
                const id = f.name.replace('.json', '');
                data.id = id;
                if (data.avatarUrl) data.avatarUrl = normalizeImageUrl(data.avatarUrl, 'character', id);
                if (data.imageUrl) data.imageUrl = normalizeImageUrl(data.imageUrl, 'character', id);
                if (data.matrixUrl) data.matrixUrl = normalizeImageUrl(data.matrixUrl, 'character', id);
              }
              return data;
            }
            return null;
          })
      );
      characters.push(...githubChars.filter(c => c !== null));
    }

    // Fill in or override with local files if they exist
    const localCharPromises = localSlots.map(async (slot) => {
      try {
        // Try the sandbox path first (where we save)
        const sandboxRes = await fetch(`/data/character_save/json/${slot}.json?t=${Date.now()}`);
        if (sandboxRes.ok) {
          const data = await sandboxRes.json();
          if (data) {
            data.id = slot;
            return data;
          }
        }
        
        // Fallback to public data (legacy/template)
        const publicRes = await fetch(`/data/${slot}.json?t=${Date.now()}`);
        if (publicRes.ok) {
          const data = await publicRes.json();
          if (data) {
            data.id = slot;
            return data;
          }
        }
      } catch (e) {}
      return null;
    });

    const localChars = await Promise.all(localCharPromises);
    localChars.forEach(lc => {
      if (lc) {
        // If we already have this slot from GitHub, local might be newer if we just saved
        const existingIdx = characters.findIndex(c => c.id === lc.id);
        if (existingIdx !== -1) {
          const existing = characters[existingIdx];
          const localDate = new Date(lc.lastSaved || 0).getTime();
          const githubDate = new Date(existing.lastSaved || 0).getTime();
          if (localDate > githubDate) {
            characters[existingIdx] = lc;
          }
        } else {
          characters.push(lc);
        }
      }
    });

    return characters
      .sort((a, b) => new Date(b.lastSaved || 0).getTime() - new Date(a.lastSaved || 0).getTime());
  }
};
