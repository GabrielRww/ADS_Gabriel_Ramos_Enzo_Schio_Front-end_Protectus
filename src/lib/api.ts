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
  role: 'cliente' | 'funcionario' | 'gerente';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'cliente' | 'funcionario' | 'gerente';
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
    // Endpoints configuráveis
    const env: any = (import.meta as any).env || {};
    const pathCliente = env.VITE_LOGIN_CLIENTE_PATH || '/auth/login-cliente';
    const pathFuncionario = env.VITE_LOGIN_FUNCIONARIO_PATH || '/auth/login-funcionario';

    // Envia ambos os campos para evitar tentativas duplicadas e ruído de 401/400
    const payload = { email: credentials.email, senha: credentials.password, password: credentials.password };
    const tryLogin = async (path: string) => this.request<any>(path, { method: 'POST', body: JSON.stringify(payload) });

    let resp = await tryLogin(pathCliente);
    if (!resp.success) {
      const tryFunc = await tryLogin(pathFuncionario);
      if (tryFunc.success) resp = tryFunc; else return resp as ApiResponse<any>;
    }

    const raw = resp.data || {};
    const token = raw.access_token || raw.token;
    const rawUser = (raw.user as Partial<User>) || raw.data?.user || {};
    // Normaliza o usuário para garantir role e campos mínimos
    const isManager =
      (rawUser as any)?.IndGerente === 1 ||
      (rawUser as any)?.IndGerente === '1' ||
      (rawUser as any)?.ind_gerente === 1 ||
      (rawUser as any)?.ind_gerente === '1' ||
      (rawUser as any)?.gerente === true ||
      String((rawUser as any)?.cargo || '').toLowerCase() === 'gerente';
    const role: User['role'] = isManager
      ? 'gerente'
      : (((rawUser as any)?.role as any) === 'funcionario' ? 'funcionario' : 'cliente');
    const user: User = {
      id: (rawUser as any)?.id || (rawUser as any)?.cod_usuario || (rawUser as any)?.cod_cliente || credentials.email,
      name: (rawUser as any)?.name || (rawUser as any)?.nome || (rawUser as any)?.des_usuario || credentials.email.split('@')[0],
      email: (rawUser as any)?.email || credentials.email,
      role,
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

  // ===== Perfil do usuário (opcionalmente no backend) =====
  private profileApiEnabled() {
    return (import.meta as any).env?.VITE_PROFILE_API === 'true';
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    // Quando desabilitado, não faz rede; apenas retorna sucesso para fluxo local
    if (!this.profileApiEnabled()) {
      return { success: true, data: { ...(data as any), id: userId } as User };
    }
    const path = ((import.meta as any).env?.VITE_PROFILE_UPDATE_PATH as string) || '/users/cliente';
    // Heurística: PATCH em path; se precisar id no caminho, suporta token {id}
    const endpoint = path.includes('{id}') ? path.replace('{id}', encodeURIComponent(userId)) : path;
    return this.request<User>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(userId: string, file: File | Blob): Promise<ApiResponse<{ url: string }>> {
    if (!this.profileApiEnabled()) {
      // Sem backend: devolve URL local (object URL) apenas para UX temporária
      const url = URL.createObjectURL(file);
      return { success: true, data: { url } };
    }
    const path = ((import.meta as any).env?.VITE_AVATAR_UPLOAD_PATH as string) || '/users/avatar';
    const endpoint = path.includes('{id}') ? path.replace('{id}', encodeURIComponent(userId)) : path;

    const form = new FormData();
    form.append('avatar', file);
    try {
      const resp = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          // Não definir Content-Type manualmente para FormData
        } as any,
        body: form,
      });
      if (!resp.ok) {
        return { success: false, error: `HTTP ${resp.status}: ${resp.statusText}` };
      }
      const data = await resp.json().catch(() => ({}));
      const url = (data?.url || data?.avatarUrl || data?.avatar || '') as string;
      return { success: true, data: { url } };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha no upload' };
    }
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

  // Funcionários (rotas: /users/funcionario; GET via params; POST/PUT via body)
  private buildQuery(params?: Record<string, any>) {
    if (!params) return '';
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (!entries.length) return '';
    const qs = entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return `?${qs}`;
  }

  async getFuncionarios(params?: Record<string, any>): Promise<ApiResponse<any[]>> {
    const qs = this.buildQuery(params);
    return this.request<any[]>(`/users/funcionario${qs}`);
  }

  async createFuncionario(data: any): Promise<ApiResponse<any>> {
    // Mapeia nomes comuns; backend aceita body
    const payload = {
      ...data,
      nome: data.nome ?? data.des_usuario ?? data.name,
      des_usuario: data.des_usuario ?? data.nome ?? data.name,
      email: data.email,
      telefone: (data.telefone ?? data.phone ?? '').replace?.(/\D/g, '') ?? data.telefone,
      cpf: (data.cpf ?? data.documento ?? '').replace?.(/\D/g, '') ?? data.cpf,
      cidade: data.cidade ?? data.city,
      estado: data.estado ?? data.uf,
      senha: data.senha ?? data.password,
      // Flag de gerente em camelCase solicitado: IndGerente (== 1)
      IndGerente: Number(data.indGerente ?? data.IndGerente ?? data.ind_gerente ?? 0) === 1 ? 1 : 0,
    };
    return this.request<any>('/users/funcionario', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateFuncionario(data: any): Promise<ApiResponse<any>> {
    const payload = {
      ...data,
      nome: data.nome ?? data.des_usuario ?? data.name,
      des_usuario: data.des_usuario ?? data.nome ?? data.name,
      telefone: (data.telefone ?? data.phone ?? '').replace?.(/\D/g, '') ?? data.telefone,
      cpf: (data.cpf ?? data.documento ?? '').replace?.(/\D/g, '') ?? data.cpf,
      IndGerente: Number(data.indGerente ?? data.IndGerente ?? data.ind_gerente ?? 0) === 1 ? 1 : 0,
    };
    return this.request<any>('/users/funcionario', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async inativaFuncionario(data: any): Promise<ApiResponse<any>> {
    const payload = {
      cod_funcionario: data.cod_funcionario ?? data.id ?? data.cod,
      ...data,
    };
    return this.request<any>('/users/inativa-funcionario', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
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