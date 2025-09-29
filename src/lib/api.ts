const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://protectus-back-end-production.up.railway.app';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  role: 'cliente' | 'funcionario';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'cliente' | 'funcionario';
  avatar?: string;
  phone?: string;
  cpf?: string;
  cep?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('protectus-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de rede',
      };
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('protectus-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('protectus-token');
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    // Backend espera campo 'senha' e rota '/auth/login-cliente'
    const resp = await this.request<any>('/auth/login-cliente', {
      method: 'POST',
      body: JSON.stringify({ email: credentials.email, senha: credentials.password }),
    });

    if (!resp.success) return resp as ApiResponse<any>;

    const raw = resp.data || {};
    const token = raw.access_token || raw.token;
    const rawUser = (raw.user as Partial<User>) || raw.data?.user || {};
    // Normaliza o usuário para garantir role e campos mínimos
    const user: User = {
      id: (rawUser as any)?.id || (rawUser as any)?.cod_usuario || (rawUser as any)?.cod_cliente || credentials.email,
      name: (rawUser as any)?.name || (rawUser as any)?.nome || (rawUser as any)?.des_usuario || credentials.email.split('@')[0],
      email: (rawUser as any)?.email || credentials.email,
      role: ((rawUser as any)?.role as User['role']) || 'cliente',
    };
    return { success: true, data: { user, token } };
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token?: string }>> {
    // Backend de cadastro de cliente em '/users/cliente'
    const payload = {
      des_usuario: userData.name,
      nome: userData.name,
      email: userData.email,
      telefone: (userData.phone || '').replace(/\D/g, ''),
      cpf: (userData.cpf || '').replace(/\D/g, ''),
      cep: (userData.cep || '').replace(/\D/g, ''),
      endereco: userData.address,
      bairro: 'Centro', // valores padrão até termos CEP->endereço
      cidade: 'Cidade Exemplo',
      estado: 'SP',
      senha: userData.password,
      role: userData.role,
    };

    const resp = await this.request<any>('/users/cliente', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!resp.success) return resp as ApiResponse<any>;

    // Muitas APIs não retornam token no cadastro; normalizamos o usuário básico
    const created = resp.data || {};
    const user: User = {
      id: created.id || created.cod_usuario || created.cod_cliente || created.cod || created.email,
      name: created.nome || created.des_usuario || userData.name,
      email: created.email || userData.email,
      role: (created.role || userData.role || 'cliente') as User['role'],
    };
    const token = created.access_token || created.token; // se existir
    return { success: true, data: { user, token } };
  }

  async getProfile(): Promise<ApiResponse<User>> {
    // Sem chamada ao backend por enquanto
    const userStr = localStorage.getItem('protectus-user');
    if (userStr) {
      return { success: true, data: JSON.parse(userStr) } as ApiResponse<User>;
    }
    return { success: false, error: 'Sem usuário em cache' };
  }

  async logout(): Promise<ApiResponse> {
    // Sem chamada ao backend
    this.clearToken();
    return { success: true };
  }

  // Apólices — protegidas por flag para evitar chamadas a rotas inexistentes.
  private policiesApiEnabled() {
    return (import.meta as any).env?.VITE_POLICIES_API === 'true';
  }

  async getPolicies(): Promise<ApiResponse<any[]>> {
    if (!this.policiesApiEnabled()) return { success: true, data: [] };
    return this.request<any[]>('/policies');
  }

  async createPolicy(policyData: any): Promise<ApiResponse<any>> {
    if (!this.policiesApiEnabled()) return { success: false, error: 'Policies API disabled' };
    return this.request<any>('/policies', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
  }

  async updatePolicy(id: string, policyData: any): Promise<ApiResponse<any>> {
    if (!this.policiesApiEnabled()) return { success: false, error: 'Policies API disabled' };
    return this.request<any>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });
  }

  async deletePolicy(id: string): Promise<ApiResponse> {
    if (!this.policiesApiEnabled()) return { success: false, error: 'Policies API disabled' } as ApiResponse;
    return this.request(`/policies/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadPolicyPdf(id: string): Promise<Blob | null> {
    if (!this.policiesApiEnabled()) return null;
    try {
      const url = `${this.baseURL}/policies/${id}/pdf`;
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
      });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      if (blob && (resp.headers.get('content-type')?.includes('pdf') || blob.size > 0)) {
        return blob;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Propostas
  async getProposals(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/proposals');
  }

  async createProposal(proposalData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async updateProposal(id: string, proposalData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(proposalData),
    });
  }

  async deleteProposal(id: string): Promise<ApiResponse> {
    return this.request(`/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  // Clientes (para funcionários)
  async getClients(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/clients');
  }

  // Rastreadores
  async getTrackers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/trackers');
  }

  async createTracker(trackerData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/trackers', {
      method: 'POST',
      body: JSON.stringify(trackerData),
    });
  }

  // Incidentes
  async getIncidents(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/incidents');
  }

  async createIncident(incidentData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  }

  async updateIncident(id: string, incidentData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incidentData),
    });
  }

  // Simulação de seguro
  async simulateInsurance(simulationData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/simulate', {
      method: 'POST',
      body: JSON.stringify(simulationData),
    });
  }
}

export const apiService = new ApiService();