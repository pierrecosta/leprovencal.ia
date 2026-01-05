
// components/ArticleCard.jsx
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateArticle } from '../services/api'; // ajuste le chemin si besoin

export default function ArticleCard({
  id,
  titre,
  description,
  image_url,
  source_url,
  onUpdated, // callback optionnel pour le parent après update
}) {
  const { user, ready } = useAuth();

  // État "vue" — ce que la carte affiche hors édition
  const [view, setView] = useState({
    titre,
    description,
    image_url,
    source_url,
  });

  // État "form" — ce que l'on édite en mode édition
  const [form, setForm] = useState({
    titre,
    description,
    image_url,
    source_url,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Détection de modifications pour activer/désactiver "Valider"
  const hasChanges = useMemo(() => {
    return (
      form.titre !== view.titre ||
      form.description !== view.description ||
      form.image_url !== view.image_url ||
      form.source_url !== view.source_url
    );
  }, [form, view]);

  // Validation basique d'URL
  const isValidUrl = (u) => {
    if (!u) return true; // autoriser vide si non obligatoire
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  };

  const startEdit = () => {
    setErrorMsg(null);
    setForm({ ...view }); // charger l'état actuel dans le formulaire
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setErrorMsg(null);
    setForm({ ...view }); // revert
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setErrorMsg(null);

    // Validations de base
    if (!form.titre?.trim()) {
      setErrorMsg('Le titre est obligatoire.');
      return;
    }
    if (!isValidUrl(form.image_url)) {
      setErrorMsg("L'URL de l'image n'est pas valide.");
      return;
    }
    if (!isValidUrl(form.source_url)) {
      setErrorMsg("L'URL de la source n'est pas valide.");
      return;
    }
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      // ⚠️ Adapte le mapping à ton backend si nécessaire
      const payload = {
        titre: form.titre.trim(),
        description: form.description?.trim() ?? '',
        image_url: form.image_url?.trim() ?? '',
        source_url: form.source_url?.trim() ?? '',
      };

      const data = await updateArticle(id, payload);

      // Mettre à jour l'affichage local
      setView({ ...form });
      setIsEditing(false);

      // Informer éventuellement le parent (toast, re-fetch, etc.)
      if (typeof onUpdated === 'function') {
        onUpdated(data);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Une erreur est survenue lors de la mise à jour.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Afficher le bouton Éditer uniquement si l'auth est résolue et un user est présent
  const canEdit = ready && !!user;

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
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
              src={view.image_url}
              alt={`Illustration de ${view.titre}`}
              className="w-full md:w-32 h-32 object-cover rounded"
            />
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor={`image-${id}`}>
                URL de l’image
              </label>
              <input
                id={`image-${id}`}
                type="url"
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full md:w-64 border rounded px-2 py-1"
              />
              {isValidUrl(form.image_url) && form.image_url ? (
                <img
                  src={form.image_url}
                  alt="Prévisualisation"
                  className="w-full h-32 object-cover rounded border"
                />
              ) : form.image_url ? (
                <div className="text-xs text-red-600">URL non valide</div>
              ) : null}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col justify-between">
          {!isEditing ? (
            <>
              <h3 className="text-xl font-bold text-[var(--color-lavender)] mb-2">
                {view.titre}
              </h3>
              <p className="text-gray-700 mb-3">{view.description}</p>
              <a
                href={view.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-terra)] font-semibold hover:underline"
              >
                Lire la suite →
              </a>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor={`titre-${id}`}>
                  Titre
                </label>
                <input
                  id={`titre-${id}`}
                  type="text"
                  value={form.titre}
                  onChange={(e) => handleChange('titre', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor={`desc-${id}`}>
                Description
                </label>
                <textarea
                  id={`desc-${id}`}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor={`src-${id}`}>
                  URL de la source
                </label>
                <input
                  id={`src-${id}`}
                  type="url"
                  value={form.source_url}
                  onChange={(e) => handleChange('source_url', e.target.value)}
                  placeholder="https://exemple.com/article"
                  className="w-full border rounded px-2 py-1"
                />
                {!isValidUrl(form.source_url) && form.source_url && (
                  <div className="text-xs text-red-600">URL non valide</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {errorMsg && (
        <div className="mt-2 text-sm text-red-600">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
