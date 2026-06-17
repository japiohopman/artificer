import { create } from 'zustand';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'lorekeeper' | 'traveler';
  createdAt?: any;
  bio?: string;
  settings?: {
    displayRealName?: boolean;
    notificationsEnabled?: boolean;
  };
}

interface AuthState {
  user: any | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  setUser: (user: any | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setAuthReady: (isReady: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  updateUserProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null
      }));
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  },
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
}));
