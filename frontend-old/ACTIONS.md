# Feature — Migration **Big Bang** vers **Vite + React + TypeScript** + refonte d’architecture

## Contexte (3 lignes)
Notre front React (JavaScript) présente des disparités de conventions, une dette technique croissante et des coûts élevés de maintenance.
Les builds et boucles de dev deviennent moins prévisibles à mesure que le codebase grandit et que les extensions/outils divergent.
Nous lançons une migration **big bang** vers **Vite + React TS** avec **refactor fonctionnel majeur** et **refonte d’architecture** pour standardiser.

## Objectif (5 lignes)
Basculer l’application en **Vite + React + TypeScript** en une seule livraison (big bang) et retirer l’ancienne stack.
Refondre l’architecture applicative (découpage, responsabilités, structure) afin de rendre le code **nettement plus maintenable**.
Mener une **refactorisation fonctionnelle majeure** pour clarifier les parcours, éliminer les doublons et stabiliser les comportements.
Mettre en place un outillage homogène et “quality-first” (ESLint + Prettier) avec règles partagées et appliquées en CI.
Améliorer la vitesse de dev/build et garantir une expérience développeur uniforme sur tous les environnements.

## Scope (10 lignes)
1. Création du nouveau socle **Vite + React TS** (scripts, conventions, structure `src/`, gestion assets, env vars).
2. Mise en place TypeScript strict **progressif** mais avec un objectif de base typée (interdiction d’`any` non justifié).
3. Mise en place de l’outillage qualité : **ESLint + Prettier** + hooks (optionnel) + exécution en CI.
4. Refonte d’architecture : séparation `app/`, `features/`, `shared/`, `entities/` (ou équivalent validé) + règles d’import.
5. Refonte des patterns : routing, gestion d’état, data-fetching, gestion erreurs, configuration, i18n (selon existant).
6. Migration **totale** du code (composants, pages, services, utilitaires) vers `.ts/.tsx`.
7. Refactor fonctionnel majeur : simplification des parcours clés, harmonisation UI/UX, suppression legacy et dead code.
8. Alignement styles/outils : normalisation conventions (naming, lint rules, formatting) et suppression des exceptions locales.
9. Mise à jour du build et des environnements : configuration dev/prod, variables, proxy, bundling, optimisations.
10. Validation complète : tests (unit/integration/e2e si applicable), smoke tests, performance baseline et critères de non-régression.

## Hors scope
- Aucun : migration big bang implique une bascule complète et la décommission de l’ancienne stack dans la même release.

## Livrables
- Application fonctionnelle en **Vite + React TS** (plus aucune dépendance à l’ancienne chaîne de build).
- Nouvelle architecture de dossiers + règles d’import + documentation courte (README / ADR).
- ESLint + Prettier opérationnels en local et en CI.
- Jeux de tests et smoke tests mis à jour + rapport de non-régression.

## Critères d’acceptation
- `npm ci` puis `npm run dev` démarre l’app sans erreur bloquante.
- `npm run build` réussit (prod) et `npm run preview` sert le build.
- `npm run lint` et `npm run format:check` passent en local et en CI.
- 100% du code applicatif (hors exceptions documentées) en `.ts/.tsx`.
- Architecture cible appliquée (structure + conventions + règles d’import) et documentée.
- Parcours fonctionnels prioritaires validés (liste en section “Tests & validation”).

---

# Backlog — Tâches techniques (liste exhaustive)

## 0) Préparation & cadrage
- [ ] Inventorier la stack actuelle : bundler, scripts, dépendances, polyfills, env vars, alias, assets.
- [ ] Définir l’architecture cible (dossiers, boundaries, règles d’import) + écrire une ADR.
- [ ] Définir la stratégie de refacto fonctionnelle : parcours prioritaires, règles de non-régression, critères UX.
- [ ] Geler les features non critiques pendant la migration (sprint dédié) + plan de communication.

## 1) Bootstrap Vite + React TS
- [ ] Initialiser Vite template `react-ts`.
- [ ] Configurer `tsconfig.json` (base strict, paths, jsx, noEmit).
- [ ] Configurer `vite.config.ts` : alias, base, define, server proxy, build options.
- [ ] Mettre en place la structure `src/` selon architecture cible.
- [ ] Migrer les assets (public, icons, fonts) et vérifier les chemins.
- [ ] Migrer la gestion des variables d’environnement (`import.meta.env`) + documentation.

