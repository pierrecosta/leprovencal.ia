import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Article,
  ArticlePayload,
  User,
  LoginPayload,
  AuthResponse,
  DictionaryFilters,
  Mot,
  MotPayload,
  Histoire,
  HistoirePayload,
  MenuHistoires,
  Carte,
  CartePayload,
  PaginatedResponse,
} from '@/types';
import {
  normalizeArticlePayload,
  normalizeArticleOut,
  normalizeDictionnairePayload,
  normalizeMotOut,
  normalizeHistoireOut,
  normalizeMenuHistoiresOut,
  normalizeCarteOut,
  normalizeCartePayload,
} from './normalizers';

// ===== Configuration =====
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ===== Token Management =====
let _token: string | null = null;

export function setToken(token: string | null): void {
  _token = token;
  if (token) {
    authHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      window.dispatchEvent(new Event('auth:login'));
    } catch {
      // ignore
    }
  } else {
    delete authHttp.defaults.headers.common['Authorization'];
    try {
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'manual' } }));
    } catch {
      // ignore
    }
  }
}

export function getToken(): string | null {
  return _token;
}

export function clearToken(): void {
  setToken(null);
}

// ===== Error Handling =====
export function getRetryAfterSeconds(err: AxiosError): number | null {
  const raw = err?.response?.headers?.['retry-after'];
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getApiErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Une erreur inattendue est survenue.';
  
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail?.message) return detail.message;
  
  if (err.response?.status === 401) return 'Non autorisé. Veuillez vous connecter.';
  if (err.response?.status === 403) return 'Accès refusé.';
  if (err.response?.status === 404) return 'Ressource non trouvée.';
  if (err.response?.status === 500) return 'Erreur serveur.';
  
  return err.message || 'Une erreur est survenue.';
}

export function getApiErrorField(err: unknown): string | null {
  if (!axios.isAxiosError(err)) return null;
  const detail = err.response?.data?.detail;
  return detail?.field || null;
}

function dispatchLogout(reason = 'unauthorized'): void {
  clearToken();
  try {
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }));
  } catch {
    // ignore
  }
}

// ===== Axios Instances =====
const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const authHttp: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Interceptors
authHttp.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authHttp.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      dispatchLogout('token_invalid_or_expired');
    }
    return Promise.reject(err);
  }
);

// ===== Authentication =====
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('username', payload.username);
  formData.append('password', payload.password);
  
  const { data } = await http.post<AuthResponse>('/auth/login', formData);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await authHttp.get<User>('/auth/me');
  return data;
}

// ===== Articles =====
export async function getArticles(): Promise<Article[]> {
  const { data } = await http.get<Article[]>('/articles');
  return Array.isArray(data) ? data.map(normalizeArticleOut) : [];
}

export async function getArticlesPaged(params: { page?: number; limit?: number } = {}): Promise<{ data: Article[] }> {
  const { page = 1, limit = 10 } = params;
  const skip = Math.max(0, (page - 1) * limit);
  
  const { data } = await http.get<Article[]>('/articles', { params: { skip, limit } });
  return {
    data: Array.isArray(data) ? data.map(normalizeArticleOut) : [],
  };
}

export async function createArticle(payload: ArticlePayload): Promise<Article> {
  const { data } = await authHttp.post<Article>('/articles', normalizeArticlePayload(payload));
  return normalizeArticleOut(data);
}

export async function updateArticle(id: number, payload: Partial<ArticlePayload>): Promise<Article> {
  const { data } = await authHttp.put<Article>(`/articles/${id}`, normalizeArticlePayload(payload));
  return normalizeArticleOut(data);
}

export async function deleteArticle(id: number): Promise<void> {
  await authHttp.delete(`/articles/${id}`);
}

