import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import {
  LOGIN_BYPASS,
  MOCK_BYPASS_SESSION,
  MOCK_BYPASS_USER,
} from '../../features/auth/model/auth_bypass';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: LOGIN_BYPASS ? MOCK_BYPASS_USER : null,
  session: LOGIN_BYPASS ? MOCK_BYPASS_SESSION : null,
  isAuthenticated: LOGIN_BYPASS ? true : false,
  isLoading: LOGIN_BYPASS ? false : true,

  initialize: async () => {
    // When dev bypass is active, immediately preserve the mock authenticated state across hot & hard reloads
    if (LOGIN_BYPASS) {
      set({
        session: MOCK_BYPASS_SESSION,
        user: MOCK_BYPASS_USER,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      isLoading: false,
    });

    // Listen for auth changes (login/logout)
    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        session: newSession,
        user: newSession?.user || null,
        isAuthenticated: !!newSession,
      });
    });
  },

  setSession: (session) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
    });
  },

  clearSession: async () => {
    if (!LOGIN_BYPASS) {
      await supabase.auth.signOut();
    }
    set({
      session: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
