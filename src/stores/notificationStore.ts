import { create } from 'zustand';
import api from '@/services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pollingInterval: ReturnType<typeof setInterval> | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  // Legacy compatibility
  setNotifications: (role: 'company' | 'gov') => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pollingInterval: null,

  fetchNotifications: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await api.get('/notifications');
      const { notifications, unread_count } = res.data;
      set({ notifications, unreadCount: unread_count });
    } catch (err) {
      // Silently fail (user may not be logged in)
    }
  },

  startPolling: () => {
    const existingInterval = get().pollingInterval;
    if (existingInterval) clearInterval(existingInterval);
    // Initial fetch
    get().fetchNotifications();
    const interval = setInterval(() => {
      get().fetchNotifications();
    }, 30000); // Poll every 30 seconds
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        return { notifications: updated, unreadCount: updated.filter((n) => !n.is_read).length };
      });
    } catch (err) {
      // Optimistic update even on failure
      set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/notifications/read-all');
    } catch (err) {}
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  // Legacy shim for existing code that calls setNotifications('company')
  setNotifications: (_role) => {
    get().startPolling();
  },
}));
