import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthSession } from '../types/golf';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorRequired: boolean;
  twoFactorMethod: 'email' | 'phone' | 'none';
  pendingSession: AuthSession | null;
  token: string | null;
  sessionExpiresAt: Date | null;
  
  // Authentication actions
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  
  // 2FA actions
  requireTwoFactor: (method: 'email' | 'phone') => void;
  completeTwoFactor: (session: AuthSession) => void;
  clearTwoFactor: () => void;
  
  // Session management
  setPendingSession: (session: AuthSession) => void;
  clearPendingSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      twoFactorRequired: false,
      twoFactorMethod: 'none',
      pendingSession: null,
      token: null,
      sessionExpiresAt: null,
      
      login: (session: AuthSession) => {
        set({ 
          user: session.user, 
          isAuthenticated: true, 
          isLoading: false,
          twoFactorRequired: false,
          twoFactorMethod: 'none',
          pendingSession: null,
          token: session.token,
          sessionExpiresAt: session.expiresAt
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          twoFactorRequired: false,
          twoFactorMethod: 'none',
          pendingSession: null,
          token: null,
          sessionExpiresAt: null
        });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      requireTwoFactor: (method: 'email' | 'phone') => {
        set({ 
          twoFactorRequired: true, 
          twoFactorMethod: method 
        });
      },

      completeTwoFactor: (session: AuthSession) => {
        set({ 
          user: session.user, 
          isAuthenticated: true, 
          isLoading: false,
          twoFactorRequired: false,
          twoFactorMethod: 'none',
          pendingSession: null,
          token: session.token,
          sessionExpiresAt: session.expiresAt
        });
      },

      clearTwoFactor: () => {
        set({ 
          twoFactorRequired: false, 
          twoFactorMethod: 'none',
          pendingSession: null
        });
      },

      setPendingSession: (session: AuthSession) => {
        set({ pendingSession: session });
      },

      clearPendingSession: () => {
        set({ pendingSession: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        sessionExpiresAt: state.sessionExpiresAt
      }),
    }
  )
);