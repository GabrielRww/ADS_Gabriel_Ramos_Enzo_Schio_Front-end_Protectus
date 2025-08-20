import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'cliente' | 'funcionario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        try {
          if (!isSupabaseConfigured || !supabase) {
            console.warn('Supabase not configured. Skipping initialize.');
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const user: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                avatar: profile.avatar_url
              };
              set({ user, isAuthenticated: true, isLoading: false });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          if (!isSupabaseConfigured || !supabase) {
            console.warn('Supabase not configured. Login disabled.');
            return false;
          }
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error.message);
            return false;
          }

          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              const user: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                avatar: profile.avatar_url
              };
              set({ user, isAuthenticated: true });
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          if (!isSupabaseConfigured || !supabase) {
            set({ user: null, isAuthenticated: false });
            return;
          }
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      register: async (name: string, email: string, password: string, role: UserRole) => {
        try {
          if (!isSupabaseConfigured || !supabase) {
            console.warn('Supabase not configured. Registration disabled.');
            return false;
          }
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            console.error('Registration error:', error.message);
            return false;
          }

          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name,
                email,
                role: 'cliente', // Sempre cliente no cadastro público
              });

          if (profileError) {
              console.error('Profile creation error:', profileError.message);
              return false;
            }

            const user: User = {
              id: data.user.id,
              name,
              email,
              role: 'cliente'
            };
            
            set({ user, isAuthenticated: true });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      }
    }),
    {
      name: 'perfectus-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Listen to auth changes
if (isSupabaseConfigured && supabase) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { initialize } = useAuthStore.getState();
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      await initialize();
    }
  });
}
