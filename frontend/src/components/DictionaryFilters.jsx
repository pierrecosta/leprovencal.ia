
export default function DictionaryFilters({ themes, categories, theme, categorie, search, onThemeChange, onCategorieChange, onSearchChange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select value={theme} onChange={(e) => onThemeChange(e.target.value)} className="border p-2 rounded bg-white">
        {themes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select value={categorie} onChange={(e) => onCategorieChange(e.target.value)} className="border p-2 rounded bg-white">
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <input
        type="text"
        placeholder="Recherche..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border p-2 rounded flex-1"
      />
    </div>
  );
}
