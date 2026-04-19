import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  description?: string;
  images: string[];
  isActive: boolean;
  roomTypeId: string;
  roomType: {
    id: string;
    name: string;
    basePrice: number;
    maxGuests: number;
    amenities: string[];
    description?: string;
  };
  createdAt: string;
}

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  roomTypeId?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}

export function useRooms(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  roomTypeId?: string;
}) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () =>
      api.get('/rooms', { params }).then((r) => r.data.data),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => api.get(`/rooms/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useSearchRooms(params: SearchParams) {
  return useQuery({
    queryKey: ['rooms', 'search', params],
    queryFn: () => api.get('/rooms/search', { params }).then((r) => r.data.data),
    enabled: !!(params.checkIn && params.checkOut),
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post('/rooms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully');
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/rooms/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated successfully');
    },
  });
}

export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/rooms/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room status updated');
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/rooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deactivated');
    },
  });
}

export function useRoomTypes() {
  return useQuery({
    queryKey: ['roomTypes'],
    queryFn: () => api.get('/room-types').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post('/room-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
      toast.success('Room type created successfully');
    },
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/room-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
      toast.success('Room type updated successfully');
    },
  });
}

export function useDeleteRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/room-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
      toast.success('Room type deleted');
    },
  });
}
