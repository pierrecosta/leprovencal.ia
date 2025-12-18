
import axios from 'axios';

// Base URL configurable via .env
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Articles
export const getArticles = () => axios.get(`${API_BASE}/articles`);

// Dictionnaire
export const getDictionary = (params) => axios.get(`${API_BASE}/dictionnaire`, { params });
export const getThemes = () => axios.get(`${API_BASE}/dictionnaire/themes`);
export const getCategories = (theme) => axios.get(`${API_BASE}/dictionnaire/categories`, { params: { theme } });

// Histoires & Légendes
export const getHistoires = (params) => axios.get(`${API_BASE}/histoires`, { params });
export const getMenuHistoires = () => axios.get(`${API_BASE}/histoires/menu`);
export const getHistoireById = (id) => axios.get(`${API_BASE}/histoires/${id}`);
export const findHistoire = (titre) =>
  axios.get(`${API_BASE}/histoires/find`, { params: { titre: encodeURIComponent(titre) } });

export const getHistoiresPaged = ({ page, limit }) =>
  axios.get(`${API_BASE}/histoires/paged`, { params: { page, limit } });