
import { useEffect, useState } from 'react';
import { getMenuHistoires, getHistoiresDetails, getHistoires, findHistoire } from '../services/api';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

export default function HistoryPage() {
  const [menuData, setMenuData] = useState({});
  const [storyDetails, setStoryDetails] = useState({});
  const [histoires, setHistoires] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 5;

  useEffect(() => {
    async function fetchMenuAndDetails() {
      try {
        const [menuRes, detailsRes] = await Promise.all([
          getMenuHistoires(),
          getHistoiresDetails()
        ]);
        setMenuData(menuRes.data);
        setStoryDetails(detailsRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMenuAndDetails();
  }, []);

  useEffect(() => {
    async function fetchHistoires() {
      setLoading(true);
      try {
        const res = await getHistoires({ page, limit });
        setHistoires(res.data.data);
        setTotalPages(res.data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistoires();
  }, [page]);

  const handleMenuClick = async (titre) => {
    const id = titre.replace(/\s+/g, '-');
    const found = histoires.find(h => h.titre === titre);

    if (found) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      try {
        const res = await findHistoire(titre);
        const targetPage = res.data.page;
        setPage(targetPage);
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex">
      {/* Menu latéral */}
      <aside className="w-1/4 p-4 border-r bg-[var(--color-bg)]">
        {Object.entries(menuData).map(([typologie, periodes]) => (
          <div key={typologie} className="mb-6">
            <h3 className="font-bold text-lg text-[var(--color-lavender)] mb-2">{typologie}</h3>
            <ul>
              {Object.entries(periodes).map(([periode, titres]) => (
                <li key={periode} className="ml-4 mb-2">
                  <strong>{periode}</strong>
                  <ul className="ml-4 list-disc">
                    {titres.map((titre) => (
                      <li key={titre} className="relative group">
                        <button
                          onClick={() => handleMenuClick(titre)}
                          className="text-[var(--color-terra)] hover:underline"
                        >
                          {titre}
                        </button>
                        {storyDetails[titre] && (
                          <div className="absolute left-full top-0 ml-2 w-64 p-2 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition">
                            <p className="text-sm text-gray-700">{storyDetails[titre]}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* Contenu principal */}
      <main className="w-3/4 p-6">
        {loading ? (
          <Loader message="Chargement des histoires..." />
        ) : (
          histoires.map((histoire) => (
            <div
              key={histoire.id}
              id={histoire.titre.replace(/\s+/g, '-')}
              className="mb-4 p-4 border rounded shadow-sm bg-white"
            >
              <h4 className="font-bold text-lg text-[var(--color-lavender)]">{histoire.titre}</h4>
              <p className="mb-2">{histoire.description_longue}</p>
              {histoire.source_url && (
                <a
                  href={histoire.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-terra)] hover:underline text-sm"
                >
                  Voir la source →
                </a>
              )}
            </div>
          ))
        )}

        {/* Pagination */}
        <Pagination page={page} pages={totalPages} onPageChange={setPage} />
      </main>
    </div>
  );
}
