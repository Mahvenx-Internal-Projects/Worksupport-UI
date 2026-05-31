import { create } from 'zustand';
import { notificationsApi } from '../services/endpoints';

interface Notification {
  id: string; type: string; title: string; message: string;
  isRead: boolean; actionUrl?: string; createdAt: string;
}

interface NotifStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await notificationsApi.getAll();
      set({ notifications: data, unreadCount: data.filter((n: Notification) => !n.isRead).length });
    } catch { /* silent fail */ }
    finally { set({ isLoading: false }); }
  },

  markRead: async (id) => {
    await notificationsApi.markRead(id);
    const updated = get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    set({ notifications: updated, unreadCount: updated.filter(n => !n.isRead).length });
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    const updated = get().notifications.map(n => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
  },
}));
