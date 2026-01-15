// components/ArticleCard.jsx
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ApiAlert from './ApiAlert';
import { toastError, toastSuccess } from '../utils/notify';
import { deleteArticle, deleteArticleImage, getApiErrorMessage, getArticleImageUrl, updateArticle, uploadArticleImage } from '../services/api';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function ArticleCard({
  id,
  titre,
  description,
  imageUrl,
  image_url, // back-compat (should disappear once API normalization is everywhere)
  imageStored,
  image_stored,
  sourceUrl,
  source_url, // back-compat
  onUpdated,
  onDeleted,
}) {
  const { user, ready } = useAuth();

  const initial = {
    titre,
    description,
    imageUrl: imageUrl ?? image_url ?? '',
    sourceUrl: sourceUrl ?? source_url ?? '',
    imageStored: imageStored ?? image_stored ?? false,
  };

  const [view, setView] = useState(initial);
  const [form, setForm] = useState(initial);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [imageRev, setImageRev] = useState(0);

  const [deleting, setDeleting] = useState(false);

  const hasChanges = useMemo(() => {
    return (
      form.titre !== view.titre ||
      form.description !== view.description ||
      form.imageUrl !== view.imageUrl ||
      form.sourceUrl !== view.sourceUrl ||
      Boolean(imageFile)
    );
  }, [form, view, imageFile]);

  const isValidUrl = (u) => {
    if (!u) return true;
    try { new URL(u); return true; } catch { return false; }
  };

  const startEdit = () => {
    setErrorMsg(null);
    setFieldErrors({});
    setForm({ ...view });
    setImageFile(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setErrorMsg(null);
    setFieldErrors({});
    setForm({ ...view });
    setImageFile(null);
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

      const updated = await updateArticle(id, payload);

      let final = {
        ...payload,
        imageStored: Boolean(updated?.imageStored),
      };

      if (imageFile) {
        const afterUpload = await uploadArticleImage(id, imageFile);
        final = {
          ...final,
          imageStored: Boolean(afterUpload?.imageStored),
        };
        setImageRev((n) => n + 1);
        setImageFile(null);
      }

      setView(final);
      setForm(final);
      setIsEditing(false);

      if (typeof onUpdated === 'function') onUpdated(updated);
    } catch (err) {
      const msg = getApiErrorMessage(err) || "Une erreur est survenue lors de la mise à jour.";
      setErrorMsg(msg);
      toastError(msg);
      const field = err?.response?.data?.detail?.field;
      if (field) setFieldErrors({ [field]: msg });
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
              className="btn btn-primary"
            >
              Éditer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                className="btn btn-secondary disabled:opacity-80"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="btn btn-primary disabled:opacity-80"
              >
                {loading ? 'Enregistrement…' : 'Valider'}
              </button>
            </>
          )}
          {!isEditing && (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Supprimer cet article ?')) return;
                setDeleting(true);
                try {
                  await deleteArticle(id);
                  if (typeof onDeleted === 'function') onDeleted(id);
                  toastSuccess('Article supprimé.');
                } catch (err) {
                  setErrorMsg(getApiErrorMessage(err) || 'Impossible de supprimer.');
                  toastError(getApiErrorMessage(err) || 'Impossible de supprimer.');
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="btn btn-danger"
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          )}
        </div>
      )}

      {/* Corps de la carte */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="w-full md:w-32">
          {!isEditing ? (
            view.imageStored ? (
              <img
                src={getArticleImageUrl(id, imageRev)}
                alt={`Illustration de ${view.titre}`}
                className="w-full md:w-32 h-32 object-cover rounded"
              />
            ) : view.imageUrl ? (
              <img
                src={view.imageUrl}
                alt={`Illustration de ${view.titre}`}
                className="w-full md:w-32 h-32 object-cover rounded"
              />
            ) : (
              <div className="w-full md:w-32 h-32 rounded bg-gray-100" />
            )
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

              <label className="text-sm font-medium" htmlFor={`file-${id}`}>Image (fichier) (optionnel, &lt; 2Mo)</label>
              <input
                id={`file-${id}`}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (!f) {
                    setImageFile(null);
                    return;
                  }
                  if (f.size > MAX_IMAGE_BYTES) {
                    setErrorMsg('Image trop lourde (max 2Mo).');
                    e.target.value = '';
                    setImageFile(null);
                    return;
                  }
                  setImageFile(f);
                }}
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
              {canEdit && view.imageStored && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Retirer l’image stockée ?')) return;
                    setErrorMsg(null);
                    setLoading(true);
                    try {
                      const updated = await deleteArticleImage(id);
                      setView((v) => ({ ...v, imageStored: Boolean(updated?.imageStored) }));
                      setImageRev((n) => n + 1);
                      if (typeof onUpdated === 'function') onUpdated(updated);
                    } catch (err) {
                      setErrorMsg(getApiErrorMessage(err) || "Impossible de retirer l'image.");
                        toastError(getApiErrorMessage(err) || "Impossible de retirer l'image.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-sm text-gray-700 underline hover:opacity-80"
                >
                  Retirer l’image stockée
                </button>
              )}
              <a href={view.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link font-semibold hover:underline">
                Lire la suite →
              </a>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium" htmlFor={`titre-${id}`}>Titre</label>
                <input id={`titre-${id}`} type="text" value={form.titre} onChange={(e) => handleChange('titre', e.target.value)} className="input" />
                {fieldErrors.titre && <div className="text-red-600 text-sm mt-1">{fieldErrors.titre}</div>}
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor={`desc-${id}`}>Description</label>
                <textarea id={`desc-${id}`} value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="input" />
                {fieldErrors.description && <div className="text-red-600 text-sm mt-1">{fieldErrors.description}</div>}
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
                {fieldErrors.sourceUrl && <div className="text-red-600 text-sm mt-1">{fieldErrors.sourceUrl}</div>}
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
