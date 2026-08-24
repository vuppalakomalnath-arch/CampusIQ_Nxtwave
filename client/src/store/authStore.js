import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('campusiq_token');
      const storedUser = localStorage.getItem('campusiq_user');
      if (storedToken && storedUser) {
        try {
          set({
            token: storedToken,
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (e) {
          localStorage.removeItem('campusiq_token');
          localStorage.removeItem('campusiq_user');
        }
      }
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusiq_token', token);
      localStorage.setItem('campusiq_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  updateUser: (updatedUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusiq_user', JSON.stringify(updatedUser));
    }
    set({ user: updatedUser });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
