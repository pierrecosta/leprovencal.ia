# ACTIONS — Priorités et découpage optimisé (Frontend)

Ce fichier regroupe les actions prioritaires pour améliorer, rationaliser, nettoyer et rendre cohérent le code frontend.

## Objectifs
- Respecter les bonnes pratiques (sécurité, tests, accessibilité).
- Rationaliser la base de code pour faciliter la maintenance.
- Nettoyer le code inutilisé ou redondant.
- Standardiser conventions et architecture.
- Fournir un découpage d'implémentation par étapes prioritaires.

---

## Priorités (Haute / Moyenne / Basse)

### Priorité Haute
- 1. Stratégie d'authentification claire (token vs cookie HttpOnly) — confirmer et implémenter. (Fichiers: `src/services/api.js`, `src/hooks/useAuth.js`) — Effort: moyen.
- 2. Corriger persistence / re-hydratation de l'utilisateur (si token côté client requis) ou documenter explicitement l'usage de cookies. (Effort: moyen)
- 3. Implémenter validation & filtrage des URLs d'iframe (sécurité) dans `GeographyPage`. (Fichiers: `src/pages/GeographyPage.jsx`, `src/services/api.js`) — Effort: petit.
- 4. Ajouter tests unitaires pour `services/api.js` et `useDictionary`. (Effort: moyen)

### Priorité Moyenne
- 5. Supprimer ou implémenter `src/hooks/usePagination.js` (actuellement vide). (Effort: petit)
- 6. Extraire et regrouper les normalizers de `src/services/api.js` dans `src/services/normalizers.js` pour lisibilité et testabilité. (Effort: moyen)
- 7. Centraliser la gestion des erreurs / notifications (composant `Toast` ou `ErrorBoundary`). (Effort: moyen)

### Priorité Basse
- 8. Standardiser l'utilisation Tailwind vs classes CSS custom (préférer utilitaires Tailwind pour nouveaux composants). (Effort: moyen)
- 9. Ajouter CI: lint, format, tests (GitHub Actions). (Effort: moyen)
- 10. Auditer et réduire les CSS redondants dans `theme.css` (tokenisation déjà bonne). (Effort: petit/moyen)

---

## Découpage par thématique (actions détaillées)

1) Bonnes pratiques de développement
- A. Auth: décider stockage du token
  - Option A: cookie HttpOnly (recommandé) — modifier backend si nécessaire; retirer stockage in-memory pour persistance. Fichiers impactés: `src/services/api.js`, `src/hooks/useAuth.js`.
  - Option B: access token persistant (localStorage/sessionStorage) — ajouter chiffrement façon sécurisée et revalidation (refresh token). Documenter risques XSS.
- B. Tests: ajouter suites Jest/React Testing Library pour
  - `src/services/api.js` (mock axios)
  - `src/hooks/useDictionary.js`
  - Composants critiques: `ArticleCard.jsx`, `GeographyPage.jsx`, `HistoryPage.jsx`.
- C. Linting & formatting: ajouter ESLint + Prettier config et hook pre-commit (`husky`, `lint-staged`).

2) Rationalisation du code existant
- A. Refactor `services/api.js`:
  - Extraire normalizers (articles, dictionnaire, histoires, cartes) dans `src/services/normalizers.js`.
  - Extraire gestion token / auth helpers dans `src/services/auth.js` si nécessaire.
- B. Factoriser constantes communes (ex: `MAX_IMAGE_BYTES`) dans `src/config/constants.js`.
- C. Centraliser les messages d'erreur et mapping de champs (facilite i18n ultérieur).

3) Nettoyage (code non utilisé / redondant)
- A. Supprimer `src/hooks/usePagination.js` s'il n'est pas utilisé.
- B. Rechercher et supprimer imports inutilisés (logo.svg, fichiers orphelins).
- C. Supprimer commentaires morts et code commenté inutile.

4) Cohérence globale
- A. Conventions de nommage: garder camelCase côté frontend; garder normalizers pour back-compat snake_case.
- B. Classes CSS vs Tailwind: recommander guide style (ex: components stylés via Tailwind, variables dans `theme.css` pour tokens uniquement).
- C. Accessibilité: vérifier `aria-*`, focus-visible, keyboard handlers existants (déjà présent); compléter où manquant.

5) Implémentation — Plan pas-à-pas recommandé
- Sprint 1 (1–3 jours):
  1. Mettre à jour `ACTIONS.md` (ce fichier).
  2. Décider stratégie d'auth (réunion rapide, choix cookie HttpOnly idéal).
  3. Implémenter ou documenter persistance token; adapter `src/services/api.js` (setToken) et `useAuth` re-hydratation.

- Sprint 2 (2–4 jours):
  1. Extraire `normalizers.js` et refactor `services/api.js` pour l'utiliser.
  2. Implémenter validations iframe et URL sur `GeographyPage` et `ArticleCard`.
  3. Supprimer/implémenter `usePagination.js`.

- Sprint 3 (2–3 jours):
  1. Écrire tests unitaires pour `services/api.js` et `useDictionary`.
  2. Ajouter linter/formatter et CI (lint + test). Commit hooks `lint-staged`.
  3. Centraliser error/toast component et remplacer messages inline.

- Sprint 4 (améliorations continues):
  1. Auditer et nettoyer `theme.css` (supprimer règles inutilisées).
  2. Ajouter tests E2E si nécessaire.

---

## Estimations rapides & effort
- Petits changements: validation iframe, suppression `usePagination.js`, constantes partagées — 0.5–1 jour.
- Moyens: refactor `services/api.js`, extraire normalizers, ajouter tests unitaires — 2–4 jours.
- Lourds: changement profond de la stratégie d'auth (ajout refresh tokens/cookies côté backend), CI complète, E2E — 3–7 jours selon backend.

---

## Liens utiles (fichiers à consulter)
- Routage: `src/App.jsx`
- Auth: `src/hooks/useAuth.js` ; `src/services/api.js`
- Services/API: `src/services/api.js`
- Pages principales: `src/pages/*` (`GeographyPage.jsx`, `HistoryPage.jsx`, `DictionaryPage.jsx`)
- Composants critiques: `src/components/ArticleCard.jsx`, `DictionaryTable.jsx`
- Styles / tokens: `src/theme.css`

---

## Prochaine étape proposée
Si tu veux, je peux commencer par implémenter l'une des actions prioritaires :
- proposer un patch pour persistance d'auth (option choisie), ou
- implémenter `usePagination.js`, ou
- extraire `normalizers.js` et refactoriser `services/api.js`.

Indique la tâche à lancer en premier.
