import { create } from 'zustand';
import { HueLight, LocalConnectionStatus, AnimationAsset, SporeType } from '../types/audio_kit';

interface HueState {
  lights: HueLight[];
  rooms: any[];
  isConnected: boolean;
  status: LocalConnectionStatus;
  error: string | null;
  lampAssignments: Record<string, string[]>; // lampId -> sporeIds[]
  activeSpores: Record<string, { asset: AnimationAsset; startTime: number }>; 
  credentials: {
    ip: string;
    username: string;
  };
  
  // Actions
  setCredentials: (ip: string, username: string) => void;
  setLights: (lights: HueLight[]) => void;
  setRooms: (rooms: any[]) => void;
  setStatus: (status: LocalConnectionStatus, error?: string | null) => void;
  assignLampToSpore: (lampId: string, sporeId: string) => void;
  runSpore: (sporeId: string, asset: AnimationAsset) => void;
  triggerHue: (settings: any, targetId?: string) => Promise<void>;
  
  // Async Thunks (Logic moved out of UI)
  connect: () => Promise<boolean>;
  fetchUpdates: () => Promise<void>;
}

export const useHueStore = create<HueState>((set, get) => ({
  lights: [],
  rooms: [],
  isConnected: false,
  status: 'disconnected',
  error: null,
  lampAssignments: {},
  activeSpores: {},
  credentials: {
    ip: localStorage.getItem("hue_ip") || "192.168.178.59",
    username: localStorage.getItem("hue_username") || "1b-t-3QlLC4cRGwai9knsfWItpR5Q17iyMt6NwTj",
  },

  setCredentials: (ip, username) => {
    localStorage.setItem("hue_ip", ip);
    localStorage.setItem("hue_username", username);
    set({ credentials: { ip, username } });
  },

  setLights: (lights) => set({ lights }),
  setRooms: (rooms) => set({ rooms }),
  setStatus: (status, error = null) => set({ status, error, isConnected: status === 'connected' }),

  assignLampToSpore: (lampId, sporeId) => set((state) => {
    const current = state.lampAssignments[lampId] || [];
    if (current.includes(sporeId)) return state;
    return {
      lampAssignments: { ...state.lampAssignments, [lampId]: [...current, sporeId] }
    };
  }),

  runSpore: (sporeId, asset) => {
    set((state) => ({
      activeSpores: { 
        ...state.activeSpores, 
        [sporeId]: { asset, startTime: Date.now() } 
      }
    }));

    // If not looping and is action, cleanup after duration
    if (!asset.loop && asset.sporeType === 'action') {
      const actionMax = asset.actionTimeline.length > 0 ? Math.max(...asset.actionTimeline.map(n => n.time)) : 0;
      const ambientMax = asset.ambientTimeline.length > 0 ? Math.max(...asset.ambientTimeline.map(n => n.time)) : 0;
      const duration = Math.max(actionMax, ambientMax) * 1000;
      setTimeout(() => {
        set((state) => {
          const next = { ...state.activeSpores };
          delete next[sporeId];
          return { activeSpores: next };
        });
      }, duration + 500);
    }
  },

  connect: async () => {
    const { ip, username } = get().credentials;
    if (!ip || !username) return false;

    set({ status: 'connecting' });
    try {
      const res = await fetch("/api/hue/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "GET",
          path: "/resource/light",
          manual: { ip, username }
        })
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || `Server returned error status ${res.status}`);
      }

      if (!res.ok) throw new Error(data.error || data.detail || "Connection failed");
      
      set({ lights: data.data || [], status: 'connected', isConnected: true, error: null });
      return true;
    } catch (e: any) {
      set({ status: 'error', error: e.message });
      return false;
    }
  },

  fetchUpdates: async () => {
    const { isConnected, credentials } = get();
    if (!isConnected) return;

    try {
      // Fetch Lights
      const lightRes = await fetch("/api/hue/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          method: "GET", 
          path: "/resource/light",
          manual: credentials 
        })
      });

      const lightText = await lightRes.text();
      try {
        const lightData = JSON.parse(lightText);
        if (lightRes.ok && lightData.data) set({ lights: lightData.data });
      } catch (err) {
        console.warn("Lamps poll parse error:", err);
      }

      // Fetch Rooms
      const roomRes = await fetch("/api/hue/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          method: "GET", 
          path: "/resource/room",
          manual: credentials 
        })
      });

      const roomText = await roomRes.text();
      try {
        const roomData = JSON.parse(roomText);
        if (roomRes.ok && roomData.data) set({ rooms: roomData.data });
      } catch (err) {
        console.warn("Rooms poll parse error:", err);
      }

    } catch (e) {
      console.error("Polling error:", e);
    }
  },

  triggerHue: async (settings, targetId) => {
    const { isConnected, credentials, lights } = get();
    if (!isConnected) return;

    const targetLights = targetId ? lights.filter(l => l.id === targetId) : lights;

    try {
      await Promise.all(targetLights.map(light => 
        fetch("/api/hue/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "PUT",
            path: `/resource/light/${light.id}`,
            manual: credentials,
            body: {
                dynamics: { duration: 400 }, // Default fallback
                ...settings // Overwrites dynamics if provided in spell/env
            }
          })
        })
      ));
      // Immediate local update for UI snappiness
      set((state) => ({
        lights: state.lights.map(l => {
          if (targetId && l.id !== targetId) return l;
          return {
            ...l,
            on: settings.on ?? l.on,
            dimming: settings.dimming ? { ...l.dimming, ...settings.dimming } : l.dimming,
            color: settings.color ?? l.color,
            color_temperature: settings.color_temperature ? { ...l.color_temperature, ...settings.color_temperature } : l.color_temperature
          };
        })
      }));
    } catch (e) {
      console.error("Hue trigger failed:", e);
    }
  }
}));