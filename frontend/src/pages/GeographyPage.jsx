import { useEffect, useMemo, useState } from 'react';
import ApiAlert from '../components/ApiAlert';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { createCarte, deleteCarte, deleteCarteImage, getCarteImageUrl, getCartes, updateCarte, uploadCarteImage } from '../services/api';
import { logError } from '../utils/logger';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function GeographyPage() {
  const { user, ready } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  const [imgRevById, setImgRevById] = useState({});

  const [createForm, setCreateForm] = useState({ titre: '', iframeUrl: '', legende: '' });
  const [createImageFile, setCreateImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ titre: '', iframeUrl: '', legende: '' });
  const [editImageFile, setEditImageFile] = useState(null);

  const isLoggedIn = useMemo(() => Boolean(ready && user), [ready, user]);

  const fetchCartes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCartes();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      logError(err);
      setError("Impossible de charger les cartes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (carte) => {
    setEditingId(carte.id);
    setEditForm({
      titre: carte.titre ?? '',
      iframeUrl: carte.iframeUrl ?? '',
      legende: carte.legende ?? '',
    });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ titre: '', iframeUrl: '', legende: '' });
    setEditImageFile(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError('');
    try {
      let updated = await updateCarte(editingId, editForm);
      if (editImageFile) {
        updated = await uploadCarteImage(editingId, editImageFile);
        setImgRevById((m) => ({ ...m, [editingId]: (m[editingId] || 0) + 1 }));
        setEditImageFile(null);
      }
      setItems((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      cancelEdit();
    } catch (err) {
      logError(err);
      setError("Impossible de modifier la carte.");
    }
  };

  const remove = async (id) => {
    const ok = window.confirm('Supprimer cette carte ?');
    if (!ok) return;
    setError('');
    try {
      await deleteCarte(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      logError(err);
      setError("Impossible de supprimer la carte.");
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError('');
    const titre = (createForm.titre || '').trim();
    const iframeUrl = (createForm.iframeUrl || '').trim();
    if (!titre) return setError('Le titre est obligatoire.');
    if (!iframeUrl && !createImageFile) return setError('Il faut une iframe URL ou une image.');
    try {
      let created = await createCarte(createForm);
      if (createImageFile) {
        try {
          created = await uploadCarteImage(created.id, createImageFile);
          setImgRevById((m) => ({ ...m, [created.id]: (m[created.id] || 0) + 1 }));
        } catch (uploadErr) {
          // Avoid leaving a carte without iframe nor image
          if (!iframeUrl) {
            try {
              await deleteCarte(created.id);
            } catch {
              // ignore
            }
          }
          throw uploadErr;
        }
      }
      setItems((prev) => [created, ...prev]);
      setCreateForm({ titre: '', iframeUrl: '', legende: '' });
      setCreateImageFile(null);
      setCreating(false);
    } catch (err) {
      logError(err);
      setError("Impossible de créer la carte.");
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-[var(--color-lavender)] mb-4">Cartes</h2>

      {error && <ApiAlert message={error} kind="error" className="mb-4" />}

      {isLoggedIn && (
        <section className="mb-6 border rounded bg-white shadow-sm">
          <header className="px-4 py-3 border-b bg-[var(--bg)] flex items-center justify-between gap-2">
            <h3 className="font-bold text-xl text-[var(--color-lavender)]">Gestion (loggué)</h3>
            <button className="btn btn-primary" onClick={() => setCreating((v) => !v)} type="button">
              {creating ? 'Fermer' : 'Ajouter une carte'}
            </button>
          </header>

          {creating && (
            <form onSubmit={submitCreate} className="p-4 grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Titre *</label>
                <input
                  className="input"
                  required
                  value={createForm.titre}
                  onChange={(e) => setCreateForm((f) => ({ ...f, titre: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Iframe URL (optionnel si image)</label>
                <input
                  className="input"
                  value={createForm.iframeUrl}
                  onChange={(e) => setCreateForm((f) => ({ ...f, iframeUrl: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Légende</label>
                <input
                  className="input"
                  value={createForm.legende}
                  onChange={(e) => setCreateForm((f) => ({ ...f, legende: e.target.value }))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold mb-1">Image (fichier) (optionnel, &lt; 2Mo)</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) {
                      setCreateImageFile(null);
                      return;
                    }
                    if (f.size > MAX_IMAGE_BYTES) {
                      e.target.value = '';
                      setCreateImageFile(null);
                      return;
                    }
                    setCreateImageFile(f);
                  }}
                />
              </div>
              <div className="md:col-span-3">
                <button type="submit" className="btn btn-primary">
                  Créer
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {loading ? (
        <Loader message="Chargement des cartes..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((carte) => (
            <div key={carte.id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
              {carte.imageStored ? (
                <img
                  src={getCarteImageUrl(carte.id, imgRevById[carte.id] || 0)}
                  alt={`Illustration de ${carte.titre}`}
                  loading="lazy"
                  className="w-full h-[320px] md:h-[400px] object-cover"
                />
              ) : carte.iframeUrl ? (
                <iframe
                  src={carte.iframeUrl}
                  title={carte.titre}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-[320px] md:h-[400px] border-0"
                />
              ) : (
                <div className="w-full h-[320px] md:h-[400px] bg-[var(--slate-100)]" />
              )}

              <div className="p-3">
                {editingId === carte.id ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Titre</label>
                      <input
                        className="input"
                        value={editForm.titre}
                        onChange={(e) => setEditForm((f) => ({ ...f, titre: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Iframe URL</label>
                      <input
                        className="input"
                        value={editForm.iframeUrl}
                        onChange={(e) => setEditForm((f) => ({ ...f, iframeUrl: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Légende</label>
                      <input
                        className="input"
                        value={editForm.legende}
                        onChange={(e) => setEditForm((f) => ({ ...f, legende: e.target.value }))}
                      />
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
                            setEditImageFile(null);
                            return;
                          }
                          if (f.size > MAX_IMAGE_BYTES) {
                            e.target.value = '';
                            setEditImageFile(null);
                            return;
                          }
                          setEditImageFile(f);
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary" onClick={saveEdit} type="button">
                        Enregistrer
                      </button>
                      <button className="btn btn-secondary" onClick={cancelEdit} type="button">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-[var(--color-lavender)]">{carte.titre}</div>
                    {carte.legende && <div className="text-sm text-gray-600">{carte.legende}</div>}

                    {isLoggedIn && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="btn btn-primary" onClick={() => startEdit(carte)} type="button">
                          Modifier
                        </button>
                        {carte.imageStored && (
                          <button
                            className="btn btn-secondary"
                            onClick={async () => {
                              if (!window.confirm('Retirer l’image stockée ?')) return;
                              setError('');
                              try {
                                const updated = await deleteCarteImage(carte.id);
                                setItems((prev) => prev.map((c) => (c.id === carte.id ? updated : c)));
                                setImgRevById((m) => ({ ...m, [carte.id]: (m[carte.id] || 0) + 1 }));
                              } catch (err) {
                                logError(err);
                                setError("Impossible de retirer l'image.");
                              }
                            }}
                            type="button"
                          >
                            Retirer l’image
                          </button>
                        )}
                        <button className="btn btn-danger" onClick={() => remove(carte.id)} type="button">
                          Supprimer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
