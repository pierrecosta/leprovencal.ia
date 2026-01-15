interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < pages) onPageChange(page + 1);
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
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
  );
}
