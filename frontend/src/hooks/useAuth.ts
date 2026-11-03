import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export function useLogin(redirectTo?: string) {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginData) => api.post('/auth/login', data),
    onSuccess: (response) => {
      const { user } = response.data.data;
      setAuth(user);
      toast.success(`Welcome back, ${user.firstName}!`);

      const fallback = user.role === 'GUEST' ? '/bookings' : '/dashboard';
      const destination = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : fallback;
      navigate(destination);
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterData) => api.post('/auth/register', data),
    onSuccess: (response) => {
      const { user } = response.data.data;
      setAuth(user);
      toast.success('Account created successfully!');
      navigate('/bookings');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    },
  });
}

export function useCurrentUser() {
  const { user, setAuth } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/auth/me').then((r) => {
      setAuth(r.data.data);
      return r.data.data;
    }),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
}
