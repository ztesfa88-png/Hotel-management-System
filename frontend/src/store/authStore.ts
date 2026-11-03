import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'STAFF' | 'GUEST';
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setAuth: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setAuth: (user) => set({ user }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () =>
        set({ user: null }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'hms-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
