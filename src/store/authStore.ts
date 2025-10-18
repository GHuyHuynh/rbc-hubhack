/**
 * Authentication state management using Zustand
 */

import { create } from 'zustand';
import type { User, Hero, Requester } from '@/lib/types';
import {
  getCurrentUser,
  getUserByEmail,
  createUser,
  setCurrentUserId,
  logout as logoutStorage,
} from '@/lib/localStorage';
import { verifyPassword } from '@/lib/utils';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const user = getUserByEmail(email);

      if (!user) {
        set({ error: 'Invalid email or password', isLoading: false });
        return false;
      }

      if (!verifyPassword(password, user.password)) {
        set({ error: 'Invalid email or password', isLoading: false });
        return false;
      }

      setCurrentUserId(user.id);
      set({ user, isLoading: false, error: null });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (userData: Omit<User, 'id' | 'createdAt'>) => {
    set({ isLoading: true, error: null });

    try {
      const newUser = createUser(userData);
      setCurrentUserId(newUser.id);
      set({ user: newUser, isLoading: false, error: null });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    logoutStorage();
    set({ user: null, error: null });
  },

  refreshUser: () => {
    const user = getCurrentUser();
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useIsHero = () => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'hero';
};
export const useIsRequester = () => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'requester';
};

// Type-safe user getters
export const useHero = (): Hero | null => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'hero' ? (user as Hero) : null;
};

export const useRequesterUser = (): Requester | null => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'requester' ? (user as Requester) : null;
};
