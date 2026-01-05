
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
  http.get(`/histoires/find`, { params: { titre: encodeURIComponent(titre) } });

export const getHistoiresPaged = ({ page, limit }) =>
  http.get(`/histoires/paged`, { params: { page, limit } });

// ==========================
//    UPDATED SERVICES
// ==========================

// --- Dictionnaire: update d'un mot (ligne du tableau)
export async function updateMot(id, payload) {
  // payload: { theme?, categorie?, mots_francais?, mots_provencal?, description?, synonymes_francais?, eg_provencal?, d_provencal?, a_provencal? }
  const { data } = await apiAuth.put(`/dictionnaire/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

// --- Articles: update d'une carte/article
export async function updateArticle(id, payload) {
  // payload: { title?, src?, ... }
  const { data } = await apiAuth.put(`/articles/${id}`, payload, {
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
export const api = http;     // instance publique
export const apiAuth = authHttp; // instance avec interceptor Bearer
