
import { useState } from 'react';
import { useDictionary } from '../hooks/useDictionary';
import Filters from '../components/DictionaryFilters';
import AlphabetFilter from '../components/DictionaryAlphabetFilter';
import DictionaryTable from '../components/DictionaryTable';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';

export default function DictionaryPage() {
  const [theme, setTheme] = useState('tous');
  const [categorie, setCategorie] = useState('toutes');
  const [lettre, setLettre] = useState('toutes');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('mots_francais');
  const [order, setOrder] = useState('asc');

  const { mots, themes, categories, pages, loading } = useDictionary({ theme, categorie, lettre, search, page, sort, order });

  const handleSort = (column) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--color-lavender)] mb-6">Dictionnaire Provençal</h1>

      <Filters
        themes={themes}
        categories={categories}
        theme={theme}
        categorie={categorie}
        search={search}
        onThemeChange={(val) => { setTheme(val); setPage(1); }}
        onCategorieChange={(val) => { setCategorie(val); setPage(1); }}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
      />

      <AlphabetFilter lettre={lettre} onLettreChange={(val) => { setLettre(val); setPage(1); }} />

      {loading ? <Loader message="Chargement des mots..." /> : <DictionaryTable mots={mots} sort={sort} order={order} onSort={handleSort} />}

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}
