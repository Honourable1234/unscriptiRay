import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export const useNotificationService = () => {
  const { token } = useAuth();

  const getUnreadCount = () =>
    api.get('/notifications/unread-count', token ?? undefined);

  const getNotifications = () =>
    api.get('/notifications', token ?? undefined);

  return { getUnreadCount, getNotifications };
};
