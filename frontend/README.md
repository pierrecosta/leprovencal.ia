# Frontend (React + Tailwind)

## Prérequis
- Node.js + npm

## Démarrage (dev)
```bash
npm install
npm start
```

- Frontend: http://localhost:3000
- Backend (par défaut): http://localhost:8000

## Configuration (.env)
Créer `frontend/.env` si besoin :

- `REACT_APP_API_URL=http://localhost:8000` (optionnel)
- `REACT_APP_WEB_VITALS=1` (optionnel)

## API contract (routes → services)
| Service (frontend/src/services/api.js) | Méthode | Route |
|---|---:|---|
| `getArticles()` | GET | `/articles` |
| `updateArticle(id, payload)` | PUT | `/articles/{id}` |
| `getDictionary(params)` | GET | `/dictionnaire` |
| `updateMot(id, payload)` | PUT | `/dictionnaire/{id}` |
| `getThemes()` | GET | `/dictionnaire/themes` |
| `getCategories(theme)` | GET | `/dictionnaire/categories?theme=...` |
| `getMenuHistoires()` | GET | `/histoires/menu` |
| `getHistoireById(id)` | GET | `/histoires/{id}` |
| `findHistoire(titre)` | GET | `/histoires/find?titre=...` |
| `login({username,password})` | POST | `/auth/login` (form-urlencoded) |
| `register({username,password})` | POST | `/auth/register` (json) |
| `getMe()` | GET | `/auth/me` |

## Conventions frontend ⇄ backend
- Frontend (JS/React): `camelCase`
- Backend/API interne/DB: `snake_case`
- L’API expose/consomme du `camelCase` (via alias côté backend), tout en conservant `snake_case` en interne.

## Auth (anti-abus / 429)
- Le backend peut renvoyer `429` sur `/auth/login` avec `Retry-After`.
- UX:
  - Le bouton de login est désactivé pendant `Retry-After`.
  - Un message indique le temps restant.
- Helpers: `getRetryAfterSeconds(err)` + `getApiErrorMessage(err)`.

## Erreurs API (contrat)
Le backend renvoie les erreurs au format :
- `detail = { "code": string, "message": string, "field"?: string }`

Côté frontend, utilisez `getApiErrorMessage(err)` pour afficher un message sans risque de `[object Object]`.

## Auth (note prod)
- Actuellement, le token est stocké dans `localStorage`.
- En production, préférer un cookie `HttpOnly; Secure; SameSite` (réduit le risque XSS).

## Thème / couleurs
- Source de vérité: `src/theme.css` (variables CSS).
- Ne pas dupliquer des valeurs hex dans les composants: référencer les variables (`--primary`, `--accent`, ou alias `--color-*`).

## Observabilité (optionnel)
Activer les logs web-vitals :
- `REACT_APP_WEB_VITALS=1`

## Dev checklist
- `REACT_APP_API_URL` correct (defaults to `http://localhost:8000`)
- Login rate-limit UX: verify `429` shows countdown and disables submit
- Auth invalid/expired: verify protected calls trigger logout + redirect to `/login`

## Auth (401)
- Les appels via l’instance auth (`apiAuth`) déclenchent un logout automatique sur `401`:
  - token supprimé
  - event `auth:logout`
  - redirection vers `/login`
