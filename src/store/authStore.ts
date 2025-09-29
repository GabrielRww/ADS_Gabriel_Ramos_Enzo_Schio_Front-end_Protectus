import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type User } from '@/lib/api';

export type UserRole = 'cliente' | 'funcionario';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login({ email, password });
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            if (token) apiService.setToken(token);
            try { localStorage.setItem('protectus-user', JSON.stringify(user)); } catch {}
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              error: response.error || 'Erro no login', 
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: 'Erro de conexão com o servidor', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async () => {
        // Logout local — sem chamadas ao backend
        apiService.clearToken();
        try { localStorage.removeItem('protectus-user'); } catch {}
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(userData);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            apiService.setToken(token);
            try { localStorage.setItem('protectus-user', JSON.stringify(user)); } catch {}
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              error: response.error || 'Erro no cadastro', 
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: 'Erro de conexão com o servidor', 
            isLoading: false 
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        // Sem request ao backend. Confia no estado persistido/local.
        const token = localStorage.getItem('protectus-token');
        if (token) {
          apiService.setToken(token);
        }
        const current = get().user;
        set({ isAuthenticated: !!current, isLoading: false });
      }
    }),
    {
      name: 'protectus-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);