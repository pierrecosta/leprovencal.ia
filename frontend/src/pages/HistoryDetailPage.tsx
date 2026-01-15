import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Histoire } from '@/types';
import { getHistoire } from '@/services/api';
import { Loader } from '@/components/Loader';

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [histoire, setHistoire] = useState<Histoire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistoire() {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getHistoire(Number(id));
        setHistoire(data);
      } catch (err) {
        setError("Impossible de charger l'histoire.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistoire();
  }, [id]);

  if (loading) return <Loader message="Chargement de l'histoire..." />;
  if (error || !histoire) {
    return (
      <div className="p-6">
        <p className="text-red-600 text-center mb-4">{error || 'Histoire non trouvée.'}</p>
        <div className="text-center">
          <Link to="/histoire-legendes" className="btn btn-secondary">
            ← Retour aux histoires
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/histoire-legendes" className="inline-flex items-center text-primary hover:text-primary-hover mb-6">
        ← Retour aux histoires
      </Link>

      <article className="card">
        <header className="mb-6">
          <div className="flex gap-3 mb-3">
            <span className="badge badge-primary">{histoire.typologie}</span>
            <span className="badge badge-secondary">{histoire.periode}</span>
          </div>
          <h1 className="text-4xl font-bold text-heading mb-4">{histoire.titre}</h1>
          {histoire.descriptionCourte && (
            <p className="text-xl text-muted italic">{histoire.descriptionCourte}</p>
          )}
        </header>

        {histoire.descriptionLongue && (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-text leading-relaxed">
              {histoire.descriptionLongue}
            </div>
          </div>
        )}

        {histoire.sourceUrl && (
          <footer className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted">
              Source :{' '}
              <a
                href={histoire.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {histoire.sourceUrl}
              </a>
            </p>
          </footer>
        )}
      </article>
    </div>
  );
}
