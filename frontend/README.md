# Frontend Vite - Le Provençal

Frontend TypeScript moderne avec Vite pour l'application Le Provençal.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Stack Technique

- **Framework**: React 18.3 avec TypeScript 5.4
- **Build Tool**: Vite 5.2
- **Routing**: React Router DOM 6.22
- **Styling**: Tailwind CSS 3.4 + CSS custom properties (thème Provence)
- **HTTP**: Axios 1.6
- **Notifications**: React Hot Toast 2.4
- **Type Safety**: TypeScript strict mode

## 🏗️ Architecture

```
src/
├── components/     # Composants réutilisables
│   ├── ArticleCard.tsx
│   ├── ErrorBoundary.tsx ⭐ NEW
│   ├── Header.tsx
│   └── ...
├── pages/         # Pages/routes
│   ├── HomePage.tsx
│   ├── DictionaryPage.tsx
│   └── ...
├── hooks/         # Custom hooks
│   ├── useAuth.tsx
│   ├── useEditInPlace.ts ⭐ NEW
│   ├── useDictionary.ts
│   └── usePagination.ts
├── services/      # API layer
│   ├── api.ts
│   └── normalizers.ts
├── utils/         # Utilitaires
│   ├── helpers.ts (ENHANCED)
│   ├── validation.ts ⭐ NEW
│   ├── notify.ts
│   └── index.ts ⭐ NEW
├── types/         # TypeScript types
│   └── index.ts
└── theme.css      # Variables CSS globales
```

## ✨ Nouvelles Fonctionnalités

### 1. Hook `useEditInPlace` ⭐

Hook générique pour le pattern "edit-in-place" utilisé dans ArticleCard et GeographyPage.

**Features**:
- Gestion automatique view/form states
- Détection changements via `useMemo`
- Validation intégrée
- Support upload image
- Loading & error states

**Usage**:
```typescript
import { useEditInPlace } from '@/hooks/useEditInPlace';

const editState = useEditInPlace({
  initialData: { titre: '', description: '' },
  validate: (data, imageFile) => {
    if (!data.titre) return 'Titre obligatoire';
    return null;
  },
  onSave: async (data) => {
    const updated = await updateArticle(id, data);
    return updated;
  },
});

// Actions disponibles
editState.startEdit();
editState.handleChange('titre', 'Nouveau titre');
editState.handleSave();
editState.cancelEdit();
```

### 2. Validation Helpers ⭐

Utilitaires centralisés pour validation de formulaires dans `@/utils/validation`.

**Fonctions disponibles**:
- `isValidUrl(url, required)` - Valide une URL
- `isValidUrlProtocol(url)` - Vérifie protocole http/https
- `isAllowedIframeUrl(url)` - Whitelist iframe (localhost)
- `validateImageFile(file, maxBytes)` - Valide type/taille image
- `isValidImageFile(file, maxBytes)` - Booléen simplifié
- `validateRequired(value, fieldName)` - Champ requis
- `validateLength(value, min, max, fieldName)` - Longueur texte
- `formatFileSize(bytes)` - Formatte taille fichier

**Constantes & Messages**:
```typescript
import { VALIDATION_CONSTANTS, VALIDATION_MESSAGES } from '@/utils/validation';

VALIDATION_CONSTANTS.MAX_IMAGE_SIZE // 2MB
VALIDATION_CONSTANTS.MAX_TITLE_LENGTH // 200
VALIDATION_MESSAGES.REQUIRED_FIELD('Titre') // 'Titre est obligatoire.'
```

**Exemple d'utilisation**:
```typescript
import { validateRequired, isValidUrl, validateImageFile } from '@/utils/validation';

const validate = (form: FormData, imageFile: File | null): string | null => {
  const titleError = validateRequired(form.titre, 'Le titre');
  if (titleError) return titleError;

  if (!isValidUrl(form.imageUrl)) return "URL invalide";

  const fileValidation = validateImageFile(imageFile);
  if (!fileValidation.isValid) return fileValidation.error;

  return null;
};
```

### 3. Error Boundary ⭐

Composant React Error Boundary pour capturer les erreurs runtime.

**Features**:
- Catch errors globales React
- UI d'erreur user-friendly
- Détails techniques en dev mode
- Boutons "Réessayer" et "Retour accueil"
- Personnalisable via prop `fallback`

**Implémentation** (déjà intégré dans App.tsx):
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Fallback custom** (optionnel):
```tsx
<ErrorBoundary
  fallback={(error, errorInfo, resetError) => (
    <div>
      <h1>Erreur custom</h1>
      <button onClick={resetError}>Réessayer</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

## 🎨 Système de Design

Le frontend utilise un système de tokens CSS cohérent défini dans `theme.css`:

**Couleurs principales**:
- `--provence-sage` / `--sage-600` - Vert sauge
- `--provence-olive` / `--olive-700` - Olive
- `--provence-sand` / `--slate-50` - Sable
- `--provence-lavender` / `--sage-700` - Lavande
- `--provence-terra` / `--terra-600` - Terra cotta

**Utilisation**:
```tsx
// Via Tailwind (recommandé)
<div className="bg-provencesage text-white">

// Via CSS variables
<div style={{ color: 'var(--color-lavender)' }}>
```

## 🔒 Authentification

**Hook `useAuth`**:
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, ready, logout } = useAuth();

  if (!ready) return <Loader />;
  if (!user) return <div>Non connecté</div>;

  return <div>Bienvenue {user.username}</div>;
}
```

**API Layer** (`services/api.ts`):
- `http` - Instance publique (GET endpoints)
- `authHttp` - Instance authentifiée (CRUD avec Bearer token)
- Interceptor 401 → logout automatique
- Support cookies HttpOnly (`withCredentials: true`)

## 🌐 Configuration API

L'URL de l'API est configurable via `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## 📝 Conventions de Code

### Imports avec alias @
```typescript
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/types';
import { toastSuccess } from '@/utils';
```

### Types
```typescript
// Props interfaces
interface MyComponentProps {
  data: Article;
  onUpdate?: (article: Article) => void;
}

// Function components
export function MyComponent({ data, onUpdate }: MyComponentProps) {
  // ...
}
```

### Naming
- **Composants**: PascalCase (ex: `ArticleCard`)
- **Hooks**: camelCase avec préfixe `use` (ex: `useEditInPlace`)
- **Types**: PascalCase (ex: `Article`, `ArticlePayload`)
- **Utils**: camelCase (ex: `isValidUrl`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_IMAGE_SIZE`)

## 🤝 Contribution

1. Utiliser TypeScript strict mode
2. Valider avec `npm run type-check` et `npm run lint`
3. Suivre les conventions de nommage
4. Documenter les types complexes
5. Utiliser les hooks/utils existants avant de créer de nouveaux

## 📚 Ressources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Version**: 2.0.0 (TypeScript + Vite + Refactoring 2026)
**Dernière mise à jour**: Janvier 2026
