import { create } from 'zustand';
import { storeAuth, clearAuth, getStoredAuth } from '../services/api';
import { authApi } from '../services/endpoints';

export type UserRole = 'admin' | 'freelancer' | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  picture?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean }>;
  register: (data: {
    email: string; password: string; name: string; role: string;
    companyName?: string; contactName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Restore auth from localStorage on app load
  hydrate: () => {
    const stored = getStoredAuth();
    if (stored.accessToken && stored.role && stored.name && stored.userId) {
      set({
        user: {
          id: stored.userId,
          name: stored.name,
          role: stored.role,
          email: '',
          picture: stored.picture || undefined,
        },
        isAuthenticated: true,
      });
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(email, password);
      storeAuth(data);
      set({
        user: { id: data.userId, name: data.name, role: data.role, email, picture: data.picture },
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.googleSignIn(idToken);
      storeAuth(data);
      set({
        user: { id: data.userId, name: data.name, role: data.role, email: '', picture: data.picture },
        isAuthenticated: true,
      });
      return { isNewUser: data.isNewUser };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (formData: any) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register(formData);
      storeAuth(data);
      set({
        user: { id: data.userId, name: data.name, role: data.role as UserRole, email: formData.email },
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const rt = localStorage.getItem('refreshToken');
    try { if (rt) await authApi.logout(rt); } catch { /* ignore */ }
    clearAuth();
    set({ user: null, isAuthenticated: false });
  },
}));
