import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const API: AxiosInstance = axios.create({
  baseURL: API_BASE,
});

// Attach token from localStorage (typed)
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("flashly::token");
  if (token) {
    // Ensure headers object exists
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to set/unset token on login/logout without casting to any
export function setAuthToken(token: string | null): void {
  if (token) {
    API.defaults.headers = API.defaults.headers ?? {};
    (API.defaults.headers as Record<string, unknown>).Authorization = `Bearer ${token}`;
  } else if (API.defaults.headers) {
    delete (API.defaults.headers as Record<string, unknown>).Authorization;
  }
}

export default API;