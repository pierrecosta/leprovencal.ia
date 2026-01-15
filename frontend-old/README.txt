# ✅ Checklist Mise en Production – Site Web Privé (Association)

## 1. Sécurité
- [ ] Activer **HTTPS** avec certificat SSL valide.
- [ ] Ajouter des en-têtes de sécurité :
  - `Content-Security-Policy` (limiter les sources).
  - `X-Frame-Options: DENY`.
  - `X-XSS-Protection`.
- [ ] Vérifier la **validation des formulaires** côté client et serveur.

---

## 2. Confidentialité & Non-référencement
- [ ] Créer un fichier **robots.txt** avec :
  ```
  User-agent: *
  Disallow: /
  ```
- [ ] Ajouter la balise :
  ```html
  <meta name="robots" content="noindex, nofollow">
  ```
- [ ] Ne pas inclure **Open Graph** ni **Twitter Cards**.
- [ ] Ne pas intégrer d’outils de tracking (Google Analytics, etc.).

---

## 3. Accessibilité minimale
- [x] Ajouter des **textes alternatifs** pour les images. — UPDATED: `ArticleCard` images include `alt`; SVGs converted to `currentColor` and `logo.svg` has accessible `title` via `alt` when used as <img> or inherits color when inlined.
- [x] Vérifier la navigation clavier basique (tabulation). — UPDATED: sortable table headers in `DictionaryTable` now have `role="button"`, `tabIndex=0` and handle Enter/Space; interactive elements are standard `<button>` where appropriate.

---

## 4. Compatibilité
- [ ] Tester sur navigateurs principaux (Chrome, Firefox, Safari).
- [ ] Vérifier le responsive sur mobile.

---

## 5. Tests
- [ ] **Tests fonctionnels** : navigation, formulaires, liens.
- [ ] **Tests unitaires** si logique JS.
- [ ] **Tests E2E** simples (Cypress ou Playwright).

---

## 6. Performance (optionnel mais recommandé)
- [ ] Compression des images.
- [ ] Minification CSS/JS.
- [ ] Cache navigateur.

---

## 7. Déploiement
- [ ] Vérifier que le site est **accessible uniquement via le lien** (pas d’indexation).
- [ ] Si possible, **protéger par mot de passe** ou mettre en place une authentification simple (ex. Basic Auth).
