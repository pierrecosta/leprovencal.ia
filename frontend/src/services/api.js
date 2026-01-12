// services/api.js
import axios from 'axios';
import { logApiError } from '../utils/logger';

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

// ==========================
//    NORMALISATION PAYLOADS
// ==========================
function normalizeArticlePayload(payload = {}) {
  // Canonique frontend: { titre, description, imageUrl, sourceUrl }
  // Back-compat: { title, src, image_url, source_url }
  return {
    ...(payload.titre != null || payload.title != null ? { titre: payload.titre ?? payload.title } : {}),
    ...(payload.description != null ? { description: payload.description } : {}),
    ...(payload.imageUrl != null || payload.image_url != null || payload.src != null
      ? { imageUrl: payload.imageUrl ?? payload.image_url ?? payload.src }
      : {}),
    ...(payload.sourceUrl != null || payload.source_url != null ? { sourceUrl: payload.sourceUrl ?? payload.source_url } : {}),
  };
}

function normalizeDictionnairePayload(payload = {}) {
  // Canonique frontend: camelCase (motsFrancais, motsProvencal, ...)
  // Back-compat: snake_case
  return {
    ...(payload.theme != null ? { theme: payload.theme } : {}),
    ...(payload.categorie != null ? { categorie: payload.categorie } : {}),
    ...(payload.description != null ? { description: payload.description } : {}),
    ...(payload.motsFrancais != null || payload.mots_francais != null ? { motsFrancais: payload.motsFrancais ?? payload.mots_francais } : {}),
    ...(payload.motsProvencal != null || payload.mots_provencal != null ? { motsProvencal: payload.motsProvencal ?? payload.mots_provencal } : {}),
    ...(payload.synonymesFrancais != null || payload.synonymes_francais != null ? { synonymesFrancais: payload.synonymesFrancais ?? payload.synonymes_francais } : {}),
    ...(payload.egProvencal != null || payload.eg_provencal != null ? { egProvencal: payload.egProvencal ?? payload.eg_provencal } : {}),
    ...(payload.dProvencal != null || payload.d_provencal != null ? { dProvencal: payload.dProvencal ?? payload.d_provencal } : {}),
    ...(payload.aProvencal != null || payload.a_provencal != null ? { aProvencal: payload.aProvencal ?? payload.a_provencal } : {}),
  };
}

// --- Response normalizers (defensive back-compat) ---
function normalizeArticleOut(a = {}) {
  return {
    ...a,
    imageUrl: a.imageUrl ?? a.image_url ?? a.src ?? '',
    sourceUrl: a.sourceUrl ?? a.source_url ?? '',
  };
}

function normalizeMotOut(m = {}) {
  return {
    ...m,
    motsFrancais: m.motsFrancais ?? m.mots_francais ?? '',
    motsProvencal: m.motsProvencal ?? m.mots_provencal ?? '',
    synonymesFrancais: m.synonymesFrancais ?? m.synonymes_francais ?? '',
    egProvencal: m.egProvencal ?? m.eg_provencal ?? '',
    dProvencal: m.dProvencal ?? m.d_provencal ?? '',
    aProvencal: m.aProvencal ?? m.a_provencal ?? '',
    // keep theme/categorie/description as-is (already same name in API)
  };
}

// --- Histoires: response normalizers (menu + détail) ---
function normalizeHistoireOut(h = {}) {
  return {
    ...h,
    descriptionCourte: h.descriptionCourte ?? h.description_courte ?? '',
    descriptionLongue: h.descriptionLongue ?? h.description_longue ?? '',
    sourceUrl: h.sourceUrl ?? h.source_url ?? '',
    // titre/typologie/periode are already camelCase in API (but keep as-is)
  };
}

function normalizeMenuItemOut(item = {}) {
  return {
    ...item,
    descriptionCourte: item.descriptionCourte ?? item.description_courte ?? '',
  };
}

/**
 * Shape attendu:
 * {
 *   [typologie]: {
 *     [periode]: [{ id, titre, descriptionCourte }]
 *   }
 * }
 */
function normalizeMenuHistoiresOut(menu = {}) {
  if (!menu || typeof menu !== 'object') return {};

  const out = {};
  for (const [typologie, periodes] of Object.entries(menu)) {
    const periodesObj = periodes && typeof periodes === 'object' ? periodes : {};
    out[typologie] = {};

    for (const [periode, items] of Object.entries(periodesObj)) {
      out[typologie][periode] = Array.isArray(items) ? items.map(normalizeMenuItemOut) : [];
    }
  }
  return out;
}

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

  if (data?.access_token) setToken(data.access_token);
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
  dispatchLogout('manual');
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
