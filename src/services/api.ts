// services/api.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { Capacitor } from "@capacitor/core";
import { getToken } from "./tokenStore";

// Prefer Vercel env var; otherwise choose based on environment
const isNative = Capacitor.isNativePlatform();
const isLocalWeb = !isNative && location.hostname === "localhost";

export const API_BASE =
  import.meta.env.VITE_API_BASE
    ?? (isLocalWeb ? "http://localhost:4000/api" : "https://flashly-api.onrender.com");

const API: AxiosInstance = axios.create({ baseURL: API_BASE });

API.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token: string | null): void {
  if (token) {
    API.defaults.headers = API.defaults.headers ?? {};
    (API.defaults.headers as Record<string, unknown>).Authorization = `Bearer ${token}`;
  } else if (API.defaults.headers) {
    delete (API.defaults.headers as Record<string, unknown>).Authorization;
  }
}

export default API;