// services/api.js
import axios from 'axios';
import { logApiError } from '../utils/logger';
import {
  normalizeArticlePayload,
  normalizeDictionnairePayload,
  normalizeArticleOut,
  normalizeMotOut,
  normalizeHistoireOut,
  normalizeCarteOut,
  normalizeCartePayload,
  normalizeMenuHistoiresOut,
} from './normalizers';

// ===== Base URL via .env (CRA) =====
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ===== Instance axios par défaut =====
// On garde une instance "publiques" pour compat (GET publiques existantes)
const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // <-- enable cookies (SameSite handled by backend cookie)
});

// ===== Instance axios avec auth =====
// Cette instance attache automatiquement le token s'il est présent
const authHttp = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // <-- send cookies automatically
});

// --- Token management (in-memory) ---
let _token = null;

export function setToken(token) {
  _token = token;
  if (token) {
    // keep Authorization header for in-memory access-token usage (optional)
    authHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try { window.dispatchEvent(new Event('auth:login')); } catch {}
  } else {
    delete authHttp.defaults.headers.common['Authorization'];
    try { window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'manual' } })); } catch {}
  }
}

export function getToken() {
  return _token;
}

export function clearToken() {
  setToken(null);
}

// ==========================
//   CROSS-CUTTING HELPERS
// ==========================
export function getRetryAfterSeconds(err) {
  const raw = err?.response?.headers?.['retry-after'];
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function dispatchLogout(reason = 'unauthorized') {
  clearToken();

  // Let the app react if it wants (optional)
  try {
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }));
  } catch {
    // ignore
  }

  // Note: do NOT redirect to /login automatically. The app should remain browsable
  // for anonymous users; authenticated-only actions will fail with 401 and the
  // UI can decide whether to prompt for login or show an error. This keeps
  // read-only browsing available by default.
}

// Normalizers moved to src/services/normalizers.js

// ==========================
//        AXIOS INSTANCES
// ==========================

// Interceptor pour l'instance auth
authHttp.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Global response handling (auth)
authHttp.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) dispatchLogout('token_invalid_or_expired');
    logApiError(err);
    return Promise.reject(err);
  }
);

// Also log public API errors (no logout here)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    logApiError(err);
    return Promise.reject(err);
  }
);

// ==========================
//        ENDPOINTS
// ==========================

// --- Articles (publics) ---
export const getArticles = () =>
  http.get(`/articles`).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(normalizeArticleOut) : res.data,
  }));

// Paged articles (skip/limit). page is 1-based.
export const getArticlesPaged = ({ page = 1, limit = 10 } = {}) => {
  const skip = Math.max(0, (page - 1) * limit);
  return http.get(`/articles`, { params: { skip, limit } }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(normalizeArticleOut) : res.data,
  }));
};

// Create a new article (authenticated)
export async function createArticle(payload) {
  const { data } = await authHttp.post(`/articles`, normalizeArticlePayload(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeArticleOut(data);
}

// Delete an article (authenticated)
export async function deleteArticle(id) {
  const res = await authHttp.delete(`/articles/${id}`);
  return res;
}

// --- Dictionnaire (publics) ---
export const getDictionary = (params) =>
  http.get(`/dictionnaire`, { params }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(normalizeMotOut) : res.data,
  }));

export const getThemes = () => http.get(`/dictionnaire/themes`);
export const getCategories = (theme) => http.get(`/dictionnaire/categories`, { params: { theme } });

// --- Histoires & Légendes (publics) ---
export const getHistoires = (params) => http.get(`/histoires`, { params });

// Keep response shape, but normalize res.data for UI camelCase-only consumption
export const getMenuHistoires = () =>
  http.get(`/histoires/menu`).then((res) => ({ ...res, data: normalizeMenuHistoiresOut(res.data) }));

export const getHistoireById = (id) =>
  http.get(`/histoires/${id}`).then((res) => ({ ...res, data: normalizeHistoireOut(res.data) }));

export const findHistoire = (titre) =>
  http.get(`/histoires/find`, { params: { titre } }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(normalizeHistoireOut) : res.data,
  }));

export const getHistoiresPaged = ({ page, limit }) => http.get(`/histoires/paged`, { params: { page, limit } });

