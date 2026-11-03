import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; data?: { message?: string } }>) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRequest = /\/auth\/(login|register|logout|refresh)$/.test(requestUrl);

    if (status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    } else if (status && status !== 401) {
      toast.error(error.response?.data?.data?.message || error.response?.data?.message || 'An error occurred');
    }

    return Promise.reject(error);
  },
);

export default api;
