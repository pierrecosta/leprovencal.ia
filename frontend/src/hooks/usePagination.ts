import { useCallback, useState } from 'react';

interface UsePaginationReturn {
  page: number;
  pages: number;
  setPage: (page: number) => void;
  setPages: (pages: number) => void;
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
}

export function usePagination(initialPage = 1, initialPages = 1): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(initialPages);

  const next = useCallback(() => {
    setPage((p) => Math.min(p + 1, pages));
  }, [pages]);

  const prev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const goTo = useCallback((p: number) => {
    setPage(() => Math.max(1, Math.min(p, pages)));
  }, [pages]);

  return { page, pages, setPage, setPages, next, prev, goTo };
}
