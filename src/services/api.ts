// services/api.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { Capacitor } from "@capacitor/core";
import { getToken } from "./tokenStore";

// Detect environment safely
const isNative = Capacitor.isNativePlatform();
const isLocalWeb =
  !isNative &&
  typeof globalThis !== "undefined" &&
  typeof globalThis.location !== "undefined" &&
  globalThis.location.hostname === "localhost";

// Prefer env on Vercel; else fallback:
// - web-localhost -> http://localhost:4000/api (dev only)
// - everything else -> your Render API (https)
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (isLocalWeb ? "http://localhost:4000/api" : "https://flashly-backend.onrender.com/api");

if (import.meta.env.DEV) {
  // helpful while debugging blank-screens / CORS
  // eslint-disable-next-line no-console
  console.debug("[api] base =", API_BASE, "native?", isNative, "localWeb?", isLocalWeb);
}

const API: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

API.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional helper (unchanged)
export function setAuthToken(token: string | null): void {
  if (token) {
    API.defaults.headers = API.defaults.headers ?? {};
    (API.defaults.headers as Record<string, unknown>).Authorization = `Bearer ${token}`;
  } else if (API.defaults.headers) {
    delete (API.defaults.headers as Record<string, unknown>).Authorization;
  }
}

export default API;