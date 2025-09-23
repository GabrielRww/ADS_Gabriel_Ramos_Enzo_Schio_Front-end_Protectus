// src/api/index.ts
import axios from "axios";

/**
 * BaseURL: usa VITE_API_URL (Vite) ou fallback para localhost:3000
 * -- coloque no .env: VITE_API_URL=https://seu-backend.up.railway.app
 */
const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// === Interceptor de request: injeta Authorization se tiver token ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
export const login = async (payload: { email: string; senha: string }) => {
  const resp = await api.post("/auth/login", payload);
  // resp.data esperado: { access_token, user }
  if (resp?.data?.access_token) {
    localStorage.setItem("access_token", resp.data.access_token);
  }
  return resp.data;
};

export const logout = async (cod_funcionario?: number) => {
  // o backend espera Authorization header (o interceptor injeta) e possivelmente o body com cod_funcionario
  const resp = await api.post("/auth/logout", { cod_funcionario });
  localStorage.removeItem("access_token");
  return resp.data;
};

// === Users / Clientes / Funcionários (wrappers das rotas do gateway) ===
// Ajuste os nomes/paths conforme necessário
export const getClientes = async (params?: any) => {
  const resp = await api.get("/users/cliente", { params });
  return resp.data;
};
export const createCliente = async (data: any) => {
  const resp = await api.post("/users/cliente", data);
  return resp.data;
};
export const inativaCliente = async (data: any) => {
  const resp = await api.patch("/users/inativa-cliente", data);
  return resp.data;
};

export const getFuncionarios = async (params?: any) => {
  const resp = await api.get("/users/funcionario", { params });
  return resp.data;
};
export const createFuncionario = async (data: any) => {
  const resp = await api.post("/users/funcionario", data);
  return resp.data;
};
export const inativaFuncionario = async (data: any) => {
  const resp = await api.patch("/users/inativa-funcionario", data);
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
