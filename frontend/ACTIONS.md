# Frontend Actions

## CSS System (Next)
- [x] Make `theme.css` the only source for palette/typography/shadows — UPDATED: moved App.css drop-shadow values into `theme.css` variables; converted `olive.svg`, `lavender.svg`, and `logo.svg` to `currentColor`; added small SVG utility classes in `theme.css`.
- [x] Remove remaining duplicated styles between App/theme/Tailwind — UPDATED: moved `.btn` margin into `theme.css` and removed duplicated `.container`/`.section`/`.card`/`.btn` rules from `App.css`.

## Améliorations Visuelles & UX (Janvier 2026) ✨
- [x] **Glassmorphism** — Sections, cartes et tables utilisent maintenant des effets de verre avec backdrop-filter pour un rendu moderne et élégant.
- [x] **Gradients Provence** — Ajout de gradients harmonieux sur les boutons, navbar et badges (lavande → prune, sable → terra, olive → sauge).
- [x] **Animations fluides** — Toutes les transitions utilisent des cubic-bezier pour des mouvements naturels (0.4s pour les éléments principaux).
- [x] **Micro-interactions** :
  - Cartes : effet de lift (translateY -6px) + scale + shimmer au survol
  - Boutons : effet de brillance animée qui traverse au survol
  - Navigation : soulignement progressif des liens + élévation
  - Inputs : lift au focus + bordure animée
  - Tables : zoom léger des lignes au survol
- [x] **Ombres améliorées** — Système d'ombres à 4 niveaux (sm/md/lg/xl) avec doubles couches pour plus de profondeur.
- [x] **Logo animé** — Float doux au lieu de rotation rapide, avec hover plus marqué (scale + rotate + brightness).
- [x] **Fond subtil** — Effet de particules/gradients radiaux animés en arrière-plan (opacity 3%) pour ajouter de la profondeur.
- [x] **Footer élégant** — Bordure dégradée animée avec effet shimmer.
- [x] **Animations d'entrée** — fadeInUp en cascade pour tous les enfants de .App avec délais progressifs.
- [x] **Classes utilitaires** — animate-pulse, animate-bounce, animate-fade-in, animate-glow, hover-lift, hover-grow, hover-glow.

### Détails techniques
- **Variables ajoutées** :
  - `--gradient-provence`, `--gradient-sunset`, `--gradient-olive`, `--gradient-soft`
  - `--glass-bg`, `--glass-border`, `--glass-blur`
  - `--shadow-xl`, `--shadow-inset`
  - `--radius-sm`, `--radius-lg`
  
- **Fichiers modifiés** :
  - `frontend/src/theme.css` — ajout de 8+ animations keyframes, amélioration des composants (cards, buttons, inputs, tables, navbar)
  - `frontend/src/App.css` — fond animé, logo float, animations d'entrée, footer shimmer

- **Performance** :
  - Utilisation de `will-change` implicite via transform/opacity
  - Animations GPU-accelerated (transform, opacity, filter)
  - Respect de prefers-reduced-motion pour l'accessibilité

## Images & Authenticated Cards (CRUD)
- Goals:
  - Cache images efficiently for site visitors to improve performance and reduce bandwidth.
  - Provide create / edit / delete UI for "cards" (same pattern as articles) available only to authenticated users.
  - Keep read-only browsing available to anonymous users; require server-side auth/permissions for mutations.

- Implementation checklist:
  - Image caching & delivery:
    - [ ] Backend: serve images with appropriate `Cache-Control`, `ETag` and support resized/thumbnail endpoints (e.g. `/images/:id?w=400`).
    - [ ] Frontend: use `loading="lazy"` on images and display a lightweight placeholder while loading.
    - [ ] Add a Service Worker (Workbox) to cache images using a `stale-while-revalidate` strategy (cache name `images-v1`) and limit size/age.
    - [ ] Provide a fallback placeholder image when remote image fails to load.
    - [ ] Optionally: use a CDN for image hosting and long-lived cache headers.

  - Cards CRUD (UI + API wiring):
    - [ ] Reuse `ArticleCard` pattern: add `createCard`, `updateCard`, `deleteCard` endpoints in `frontend/src/services/api.js` (similar to `createArticle`/`deleteArticle`).
    - [ ] Add a `Card` component (or reuse `ArticleCard`) that shows Edit + Delete buttons only when `useAuth().user` is present and `ready`.
    - [ ] Add a creation form (link → fetch metadata or title) on the listing page (e.g. `HomePage.jsx`) visible only to logged-in users.
    - [ ] For link-based card creation: add a backend endpoint to fetch page metadata (title/description/image) server-side, then POST sanitized data to `POST /cards`.
    - [ ] Implement optimistic UI updates (add/remove/update) with rollback on error; show success/error feedback (toasts or `ApiAlert`).

  - Auth & permissions:
    - [ ] Ensure server-side permission checks for `POST/PUT/DELETE /cards` (only allow authenticated editors).
    - [ ] Frontend: hide edit/delete/create controls for anonymous users; handle `401` responses gracefully (show login prompt or toast, do not force redirect).
    - [ ] Keep `AuthProvider` in `frontend/src/hooks/useAuth.js` to update UI immediately on login/logout.

  - Tests & QA:
    - [ ] Add E2E tests (Cypress/Playwright) covering create/edit/delete flows with authenticated user.
    - [ ] Add unit tests for `Card`/`ArticleCard` logic (edit form validation, optimistic updates).
    - [ ] Verify caching behavior (simulate cold/warm cache) and measure load improvements.

- Files to modify (suggested):
  - `frontend/src/services/api.js` — add `createCard`, `updateCard`, `deleteCard`, and image-upload/metadata helpers.
  - `frontend/src/components/ArticleCard.jsx` (or `Card.jsx`) — add delete/edit buttons and handle optimistic updates + `onDeleted` callback.
  - `frontend/src/pages/HomePage.jsx` (or the listing page) — add create-card form and wire callbacks to update list state.
  - `frontend/src/hooks/useAuth.js` — ensure auth state is reactive (already migrated to `AuthProvider`).
  - `frontend/src/index.js` — register the Service Worker (e.g. Workbox) and enable only for production builds.
  - `backend` routes — add `POST/PUT/DELETE /cards` and an endpoint to fetch metadata for a link.

- Notes / constraints:
  - Always enforce server-side authorization; frontend-only checks are not secure.
  - For image caching, prefer server/HTTP headers + CDN; Service Worker adds offline/resilience benefits but increases complexity.
  - For link metadata scraping, do it server-side to avoid CORS and to sanitize content.

Add these items to the actionable backlog and tell me which ones you want implemented next (I can scaffold API clients, SW registration, or UI forms).
