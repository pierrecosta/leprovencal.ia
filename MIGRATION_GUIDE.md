# Guide de Migration : frontend (CRA) → frontend-vite

## 🎯 Objectif

Basculer complètement de l'ancien frontend Create React App vers le nouveau frontend-vite avec TypeScript.

---

## 📋 Pré-requis

- ✅ Toutes les recommandations prioritaires implémentées
- ✅ Type checking passé (0 erreur)
- ✅ Documentation à jour
- ⚠️ Build de test à effectuer

---

## 🔄 Plan de Migration

### Phase 1 : Validation (1-2 jours)

#### 1.1 Tests Build & Dev
```bash
cd frontend-vite

# Test dev server
npm run dev
# → Vérifier http://localhost:5173

# Test build
npm run build
npm run preview
# → Vérifier build/
```

#### 1.2 Comparaison Fonctionnalités
- [ ] Page Accueil (articles)
- [ ] Page Dictionnaire (filtres, pagination, tri)
- [ ] Page Géographie (cartes, iframe, images)
- [ ] Page Histoire & Légendes
- [ ] Page Login
- [ ] Auth flow (login/logout)
- [ ] Upload images
- [ ] Edit-in-place (articles, cartes)

#### 1.3 Tests Manuels
- [ ] Navigation entre pages
- [ ] Login/Logout
- [ ] CRUD articles (create, edit, delete)
- [ ] Upload image article
- [ ] Filtres dictionnaire
- [ ] Pagination
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Error handling (404, 401, 500)

---

### Phase 2 : Configuration Environnement (1 jour)

#### 2.1 Variables d'environnement

**Créer `.env.local`** dans `frontend-vite/` :
```env
# Backend API
VITE_API_URL=http://localhost:8000

# Optionnel : Analytics, Sentry, etc.
# VITE_SENTRY_DSN=...
```

**Créer `.env.production`** pour le build prod :
```env
VITE_API_URL=https://api.leprovencal.ia
```

#### 2.2 Scripts de démarrage

**Mise à jour `package.json` (root)** :
```json
{
  "scripts": {
    "dev:frontend": "cd frontend-vite && npm run dev",
    "dev:backend": "cd backend && uvicorn app.main:app --reload",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:frontend": "cd frontend-vite && npm run build",
    "test:frontend": "cd frontend-vite && npm run type-check && npm run lint"
  }
}
```

**Installer `concurrently`** :
```bash
npm install -D concurrently
```

#### 2.3 Configuration serveur dev

**Option A : Proxy Vite (recommandé dev)**

Modifier `frontend-vite/vite.config.ts` :
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Ou 5173 (défaut Vite)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // ...
});
```

Puis changer `VITE_API_URL=/api` dans `.env.local`.

**Option B : CORS backend (actuel)**

Garder la config actuelle (`backend/app/main.py` avec CORS localhost:3000).

---

### Phase 3 : Migration Code Manquant (si nécessaire) (2-3 jours)

#### 3.1 Audit composants

Comparer `frontend/src/` et `frontend-vite/src/` :

```bash
# Lister tous les fichiers
ls -R frontend/src/ > frontend-files.txt
ls -R frontend-vite/src/ > frontend-vite-files.txt

