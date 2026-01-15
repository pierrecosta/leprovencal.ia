# Frontend Vite - Le Provençal

## 🚀 Stack Technologique

- **React 18.3** avec TypeScript
- **Vite 5** pour le build ultra-rapide
- **Tailwind CSS** pour le styling
- **React Router 6** pour la navigation
- **Axios** pour les appels API
- **react-hot-toast** pour les notifications

## 📦 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

Le build sera généré dans le dossier `build/`

## 🔍 Linting

```bash
npm run lint
```

## 📁 Structure

```
src/
├── components/     # Composants réutilisables
├── hooks/          # Hooks personnalisés (useAuth, usePagination, useDictionary)
├── pages/          # Pages (routes)
├── services/       # API client & normalizers
├── types/          # Types TypeScript
├── utils/          # Utilitaires (notify, helpers)
├── App.tsx         # Composant principal
├── main.tsx        # Point d'entrée
└── theme.css       # Styles globaux avec thème Provence
```

## 🎨 Thème

Le thème Provence utilise des variables CSS définies dans `theme.css`:
- `--provence-sage`, `--provence-olive` pour les couleurs principales
- Système de design cohérent avec Tailwind

## 🔐 Authentification

L'application utilise:
- Cookies `HttpOnly` pour la sécurité
- Tokens JWT en mémoire
- Hook `useAuth` pour gérer l'état utilisateur

## 🌐 API

L'URL de l'API est configurable via `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## 📝 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Preview du build
- `npm run lint` - Vérifie le code
- `npm run type-check` - Vérifie les types TypeScript
