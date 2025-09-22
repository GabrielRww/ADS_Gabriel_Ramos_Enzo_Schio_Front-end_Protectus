import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
}

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    role: 'cliente'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@protectus.com',
    role: 'funcionario'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Mock login validation
        const user = mockUsers.find(u => u.email === email);
        
        if (user && password === '123456') {
          set({ user, isAuthenticated: true });
          return true;
        }
        
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      register: async (name: string, email: string, password: string, role: UserRole) => {
        // Verificar se o email já existe
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          return false; // Email já existe
        }

        // Criar novo usuário com dados únicos
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          role
        };
        
        // Adicionar à lista de usuários mock
        mockUsers.push(newUser);
        
        // Limpar qualquer estado anterior e definir o novo usuário
        set({ user: newUser, isAuthenticated: true });
        return true;
      }
    }),
    {
      name: 'protectus-auth'
    }
  )
);