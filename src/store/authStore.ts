import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type User } from '@/lib/api';
import { parseApiError, type ErrorInfo } from '@/utils/errorMessages';

export type UserRole = 'cliente' | 'funcionario' | 'gerente';

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
  errors: ErrorInfo[];
  login: (email: string, password: string, roleHint?: 'cliente' | 'funcionario') => Promise<boolean>;
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
      errors: [],

      login: async (email: string, password: string, roleHint?: 'cliente' | 'funcionario') => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login({ email, password, roleHint });
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            if (token) apiService.setToken(token);
            
            // Preserva dados do usuário anterior quando o backend não os retorna
            let previous: any = {};
            try { 
              const prevStr = localStorage.getItem('protectus-user'); 
              if (prevStr) {
                previous = JSON.parse(prevStr);
                console.log('Login: Dados anteriores encontrados', {
                  prevEmail: previous?.email,
                  prevPhone: previous?.phone,
                  prevCpf: previous?.cpf,
                  prevAddress: previous?.address
                });
              }
            } catch {}
            
            // Só mescla dados anteriores se for o MESMO usuário (mesmo email)
            const shouldMerge = previous?.email && previous.email === user.email;
            
            let merged = {
              ...user,
              phone: user.phone || (shouldMerge ? previous?.phone : undefined),
              cpf: user.cpf || (shouldMerge ? previous?.cpf : undefined),
              cep: user.cep || (shouldMerge ? previous?.cep : undefined),
              address: user.address || (shouldMerge ? previous?.address : undefined),
              addressNumber: user.addressNumber || (shouldMerge ? previous?.addressNumber : undefined),
            } as User;
            
            console.log('Login: Usuário mesclado', {
              userFromBackend: { id: user.id, name: user.name, email: user.email, phone: user.phone, cpf: user.cpf },
              merged: { id: merged.id, name: merged.name, email: merged.email, phone: merged.phone, cpf: merged.cpf, address: merged.address },
              shouldMerge
            });
            
            // Opcionalmente hidrata dados do perfil via API se habilitado
            try {
              const env: any = (import.meta as any).env || {};
              const canProfile = String(env.VITE_PROFILE_API) === 'true' && !!env.VITE_PROFILE_CLIENTE_GET_PATH;
              if (canProfile && token) {
                const prof = await apiService.fetchClienteProfile({ id: user.id, email: user.email });
                if (prof.success && prof.data) {
                  merged = { ...merged, ...prof.data } as User;
                  console.log('Login: Perfil enriquecido via API', prof.data);
                }
              }
            } catch (e) {
              console.log('Login: Erro ao buscar perfil via API', e);
            }
            
            localStorage.setItem('protectus-user', JSON.stringify(merged));
            if (token) localStorage.setItem('protectus-token', token);
            set({ 
              user: merged, 
              isAuthenticated: true, 
              isLoading: false,
              error: null,
              errors: []
            });
            return true;
          } else {
            const errorInfo = parseApiError(response.error);
            set({ 
              error: response.error || 'Erro no login',
              errors: errorInfo,
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          const errorInfo = parseApiError('Erro de conexão com o servidor');
          set({ 
            error: 'Erro de conexão com o servidor',
            errors: errorInfo,
            isLoading: false 
          });
          return false;
        }
      },

      logout: async () => {
        // Logout local — sem chamadas ao backend
        apiService.clearToken();
        // NÃO remove protectus-user para preservar dados entre sessões
        // try { localStorage.removeItem('protectus-user'); } catch {}
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null,
          errors: []
        });
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null, errors: [] });
        
        try {
          const response = await apiService.register(userData);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // Enriquece o user com os dados do formulário que podem não ter vindo do backend
            const enrichedUser = {
              ...user,
              phone: user.phone || userData.phone,
              cpf: user.cpf || userData.cpf,
              cep: user.cep || userData.cep,
              address: user.address || userData.address,
            };
            
            console.log('Register: Usuário enriquecido', {
              fromBackend: { phone: user.phone, cpf: user.cpf },
              fromForm: { phone: userData.phone, cpf: userData.cpf, address: userData.address },
              enriched: { phone: enrichedUser.phone, cpf: enrichedUser.cpf, address: enrichedUser.address }
            });
            
            // Se o backend NÃO retornar token no cadastro, faz login automático
            if (!token || !String(token).trim()) {
              // Salva os dados enriquecidos ANTES do login para garantir persistência
              console.log('Register: Salvando dados antes do auto-login', enrichedUser);
              try { localStorage.setItem('protectus-user', JSON.stringify(enrichedUser)); } catch {}
              
              // Reutiliza o fluxo de login da store para garantir hidratação de perfil e persistências
              const ok = await get().login(userData.email, userData.password, 'cliente');
              
              // CRÍTICO: Força a re-salvamento dos dados após login, pois o login pode ter sobrescrito
              try {
                const currentUser = get().user;
                if (currentUser) {
                  const mergedAfterLogin = {
                    ...currentUser,
                    phone: currentUser.phone || enrichedUser.phone || userData.phone,
                    cpf: currentUser.cpf || enrichedUser.cpf || userData.cpf,
                    cep: currentUser.cep || enrichedUser.cep || userData.cep,
                    address: currentUser.address || enrichedUser.address || userData.address,
                  };
                  console.log('Register: Re-salvando após auto-login', mergedAfterLogin);
                  localStorage.setItem('protectus-user', JSON.stringify(mergedAfterLogin));
                  set({ user: mergedAfterLogin });
                }
              } catch (e) {
                console.error('Register: Erro ao re-salvar após login', e);
              }
              
              set({ isLoading: false });
              return ok;
            }

            // Se recebeu token, mantém o comportamento atual
            apiService.setToken(token);
            try { 
              localStorage.setItem('protectus-user', JSON.stringify(enrichedUser));
              if (token) localStorage.setItem('protectus-token', token);
            } catch {}
            set({ 
              user: enrichedUser, 
              isAuthenticated: true, 
              isLoading: false,
              error: null,
              errors: []
            });
            return true;
          } else {
            const errorInfo = parseApiError(response.error);
            set({ 
              error: response.error || 'Erro no cadastro',
              errors: errorInfo,
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          const errorInfo = parseApiError('Erro de conexão com o servidor');
          set({ 
            error: 'Erro de conexão com o servidor',
            errors: errorInfo,
            isLoading: false 
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null, errors: [] });
      },

      checkAuth: async () => {
        // Sem request ao backend. Confia no estado persistido/local.
        const token = localStorage.getItem('protectus-token');
        if (token) {
          apiService.setToken(token);
        }
        let current = get().user;
        // Se perfil habilitado e temos user/token, tenta reidratar dados ausentes
        try {
          const env: any = (import.meta as any).env || {};
          const canProfile = String(env.VITE_PROFILE_API) === 'true' && !!env.VITE_PROFILE_CLIENTE_GET_PATH;
          if (canProfile && token && current) {
            const prof = await apiService.fetchClienteProfile({ id: current.id, email: current.email });
            if (prof.success && prof.data) {
              current = { ...current, ...(prof.data as any) } as any;
              try { localStorage.setItem('protectus-user', JSON.stringify(current)); } catch {}
            }
          }
        } catch {}
        set({ isAuthenticated: !!current, user: current || null, isLoading: false });
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