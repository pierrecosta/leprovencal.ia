
import { useEffect, useState } from 'react';
import { getArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import Loader from '../components/Loader';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {articles.map(article => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  );
}
