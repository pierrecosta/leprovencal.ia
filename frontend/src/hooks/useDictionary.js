
import { useEffect, useState } from 'react';
import { getThemes, getCategories, getDictionary } from '../services/api';

export function useDictionary({ theme, categorie, lettre, search, page, sort, order }) {
  const [mots, setMots] = useState([]);
  const [themes, setThemes] = useState(['tous']);
  const [categories, setCategories] = useState(['toutes']);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Charger les thèmes
  useEffect(() => {
    getThemes()
      .then(res => setThemes(['tous', ...(Array.isArray(res?.data) ? res.data : [])]))
      .catch(() => setThemes(['tous']));
  }, []);

  // Charger les catégories selon le thème
  useEffect(() => {
    getCategories(theme)
      .then(res => setCategories(['toutes', ...(Array.isArray(res?.data) ? res.data : [])]))
      .catch(() => setCategories(['toutes']));
  }, [theme]);

  // Charger les mots
  useEffect(() => {
    setLoading(true);
    getDictionary({ theme, categorie, lettre, search, page, limit: 20, sort, order })
      .then(res => {
        const payload = res?.data;
        const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        setMots(items);
        setPages(typeof payload?.pages === 'number' ? payload.pages : 1);
      })
      .catch(() => {
        setMots([]);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [theme, categorie, lettre, search, page, sort, order]);

  return { mots, themes, categories, pages, loading };
}
