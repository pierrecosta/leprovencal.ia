import { useEffect, useState } from 'react';
import type { Article } from '@/types';
import { createArticle, getArticlesPaged, uploadArticleImage, getApiErrorMessage } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Loader } from '@/components/Loader';
import { Pagination } from '@/components/Pagination';
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

  const [limit, setLimit] = useState(25);

  const { page, pages, setPage, setPages } = usePagination(1, 1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        // Request limit+1 to detect next page
        const res = await getArticlesPaged({ page, limit: limit + 1 });
        const items = res.data;
        setHasNext(items.length > limit);
        setArticles(items.slice(0, limit));
        // Update pages: if hasNext, we know there's at least page+1
        setPages(items.length > limit ? page + 1 : page);
      } catch (err) {
        setError('Impossible de charger les articles.');
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page, limit, setPages]);

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
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6 pb-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-heading">Culture Provençale</h1>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
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

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          page={page}
          pages={pages}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
