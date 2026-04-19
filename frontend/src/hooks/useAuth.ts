import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { disconnectSocket } from '../lib/socket';

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

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginData) => api.post('/auth/login', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);

      if (user.role === 'GUEST') {
        navigate('/bookings');
      } else {
        navigate('/dashboard');
      }
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterData) => api.post('/auth/register', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
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
      disconnectSocket();
      navigate('/login');
      toast.success('Logged out successfully');
    },
  });
}

export function useCurrentUser() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000,
  });
}
