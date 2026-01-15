import { useEffect, useState } from 'react';
import type { MenuHistoires } from '@/types';
import { getMenuHistoires } from '@/services/api';
import { Loader } from '@/components/Loader';

export function HistoryPage() {
  const [menu, setMenu] = useState<MenuHistoires>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const data = await getMenuHistoires();
        setMenu(data);
      } catch (err) {
        setError('Impossible de charger le menu des histoires.');
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  if (loading) return <Loader message="Chargement des histoires..." />;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  const typologies = Object.keys(menu);

  if (typologies.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-heading mb-6">Histoire &amp; Légendes</h1>
        <div className="card text-center py-8">
          <p className="text-muted">Aucune histoire disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-heading mb-6">Histoire &amp; Légendes de Provence</h1>

      <div className="space-y-8">
        {typologies.map((typologie) => {
          const periodes = Object.keys(menu[typologie] || {});
          if (periodes.length === 0) return null;

          return (
            <section key={typologie} className="card">
              <h2 className="text-2xl font-bold text-heading mb-4">{typologie}</h2>
              {periodes.map((periode) => {
                const items = menu[typologie][periode] || [];
                if (items.length === 0) return null;

                return (
                  <div key={periode} className="mb-6 last:mb-0">
                    <h3 className="text-xl font-semibold text-primary mb-3">{periode}</h3>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.id} className="border-l-2 border-primary pl-4">
                          <h4 className="font-semibold text-heading">{item.titre}</h4>
                          <p className="text-sm text-muted">{item.descriptionCourte}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
