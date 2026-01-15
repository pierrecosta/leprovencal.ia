import { useEffect, useState } from 'react';
import type { Mot } from '@/types';
import { getThemes, getCategories, getDictionary } from '@/services/api';

interface UseDictionaryParams {
  theme: string;
  categorie: string;
  lettre: string;
  search: string;
  page: number;
  sort: string;
  order: 'asc' | 'desc';
}

interface UseDictionaryReturn {
  mots: Mot[];
  themes: string[];
  categories: string[];
  pages: number;
  loading: boolean;
}

export function useDictionary({
  theme,
  categorie,
  lettre,
  search,
  page,
  sort,
  order,
}: UseDictionaryParams): UseDictionaryReturn {
  const [mots, setMots] = useState<Mot[]>([]);
  const [themes, setThemes] = useState<string[]>(['tous']);
  const [categories, setCategories] = useState<string[]>(['toutes']);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load themes
  useEffect(() => {
    getThemes()
      .then((res) => setThemes(['tous', ...res]))
      .catch(() => setThemes(['tous']));
  }, []);

  // Load categories based on theme
  useEffect(() => {
    getCategories(theme)
      .then((res) => setCategories(['toutes', ...res]))
      .catch(() => setCategories(['toutes']));
  }, [theme]);

  // Load mots
  useEffect(() => {
    setLoading(true);
    getDictionary({ theme, categorie, lettre, search, page, limit: 20, sort, order })
      .then((res) => {
        setMots(res.data);
        setPages(res.pages);
      })
      .catch(() => {
        setMots([]);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [theme, categorie, lettre, search, page, sort, order]);

  return { mots, themes, categories, pages, loading };
}
