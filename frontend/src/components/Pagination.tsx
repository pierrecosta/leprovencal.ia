interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export function Pagination({
  page,
  pages,
  onPageChange,
  limit,
  onLimitChange,
  limitOptions = [25, 50, 100],
}: PaginationProps) {
  const showLimit = typeof onLimitChange === 'function' && typeof limit === 'number';
  if (pages <= 1 && !showLimit) return null;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < pages) onPageChange(page + 1);
  };

  const handleLimitChange = (value: string) => {
    const nextLimit = Number(value);
    if (!Number.isFinite(nextLimit) || nextLimit <= 0) return;
    onLimitChange?.(nextLimit);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
      {showLimit ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Éléments/page</span>
          <select
            className="input !w-auto !py-2 !px-3"
            value={limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            aria-label="Éléments par page"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center justify-center gap-4">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Page précédente"
      >
        ← Précédent
      </button>
      
      <span className="text-text">
        Page <strong>{page}</strong> sur <strong>{pages}</strong>
      </span>
      
      <button
        onClick={handleNext}
        disabled={page === pages}
        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Page suivante"
      >
        Suivant →
      </button>
      </div>
    </div>
  );
}
