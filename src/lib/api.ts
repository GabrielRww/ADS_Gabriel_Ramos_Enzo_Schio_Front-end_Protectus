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
  roleHint?: 'cliente' | 'funcionario';
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
  email: string;
  name?: string; // Adicionando propriedade name que estava sendo usada
  role: 'cliente' | 'funcionario' | 'gerente';
  avatar?: string;
  phone?: string;
  cpf?: string;
  cep?: string;
  address?: string;
  addressNumber?: string;
  created_at?: string;
  updated_at?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    const stored = localStorage.getItem('protectus-token');
    // Sanitiza tokens inválidos ('undefined', 'null', vazio)
    if (!stored || stored === 'undefined' || stored === 'null') {
      this.token = null;
      try { localStorage.removeItem('protectus-token'); } catch {}
    } else {
      this.token = stored;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const isGet = !options.method || String(options.method).toUpperCase() === 'GET';
    const headersIn = (options.headers || {}) as Record<string, any>;
    const skipAuth = headersIn['X-Skip-Auth'] === true || headersIn['X-Skip-Auth'] === 'true';
    const baseHeaders: Record<string, any> = {
      Accept: 'application/json',
      ...(!skipAuth && this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
    // Só define Content-Type quando houver body não-FormData
    const hasBody = typeof (options as any).body !== 'undefined' && (options as any).body !== null;
    const isFormData = hasBody && typeof FormData !== 'undefined' && (options as any).body instanceof FormData;
    if (!isGet && hasBody && !isFormData) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    // Remove nossa flag interna antes do envio
    const { ['X-Skip-Auth']: _skip, ...restHeaders } = headersIn;
    const config: RequestInit = {
      ...options,
      headers: {
        ...baseHeaders,
        ...restHeaders,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Tratamento específico para erros estruturados do backend
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Formato: { "errors": [[{ "status": 400, "title": "...", "details": "..." }]] }
          const messages: string[] = [];
          errorData.errors.forEach((errorGroup: any) => {
            if (Array.isArray(errorGroup)) {
              errorGroup.forEach((error: any) => {
                if (error.details) {
                  messages.push(error.details);
                } else if (error.title) {
                  messages.push(error.title);
                }
              });
            }
          });
          if (messages.length > 0) {
            errorMessage = messages.join('; ');
          }
        } else if (errorData.message) {
          // Formato simples: { "message": "..." }
          errorMessage = errorData.message;
        } else if (errorData.error) {
          // Formato alternativo: { "error": "..." }
          errorMessage = errorData.error;
        } else if (errorData.details) {
          // Formato alternativo: { "details": "..." }
          errorMessage = errorData.details;
        }
        
        return {
          success: false,
          error: errorMessage,
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

  setToken(token: any) {
    if (typeof token !== 'string' || !token.trim()) {
      // token inválido: limpa
      this.clearToken();
      return;
    }
    this.token = token;
    try { localStorage.setItem('protectus-token', token); } catch {}
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

    // Backend espera apenas { email, senha }
    const payload = { email: credentials.email, senha: credentials.password };
    const tryLogin = async (path: string) => this.request<any>(path, { method: 'POST', body: JSON.stringify(payload), headers: { 'X-Skip-Auth': 'true' } });

    const preferFuncionario = credentials.roleHint === 'funcionario';
    const firstPath = preferFuncionario ? pathFuncionario : pathCliente;
    const secondPath = preferFuncionario ? pathCliente : pathFuncionario;

    let resp = await tryLogin(firstPath);
    if (!resp.success) {
      const trySecond = await tryLogin(secondPath);
      if (trySecond.success) resp = trySecond; else return resp as ApiResponse<any>;
    }

    const raw = resp.data || {};
    const token = (raw as any).access_token as string | undefined;
    const rawUser = (raw as any)?.user || {};
    // Normaliza o usuário para garantir role e campos mínimos
    const isManager = Boolean((rawUser as any)?.gerente === true || Number((rawUser as any)?.indGerente) === 1);
    const role: User['role'] = isManager
      ? 'gerente'
      : ((rawUser as any)?.tipo === 'funcionario' ? 'funcionario' : 'cliente');
    const phoneRaw = (rawUser as any)?.telefone || (rawUser as any)?.phone || (rawUser as any)?.celular || (rawUser as any)?.cel || (rawUser as any)?.tel;
    const cpfRaw = (rawUser as any)?.cpf || (rawUser as any)?.documento || (rawUser as any)?.doc;
    const user: User = {
      id: (rawUser as any)?.codFuncionario || (rawUser as any)?.codCliente || (rawUser as any)?.id || credentials.email,
      name: (rawUser as any)?.nome || (rawUser as any)?.name || (rawUser as any)?.des_usuario || credentials.email.split('@')[0],
      email: (rawUser as any)?.email || credentials.email,
      role,
      phone: typeof phoneRaw === 'string' ? phoneRaw : (typeof phoneRaw === 'number' ? String(phoneRaw) : undefined),
      cpf: typeof cpfRaw === 'string' ? cpfRaw : (typeof cpfRaw === 'number' ? String(cpfRaw) : undefined),
    };
    return { success: true, data: { user, token } };
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token?: string }>> {
    // Backend de cadastro de cliente em '/users/cliente' (DTO exige apenas estes campos)
    const payload = {
      nome: userData.name,
      email: userData.email,
      telefone: (userData.phone || '').replace(/\D/g, ''),
      cpf: (userData.cpf || '').replace(/\D/g, ''),
      cep: (userData.cep || '').replace(/\D/g, ''),
      senha: userData.password,
      status: 1, // Garante que o cliente fica ativo imediatamente
    };

    const resp = await this.request<any>('/users/cliente', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!resp.success) return resp as ApiResponse<any>;

    // Muitas APIs não retornam token no cadastro; normalizamos o usuário básico
    const created = resp.data || {};
    const phoneRaw = created.telefone || created.phone || userData.phone;
    const cpfRaw = created.cpf || created.documento || userData.cpf;
    const cepRaw = created.cep || userData.cep;
    const user: User = {
      id: created.id || created.codCliente || created.cod_cliente || created.cod || created.email || userData.email,
      name: created.nome || created.des_usuario || userData.name,
      email: created.email || userData.email,
      role: 'cliente',
      phone: typeof phoneRaw === 'string' ? phoneRaw : (typeof phoneRaw === 'number' ? String(phoneRaw) : userData.phone),
      cpf: typeof cpfRaw === 'string' ? cpfRaw : (typeof cpfRaw === 'number' ? String(cpfRaw) : userData.cpf),
      cep: typeof cepRaw === 'string' ? cepRaw : (typeof cepRaw === 'number' ? String(cepRaw) : userData.cep),
      address: userData.address, // Sempre pega do formulário pois backend não tem
    };
    
    console.log('API Register: Resposta do backend', created);
    console.log('API Register: User construído', user);
    console.log('API Register: userData original', { phone: userData.phone, cpf: userData.cpf, cep: userData.cep, address: userData.address });
    
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

  // Tenta buscar perfil completo do cliente no backend (telefone/cpf)
  async fetchClienteProfile(hint: { id?: string; email?: string } = {}): Promise<ApiResponse<Partial<User>>> {
    const env: any = (import.meta as any).env || {};
    const enabled = String(env.VITE_PROFILE_API) === 'true';
    if (!enabled) return { success: false, error: 'Profile API disabled' };

    const configuredPath = (env.VITE_PROFILE_CLIENTE_GET_PATH as string) || '';
    if (!configuredPath) return { success: false, error: 'Profile GET path not configured' };

    // Constrói endpoint a partir de placeholders
    let endpoint = configuredPath;
    if (endpoint.includes('{id}') && hint.id) {
      endpoint = endpoint.replace('{id}', encodeURIComponent(hint.id));
    }
    if (endpoint.includes('{email}') && hint.email) {
      endpoint = endpoint.replace('{email}', encodeURIComponent(hint.email));
    }
    // Se não há placeholders, tenta anexar query string básica
    if (!endpoint.includes('{') && !endpoint.includes('}')) {
      const qs: string[] = [];
      if (hint.id && !/\?.+/.test(endpoint)) qs.push(`id=${encodeURIComponent(hint.id)}`);
      if (hint.email && !/\?.+/.test(endpoint)) qs.push(`email=${encodeURIComponent(hint.email)}`);
      if (qs.length) endpoint += (endpoint.includes('?') ? '&' : '?') + qs.join('&');
    }

    const resp = await this.request<any>(endpoint);
    if (!resp.success || !resp.data) return resp as ApiResponse<any>;
    const raw = resp.data as any;
    const item = Array.isArray(raw) ? raw[0] : (raw.data && Array.isArray(raw.data) ? raw.data[0] : (raw.item || raw));
    if (!item) return { success: false, error: 'Perfil vazio' };
    const phoneRaw = item.telefone || item.phone || item.celular || item.cel || item.tel;
    const cpfRaw = item.cpf || item.documento || item.doc;
    const cepRaw = item.cep || item.CEP || item.zip;
    const addressRaw = item.endereco || item.logradouro || item.address || item.rua;
    const numberRaw = item.numero || item.num_endereco || item.number || item.num;
    const out: Partial<User> = {
      phone: typeof phoneRaw === 'string' ? phoneRaw : (typeof phoneRaw === 'number' ? String(phoneRaw) : undefined),
      cpf: typeof cpfRaw === 'string' ? cpfRaw : (typeof cpfRaw === 'number' ? String(cpfRaw) : undefined),
      cep: typeof cepRaw === 'string' ? cepRaw : (typeof cepRaw === 'number' ? String(cepRaw) : undefined),
      address: typeof addressRaw === 'string' ? addressRaw : undefined,
      addressNumber: typeof numberRaw === 'string' ? numberRaw : (typeof numberRaw === 'number' ? String(numberRaw) : undefined),
    };
    return { success: true, data: out };
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


  // Simulação de seguro
  async simulateInsurance(simulationData: any): Promise<ApiResponse<any>> {
    // Primeiro, tentar criar/verificar cliente se temos CPF
    if (simulationData.cpfCliente) {
      try {
        console.log('👤 Verificando cliente CPF:', simulationData.cpfCliente);
        
        // Primeiro verifica se o cliente já existe
        const existingClient = await this.request<any>(`/users/cliente?cpf=${simulationData.cpfCliente}`, {
          method: 'GET',
        });
        
        if (existingClient.success && existingClient.data && existingClient.data.length > 0) {
          console.log('✅ Cliente já existe, continuando com simulação');
        } else {
          console.log('👤 Cliente não encontrado, criando novo...');
          const clientData = {
            cpf: simulationData.cpfCliente,
            nome: 'Cliente Simulação',
            email: 'cliente@simulacao.com',
            telefone: '00000000000',
            cep: '00000000',
            senha: '123456',
            status: 1
          };
          
          await this.request<any>('/users/cliente', {
            method: 'POST',
            body: JSON.stringify(clientData),
          });
          console.log('✅ Cliente criado com sucesso');
        }
      } catch (clientError) {
        console.log('⚠️ Erro ao verificar/criar cliente (continuando):', clientError);
        // Não é um erro crítico, continua com a simulação
      }
    }

    return this.request<any>('/insurances/seguro-veiculo', {
      method: 'POST',
      body: JSON.stringify(simulationData),
    });
  }

  // Catálogo de veículos (para simulação): marcas, modelos, anos
  private buildVehicleHeaders(): Record<string, string> {
    const env: any = (import.meta as any).env || {};
    const customHeader = (env.VITE_VEHICLE_AUTH_HEADER as string) || '';
    const customValue = (env.VITE_VEHICLE_AUTH_VALUE as string) || '';
    if (customHeader && customValue) {
      // Suporta placeholder {token}; só injeta se houver token válido
      if (customValue.includes('{token}')) {
        if (!this.token) return {};
        const value = customValue.replace('{token}', this.token);
        return { [customHeader]: value } as Record<string, string>;
      }
      // Valor estático (ex.: x-api-key)
      return { [customHeader]: customValue } as Record<string, string>;
    }
    // Sem custom, rely no Authorization padrão já incluído em request()
    return {};
  }

  async getMarcas(): Promise<ApiResponse<any[]>> {
    const env: any = (import.meta as any).env || {};
    const baseVehicle = (env.VITE_VEHICLE_API_URL as string) || this.baseURL;
    const marcasPath = (env.VITE_VEHICLE_MARCAS_PATH as string) || '/insurances/marcas';
    const url = marcasPath.startsWith('http')
      ? marcasPath
      : `${baseVehicle}${marcasPath.startsWith('/') ? '' : '/'}${marcasPath}`;
    return this.request<any[]>(url, { headers: this.buildVehicleHeaders() });
  }

  async getModelos(params: { marca?: string } = {}): Promise<ApiResponse<any[]>> {
    const env: any = (import.meta as any).env || {};
    const baseVehicle = (env.VITE_VEHICLE_API_URL as string) || this.baseURL;
    const modelosPath = (env.VITE_VEHICLE_MODELOS_PATH as string) || '/insurances/modelos';
    const brandParam = (env.VITE_VEHICLE_PARAM_BRAND as string) || 'marca';
    const qs = params.marca ? `?${brandParam}=${encodeURIComponent(params.marca)}` : '';
    const urlBase = modelosPath.startsWith('http') ? modelosPath : `${baseVehicle}${modelosPath.startsWith('/') ? '' : '/'}${modelosPath}`;
    const url = `${urlBase}${qs}`;
    return this.request<any[]>(url, { headers: this.buildVehicleHeaders() });
  }

  async getAnos(params: { marca?: string; modelo?: string } = {}): Promise<ApiResponse<any[]>> {
    const env: any = (import.meta as any).env || {};
    const baseVehicle = (env.VITE_VEHICLE_API_URL as string) || this.baseURL;
    const anosPath = (env.VITE_VEHICLE_ANOS_PATH as string) || '/insurances/anos';
    const brandParam = (env.VITE_VEHICLE_PARAM_BRAND as string) || 'marca';
    const modelParam = (env.VITE_VEHICLE_PARAM_MODEL as string) || 'modelo';
    const qpMarca = params.marca ? `${brandParam}=${encodeURIComponent(params.marca)}` : '';
    const qpModelo = params.modelo ? `${modelParam}=${encodeURIComponent(params.modelo)}` : '';
    const q = [qpMarca, qpModelo].filter(Boolean).join('&');
    const urlBase = anosPath.startsWith('http') ? anosPath : `${baseVehicle}${anosPath.startsWith('/') ? '' : '/'}${anosPath}`;
    const url = q ? `${urlBase}?${q}` : urlBase;
    return this.request<any[]>(url, { headers: this.buildVehicleHeaders() });
  }

  // Catálogo de celulares
  async getMarcasCelulares(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/insurances/celulares/marcas', {
      method: 'GET',
    });
  }

  async getModelosCelulares(params: { marca?: string } = {}): Promise<ApiResponse<any[]>> {
    let endpoint = '/insurances/celulares/modelos';
    if (params.marca) {
      const queryParams = new URLSearchParams();
      queryParams.append('marca', params.marca);
      endpoint += `?${queryParams.toString()}`;
    }
    return this.request<any[]>(endpoint, {
      method: 'GET',
    });
  }

  async getCoresCelulares(params: { marca?: string; modelo?: string } = {}): Promise<ApiResponse<any[]>> {
    let endpoint = '/insurances/celulares/cores';
    const queryParams = new URLSearchParams();
    if (params.marca) queryParams.append('marca', params.marca);
    if (params.modelo) queryParams.append('modelo', params.modelo);
    if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    
    return this.request<any[]>(endpoint, {
      method: 'GET',
    });
  }

  // Buscar valor FIPE real
  async getValorFipe(params: { marca: string; modelo: string; ano: string }): Promise<ApiResponse<any>> {
    console.log('🚗 Buscando valor FIPE:', params);
    
    try {
      // Primeiro tenta buscar do backend (endpoint correto conforme backend)
      // Tenta diferentes formatos de parâmetros
      const cleanMarca = params.marca.replace(/^(GM\s*-\s*)?/, '').trim(); // Remove "GM - " se presente
      const cleanModelo = params.modelo.replace(/\s+/g, ' ').trim(); // Normaliza espaços
      
      const endpoints = [
        `/insurances/veiculo?marca=${encodeURIComponent(params.marca)}&modelo=${encodeURIComponent(params.modelo)}&ano=${encodeURIComponent(params.ano)}`,
        `/insurances/veiculo?marca=${encodeURIComponent(cleanMarca)}&modelo=${encodeURIComponent(cleanModelo)}&ano=${encodeURIComponent(params.ano)}`,
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log('📡 Tentando endpoint do backend:', endpoint);
          
          const backendResponse = await this.request<any>(endpoint, {
            method: 'GET',
          });
          
          console.log(' Resposta do backend:', backendResponse);
          
          if (backendResponse.success && backendResponse.data) {
            // O backend retorna um objeto CatalogoVeiculosEntity com a propriedade "valor"
            const valorFipe = backendResponse.data.valor;
            
            if (valorFipe) {
              console.log(' Valor FIPE encontrado no backend:', valorFipe);
              return {
                success: true,
                data: {
                  valor: valorFipe,
                  marca: params.marca,
                  modelo: params.modelo,
                  ano: params.ano,
                  fonte: 'BACKEND',
                  ...backendResponse.data // Inclui outros dados que o backend possa retornar
                }
              };
            }
          }
        } catch (endpointError: any) {
          console.log(`❌ Erro no endpoint ${endpoint}:`, {
            status: endpointError?.response?.status || 'unknown',
            statusText: endpointError?.response?.statusText || 'unknown',
            message: endpointError?.message || 'unknown',
            url: endpointError?.config?.url || endpoint,
            data: endpointError?.response?.data || null
          });
          continue; // Tenta o próximo endpoint
        }
      }
      
      // Se não teve sucesso, loga o motivo
      console.log('⚠️ Nenhum endpoint do backend retornou valor FIPE válido, tentando API pública...');
    } catch (error) {
      console.log('❌ Erro geral ao acessar backend FIPE:', error);
      console.log('🔄 Tentando API pública da FIPE...');
    }

    try {
      // Se backend não tiver, usa API pública da FIPE
      // API da FIPE pública (paralelo.ws ou similar)
      const fipeApiUrl = 'https://parallelum.com.br/fipe/api/v1/carros';
      
      // 1. Buscar código da marca
      const marcasResponse = await fetch(`${fipeApiUrl}/marcas`);
      const marcas = await marcasResponse.json();
      const marcaEncontrada = marcas.find((m: any) => 
        m.nome.toLowerCase().includes(params.marca.toLowerCase()) ||
        params.marca.toLowerCase().includes(m.nome.toLowerCase())
      );
      
      if (!marcaEncontrada) {
        return { success: false, error: 'Marca não encontrada na FIPE' };
      }

      // 2. Buscar código do modelo
      const modelosResponse = await fetch(`${fipeApiUrl}/marcas/${marcaEncontrada.codigo}/modelos`);
      const modelosData = await modelosResponse.json();
      const modeloEncontrado = modelosData.modelos?.find((m: any) => 
        m.nome.toLowerCase().includes(params.modelo.toLowerCase()) ||
        params.modelo.toLowerCase().includes(m.nome.toLowerCase())
      );
      
      if (!modeloEncontrado) {
        return { success: false, error: 'Modelo não encontrado na FIPE' };
      }

      // 3. Buscar código do ano
      const anosResponse = await fetch(`${fipeApiUrl}/marcas/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos`);
      const anos = await anosResponse.json();
      const anoEncontrado = anos.find((a: any) => 
        a.nome.includes(params.ano) || a.codigo.includes(params.ano)
      );
      
      if (!anoEncontrado) {
        return { success: false, error: 'Ano não encontrado na FIPE' };
      }

      // 4. Buscar valor FIPE
      const valorResponse = await fetch(`${fipeApiUrl}/marcas/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos/${anoEncontrado.codigo}`);
      const valorData = await valorResponse.json();
      
      if (valorData.Valor) {
        return {
          success: true,
          data: {
            valor: valorData.Valor,
            marca: valorData.Marca,
            modelo: valorData.Modelo,
            anoModelo: valorData.AnoModelo,
            combustivel: valorData.Combustivel,
            codigoFipe: valorData.CodigoFipe,
            mesReferencia: valorData.MesReferencia,
            fonte: 'FIPE_API_PUBLICA'
          }
        };
      }

      return { success: false, error: 'Valor FIPE não encontrado' };
    } catch (error) {
      console.error('Erro ao buscar valor FIPE:', error);
      return { success: false, error: 'Erro ao consultar FIPE' };
    }
  }
}

export const apiService = new ApiService();