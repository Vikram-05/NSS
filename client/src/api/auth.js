// Handles login, token storage, and refresh.
const STORAGE_KEY = "vtu_auth";

// Fixed credentials — always used for login on first visit
const CREDENTIALS = {
  username: "mmhh@gmail.com",
  password: "12345",
  whichapp: "apts",
  typeofway: "web",
};

const API_BASE = import.meta.env.VITE_API_BASE;

/* ── storage ──────────────────────────────────────────────── */
export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAuth(data) {
  // data = { access, refresh, user, expires_at }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return loadAuth()?.access || null;
}

/* ── login ────────────────────────────────────────────────── */
export async function login() {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDENTIALS),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Login failed (${res.status})`);
  }
  const data = await res.json();
  const expiresAt =
    data?.token?.token_expiretime?.access_expires_in_seconds
      ? Date.now() + data.token.token_expiretime.access_expires_in_seconds * 1000
      : Date.now() + 60 * 60 * 1000;

  saveAuth({
    access: data.token.access,
    refresh: data.token.refresh,
    user: data.user,
    expires_at: expiresAt,
  });

  return loadAuth();
}

/* ── ensure token (login if needed, refresh if expired soon) ── */
let loginPromise = null;

export async function ensureAuth() {
  const auth = loadAuth();
  const now = Date.now();

  // valid token, still fresh (refresh 60s before expiry)
  if (auth?.access && auth.expires_at && auth.expires_at - now > 60_000) {
    return auth;
  }

  // avoid parallel logins
  if (!loginPromise) {
    loginPromise = login().finally(() => {
      loginPromise = null;
    });
  }
  return loginPromise;
}

// Try to login again (used on 401 from a data call)
export async function reLogin() {
  clearAuth();
  return login();
}