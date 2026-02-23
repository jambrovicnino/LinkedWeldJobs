import { create } from 'zustand';
import api from '@/lib/api';

interface NotificationState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.data?.count ?? 0 });
    } catch {
      // ignore
    }
  },
}));
