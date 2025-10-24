// src/service/index.ts
import axios from "axios";

/**
 * CONFIGURAÇÃO CENTRALIZADA DA API
 * Todas as URLs e endpoints estão definidos aqui
 */

// URL Base da API
const API_BASE = "http://localhost:3000";

// Endpoints de Autenticação
const AUTH_ENDPOINTS = {
  loginCliente: "/auth/login-cliente",
  loginFuncionario: "/auth/login-funcionario",
};

// Endpoints de Usuários
const USER_ENDPOINTS = {
  cliente: "/users/cliente",
  funcionario: "/users/funcionario",
  inativaCliente: "/users/inativa-cliente",
  inativaFuncionario: "/users/inativa-funcionario",
};

// Endpoints de Veículos
const VEHICLE_ENDPOINTS = {
  marcas: "/insurances/marcas",
  modelos: "/insurances/modelos",
  anos: "/insurances/anos",
  seguroVeiculo: "/insurances/seguro-veiculo",
  seguroVeiculoStatus: "/insurances/seguro-veiculo/status",
};

// Endpoints de Celulares
const CELLPHONE_ENDPOINTS = {
  marcas: "/insurances/celulares/marcas",
  modelos: "/insurances/celulares/modelos",
  cores: "/insurances/celulares/cores",
  seguroCelular: "/insurances/seguro-celular",
  seguroCelularStatus: "/insurances/seguro-celular/status",
};

// Endpoints de Residencial
const RESIDENTIAL_ENDPOINTS = {
  seguroImovel: "/insurances/seguro-imovel",
  seguroImovelStatus: "/insurances/seguro-imovel/status",
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// === Interceptor de request: injeta Authorization se tiver token ===
api.interceptors.request.use(
  (config) => {
    // Busca token em múltiplas fontes possíveis
    const token = localStorage.getItem("access_token") || 
                  localStorage.getItem("protectus-token") || 
                  localStorage.getItem("token");
    
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log('[API] Token enviado:', token.substring(0, 20) + '...');
    } else {
      console.warn('[API] Nenhum token encontrado para autenticação');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// === Interceptor de response: tratamento genérico (p.ex. 401) ===
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      // token inválido/expirado — ação sugerida: limpar token e redirecionar ao login
      localStorage.removeItem("access_token");
      console.warn("401 Unauthorized recebido — token removido do localStorage");
      // window.location.href = "/login"; // descomente se desejar redirecionamento automático
    }
    return Promise.reject(error);
  }
);

// === Autenticação ===
export const loginCliente = async (payload: { email: string; senha: string }): Promise<any> => {
  const resp = await api.post(AUTH_ENDPOINTS.loginCliente, payload);
  // resp.data esperado: { access_token, user }
  if (resp?.data?.access_token) {
    localStorage.setItem("access_token", resp.data.access_token);
  }
  return resp.data;
};

// Importante: rota /auth/logout não existe no backend atual.
// Para evitar 404 e preflight desnecessários, tornamos o logout sem chamadas de rede.
export const logout = async (_cod_funcionario?: number) => {
  localStorage.removeItem("access_token");
  return { success: true };
};

// === Users / Clientes / Funcionários (wrappers das rotas do gateway) ===
export const getClientes = async (params?: any) => {
  const resp = await api.get(USER_ENDPOINTS.cliente, { params });
  return resp.data;
};
export const createCliente = async (data: any) => {
  const resp = await api.post(USER_ENDPOINTS.cliente, data);
  return resp.data;
};
export const inativaCliente = async (data: any) => {
  const resp = await api.patch(USER_ENDPOINTS.inativaCliente, data);
  return resp.data;
};

export const getFuncionarios = async (params?: any) => {
  const resp = await api.get(USER_ENDPOINTS.funcionario, { params });
  return resp.data;
};
export const createFuncionario = async (data: any) => {
  const resp = await api.post(USER_ENDPOINTS.funcionario, data);
  return resp.data;
};
export const inativaFuncionario = async (data: any) => {
  const resp = await api.patch(USER_ENDPOINTS.inativaFuncionario, data);
  return resp.data;
};

// === Veículos (catálogo e seguros) ===
export const getMarcasVeiculos = async () => {
  const resp = await api.get(VEHICLE_ENDPOINTS.marcas);
  return resp.data;
};

export const getModelosVeiculos = async (params?: { marca: string }) => {
  const resp = await api.get(VEHICLE_ENDPOINTS.modelos, { params });
  return resp.data;
};

export const getAnosVeiculos = async (params?: { marca: string; modelo: string }) => {
  const resp = await api.get(VEHICLE_ENDPOINTS.anos, { params });
  return resp.data;
};

export const createSeguroVeiculo = async (data: any) => {
  const resp = await api.post(VEHICLE_ENDPOINTS.seguroVeiculo, data);
  return resp.data;
};

export const updateSeguroVeiculoStatus = async (data: { placa: string; status: number }) => {
  const resp = await api.patch(VEHICLE_ENDPOINTS.seguroVeiculoStatus, data);
  return resp.data;
};

// === Celulares (catálogo e seguros) ===
export const getMarcasCelulares = async () => {
  const resp = await api.get(CELLPHONE_ENDPOINTS.marcas);
  return resp.data;
};

export const getModelosCelulares = async (params?: { marca: string }) => {
  const resp = await api.get(CELLPHONE_ENDPOINTS.modelos, { params });
  return resp.data;
};

// API de cores não existe - removida

export const createSeguroCelular = async (data: any) => {
  const resp = await api.post(CELLPHONE_ENDPOINTS.seguroCelular, data);
  return resp.data;
};

export const updateSeguroCelularStatus = async (data: { imei: string; status: number }) => {
  const resp = await api.patch(CELLPHONE_ENDPOINTS.seguroCelularStatus, data);
  return resp.data;
};

// === Residencial (seguros) ===
export const createSeguroImovel = async (data: any) => {
  const resp = await api.post(RESIDENTIAL_ENDPOINTS.seguroImovel, data);
  return resp.data;
};

export const updateSeguroImovelStatus = async (data: { cib: string; status: number }) => {
  const resp = await api.patch(RESIDENTIAL_ENDPOINTS.seguroImovelStatus, data);
  return resp.data;
};

// === Buscar dados específicos de veículo ===
export const getVeiculo = async (params?: { marca: string; modelo: string; ano: number }) => {
  const resp = await api.get('/insurances/veiculo', { params });
  return resp.data;
};

// === Funções genéricas de CRUD (opcional) ===
export const getUsers = async () => {
  const response = await api.get("/users"); // se existir essa rota
  return response.data;
};

export const createUser = async (data: any) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// exporta a instância do axios caso precise de chamadas ad-hoc
export default api;

// Exporta os endpoints para uso externo se necessário
export const ENDPOINTS = {
  auth: AUTH_ENDPOINTS,
  users: USER_ENDPOINTS,
  vehicles: VEHICLE_ENDPOINTS,
  cellphones: CELLPHONE_ENDPOINTS,
  residential: RESIDENTIAL_ENDPOINTS,
  baseURL: API_BASE,
};
