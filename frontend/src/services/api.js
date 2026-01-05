// services/api.js
import axios from 'axios';

// ===== Base URL via .env (CRA) =====
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ===== Instance axios par défaut =====
// On garde une instance "publiques" pour compat (GET publiques existantes)
const http = axios.create({
  baseURL: API_BASE,
});

// ===== Instance axios avec auth =====
// Cette instance attache automatiquement le token s'il est présent
const authHttp = axios.create({
  baseURL: API_BASE,
});

// --- Token management ---
// NOTE (prod): préférer cookie HttpOnly/Secure/SameSite plutôt que localStorage.
const TOKEN_KEY = 'access_token';

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

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

// ==========================
//        ENDPOINTS
// ==========================

// --- Articles (publics) ---
export const getArticles = () => http.get(`/articles`);

// --- Dictionnaire (publics) ---
export const getDictionary = (params) => http.get(`/dictionnaire`, { params });
export const getThemes = () => http.get(`/dictionnaire/themes`);
export const getCategories = (theme) =>
  http.get(`/dictionnaire/categories`, { params: { theme } });

// --- Histoires & Légendes (publics) ---
export const getHistoires = (params) => http.get(`/histoires`, { params });
export const getMenuHistoires = () => http.get(`/histoires/menu`);
export const getHistoireById = (id) => http.get(`/histoires/${id}`);
export const findHistoire = (titre) =>
  http.get(`/histoires/find`, { params: { titre } });

export const getHistoiresPaged = ({ page, limit }) =>
  http.get(`/histoires/paged`, { params: { page, limit } });

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

// ==========================
//    UPDATED SERVICES
// ==========================

// --- Dictionnaire: update d'un mot (ligne du tableau)
export async function updateMot(id, payload) {
  const { data } = await authHttp.put(`/dictionnaire/${id}`, normalizeDictionnairePayload(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

// --- Articles: update d'une carte/article
export async function updateArticle(id, payload) {
  const { data } = await authHttp.put(`/articles/${id}`, normalizeArticlePayload(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

// ==========================
//       AUTH SERVICES
// ==========================

/**
 * Login (FastAPI OAuth2PasswordRequestForm)
 * - Content-Type: application/x-www-form-urlencoded
 * - Retour: { access_token, token_type }
 */
export async function login({ username, password }) {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const { data } = await axios.post(`${API_BASE}/auth/login`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data?.access_token) {
    setToken(data.access_token);
  }
  return data;
}

/**
 * Register (JSON UserCreate)
 * - Body: { username, password }
 * - Retour: UserResponse (défini côté FastAPI)
 */
export async function register({ username, password }) {
  const { data } = await axios.post(
    `${API_BASE}/auth/register`,
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
  clearToken();
}

// ==========================
//    EXPORTS UTILES PAR DÉFAUT
// ==========================
export const api = http;
export const apiAuth = authHttp;

// --- Error handling ---
export function getApiErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (detail && typeof detail === 'object') return detail.message || 'Erreur API';
  return detail || err?.response?.data?.message || err?.message || 'Erreur API';
}
