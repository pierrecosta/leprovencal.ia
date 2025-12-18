
import { useEffect, useState } from 'react';
import { getMenuHistoires, getHistoireById } from '../services/api';
import Loader from '../components/Loader';

export default function HistoryPage() {
  const [menuData, setMenuData] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const res = await getMenuHistoires(); // [{ id, titre, description_courte }]
        setMenuData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await getHistoireById(id);
      setSelected(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const backToMenu = () => {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selected) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={backToMenu}
            className="px-4 py-2 rounded bg-[var(--color-olive)] text-white hover:bg-[var(--color-terra)] font-semibold"
          >
            ← Retour au menu
          </button>
        </div>

        <article className="mb-6 p-6 border rounded shadow-sm bg-white">
          <h1 className="font-bold text-2xl text-[var(--color-lavender)] mb-3">
            {selected.titre}
          </h1>
          <div className="text-sm text-gray-600 mb-4">
            <span className="mr-3"><strong>Typologie :</strong> {selected.typologie}</span>
            <span><strong>Période :</strong> {selected.periode}</span>
          </div>

          {loadingDetail ? (
            <Loader message="Chargement..." />
          ) : (
            <>
              {selected.description_longue && (
                <p className="mb-4 whitespace-pre-line leading-relaxed">
                  {selected.description_longue}
                </p>
              )}
              {selected.source_url && (
                <a
                  href={selected.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-terra)] hover:underline text-sm"
                >
                  Voir la source →
                </a>
              )}
            </>
          )}
        </article>

        <div className="mt-4">
          <button
            onClick={backToMenu}
            className="px-4 py-2 rounded bg-[var(--color-olive)] text-white hover:bg-[var(--color-terra)] font-semibold"
          >
            ← Retour au menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-[var(--color-lavender)] mb-6">
        Histoire & légendes — Sommaire
      </h2>

      {loading ? (
        <Loader message="Chargement du sommaire..." />
      ) : (
        <div className="space-y-8">
          {Object.keys(menuData).length === 0 && (
            <p className="text-gray-600">Aucun contenu disponible.</p>
          )}

          {Object.entries(menuData).map(([typologie, periodes]) => (
            <section key={typologie} className="border rounded bg-white shadow-sm">
              <header className="px-4 py-3 border-b bg-[var(--color-bg)]">
                <h3 className="font-bold text-xl text-[var(--color-lavender)]">
                  {typologie}
                </h3>
              </header>

              <div className="p-4 space-y-6">
                {Object.entries(periodes).map(([periode, items]) => (
                  <div key={periode}>
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {periode}
                    </h4>

                    <ul className="grid md:grid-cols-2 gap-2">
                      {items.map(({ id, titre, description_courte }) => (
                        <li key={id} className="relative">
                          <button
                            onClick={() => openDetail(id)}  // 👈 passer l'id
                            className="group w-full text-left px-3 py-2 rounded border hover:border-[var(--color-terra)] hover:bg-[var(--color-bg)]"
                            aria-describedby={`hint-${id}`}
                          >
                            <span className="text-[var(--color-terra)] font-medium group-hover:underline">
                              {titre}
                            </span>

                            {description_courte && (
                              <span
                                id={`hint-${id}`}
                                className="pointer-events-none absolute left-full top-1 ml-3 z-10 hidden group-hover:block group-focus-within:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg"
                              >
                                {description_courte}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
