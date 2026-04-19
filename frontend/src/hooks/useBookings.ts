import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

export interface Booking {
  id: string;
  bookingNumber: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  status: string;
  adults: number;
  children: number;
  totalAmount: number;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType: {
      name: string;
      basePrice: number;
    };
  };
  payment?: {
    id: string;
    status: string;
    amount: number;
    invoiceNumber: string;
    paidAt?: string;
  };
}

export function useBookings(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () =>
      api.get('/bookings', { params }).then((r) => r.data),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => api.get(`/bookings/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
      adults?: number;
      children?: number;
      specialRequests?: string;
    }) => api.post('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Booking created successfully!');
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking confirmed');
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/check-in`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Guest checked in successfully');
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/check-out`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Guest checked out successfully');
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled');
    },
  });
}
