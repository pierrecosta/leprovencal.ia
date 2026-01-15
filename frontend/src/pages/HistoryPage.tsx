import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MenuHistoires } from '@/types';
import { getMenuHistoires } from '@/services/api';
import { Loader } from '@/components/Loader';

type MenuEntry = {
  id: number;
  titre: string;
  descriptionCourte: string;
  typologie: string;
  periode: string;
};

function normalizeKey(value: string) {
  return (value || '').trim().toLowerCase();
}

function isLegendeTypologie(value: string) {
  const k = normalizeKey(value);
  return k.includes('légende') || k.includes('legende');
}

function collectEntries(menu: MenuHistoires, predicate: (typologie: string) => boolean): MenuEntry[] {
  const entries: MenuEntry[] = [];
  for (const typologie of Object.keys(menu)) {
    if (!predicate(typologie)) continue;
    const periodes = menu[typologie] || {};
    for (const periode of Object.keys(periodes)) {
      const items = periodes[periode] || [];
      for (const item of items) {
        entries.push({ ...item, typologie, periode });
      }
    }
  }
  return entries;
}

function groupByPeriode(entries: MenuEntry[]) {
  const result: Record<string, MenuEntry[]> = {};
  for (const entry of entries) {
    if (!result[entry.periode]) result[entry.periode] = [];
    result[entry.periode].push(entry);
  }
  return result;
}

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
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6 pb-10">
        <h1 className="text-3xl font-bold text-heading mb-2">Histoire &amp; Légendes</h1>
        <p className="text-muted mb-6">Découvrez les récits et traditions qui façonnent la Provence.</p>
        <div className="card text-center py-8">
          <p className="text-muted">Aucune histoire disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  const histoiresEntries = collectEntries(menu, (t) => !isLegendeTypologie(t));
  const legendesEntries = collectEntries(menu, (t) => isLegendeTypologie(t));
  const histoiresByPeriode = groupByPeriode(histoiresEntries);
  const legendesByPeriode = groupByPeriode(legendesEntries);

  const histoiresPeriodes = Object.keys(histoiresByPeriode);
  const legendesPeriodes = Object.keys(legendesByPeriode);

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6 pb-10">
      <h1 className="text-3xl font-bold text-heading mb-2">Histoire &amp; Légendes de Provence</h1>
      <p className="text-muted mb-6">Deux lectures, un même territoire : récits historiques et traditions légendaires.</p>

      <div className="hl-grid">
        <section className="card hl-panel">
          <div className="hl-panel-header">
            <h2 className="hl-panel-title text-2xl font-bold text-heading">
              <span aria-hidden="true">📜</span> Histoires
            </h2>
            <span className="badge badge-primary">{histoiresEntries.length} entrées</span>
          </div>
          <p className="hl-panel-subtitle text-muted">Repères, personnages et événements marquants.</p>

          {histoiresPeriodes.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-muted">Aucune histoire disponible pour le moment.</p>
            </div>
          ) : (
            <div>
              {histoiresPeriodes.map((periode, index) => {
                const items = histoiresByPeriode[periode] || [];
                if (items.length === 0) return null;

                return (
                  <details key={periode} className="hl-accordion" open={index === 0}>
                    <summary>
                      <span className="hl-accordion-title">{periode}</span>
                      <span className="hl-accordion-count">{items.length}</span>
                    </summary>
                    <div className="hl-accordion-body">
                      {items.map((item) => (
                        <Link key={item.id} to={`/histoire-legendes/${item.id}`} className="hl-item">
                          <div className="hl-item-top">
                            <h3 className="hl-item-title">{item.titre}</h3>
                            <span className="badge badge-secondary">{item.periode}</span>
                          </div>
                          <p className="hl-item-desc">{item.descriptionCourte}</p>
                        </Link>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>

        <section className="card hl-panel">
          <div className="hl-panel-header">
            <h2 className="hl-panel-title text-2xl font-bold text-heading">
              <span aria-hidden="true">✨</span> Légendes
            </h2>
            <span className="badge badge-terra">{legendesEntries.length} entrées</span>
          </div>
          <p className="hl-panel-subtitle text-muted">Traditions orales, croyances et récits populaires.</p>

          {legendesPeriodes.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-muted">Aucune légende disponible pour le moment.</p>
            </div>
          ) : (
            <div>
              {legendesPeriodes.map((periode, index) => {
                const items = legendesByPeriode[periode] || [];
                if (items.length === 0) return null;

                return (
                  <details key={periode} className="hl-accordion" open={index === 0}>
                    <summary>
                      <span className="hl-accordion-title">{periode}</span>
                      <span className="hl-accordion-count">{items.length}</span>
                    </summary>
                    <div className="hl-accordion-body">
                      {items.map((item) => (
                        <Link key={item.id} to={`/histoire-legendes/${item.id}`} className="hl-item">
                          <div className="hl-item-top">
                            <h3 className="hl-item-title">{item.titre}</h3>
                            <span className="badge badge-secondary">{item.periode}</span>
                          </div>
                          <p className="hl-item-desc">{item.descriptionCourte}</p>
                        </Link>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
