import type { Mot } from '@/types';

interface DictionaryTableProps {
  mots: Mot[];
  sort: string;
  order: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export function DictionaryTable({ mots, sort, order, onSort }: DictionaryTableProps) {
  if (mots.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-muted">Aucun mot trouvé.</p>
      </div>
    );
  }

  const renderSortIcon = (column: string) => {
    if (sort !== column) return '↕';
    return order === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto card">
      <table className="w-full">
        <thead className="bg-surface border-b border-borderProvence">
          <tr>
            <th
              className="text-left p-3 cursor-pointer hover:bg-surface"
              onClick={() => onSort('mots_francais')}
            >
              Français {renderSortIcon('mots_francais')}
            </th>
            <th
              className="text-left p-3 cursor-pointer hover:bg-surface"
              onClick={() => onSort('mots_provencal')}
            >
              Provençal {renderSortIcon('mots_provencal')}
            </th>
            <th className="text-left p-3">Description</th>
            <th className="text-left p-3">Thème</th>
            <th className="text-left p-3">Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {mots.map((mot) => (
            <tr key={mot.id} className="border-b border-borderProvence hover:bg-surface">
              <td className="p-3 font-semibold">{mot.motsFrancais}</td>
              <td className="p-3 font-semibold text-primary">{mot.motsProvencal}</td>
              <td className="p-3 text-sm text-muted">{mot.description}</td>
              <td className="p-3 text-sm">{mot.theme}</td>
              <td className="p-3 text-sm">{mot.categorie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
