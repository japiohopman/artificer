import { BattleMap } from '../types/battleMap';
import { serializeBattleMap, deserializeBattleMap } from './battleMapSerializer';
import { validateBattleMap } from './battleMapValidator';
import { migrateBattleMap } from './battleMapMigration';

const STORAGE_KEY = 'artificer_devkit_battlemap';

export const saveBattleMap = (map: BattleMap): boolean => {
  const validation = validateBattleMap(map);
  if (!validation.isValid) {
    throw new Error(`Validation Error:\n\n${validation.errors.map(e => `• ${e}`).join('\n')}`);
  }

  try {
    const serialized = serializeBattleMap(map);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save battle map to local storage:', err);
    throw new Error('Failed to save to local storage.');
  }
};

export const loadBattleMap = (): BattleMap | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = deserializeBattleMap(saved);
    return migrateBattleMap(parsed);
  } catch (err) {
    console.error('Failed to load battle map from local storage:', err);
    throw new Error('Failed to load map from local storage.');
  }
};

export const importBattleMap = (file: File): Promise<BattleMap> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = event.target?.result as string;
        const parsed = deserializeBattleMap(rawJson);
        const migrated = migrateBattleMap(parsed);
        resolve(migrated);
      } catch (err) {
        reject(new Error('Failed to parse and migrate battle map JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error.'));
    reader.readAsText(file);
  });
};

export const exportBattleMap = (map: BattleMap): void => {
  const serialized = serializeBattleMap(map);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(serialized);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${map.name.toLowerCase().replace(/\s+/g, '_')}.battlemap.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const saveBattleMapToServer = async (id: string, name: string, map: BattleMap): Promise<boolean> => {
  const validation = validateBattleMap(map);
  if (!validation.isValid) {
    throw new Error(`Validation Error:\n\n${validation.errors.map(e => `• ${e}`).join('\n')}`);
  }

  const res = await fetch('/api/combat-maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, mapData: map })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save combat map to server.');
  }

  return true;
};

export const loadBattleMapFromServer = async (id: string): Promise<BattleMap> => {
  const res = await fetch(`/api/combat-maps/${id}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load combat map from server.');
  }
  const parsed = await res.json();
  return migrateBattleMap(parsed);
};

export const listBattleMapsFromServer = async (): Promise<Array<{ id: string; name: string; filename: string }>> => {
  const res = await fetch('/api/combat-maps');
  if (!res.ok) {
    throw new Error('Failed to list combat maps from server.');
  }
  return res.json();
};

export const deleteBattleMapFromServer = async (id: string): Promise<boolean> => {
  const res = await fetch(`/api/combat-maps/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete combat map from server.');
  }
  return true;
};
