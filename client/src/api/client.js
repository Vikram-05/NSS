import axios from "axios";
import { ensureAuth, getAccessToken, reLogin, loadAuth } from "./auth.js";

const BASE = import.meta.env.VITE_API_BASE;
if (!BASE) console.error("[client] VITE_API_BASE missing — check client/.env");

const api = axios.create({ baseURL: BASE });

/* ── request: always ensure a valid access token first ───── */
api.interceptors.request.use(async (cfg) => {
  if (!cfg.skipAuth && !cfg.url?.includes("/login")) {
    const auth = await ensureAuth();
    cfg.headers.Authorization = `Bearer ${auth.access}`;
  }
  console.log(`[client →] ${cfg.method?.toUpperCase()} ${cfg.baseURL}${cfg.url}`);
  return cfg;
});

/* ── response: on 401, refresh once and retry ────────────── */
api.interceptors.response.use(
  (r) => {
    console.log(`[client ←] ${r.status} ${r.config.url}`);
    return r;
  },
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401 && config && !config._retried) {
      config._retried = true;
      try {
        await reLogin();
        return api.request(config); // retry once with fresh token
      } catch {
        /* fall through to normal error */
      }
    }

    console.error(
      `[client ✗] ${config?.url}`,
      response?.status,
      response?.data || error.message
    );
    return Promise.reject(error);
  }
);

/* ── data helpers ─────────────────────────────────────────── */
export const getColleges = (universityId = 1) =>
  api.get(`/colleges?universityId=${universityId}`).then((r) => r.data);

export const getDepartments = (collegeId) =>
  api.get(`/departments?collegeId=${collegeId}`).then((r) => r.data);

export const getFaculty = (payload) =>
  api.post(`/faculty`, payload).then((r) => r.data);

export const getStudents = (payload) =>
  api.post(`/students`, payload).then((r) => r.data);

export const getCurrentUser = () => loadAuth()?.user || null;

/* ── impersonation (only used when VITE_ALLOW_IMPERSONATION=true) ── */
export const impersonateTryLogin = (email, mobile) =>
  api
    .post(`/impersonate/try-login`, { email, mobile }, { skipAuth: true })
    .then((r) => r.data);

export const impersonateResetPassword = (email) =>
  api
    .post(`/impersonate/reset-password`, { email }, { skipAuth: true })
    .then((r) => r.data);

export const impersonateLogin = (email, password) =>
  api
    .post(`/impersonate/login`, { email, password }, { skipAuth: true })
    .then((r) => r.data);

export default api;