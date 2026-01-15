import { useEffect, useState } from 'react';
import type { Article } from '@/types';
import { createArticle, getArticlesPaged, uploadArticleImage, getApiErrorMessage } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { toastError, toastSuccess } from '@/utils/notify';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newArticle, setNewArticle] = useState({ titre: '', description: '' });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);

  const { page, setPage } = usePagination(1, 1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        // Request limit+1 to detect next page
        const res = await getArticlesPaged({ page, limit: 6 });
        const items = res.data;
        setHasNext(items.length > 5);
        setArticles(items.slice(0, 5));
      } catch (err) {
        setError('Impossible de charger les articles.');
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.titre.trim()) return;

    setAdding(true);
    try {
      let created = await createArticle(newArticle);
      if (newImageFile) {
        created = await uploadArticleImage(created.id, newImageFile);
      }
      setArticles((prev) => [created, ...prev]);
      setNewArticle({ titre: '', description: '' });
      setNewImageFile(null);
      setCreating(false);
      toastSuccess('Article créé avec succès !');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg || "Impossible de créer l'article.");
      toastError(msg);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loader message="Chargement des articles..." />;
  if (error && articles.length === 0) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-heading mb-6">Culture Provençale</h1>

      {user && (
        <section className="mb-6 border rounded bg-white shadow-sm">
          <header className="px-4 py-3 border-b bg-surface flex items-center justify-between gap-2">
            <h3 className="font-bold text-xl text-heading">Gestion (connecté)</h3>
            <button className="btn btn-primary" onClick={() => setCreating((v) => !v)} type="button">
              {creating ? 'Fermer' : 'Ajouter un article'}
            </button>
          </header>

          {creating && (
            <form onSubmit={handleCreateArticle} className="p-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Titre *</label>
                  <input
                    className="input"
                    placeholder="Titre"
                    value={newArticle.titre}
                    onChange={(e) => setNewArticle({ ...newArticle, titre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Image (fichier, optionnel, &lt; 2Mo)</label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > MAX_IMAGE_BYTES) {
                        toastError('Fichier trop volumineux (max 2 Mo).');
                        e.target.value = '';
                        return;
                      }
                      setNewImageFile(file || null);
                    }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Description"
                  value={newArticle.description}
                  onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                />
              </div>

              <button type="submit" disabled={adding} className="btn btn-primary mt-4 disabled:opacity-50">
                {adding ? 'Création...' : 'Créer'}
              </button>
            </form>
          )}
        </section>
      )}

      <section className="space-y-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onUpdated={(updated) => {
              setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            }}
            onDeleted={(id) => {
              setArticles((prev) => prev.filter((a) => a.id !== id));
            }}
          />
        ))}
      </section>

      {/* Simple pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="btn btn-secondary disabled:opacity-50"
        >
          ← Précédent
        </button>
        <span className="text-text">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!hasNext}
          className="btn btn-secondary disabled:opacity-50"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
