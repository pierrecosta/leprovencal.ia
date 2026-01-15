interface DictionaryFiltersProps {
  themes: string[];
  categories: string[];
  theme: string;
  categorie: string;
  search: string;
  onThemeChange: (value: string) => void;
  onCategorieChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function DictionaryFilters({
  themes,
  categories,
  theme,
  categorie,
  search,
  onThemeChange,
  onCategorieChange,
  onSearchChange,
}: DictionaryFiltersProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold text-heading mb-4">Filtres</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Thème</label>
          <select
            className="input"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Catégorie</label>
          <select
            className="input"
            value={categorie}
            onChange={(e) => onCategorieChange(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Recherche</label>
          <input
            type="text"
            className="input"
            placeholder="Rechercher un mot..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
