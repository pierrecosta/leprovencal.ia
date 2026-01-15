import { useMemo, useState, ChangeEvent } from 'react';
import type { Article } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { ApiAlert } from './ApiAlert';
import { toastError, toastSuccess } from '@/utils/notify';
import { isValidUrl } from '@/utils/helpers';
import {
  deleteArticle,
  deleteArticleImage,
  getApiErrorMessage,
  getArticleImageUrl,
  updateArticle,
  uploadArticleImage,
} from '@/services/api';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

interface ArticleCardProps {
  article: Article;
  onUpdated?: (article: Article) => void;
  onDeleted?: (id: number) => void;
}

interface FormData {
  titre: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  imageStored: boolean;
}

export function ArticleCard({ article, onUpdated, onDeleted }: ArticleCardProps) {
  const { user, ready } = useAuth();

  const initial: FormData = {
    titre: article.titre,
    description: article.description,
    imageUrl: article.imageUrl,
    sourceUrl: article.sourceUrl,
    imageStored: article.imageStored,
  };

  const [view, setView] = useState<FormData>(initial);
  const [form, setForm] = useState<FormData>(initial);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setErrorMsg(null);

    if (!form.titre?.trim()) {
      setErrorMsg('Le titre est obligatoire.');
      return;
    }
    if (!isValidUrl(form.imageUrl)) {
      setErrorMsg("L'URL de l'image n'est pas valide.");
      return;
    }
    if (!isValidUrl(form.sourceUrl)) {
      setErrorMsg("L'URL de la source n'est pas valide.");
      return;
    }
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titre: form.titre.trim(),
        description: form.description?.trim() ?? '',
        imageUrl: form.imageUrl?.trim() ?? '',
        sourceUrl: form.sourceUrl?.trim() ?? '',
      };

      const updated = await updateArticle(article.id, payload);

      let final: FormData = {
        ...payload,
        imageStored: Boolean(updated?.imageStored),
      };

      if (imageFile) {
        const afterUpload = await uploadArticleImage(article.id, imageFile);
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
      toastSuccess('Article mis à jour avec succès !');

      if (onUpdated) onUpdated(updated);
    } catch (err) {
      const msg = getApiErrorMessage(err) || "Une erreur est survenue lors de la mise à jour.";
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Supprimer l\'image stockée ?')) return;

    setLoading(true);
    try {
      await deleteArticleImage(article.id);
      setView((prev) => ({ ...prev, imageStored: false }));
      setForm((prev) => ({ ...prev, imageStored: false }));
      setImageRev((n) => n + 1);
      toastSuccess('Image supprimée avec succès !');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      toastError(msg || 'Impossible de supprimer l\'image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cet article ?')) return;

    setDeleting(true);
    try {
      await deleteArticle(article.id);
      toastSuccess('Article supprimé avec succès !');
      if (onDeleted) onDeleted(article.id);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      toastError(msg || 'Impossible de supprimer l\'article.');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toastError('Fichier trop volumineux (max 2 Mo).');
      e.target.value = '';
      return;
    }

    setImageFile(file);
  };

  const canEdit = ready && !!user;

  const displayImageUrl = view.imageStored
    ? getArticleImageUrl(article.id, imageRev)
    : view.imageUrl;

  return (
    <div className="card flex flex-col gap-4">
      {/* Action bar (top) */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2">
          {!isEditing ? (
            <button type="button" onClick={startEdit} className="btn btn-primary">
              Éditer
            </button>
          ) : (
            <>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </>
          )}
        </div>
      )}

      {errorMsg && <ApiAlert message={errorMsg} type="error" onDismiss={() => setErrorMsg(null)} />}

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        {displayImageUrl && (
          <div className="md:w-1/3">
            <img
              src={displayImageUrl}
              alt={view.titre}
              className="w-full h-auto rounded shadow-sm object-cover"
            />
            {canEdit && view.imageStored && !isEditing && (
              <button
                onClick={handleDeleteImage}
                className="mt-2 text-sm text-red-600 hover:underline"
                disabled={loading}
              >
                Supprimer l'image
              </button>
            )}
          </div>
        )}

        {/* Text */}
        <div className="flex-1">
          {!isEditing ? (
            <>
              <h3 className="text-2xl font-bold text-heading mb-2">{view.titre}</h3>
              <p className="text-text mb-4">{view.description}</p>
              {view.sourceUrl && (
                <a
                  href={view.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:text-linkHover underline"
                >
                  Voir la source →
                </a>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Titre *</label>
                <input
                  type="text"
                  className="input"
                  value={form.titre}
                  onChange={(e) => handleChange('titre', e.target.value)}
                  placeholder="Titre de l'article"
                  required
                />
                {fieldErrors.titre && <div className="text-red-600 text-sm mt-1">{fieldErrors.titre}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">URL de l'image</label>
                <input
                  type="url"
                  className="input"
                  value={form.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Ou uploader une image (max 2Mo)</label>
                <input
                  type="file"
                  className="input"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
                {imageFile && <p className="text-sm text-muted mt-1">Fichier sélectionné: {imageFile.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">URL de la source</label>
                <input
                  type="url"
                  className="input"
                  value={form.sourceUrl}
                  onChange={(e) => handleChange('sourceUrl', e.target.value)}
                  placeholder="https://example.com/source"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete button */}
      {canEdit && !isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? 'Suppression...' : 'Supprimer l\'article'}
          </button>
        </div>
      )}
    </div>
  );
}
