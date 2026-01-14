import { useEffect, useState } from 'react';
import ApiAlert from '../components/ApiAlert';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { logError } from '../utils/logger';
import { createHistoire, deleteHistoire, getHistoireById, getMenuHistoires, updateHistoire, getApiErrorMessage, getApiErrorField } from '../services/api';

export default function HistoryPage() {
  const { user, ready } = useAuth();
  const [menuData, setMenuData] = useState({});
  const [selected, setSelected] = useState(null);

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    titre: '',
    typologie: '',
    periode: '',
    descriptionCourte: '',
    descriptionLongue: '',
    sourceUrl: '',
  });

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      setError('');
      try {
        const res = await getMenuHistoires();
        setMenuData(res.data);
      } catch (err) {
        logError(err);
        setError("Impossible de charger le sommaire.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const refreshMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMenuHistoires();
      setMenuData(res.data);
    } catch (err) {
      logError(err);
      setError("Impossible de charger le sommaire.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setLoadingDetail(true);
    setError('');
    try {
      const res = await getHistoireById(id);
      setSelected(res.data);
      setEditing(false);
      setEditForm(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      logError(err);
      setError("Impossible de charger cette histoire.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const backToMenu = () => {
    setSelected(null);
    setError('');
    setEditing(false);
    setEditForm(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = () => {
    if (!selected) return;
    setEditing(true);
    setEditForm({
      titre: selected.titre ?? '',
      typologie: selected.typologie ?? '',
      periode: selected.periode ?? '',
      descriptionCourte: selected.descriptionCourte ?? '',
      descriptionLongue: selected.descriptionLongue ?? '',
      sourceUrl: selected.sourceUrl ?? '',
    });
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm(null);
  };

  const saveEditing = async () => {
    if (!selected || !editForm) return;
    setError('');
    setFieldErrors({});
    try {
      const updated = await updateHistoire(selected.id, editForm);
      setSelected(updated);
      setEditing(false);
      setEditForm(null);
      await refreshMenu();
    } catch (err) {
      logError(err);
      const msg = getApiErrorMessage(err);
      setError(msg || "Impossible de modifier cette histoire.");
      const field = getApiErrorField(err);
      if (field) setFieldErrors({ [field]: msg });
    }
  };

  const removeSelected = async () => {
    if (!selected) return;
    const ok = window.confirm('Supprimer cette histoire ?');
    if (!ok) return;
    setError('');
    setFieldErrors({});
    try {
      await deleteHistoire(selected.id);
      setSelected(null);
      setEditing(false);
      setEditForm(null);
      await refreshMenu();
    } catch (err) {
      logError(err);
      const msg = getApiErrorMessage(err);
      setError(msg || "Impossible de supprimer cette histoire.");
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      const created = await createHistoire(createForm);
      setCreateForm({
        titre: '',
        typologie: '',
        periode: '',
        descriptionCourte: '',
        descriptionLongue: '',
        sourceUrl: '',
      });
      setCreating(false);
      await refreshMenu();
      await openDetail(created.id);
    } catch (err) {
      logError(err);
      const msg = getApiErrorMessage(err);
      setError(msg || "Impossible de créer une histoire.");
      const field = getApiErrorField(err);
      if (field) setFieldErrors({ [field]: msg });
    }
  };

  if (selected) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        {error && <ApiAlert message={error} kind="error" className="mb-4" />}

        <div className="mb-4">
          <button
            onClick={backToMenu}
            className="btn btn-secondary"
          >
            ← Retour au menu
          </button>
        </div>

        <article className="mb-6 p-6 border rounded shadow-sm bg-white">
          {loadingDetail ? (
            <Loader message="Chargement..." />
          ) : (
            <>
              {!editing ? (
                <>
                  <h1 className="font-bold text-2xl text-[var(--color-lavender)] mb-3">{selected.titre}</h1>

                  <div className="text-sm text-gray-600 mb-4">
                    <span className="mr-3">
                      <strong>Typologie :</strong> {selected.typologie}
                    </span>
                    <span>
                      <strong>Période :</strong> {selected.periode}
                    </span>
                  </div>

                  {selected.descriptionLongue && (
                    <p className="mb-4 whitespace-pre-line leading-relaxed">{selected.descriptionLongue}</p>
                  )}
                  {selected.sourceUrl && (
                    <a
                      href={selected.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-terra)] hover:underline text-sm"
                    >
                      Voir la source →
                    </a>
                  )}

                  {ready && user && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button onClick={startEditing} className="btn btn-primary">
                        Modifier
                      </button>
                      <button onClick={removeSelected} className="btn btn-danger">
                        Supprimer
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="font-bold text-xl text-[var(--color-lavender)] mb-3">Modifier l’histoire</h2>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Titre</label>
                      <input
                        className="input"
                        value={editForm?.titre ?? ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, titre: e.target.value }))}
                      />
                      {fieldErrors.titre && <div className="text-red-600 text-sm mt-1">{fieldErrors.titre}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Typologie</label>
                      <input
                        className="input"
                        value={editForm?.typologie ?? ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, typologie: e.target.value }))}
                      />
                      {fieldErrors.typologie && <div className="text-red-600 text-sm mt-1">{fieldErrors.typologie}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Période</label>
                      <input
                        className="input"
                        value={editForm?.periode ?? ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, periode: e.target.value }))}
                      />
                      {fieldErrors.periode && <div className="text-red-600 text-sm mt-1">{fieldErrors.periode}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Légende courte (survol)</label>
                      <input
                        className="input"
                        value={editForm?.descriptionCourte ?? ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, descriptionCourte: e.target.value }))}
                      />
                      {fieldErrors.descriptionCourte && <div className="text-red-600 text-sm mt-1">{fieldErrors.descriptionCourte}</div>}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">Texte</label>
                    <textarea
                      className="input"
                      rows={8}
                      value={editForm?.descriptionLongue ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, descriptionLongue: e.target.value }))}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">Source (URL)</label>
                    <input
                      className="input"
                      value={editForm?.sourceUrl ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button onClick={saveEditing} className="btn btn-primary">
                      Enregistrer
                    </button>
                    <button onClick={cancelEditing} className="btn btn-secondary">
                      Annuler
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </article>

        <div className="mt-4">
          <button
            onClick={backToMenu}
            className="btn btn-secondary"
          >
            ← Retour au menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-[var(--color-lavender)] mb-6">Histoire & légendes — Sommaire</h2>

      {error && <ApiAlert message={error} kind="error" className="mb-4" />}

      {ready && user && (
        <section className="mb-6 border rounded bg-white shadow-sm">
          <header className="px-4 py-3 border-b bg-[var(--bg)] flex items-center justify-between gap-2">
            <h3 className="font-bold text-xl text-[var(--color-lavender)]">Gestion (loggué)</h3>
            <button className="btn btn-primary" onClick={() => setCreating((v) => !v)}>
              {creating ? 'Fermer' : 'Ajouter une histoire'}
            </button>
          </header>

          {creating && (
            <form onSubmit={submitCreate} className="p-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Titre *</label>
                  <input
                    className="input"
                    required
                    value={createForm.titre}
                    onChange={(e) => setCreateForm((f) => ({ ...f, titre: e.target.value }))}
                  />
                  {fieldErrors.titre && <div className="text-red-600 text-sm mt-1">{fieldErrors.titre}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Typologie *</label>
                  <input
                    className="input"
                    required
                    value={createForm.typologie}
                    onChange={(e) => setCreateForm((f) => ({ ...f, typologie: e.target.value }))}
                  />
                  {fieldErrors.typologie && <div className="text-red-600 text-sm mt-1">{fieldErrors.typologie}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Période *</label>
                  <input
                    className="input"
                    required
                    value={createForm.periode}
                    onChange={(e) => setCreateForm((f) => ({ ...f, periode: e.target.value }))}
                  />
                  {fieldErrors.periode && <div className="text-red-600 text-sm mt-1">{fieldErrors.periode}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Légende courte (survol)</label>
                  <input
                    className="input"
                    value={createForm.descriptionCourte}
                    onChange={(e) => setCreateForm((f) => ({ ...f, descriptionCourte: e.target.value }))}
                  />
                  {fieldErrors.descriptionCourte && <div className="text-red-600 text-sm mt-1">{fieldErrors.descriptionCourte}</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Texte</label>
                <textarea
                  className="input"
                  rows={6}
                  value={createForm.descriptionLongue}
                  onChange={(e) => setCreateForm((f) => ({ ...f, descriptionLongue: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Source (URL)</label>
                <input
                  className="input"
                  value={createForm.sourceUrl}
                  onChange={(e) => setCreateForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Créer
              </button>
            </form>
          )}
        </section>
      )}

      {loading ? (
        <Loader message="Chargement du sommaire..." />
      ) : (
        <div className="space-y-8">
          {Object.keys(menuData).length === 0 && <p className="text-gray-600">Aucun contenu disponible.</p>}

          {Object.entries(menuData).map(([typologie, periodes]) => (
            <section key={typologie} className="border rounded bg-white shadow-sm">
              <header className="px-4 py-3 border-b bg-[var(--bg)]">
                <h3 className="font-bold text-xl text-[var(--color-lavender)]">{typologie}</h3>
              </header>

              <div className="p-4 space-y-6">
                {Object.entries(periodes).map(([periode, items]) => (
                  <div key={periode}>
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">{periode}</h4>

                    <ul className="grid md:grid-cols-2 gap-2">
                      {items.map(({ id, titre, descriptionCourte }) => (
                        <li key={id} className="relative">
                          <button
                            onClick={() => openDetail(id)}
                            className="group w-full text-left px-3 py-2 rounded border hover:border-[var(--color-terra)] hover:bg-white"
                            aria-describedby={`hint-${id}`}
                          >
                            <span className="text-[var(--color-terra)] font-medium group-hover:underline">{titre}</span>

                            {descriptionCourte && (
                              <span
                                id={`hint-${id}`}
                                className="pointer-events-none absolute left-full top-1 ml-3 z-10 hidden group-hover:block group-focus-within:block w-64 p-2 bg-black text-white text-sm rounded shadow-lg"
                              >
                                {descriptionCourte}
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
  );
}
