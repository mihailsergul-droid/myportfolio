import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      initializeAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with backend
          fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              set({ user: data.user, token, isAuthenticated: true });
            } else {
              get().logout();
            }
          })
          .catch(() => get().logout());
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;