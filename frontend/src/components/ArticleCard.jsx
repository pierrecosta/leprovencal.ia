// components/ArticleCard.jsx
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ApiAlert from './ApiAlert';
import { getApiErrorMessage, updateArticle } from '../services/api';

export default function ArticleCard({
  id,
  titre,
  description,
  imageUrl,
  image_url, // back-compat (should disappear once API normalization is everywhere)
  sourceUrl,
  source_url, // back-compat
  onUpdated,
}) {
  const { user, ready } = useAuth();

  const initial = {
    titre,
    description,
    imageUrl: imageUrl ?? image_url ?? '',
    sourceUrl: sourceUrl ?? source_url ?? '',
  };

  const [view, setView] = useState(initial);
  const [form, setForm] = useState(initial);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const hasChanges = useMemo(() => {
    return (
      form.titre !== view.titre ||
      form.description !== view.description ||
      form.imageUrl !== view.imageUrl ||
      form.sourceUrl !== view.sourceUrl
    );
  }, [form, view]);

  const isValidUrl = (u) => {
    if (!u) return true;
    try { new URL(u); return true; } catch { return false; }
  };

  const startEdit = () => {
    setErrorMsg(null);
    setForm({ ...view });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setErrorMsg(null);
    setForm({ ...view });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setErrorMsg(null);

    if (!form.titre?.trim()) return setErrorMsg('Le titre est obligatoire.');
    if (!isValidUrl(form.imageUrl)) return setErrorMsg("L'URL de l'image n'est pas valide.");
    if (!isValidUrl(form.sourceUrl)) return setErrorMsg("L'URL de la source n'est pas valide.");
    if (!hasChanges) return setIsEditing(false);

    setLoading(true);
    try {
      const payload = {
        titre: form.titre.trim(),
        description: form.description?.trim() ?? '',
        imageUrl: form.imageUrl?.trim() ?? '',
        sourceUrl: form.sourceUrl?.trim() ?? '',
      };

      const data = await updateArticle(id, payload);

      // Keep UI canonical/trimmed
      setView({ ...payload });
      setForm({ ...payload });
      setIsEditing(false);

      if (typeof onUpdated === 'function') onUpdated(data);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || "Une erreur est survenue lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  const canEdit = ready && !!user;

  return (
    <div className="card flex flex-col gap-4">
      {/* Barre d'action (haut) */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={startEdit}
              className="px-3 py-1.5 rounded bg-[var(--color-terra)] text-black hover:opacity-90"
            >
              Éditer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                className="px-3 py-1.5 rounded border border-gray-300 text-green hover:bg-gray-50 disabled:opacity-80"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="px-3 py-1.5 rounded bg-[var(--color-lavender)] text-red hover:opacity-90 disabled:opacity-80"
              >
                {loading ? 'Enregistrement…' : 'Valider'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Corps de la carte */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="w-full md:w-32">
          {!isEditing ? (
            <img
              src={view.imageUrl}
              alt={`Illustration de ${view.titre}`}
              className="w-full md:w-32 h-32 object-cover rounded"
            />
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor={`image-${id}`}>URL de l’image</label>
              <input
                id={`image-${id}`}
                type="url"
                value={form.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="input"
              />
              {isValidUrl(form.imageUrl) && form.imageUrl ? (
                <img src={form.imageUrl} alt="Prévisualisation" className="w-full h-32 object-cover rounded border" />
              ) : form.imageUrl ? (
                <div className="text-xs text-red-600">URL non valide</div>
              ) : null}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col justify-between">
          {!isEditing ? (
            <>
              <h3 className="text-xl font-bold text-secondary mb-2">{view.titre}</h3>
              <p className="text-content mb-3">{view.description}</p>
              <a href={view.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link font-semibold hover:underline">
                Lire la suite →
              </a>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium" htmlFor={`titre-${id}`}>Titre</label>
                <input id={`titre-${id}`} type="text" value={form.titre} onChange={(e) => handleChange('titre', e.target.value)} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor={`desc-${id}`}>Description</label>
                <textarea id={`desc-${id}`} value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor={`src-${id}`}>URL de la source</label>
                <input
                  id={`src-${id}`}
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => handleChange('sourceUrl', e.target.value)}
                  placeholder="https://exemple.com/article"
                  className="input"
                />
                {!isValidUrl(form.sourceUrl) && form.sourceUrl && <div className="text-xs text-red-600">URL non valide</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {errorMsg && <ApiAlert message={errorMsg} kind="error" />}
    </div>
  );
}