export async function uploadArticleImage(id: number, file: File): Promise<Article> {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await authHttp.post<Article>(`/articles/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeArticleOut(data);
}

export async function deleteArticleImage(id: number): Promise<void> {
  await authHttp.delete(`/articles/${id}/image`);
}

export function getArticleImageUrl(id: number, rev?: number): string {
  const base = `${API_BASE}/articles/${id}/image`;
  return rev ? `${base}?v=${rev}` : base;
}

// ===== Dictionary =====
export async function getDictionary(filters: DictionaryFilters = {}): Promise<PaginatedResponse<Mot>> {
  const params: any = {};
  
  if (filters.theme && filters.theme !== 'tous') params.theme = filters.theme;
  if (filters.categorie && filters.categorie !== 'toutes') params.categorie = filters.categorie;
  if (filters.lettre && filters.lettre !== 'toutes') params.lettre = filters.lettre;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.sort) params.sort = filters.sort;
  if (filters.order) params.order = filters.order;
  
  const { data } = await http.get<{ items: Mot[]; total: number; pages: number; page: number; limit: number }>('/dictionnaire', { params });
  
  return {
    data: Array.isArray(data.items) ? data.items.map(normalizeMotOut) : [],
    page: data.page || 1,
    pages: data.pages || 1,
    total: data.total || 0,
  };
}

export async function getThemes(): Promise<string[]> {
  const { data } = await http.get<string[]>('/dictionnaire/themes');
  return Array.isArray(data) ? data : [];
}

export async function getCategories(theme?: string): Promise<string[]> {
  const params = theme && theme !== 'tous' ? { theme } : {};
  const { data } = await http.get<string[]>('/dictionnaire/categories', { params });
  return Array.isArray(data) ? data : [];
}

export async function createMot(payload: MotPayload): Promise<Mot> {
  const { data } = await authHttp.post<Mot>('/dictionnaire', normalizeDictionnairePayload(payload));
  return normalizeMotOut(data);
}

export async function updateMot(id: number, payload: Partial<MotPayload>): Promise<Mot> {
  const { data } = await authHttp.put<Mot>(`/dictionnaire/${id}`, normalizeDictionnairePayload(payload));
  return normalizeMotOut(data);
}

export async function deleteMot(id: number): Promise<void> {
  await authHttp.delete(`/dictionnaire/${id}`);
}

// ===== Histoires =====
export async function getHistoires(): Promise<Histoire[]> {
  const { data } = await http.get<Histoire[]>('/histoires');
  return Array.isArray(data) ? data.map(normalizeHistoireOut) : [];
}

export async function getHistoire(id: number): Promise<Histoire> {
  const { data } = await http.get<Histoire>(`/histoires/${id}`);
  return normalizeHistoireOut(data);
}

export async function getMenuHistoires(): Promise<MenuHistoires> {
  const { data } = await http.get<MenuHistoires>('/histoires/menu');
  return normalizeMenuHistoiresOut(data);
}

export async function createHistoire(payload: HistoirePayload): Promise<Histoire> {
  const { data } = await authHttp.post<Histoire>('/histoires', payload);
  return normalizeHistoireOut(data);
}

export async function updateHistoire(id: number, payload: Partial<HistoirePayload>): Promise<Histoire> {
  const { data } = await authHttp.put<Histoire>(`/histoires/${id}`, payload);
  return normalizeHistoireOut(data);
}

export async function deleteHistoire(id: number): Promise<void> {
  await authHttp.delete(`/histoires/${id}`);
}

// ===== Cartes =====
export async function getCartes(): Promise<Carte[]> {
  const { data } = await http.get<Carte[]>('/cartes');
  return Array.isArray(data) ? data.map(normalizeCarteOut) : [];
}

export async function getCarte(id: number): Promise<Carte> {
  const { data } = await http.get<Carte>(`/cartes/${id}`);
  return normalizeCarteOut(data);
}

export async function createCarte(payload: CartePayload): Promise<Carte> {
  const { data } = await authHttp.post<Carte>('/cartes', normalizeCartePayload(payload));
  return normalizeCarteOut(data);
}

export async function updateCarte(id: number, payload: Partial<CartePayload>): Promise<Carte> {
  const { data } = await authHttp.put<Carte>(`/cartes/${id}`, normalizeCartePayload(payload));
  return normalizeCarteOut(data);
}

export async function deleteCarte(id: number): Promise<void> {
  await authHttp.delete(`/cartes/${id}`);
}

export async function uploadCarteImage(id: number, file: File): Promise<Carte> {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await authHttp.post<Carte>(`/cartes/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeCarteOut(data);
}

export async function deleteCarteImage(id: number): Promise<void> {
  await authHttp.delete(`/cartes/${id}/image`);
}

export function getCarteImageUrl(id: number, rev?: number): string {
  const base = `${API_BASE}/cartes/${id}/image`;
  return rev ? `${base}?v=${rev}` : base;
}
