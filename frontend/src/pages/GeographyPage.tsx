import { useEffect, useState } from 'react';
import type { Carte } from '@/types';
import { getCartes } from '@/services/api';
import { Loader } from '@/components/Loader';

export function GeographyPage() {
  const [cartes, setCartes] = useState<Carte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCartes() {
      setLoading(true);
      try {
        const data = await getCartes();
        setCartes(data);
      } catch (err) {
        setError('Impossible de charger les cartes.');
      } finally {
        setLoading(false);
      }
    }
    fetchCartes();
  }, []);

  if (loading) return <Loader message="Chargement des cartes..." />;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6 pb-10">
      <h1 className="text-3xl font-bold text-heading mb-6">Géographie de la Provence</h1>

      {cartes.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-muted">Aucune carte disponible pour le moment.</p>
        </div>
      ) : (
        <div className="geo-grid">
          {cartes.map((carte) => (
            <div key={carte.id} className="card h-full">
              <h3 className="text-2xl font-bold text-heading mb-4">{carte.titre}</h3>
              {carte.iframeUrl && (
                <div className="aspect-video mb-4">
                  <iframe
                    src={carte.iframeUrl}
                    className="w-full h-full border-0 rounded"
                    title={carte.titre}
                  />
                </div>
              )}
              {carte.legende && <p className="text-text">{carte.legende}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
