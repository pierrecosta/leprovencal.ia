
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
export const getMenuHistoires = () => axios.get(`${API_BASE}/menu-histoires`);
export const getHistoiresDetails = () => axios.get(`${API_BASE}/histoires-details`);
export const getHistoires = (params) => axios.get(`${API_BASE}/histoires`, { params });
export const findHistoire = (titre) =>
  axios.get(`${API_BASE}/find-histoire`, { params: { titre: encodeURIComponent(titre) } });
