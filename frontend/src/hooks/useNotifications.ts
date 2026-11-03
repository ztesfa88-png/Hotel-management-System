import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const response = await api.get('/notifications', { params: { page, limit } });
      return { data: response.data.data, meta: response.data.meta };
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () =>
      api.get('/notifications/unread-count').then((r) => r.data.data),
    refetchInterval: 30 * 1000,
    enabled: !!user,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
