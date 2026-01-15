import { useState, useEffect } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { usePagination } from '@/hooks/usePagination';
import { DictionaryFilters } from '@/components/DictionaryFilters';
import { DictionaryAlphabetFilter } from '@/components/DictionaryAlphabetFilter';
import { DictionaryTable } from '@/components/DictionaryTable';
import { Pagination } from '@/components/Pagination';
import { Loader } from '@/components/Loader';

export function DictionaryPage() {
  const [theme, setTheme] = useState('tous');
  const [categorie, setCategorie] = useState('toutes');
  const [lettre, setLettre] = useState('toutes');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('mots_francais');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const [limit, setLimit] = useState(25);

  const { page, pages, setPage, setPages } = usePagination(1, 1);

  const { mots, themes, categories, pages: totalPages, loading } = useDictionary({
    theme,
    categorie,
    lettre,
    search,
    page,
    limit,
    sort,
    order,
  });

  // Keep pagination hook in sync with total pages returned by the API
  useEffect(() => {
    if (typeof totalPages === 'number') setPages(totalPages);
  }, [totalPages, setPages]);

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-heading mb-6">Dictionnaire Provençal</h1>

      <DictionaryFilters
        themes={themes}
        categories={categories}
        theme={theme}
        categorie={categorie}
        search={search}
        onThemeChange={(val) => {
          setTheme(val);
          setPage(1);
        }}
        onCategorieChange={(val) => {
          setCategorie(val);
          setPage(1);
        }}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <DictionaryAlphabetFilter
        lettre={lettre}
        onLettreChange={(val) => {
          setLettre(val);
          setPage(1);
        }}
      />

      {loading ? (
        <Loader message="Chargement des mots..." />
      ) : (
        <DictionaryTable mots={mots} sort={sort} order={order} onSort={handleSort} />
      )}

      <Pagination
        page={page}
        pages={pages}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </div>
  );
}
