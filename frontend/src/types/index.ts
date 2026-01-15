// Core API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  total: number;
}

export interface ApiError {
  detail: string | { code: string; message: string; field?: string };
  status?: number;
}

// Article types
export interface Article {
  id: number;
  titre: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  imageStored: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticlePayload {
  titre: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

// Dictionary types
export interface Mot {
  id: number;
  theme: string;
  categorie: string;
  description: string;
  motsFrancais: string;
  motsProvencal: string;
  synonymesFrancais: string;
  egProvencal: string;
  dProvencal: string;
  aProvencal: string;
}

export interface MotPayload {
  theme?: string;
  categorie?: string;
  description?: string;
  motsFrancais?: string;
  motsProvencal?: string;
  synonymesFrancais?: string;
  egProvencal?: string;
  dProvencal?: string;
  aProvencal?: string;
}

export interface DictionaryFilters {
  theme?: string;
  categorie?: string;
  lettre?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Histoire types
export interface Histoire {
  id: number;
  titre: string;
  typologie: string;
  periode: string;
  descriptionCourte: string;
  descriptionLongue: string;
  sourceUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoirePayload {
  titre: string;
  typologie?: string;
  periode?: string;
  descriptionCourte?: string;
  descriptionLongue?: string;
  sourceUrl?: string;
}

export interface MenuHistoires {
  [typologie: string]: {
    [periode: string]: MenuHistoireItem[];
  };
}

export interface MenuHistoireItem {
  id: number;
  titre: string;
  descriptionCourte: string;
}

// Carte types
export interface Carte {
  id: number;
  titre: string;
  iframeUrl: string | null;
  legende: string;
  imageStored: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartePayload {
  titre: string;
  iframeUrl?: string | null;
  legende?: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email?: string;
  isAdmin?: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