## 2) Outillage qualité (ESLint + Prettier)
- [ ] Installer ESLint + plugins (react, react-hooks, import, jsx-a11y, @typescript-eslint).
- [ ] Définir règles : no-explicit-any (avec exceptions), import/order, boundaries, hooks rules.
- [ ] Installer Prettier + config + `.prettierignore`.
- [ ] Harmoniser ESLint/Prettier (désactiver règles de style côté ESLint si Prettier).
- [ ] Ajouter scripts : `lint`, `lint:fix`, `format`, `format:check`, `typecheck`.
- [ ] Optionnel : husky + lint-staged (pré-commit) + commitlint.

## 3) Refactor d’architecture applicative (big bang)
- [ ] Définir modules : `app/` (bootstrap), `shared/` (ui, lib), `features/` (use-cases), `entities/` (domain).
- [ ] Mettre en place une règle d’import (lint) interdisant les imports transverses non autorisés.
- [ ] Centraliser la configuration applicative : config runtime, constants, feature flags.
- [ ] Standardiser la gestion d’erreurs : ErrorBoundary, handling API, logging.
- [ ] Standardiser routing : structure routes, lazy loading, guards, redirections.
- [ ] Standardiser data-fetching : client API, caching, retry, invalidation.
- [ ] Standardiser state management : choix (context, redux, zustand…) + conventions.
- [ ] Standardiser UI : design tokens, composants partagés, règles d’accessibilité.

## 4) Migration totale du code vers TypeScript
- [ ] Renommer fichiers : `.js/.jsx` -> `.ts/.tsx`.
- [ ] Ajouter types Props/State/Events sur tous les composants.
- [ ] Introduire types domain (DTO, models) et mapping API <-> domain.
- [ ] Éliminer `any` ; utiliser `unknown` + narrowing, generics et discriminated unions.
- [ ] Typage des hooks personnalisés, contextes, stores.
- [ ] Typage des services : API client, interceptors, erreurs.
- [ ] Typage de la configuration (env vars, runtime config).

## 5) Refactorisation fonctionnelle majeure
- [ ] Revoir et simplifier les parcours “top 3” (à lister) : écrans, interactions, validations.
- [ ] Supprimer dead code, écrans obsolètes, branches legacy, flags non utilisés.
- [ ] Dédupliquer composants et logique (helpers, hooks, services).
- [ ] Normaliser la gestion des formulaires (validation, erreurs, i18n).
- [ ] Normaliser la gestion des permissions/roles (si applicable).
- [ ] Harmoniser les comportements cross-cutting (loading states, empty states, errors, toasts).

## 6) Tests & validation
- [ ] Mettre à jour / créer tests unitaires (components, utils, domain).
- [ ] Mettre à jour / créer tests d’intégration (API mock, routing, stores).
- [ ] Mettre à jour / créer tests e2e (Cypress/Playwright) sur parcours critiques.
- [ ] Définir smoke test checklist + exécution en CI (au minimum sur build).
- [ ] Mettre en place coverage threshold (optionnel, selon maturité).

## 7) Performance & DX
- [ ] Activer code splitting / lazy loading routes.
- [ ] Optimiser bundle : analyse, suppression deps inutiles, tree-shaking.
- [ ] Optimiser images/assets (compression, cache headers si applicable).
- [ ] Standardiser environnements dev : `.nvmrc`/Volta, versions Node, scripts.
- [ ] Documenter commandes et conventions (README) + guide de contribution.

## 8) CI/CD & release big bang
- [ ] Mettre à jour pipeline CI : install, lint, format check, typecheck, build, tests.
- [ ] Mettre à jour pipeline CD : artefacts, déploiement, variables d’env.
- [ ] Mettre en place un plan de rollback (tag, artefacts, release précédente).
- [ ] Exécuter une release candidate + validation UAT.
- [ ] Décommissionner l’ancienne stack : suppression configs, scripts, docs, dépendances.

## 9) Nettoyage & clôture
- [ ] Supprimer dépendances legacy et fichiers de config obsolètes.
- [ ] Vérifier licences/versions des dépendances.
- [ ] Finaliser ADR + documentation + décisions d’architecture.
- [ ] Créer tickets de suivi (tech debt résiduelle, optimisations futures).
