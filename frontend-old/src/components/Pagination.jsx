
export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center gap-3 mt-6">
      {/* Bouton précédent */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`px-4 py-2 rounded border font-semibold ${
          page === 1
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[var(--color-olive)] text-white hover:bg-[var(--color-terra)]'
        }`}
      >
        ← Précédent
      </button>

      {/* Pages */}
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-2 rounded border font-semibold ${
            page === i + 1
              ? 'bg-[var(--color-sun)] text-black'
              : 'bg-white hover:bg-[var(--color-sun)]'
          }`}
        >
          {i + 1}
        </button>
      ))}

      {/* Bouton suivant */}
      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className={`px-4 py-2 rounded border font-semibold ${
          page === pages
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[var(--color-olive)] text-white hover:bg-[var(--color-terra)]'
        }`}
      >
        Suivant →
      </button>
    </div>
  );
}
