
import { useEffect, useState } from 'react';
import { createArticle, getArticles, uploadArticleImage } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newArticle, setNewArticle] = useState({ titre: '', description: '' });
  const [newImageFile, setNewImageFile] = useState(null);
  const [adding, setAdding] = useState(false);

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
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newArticle.titre.trim()) return;
            setAdding(true);
            try {
              let created = await createArticle(newArticle);
              if (newImageFile) {
                created = await uploadArticleImage(created.id, newImageFile);
              }
              setArticles((s) => [created, ...s]);
              setNewArticle({ titre: '', description: '' });
              setNewImageFile(null);
            } catch (err) {
              // TODO: handle error display
            } finally {
              setAdding(false);
            }
          }}
          className="mb-6"
        >
          <h3 className="font-semibold mb-2">Ajouter un article</h3>
          <input
            className="input mb-2"
            placeholder="Titre"
            value={newArticle.titre}
            onChange={(e) => setNewArticle({ ...newArticle, titre: e.target.value })}
            required
          />
          <textarea
            className="input mb-2"
            placeholder="Résumé"
            value={newArticle.description}
            onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
          />

          <input
            className="input mb-2"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (!f) {
                setNewImageFile(null);
                return;
              }
              if (f.size > MAX_IMAGE_BYTES) {
                // Keep this minimal (no new UI); user can pick another file.
                e.target.value = '';
                setNewImageFile(null);
                return;
              }
              setNewImageFile(f);
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={adding}>
            {adding ? 'Ajout...' : "Ajouter l'article"}
          </button>
        </form>
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
