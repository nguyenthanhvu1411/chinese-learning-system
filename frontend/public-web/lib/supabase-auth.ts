export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: { id: string; email?: string };
};

const sessionKey = "chinese-learning.auth.session";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Thiếu cấu hình Supabase cho frontend.");
  return { url, publishableKey };
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...init,
    headers: { apikey: publishableKey, "Content-Type": "application/json", ...init.headers },
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    error_description?: string;
    msg?: string;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.msg ?? payload.message ?? "Yêu cầu xác thực thất bại.");
  }
  return payload;
}

export async function signUp(email: string, password: string, redirectTo: string) {
  return request<{ user: AuthSession["user"] | null; session: AuthSession | null }>(
    `/signup?redirect_to=${encodeURIComponent(redirectTo)}`,
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
}

export async function signIn(email: string, password: string) {
  const session = await request<AuthSession>("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(session);
  return session;
}

export async function sendPasswordReset(email: string, redirectTo: string) {
  await request<Record<string, never>>(`/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function updatePassword(password: string, accessToken: string) {
  const result = await request<{ user: AuthSession["user"] }>("/user", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password }),
  });
  return result.user;
}

export async function signOut() {
  const session = loadSession();
  if (session?.access_token) {
    await request<Record<string, never>>("/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
  }
  clearSession();
}

export function saveSession(session: AuthSession) {
  if (typeof window !== "undefined") window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
}

export function readSessionFromUrl(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (!accessToken || !refreshToken) return null;
  const session: AuthSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: Number(hash.get("expires_in") ?? 3600),
    token_type: hash.get("token_type") ?? "bearer",
    user: { id: "" },
  };
  saveSession(session);
  return session;
}

export async function fetchCurrentUser(accessToken: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) throw new Error("Thiếu NEXT_PUBLIC_API_BASE_URL.");
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Backend từ chối access token (${response.status}).`);
  return response.json() as Promise<Record<string, unknown>>;
}
