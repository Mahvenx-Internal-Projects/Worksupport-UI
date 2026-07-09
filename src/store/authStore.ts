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

// ── Read localStorage synchronously at module load (before any render) ──
const _initUser: AuthUser | null = (() => {
  try {
    const s = getStoredAuth() as Record<string, any>;
    if (s && s['accessToken'] && s['role'] && s['name'] && s['userId']) {
      return { id: s['userId'], name: s['name'], role: (s['role'] as string).toLowerCase() as UserRole, email: '', picture: s['picture'] || undefined } as AuthUser;
    }
  } catch {}
  return null;
})();

export const useAuthStore = create<AuthStore>((set) => ({
  user:            _initUser,
  isAuthenticated: !!_initUser,
  isLoading:       false,   // ← already resolved above, never blocks renders

  hydrate: () => {
    // Re-reads localStorage — useful if called manually to refresh state
    try {
      const stored = getStoredAuth();
      if (stored.accessToken && stored.role && stored.name && stored.userId) {
        set({
          user: { id: stored.userId, name: stored.name, role: (stored.role as string).toLowerCase() as UserRole, email: '', picture: stored.picture || undefined },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(email, password);
      storeAuth(data);
      set({
        user: { id: data.userId, name: data.name, role: (data.role as string).toLowerCase() as UserRole, email, picture: data.picture },
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
        user: { id: data.userId, name: data.name, role: (data.role as string).toLowerCase() as UserRole, email: '', picture: data.picture },
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
        user: { id: data.userId, name: data.name, role: (data.role as string).toLowerCase() as UserRole, email: formData.email },
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const rt = localStorage.getItem('refreshToken');
    set({ user: null, isAuthenticated: false });
    clearAuth();
    ['role','name','userId','picture','accessToken','refreshToken',
     'userRole','userName','userPicture','pendingAction','ws360_chat_state'].forEach(k => {
      try { localStorage.removeItem(k); } catch {}
      try { sessionStorage.removeItem(k); } catch {}
    });
    try { if (rt) await authApi.logout(rt); } catch {}
  },
}));