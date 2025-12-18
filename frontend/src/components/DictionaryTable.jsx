
export default function DictionaryTable({ mots, sort, order, onSort }) {
  const sortIcon = (column) => (sort === column ? (order === 'asc' ? '▲' : '▼') : '');

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            {['theme', 'categorie', 'mots_francais', 'mots_provencal'].map(col => (
              <th key={col} className="border p-2 cursor-pointer" onClick={() => onSort(col)}>
                {col} {sortIcon(col)}
              </th>
            ))}
            <th className="border p-2">Description</th>
            <th className="border p-2">Synonymes</th>
            <th className="border p-2">Sources</th>
          </tr>
        </thead>
        <tbody>
          {mots.map(m => (
            <tr key={m.id}>
              <td className="border p-2">{m.theme}</td>
              <td className="border p-2">{m.categorie}</td>
              <td className="border p-2">{m.mots_francais}</td>
              <td className="border p-2">{m.mots_provencal}</td>
              <td className="border p-2">{m.description}</td>
              <td className="border p-2">{m.synonymes_francais}</td>
              <td className="border p-2 text-sm text-gray-600">{m.eg_provencal}, {m.d_provencal}, {m.a_provencal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
