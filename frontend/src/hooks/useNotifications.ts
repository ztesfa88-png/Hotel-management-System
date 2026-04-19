import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () =>
      api.get('/notifications', { params: { page, limit } }).then((r) => r.data),
  });
}

export function useUnreadCount() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    socket.on(`notification:${user.id}`, () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    });

    return () => {
      socket.off(`notification:${user.id}`);
    };
  }, [user, queryClient]);

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
