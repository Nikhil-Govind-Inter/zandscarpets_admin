// Auth endpoints talk to the backend purely via httpOnly cookies (access_token /
// refresh_token) — no token is ever read or stored by JS. These calls use a plain
// `fetch` (not `apiClient`'s `apiFetch`) since `apiFetch` itself calls `refresh()`
// on a 401, and routing refresh/login/logout through it would be circular.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  timestamp?: string;
  data: T;
}

const parseEnvelope = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const body = await response.json().catch(() => ({} as ApiEnvelope<T>));
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }
  return body;
};

export const login = async (username: string, password: string): Promise<{ user: AdminUser }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const envelope = await parseEnvelope<{ user: AdminUser }>(response);
  return envelope.data;
};

export const logout = async (): Promise<void> => {
  // Best-effort: the caller always clears local auth state regardless of
  // whether this network call succeeds.
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  }
};

export const refresh = async (): Promise<{ user: AdminUser }> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  const envelope = await parseEnvelope<{ user: AdminUser }>(response);
  return envelope.data;
};

export const getCurrentAdmin = async (): Promise<{ user: AdminUser }> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });
  const envelope = await parseEnvelope<{ user: AdminUser }>(response);
  return envelope.data;
};
