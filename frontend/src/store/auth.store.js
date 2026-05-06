import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '../services/auth.service';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await authService.login(credentials);
          const { user } = res.data.data;
          set({ user, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.signup(data);
          const { user } = res.data.data;
          set({ user, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (err) {
          console.error("Logout failed", err);
        }
        set({ user: null });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
