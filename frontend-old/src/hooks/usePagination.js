import { useCallback, useState } from 'react';

// Simple pagination hook: manages page and exposes helpers
export default function usePagination(initialPage = 1, initialPages = 1) {
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(initialPages);

  const next = useCallback(() => setPage((p) => Math.min(p + 1, pages)), [pages]);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goTo = useCallback((p) => setPage(() => Math.max(1, Math.min(p, pages))), [pages]);

  return { page, pages, setPage, setPages, next, prev, goTo };
}
