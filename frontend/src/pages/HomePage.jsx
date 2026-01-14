
import { useEffect, useState } from 'react';
import { createArticle, getArticles, uploadArticleImage, getApiErrorMessage, getApiErrorField } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [newArticle, setNewArticle] = useState({ titre: '', description: '' });
  const [newImageFile, setNewImageFile] = useState(null);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await getArticles();
        setArticles(res.data);
      } catch (err) {
        setError('Impossible de charger les articles.');
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  if (loading) return <Loader message="Chargement des articles..." />;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="p-6">
      {user && (
        <section className="mb-6 border rounded bg-white shadow-sm">
          <header className="px-4 py-3 border-b bg-[var(--bg)] flex items-center justify-between gap-2">
            <h3 className="font-bold text-xl text-[var(--color-lavender)]">Gestion (loggué)</h3>
            <button className="btn btn-primary" onClick={() => setCreating((v) => !v)} type="button">
              {creating ? 'Fermer' : 'Ajouter un article'}
            </button>
          </header>

          {creating && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newArticle.titre.trim()) return;
                setAdding(true);
                setFieldErrors({});
                try {
                  let created = await createArticle(newArticle);
                  if (newImageFile) {
                    created = await uploadArticleImage(created.id, newImageFile);
                  }
                  setArticles((s) => [created, ...s]);
                  setNewArticle({ titre: '', description: '' });
                  setNewImageFile(null);
                  setCreating(false);
                } catch (err) {
                  const msg = getApiErrorMessage(err);
                  setError(msg || "Impossible de créer l'article.");
                  const field = getApiErrorField(err);
                  if (field) setFieldErrors({ [field]: msg });
                } finally {
                  setAdding(false);
                }
              }}
              className="p-4"
            >
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
                  {fieldErrors.titre && <div className="text-red-600 text-sm mt-1">{fieldErrors.titre}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Image (fichier) (optionnel, &lt; 2Mo)</label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (!f) {
                        setNewImageFile(null);
                        return;
                      }
                      if (f.size > MAX_IMAGE_BYTES) {
                        e.target.value = '';
                        setNewImageFile(null);
                        return;
                      }
                      setNewImageFile(f);
                    }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-semibold mb-1">Résumé</label>
                <textarea
                  className="input"
                  placeholder="Résumé"
                  value={newArticle.description}
                  onChange={(e) => {
                    setNewArticle({ ...newArticle, description: e.target.value });
                    setFieldErrors({});
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={adding}>
                {adding ? 'Ajout...' : "Créer"}
              </button>
            </form>
          )}
        </section>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            {...article}
            onUpdated={(updated) => setArticles((a) => a.map((x) => (x.id === updated.id ? updated : x)))}
            onDeleted={(id) => setArticles((a) => a.filter((x) => x.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
