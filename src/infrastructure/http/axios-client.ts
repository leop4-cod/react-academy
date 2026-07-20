import axios from 'axios';
import { ENV } from '../config/env';
import { useAuthStore } from '../../presentation/store/auth.store';

export const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token JWT en cada petición (solo si existe)
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para manejar tokens expirados (401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.code === 'token_not_valid') {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Cliente público SIN autenticación (para endpoints como /courses/ que son públicos)
export const axiosPublic = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
