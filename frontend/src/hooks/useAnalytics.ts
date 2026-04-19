import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data.data),
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () =>
      api.get('/analytics/revenue', { params: { period } }).then((r) => r.data.data),
  });
}

export function useBookingTrends(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: ['analytics', 'bookings', 'trends', period],
    queryFn: () =>
      api.get('/analytics/bookings/trends', { params: { period } }).then((r) => r.data.data),
  });
}

export function useRoomTypeStats() {
  return useQuery({
    queryKey: ['analytics', 'rooms', 'stats'],
    queryFn: () => api.get('/analytics/rooms/stats').then((r) => r.data.data),
  });
}

export function useOccupancyByMonth() {
  return useQuery({
    queryKey: ['analytics', 'occupancy'],
    queryFn: () => api.get('/analytics/occupancy').then((r) => r.data.data),
  });
}
