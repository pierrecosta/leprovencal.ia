import { ChangeEvent } from 'react';
import type { Article } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useEditInPlace } from '@/hooks/useEditInPlace';
import { ApiAlert } from './ApiAlert';
import { toastError, toastSuccess } from '@/utils/notify';
import { validateRequired, isValidUrl, validateImageFile, VALIDATION_CONSTANTS } from '@/utils/validation';
import {
  deleteArticle,
  deleteArticleImage,
  getApiErrorMessage,
  getArticleImageUrl,
  updateArticle,
  uploadArticleImage,
} from '@/services/api';

interface ArticleCardProps {
  article: Article;
  onUpdated?: (article: Article) => void;
  onDeleted?: (id: number) => void;
}

interface ArticleFormData {
  titre: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  imageStored: boolean;
}

export function ArticleCardRefactored({ article, onUpdated, onDeleted }: ArticleCardProps) {
  const { user, ready } = useAuth();

  const initialData: ArticleFormData = {
    titre: article.titre,
    description: article.description,
    imageUrl: article.imageUrl,
    sourceUrl: article.sourceUrl,
    imageStored: article.imageStored,
  };

  // Validation function
  const validate = (data: ArticleFormData, imageFile: File | null): string | null => {
    const requiredError = validateRequired(data.titre, 'Le titre');
    if (requiredError) return requiredError;

    if (!isValidUrl(data.imageUrl)) return "L'URL de l'image n'est pas valide.";
    if (!isValidUrl(data.sourceUrl)) return "L'URL de la source n'est pas valide.";

    if (imageFile) {
      const imageValidation = validateImageFile(imageFile, VALIDATION_CONSTANTS.MAX_IMAGE_SIZE);
      if (!imageValidation.isValid) return imageValidation.error;
    }

    return null;
  };

  // Save function with image upload
  const handleSave = async (data: ArticleFormData): Promise<ArticleFormData> => {
    const payload = {
      titre: data.titre.trim(),
      description: data.description?.trim() ?? '',
      imageUrl: data.imageUrl?.trim() ?? '',
      sourceUrl: data.sourceUrl?.trim() ?? '',
    };

    const updated = await updateArticle(article.id, payload);

    let final: ArticleFormData = {
      ...payload,
      imageStored: Boolean(updated?.imageStored),
    };

    // Upload image if selected
    if (editState.imageFile) {
      const afterUpload = await uploadArticleImage(article.id, editState.imageFile);
      final = {
        ...final,
        imageStored: Boolean(afterUpload?.imageStored),
      };
      editState.incrementImageRev();
      editState.setImageFile(null);
    }

    toastSuccess('Article mis à jour avec succès !');
    if (onUpdated) onUpdated(updated);

    return final;
  };

  // Use the edit-in-place hook
  const editState = useEditInPlace({
    initialData,
    validate,
    onSave: handleSave,
  });

  // Delete image handler
  const handleDeleteImage = async () => {
    if (!confirm("Supprimer l'image stockée ?")) return;

    try {
      await deleteArticleImage(article.id);
      editState.handleChange('imageStored', false);
      editState.incrementImageRev();
      toastSuccess('Image supprimée avec succès !');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      toastError(msg || "Impossible de supprimer l'image.");
    }
  };

  // Delete article handler
  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cet article ?')) return;

    try {
      await deleteArticle(article.id);
      toastSuccess('Article supprimé avec succès !');
      if (onDeleted) onDeleted(article.id);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      toastError(msg || "Impossible de supprimer l'article.");
    }
  };

  // Image file change handler
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      editState.setImageFile(null);
      return;
    }

    const validation = validateImageFile(file, VALIDATION_CONSTANTS.MAX_IMAGE_SIZE);
    if (!validation.isValid) {
      toastError(validation.error || 'Fichier invalide');
      e.target.value = '';
      return;
    }

    editState.setImageFile(file);
  };

  const canEdit = ready && !!user;

  const displayImageUrl = editState.view.imageStored
    ? getArticleImageUrl(article.id, editState.imageRev)
    : editState.view.imageUrl;

  return (
    <div className="card flex flex-col gap-4">
      {/* Action bar */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2">
          {!editState.isEditing ? (
            <button type="button" onClick={editState.startEdit} className="btn btn-primary">
              Éditer
            </button>
          ) : (
            <>
              <button type="button" onClick={editState.cancelEdit} className="btn btn-secondary">
                Annuler
              </button>
              <button
                type="button"
                onClick={editState.handleSave}
                disabled={editState.loading || !editState.hasChanges}
                className="btn btn-primary disabled:opacity-50"
              >
                {editState.loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </>
          )}
        </div>
      )}

      {editState.errorMsg && (
        <ApiAlert message={editState.errorMsg} type="error" onDismiss={() => editState.setErrorMsg(null)} />
      )}

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        {displayImageUrl && (
          <div className="md:w-1/3">
            <img
              src={displayImageUrl}
              alt={editState.view.titre}
              className="w-full h-auto rounded shadow-sm object-cover"
            />
            {canEdit && editState.view.imageStored && !editState.isEditing && (
              <button
                onClick={handleDeleteImage}
                className="mt-2 text-sm text-red-600 hover:underline"
                disabled={editState.loading}
              >
                Supprimer l'image
              </button>
            )}
          </div>
        )}

        {/* Text */}
        <div className="flex-1">
          {!editState.isEditing ? (
            <>
              <h3 className="text-2xl font-bold text-heading mb-2">{editState.view.titre}</h3>
              <p className="text-text mb-4">{editState.view.description}</p>
              {editState.view.sourceUrl && (
                <a
                  href={editState.view.sourceUrl}
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
                  value={editState.form.titre}
                  onChange={(e) => editState.handleChange('titre', e.target.value)}
                  placeholder="Titre de l'article"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  className="input"
                  rows={4}
                  value={editState.form.description}
                  onChange={(e) => editState.handleChange('description', e.target.value)}
                  placeholder="Description de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">URL de l'image</label>
                <input
                  type="url"
                  className="input"
                  value={editState.form.imageUrl}
                  onChange={(e) => editState.handleChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Ou uploader une image (max 2Mo)</label>
                <input type="file" className="input" accept="image/*" onChange={handleImageFileChange} />
                {editState.imageFile && (
                  <p className="text-sm text-muted mt-1">Fichier sélectionné: {editState.imageFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">URL de la source</label>
                <input
                  type="url"
                  className="input"
                  value={editState.form.sourceUrl}
                  onChange={(e) => editState.handleChange('sourceUrl', e.target.value)}
                  placeholder="https://example.com/source"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete button */}
      {canEdit && !editState.isEditing && (
        <div className="flex justify-end">
          <button onClick={handleDelete} className="text-sm text-red-600 hover:underline">
            Supprimer l'article
          </button>
        </div>
      )}
    </div>
  );
}