// --- Histoires (CRUD) (authenticated) ---
export async function createHistoire(payload) {
  const { data } = await authHttp.post(`/histoires`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeHistoireOut(data);
}

export async function updateHistoire(id, payload) {
  const { data } = await authHttp.put(`/histoires/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeHistoireOut(data);
}

export async function deleteHistoire(id) {
  const res = await authHttp.delete(`/histoires/${id}`);
  return res;
}

// --- Cartes (Géographie) (public + authenticated mutations) ---
export const getCartes = (params) =>
  http.get(`/cartes`, { params }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(normalizeCarteOut) : res.data,
  }));

// Paged cartes (convert page -> skip). page is 1-based.
export const getCartesPaged = ({ page = 1, limit = 10 } = {}) => {
  const skip = Math.max(0, (page - 1) * limit);
  return http.get(`/cartes`, { params: { skip, limit } }).then((res) => ({
    ...res,
    data: Array.isArray(res.data) ? res.data.map(normalizeCarteOut) : res.data,
  }));
};

export async function createCarte(payload) {
  const { data } = await authHttp.post(`/cartes`, normalizeCartePayload(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeCarteOut(data);
}

export async function updateCarte(id, payload) {
  const { data } = await authHttp.put(`/cartes/${id}`, normalizeCartePayload(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  return normalizeCarteOut(data);
}

export async function deleteCarte(id) {
  const res = await authHttp.delete(`/cartes/${id}`);
  return res;
}

// ==========================
//   STORED IMAGES (BINARY)
// ==========================

export function getArticleImageUrl(id, cacheBuster) {
  const qs = cacheBuster ? `?v=${encodeURIComponent(String(cacheBuster))}` : '';
  return `${API_BASE}/articles/${id}/image${qs}`;
}

export function getCarteImageUrl(id, cacheBuster) {
  const qs = cacheBuster ? `?v=${encodeURIComponent(String(cacheBuster))}` : '';
  return `${API_BASE}/cartes/${id}/image${qs}`;
}

export async function uploadArticleImage(id, file) {
  const fd = new FormData();
  fd.append('image', file);
  const { data } = await authHttp.put(`/articles/${id}/image`, fd);
  return normalizeArticleOut(data);
}

export async function deleteArticleImage(id) {
  const { data } = await authHttp.delete(`/articles/${id}/image`);
  return normalizeArticleOut(data);
}

export async function uploadCarteImage(id, file) {
  const fd = new FormData();
  fd.append('image', file);
  const { data } = await authHttp.put(`/cartes/${id}/image`, fd);
  return normalizeCarteOut(data);
}

export async function deleteCarteImage(id) {
  const { data } = await authHttp.delete(`/cartes/${id}/image`);
  return normalizeCarteOut(data);
}

// --- Dictionnaire: update d'un mot (ligne du tableau)
export async function updateMot(id, payload) {
  const { data } = await authHttp.put(
    `/dictionnaire/${id}`,
    normalizeDictionnairePayload(payload),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return normalizeMotOut(data);
}

// --- Articles: update d'une carte/article
export async function updateArticle(id, payload) {
  const { data } = await authHttp.put(
    `/articles/${id}`,
    normalizeArticlePayload(payload),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return normalizeArticleOut(data);
}

// ==========================
//       AUTH SERVICES
// ==========================

export async function login({ username, password }) {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const { data } = await http.post(`/auth/login`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // Two possible server behaviors:
  // - Return { access_token } (Bearer token) -> frontend stores it via setToken
  // - Or set a HttpOnly cookie and return a simple success payload -> emit login event
  if (data?.access_token) {
    setToken(data.access_token);
  } else {
    try {
      window.dispatchEvent(new Event('auth:login'));
    } catch {
      // ignore
    }
  }
  return data;
}

export async function register({ username, password }) {
  const { data } = await http.post(
    `/auth/register`,
    { username, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
}

/**
 * Récupère l'utilisateur courant (protégé)
 * - Nécessite Authorization: Bearer <token>
 * - Retour: { username }
 */
export async function getMe() {
  const { data } = await authHttp.get(`/auth/me`);
  return data;
}

// (Optionnel) helper logout
export function logout() {
  // Try to notify server (if an endpoint exists) to clear HttpOnly cookie, then dispatch logout locally.
  (async () => {
    try {
      await http.post('/auth/logout');
    } catch {
      // ignore errors (endpoint may not exist)
    } finally {
      dispatchLogout('manual');
    }
  })();
}

// ==========================
//    EXPORTS UTILES PAR DÉFAUT
// ==========================
export const api = http;
export const apiAuth = authHttp;

// --- Error handling ---
export function getApiErrorMessage(err) {
  const status = err?.response?.status;
  const retryAfter = err?.response?.headers?.['retry-after'];

  const detail = err?.response?.data?.detail;

  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string' && detail.message.trim() !== '') return detail.message;
    if (typeof detail.code === 'string' && detail.code.trim() !== '') return detail.code;
    try {
      return JSON.stringify(detail);
    } catch {
      return 'Erreur API';
    }
  }

  if (typeof detail === 'string') return detail;

  const msg = err?.response?.data?.message || err?.message;
  const base = typeof msg === 'string' ? msg : 'Erreur API';

  if (status === 429 && retryAfter) return `${base} (Retry-After: ${retryAfter}s)`;
  return base;
}

// Retourne le champ ciblé par l'erreur si fourni par l'API (ex: { detail: { field: 'titre' } })
export function getApiErrorField(err) {
  return err?.response?.data?.detail?.field ?? null;
}
