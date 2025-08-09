import API from "./api";

export type AuthResponse = { token: string };

export async function register(email: string, password: string) {
  const { data } = await API.post<AuthResponse>("/auth/register", { email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await API.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function me() {
  const { data } = await API.get("/auth/me");
  return data as { _id: string; email: string; createdAt?: string };
}