export default function DictionaryTable({ mots, sort, order, onSort }) {
  const sortIcon = (column) => (sort === column ? (order === 'asc' ? '▲' : '▼') : '');

  const get = (m, camel, snake) => m?.[camel] ?? m?.[snake];

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {['theme', 'categorie', 'mots_francais', 'mots_provencal'].map((col) => (
              <th
                key={col}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => onSort(col)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSort(col);
                  }
                }}
              >
                {col} {sortIcon(col)}
              </th>
            ))}
            <th>Description</th>
            <th>Synonymes</th>
            <th>Sources</th>
          </tr>
        </thead>
        <tbody>
          {mots.map((m) => {
            const eg = get(m, 'egProvencal', 'eg_provencal');
            const d = get(m, 'dProvencal', 'd_provencal');
            const a = get(m, 'aProvencal', 'a_provencal');
            const sources = [eg, d, a].filter(Boolean).join(', ');

            return (
              <tr key={m.id}>
                <td>{get(m, 'theme', 'theme')}</td>
                <td>{get(m, 'categorie', 'categorie')}</td>
                <td>{get(m, 'motsFrancais', 'mots_francais')}</td>
                <td>{get(m, 'motsProvencal', 'mots_provencal')}</td>
                <td>{get(m, 'description', 'description')}</td>
                <td>{get(m, 'synonymesFrancais', 'synonymes_francais')}</td>
                <td className="text-sm text-muted">{sources}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
