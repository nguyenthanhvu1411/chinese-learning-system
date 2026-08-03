export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
  token_type: string;
  user?: { id?: string; email?: string };
};

const sessionKey = "chinese-learning.auth.session";

function apiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!value) throw new Error("Thiếu NEXT_PUBLIC_API_BASE_URL.");
  return value.replace(/\/$/, "");
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/auth${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.detail ?? payload?.message ?? payload?.title ?? "Yêu cầu xác thực thất bại.";
    throw new Error(message);
  }
  return payload as T;
}

export async function signUp(email: string, password: string, _redirectTo?: string) {
  const result = await request<{ userId: string; email: string; verificationToken?: string | null }>("/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName: email.split("@")[0] }),
  });
  return { user: { id: result.userId, email: result.email }, session: null, ...result };
}

export async function signIn(email: string, password: string) {
  const data = await request<{ accessToken: string; refreshToken: string; expiresAtUtc: string; tokenType: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session: AuthSession = {
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
    expires_at: data.expiresAtUtc,
    token_type: data.tokenType,
  };
  saveSession(session);
  return session;
}

export async function sendPasswordReset(email: string, _redirectTo?: string) {
  return request<{ message: string; userId?: string; resetToken?: string }>("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function updatePassword(password: string, recoveryValue: string) {
  const separator = recoveryValue.indexOf("|");
  const userId = separator >= 0 ? recoveryValue.slice(0, separator) : "";
  const token = separator >= 0 ? recoveryValue.slice(separator + 1) : "";
  if (!userId || !token) throw new Error("Liên kết đặt lại mật khẩu không hợp lệ.");
  await request<void>("/reset-password", {
    method: "POST",
    body: JSON.stringify({ userId, token, newPassword: password }),
  });
}

export async function signOut() {
  const session = loadSession();
  if (session?.refresh_token) {
    await request<void>("/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: session.refresh_token }),
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
  try { return JSON.parse(raw) as AuthSession; } catch { clearSession(); return null; }
}

export function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
}

export function readSessionFromUrl(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const query = new URLSearchParams(window.location.search);
  const userId = query.get("userId");
  const token = query.get("token");
  const next = query.get("next");
  if (!userId || !token) return null;
  const recovery = `${userId}|${token}`;
  const session: AuthSession = {
    access_token: recovery,
    refresh_token: "",
    token_type: next === "/auth/reset-password" ? "password-recovery" : "email-verification",
  };
  saveSession(session);
  return session;
}

export async function fetchCurrentUser(accessToken: string) {
  const response = await fetch(`${apiBaseUrl()}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Backend từ chối access token (${response.status}).`);
  return response.json() as Promise<Record<string, unknown>>;
}
