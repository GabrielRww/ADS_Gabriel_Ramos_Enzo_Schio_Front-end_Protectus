// src/api/index.ts
import axios from "axios";

// cria a instância do axios com a URL do backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000", 
  // se tu estiver usando Create React App, troca por:
  // baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// exemplo de rotas que tu pode expor
export const getUsers = async () => {
  const response = await api.get("/users");
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

// exporta a instância do axios também, caso precise
export default api;