# Comparer
diff frontend-files.txt frontend-vite-files.txt
```

#### 3.2 Composants manquants potentiels

Si des composants sont absents dans frontend-vite, les porter :

**Checklist** :
- [ ] Tous les composants dans `components/`
- [ ] Toutes les pages dans `pages/`
- [ ] Tous les hooks dans `hooks/`
- [ ] Tous les services dans `services/`
- [ ] Tous les utils dans `utils/`
- [ ] Tous les types dans `types/`

**Process de portage** :
1. Copier le fichier `.jsx` → `.tsx`
2. Ajouter les types TypeScript
3. Remplacer imports relatifs par alias `@/`
4. Utiliser les nouveaux helpers (`@/utils/validation`)
5. Tester avec `npm run type-check`

#### 3.3 Assets & Styles

**Copier assets manquants** :
```bash
# Si images/fonts dans frontend/src/assets/
cp -r frontend/src/assets/* frontend-vite/src/assets/
```

**Vérifier theme.css** :
```bash
# Comparer les deux fichiers
diff frontend/src/theme.css frontend-vite/src/theme.css
```

---

### Phase 4 : Déploiement Test (1 jour)

#### 4.1 Build production locale

```bash
cd frontend-vite
npm run build

# Tester le build
npm run preview
# → Ouvrir http://localhost:4173
```

**Checklist build** :
- [ ] Pas d'erreurs de compilation
- [ ] Bundle size raisonnable (< 500KB gzipped)
- [ ] Assets copiés correctement
- [ ] Variables d'env injectées
- [ ] Source maps générées (dev) ou non (prod)

#### 4.2 Configuration serveur web

**Nginx exemple** (`/etc/nginx/sites-available/leprovencal`) :
```nginx
server {
    listen 80;
    server_name leprovencal.ia;
    root /var/www/leprovencal/frontend-vite/build;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript application/json;

    # SPA routing (toutes les routes → index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optionnel, ou CORS)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache statique
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache exemple** (`.htaccess`) :
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 4.3 Déploiement staging

**Option A : Serveur staging dédié**
```bash
# SSH vers staging
ssh user@staging.leprovencal.ia

# Clone/pull repo
cd /var/www/leprovencal
git pull origin main

# Build
cd frontend-vite
npm install
npm run build

# Recharger nginx
sudo systemctl reload nginx
```

**Option B : Netlify/Vercel (gratuit pour test)**
```bash
# Netlify CLI
npm install -g netlify-cli
cd frontend-vite
netlify deploy --prod

# Ou Vercel
npm install -g vercel
cd frontend-vite
vercel --prod
```

#### 4.4 Tests staging

- [ ] Accès public (domaine staging)
- [ ] Connexion au backend prod/staging
- [ ] Toutes les fonctionnalités testées
- [ ] Performance (Lighthouse)
- [ ] SEO (meta tags, Open Graph)

---

### Phase 5 : Bascule Production (1/2 jour)

#### 5.1 Backup frontend actuel

```bash
# Sauvegarder l'ancien frontend
cd /var/www/leprovencal
tar -czf frontend-backup-$(date +%Y%m%d).tar.gz frontend/build/
```

#### 5.2 Déploiement prod

**Option 1 : Build local puis upload**
```bash
# Local
cd frontend-vite
npm run build

# Upload via rsync
rsync -avz --delete build/ user@prod.leprovencal.ia:/var/www/leprovencal/frontend-vite/build/
```

**Option 2 : Build sur serveur**
```bash
# SSH prod
ssh user@prod.leprovencal.ia

# Build
cd /var/www/leprovencal/frontend-vite
npm install
npm run build

# Reload
sudo systemctl reload nginx
```

#### 5.3 Configuration DNS/Proxy (si changement de port)

Si passage de port 3000 (CRA) à 5173 (Vite) :
- Mettre à jour reverse proxy (Nginx/Apache)
- Ou builder et servir depuis même port

**Vite custom port** :
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000, // Même port que CRA
  },
  preview: {
    port: 3000,
  },
});
```

#### 5.4 Monitoring

**Activer logs** :
- Nginx access/error logs
- Browser console (erreurs JS)
- Backend logs (appels API)

**Métriques à surveiller** :
- Page load time
- Time to Interactive (TTI)
- Erreurs 4xx/5xx
- Taux de conversion (si analytics)

---

### Phase 6 : Déprécation Frontend CRA (1 jour)

#### 6.1 Marquer comme legacy

**Créer `frontend/DEPRECATED.md`** :
```markdown
# ⚠️ DEPRECATED

Ce frontend Create React App est déprécié depuis le [DATE].

**Migration vers** : `frontend-vite/` (TypeScript + Vite)

**Raisons** :
- Type safety avec TypeScript
- Build 10x plus rapide (Vite vs Webpack)
- Architecture moderne et maintenable
- Nouvelles fonctionnalités (useEditInPlace, validation helpers, ErrorBoundary)

**Ne plus modifier ce dossier.**

Voir : `/IMPLEMENTATION_SUMMARY.md` pour détails.
```

#### 6.2 Mise à jour README root

**Modifier `README.md`** (root) :
```markdown
## Frontend

**⚠️ Important** : Le frontend principal est maintenant dans `frontend-vite/` (TypeScript + Vite).

L'ancien frontend CRA (`frontend/`) est déprécié.

### Démarrage rapide

```bash
# Frontend moderne (recommandé)
cd frontend-vite
npm install
npm run dev

# Ancien frontend (déprécié)
cd frontend
npm start  # NE PLUS UTILISER
```

Voir `frontend-vite/README.md` pour la documentation complète.
```

#### 6.3 Suppression future (optionnel)

**Dans 1-2 mois** (après validation prod) :
```bash
# Archiver l'ancien frontend
tar -czf frontend-cra-archive.tar.gz frontend/
git rm -r frontend/
git commit -m "chore: remove deprecated CRA frontend"
```

---

## 📊 Checklist Finale

### Avant migration
- [x] frontend-vite : type-check ✅
- [x] frontend-vite : lint ✅
- [ ] frontend-vite : build test
- [ ] frontend-vite : tous composants présents
- [ ] Variables d'environnement configurées
- [ ] Documentation à jour

### Pendant migration
- [ ] Tests manuels complets
- [ ] Performance Lighthouse > 90
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Cross-browser (Chrome, Firefox, Safari)
- [ ] Backup frontend actuel

### Après migration
- [ ] Production déployée
- [ ] Monitoring actif
- [ ] Rollback possible (si problème)
- [ ] Documentation utilisateur à jour
- [ ] Équipe informée

---

## 🚨 Rollback Plan (si problème en prod)

### Rollback immédiat (< 5 min)

**Option 1 : Restore backup**
```bash
# SSH prod
cd /var/www/leprovencal
tar -xzf frontend-backup-YYYYMMDD.tar.gz
sudo systemctl reload nginx
```

**Option 2 : Revert git commit**
```bash
git revert HEAD
git push origin main
# Redéployer l'ancien build
```

### Rollback configuration

**Nginx** : Changer `root` vers ancien dossier
```nginx
root /var/www/leprovencal/frontend/build;  # Au lieu de frontend-vite/build
```

---

## 📞 Support & Questions

**En cas de problème** :
1. Vérifier les logs (`npm run dev` ou navigateur console)
2. Type-check : `npm run type-check`
3. Rebuild : `rm -rf node_modules && npm install`
4. Consulter `/IMPLEMENTATION_SUMMARY.md`
5. Consulter `frontend-vite/CHANGELOG.md`

**Ressources** :
- [Vite Docs](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React 18 Migration](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)

---

## ✅ Validation Complète

Une fois toutes les étapes validées :

```bash
# Root du projet
git add .
git commit -m "feat: migrate from CRA to Vite + TypeScript

- Implement useEditInPlace hook
- Add validation helpers
- Add ErrorBoundary component
- Update documentation
- Deprecate frontend CRA

See IMPLEMENTATION_SUMMARY.md for details."

git push origin main
```

---

**Bonne migration ! 🚀**
