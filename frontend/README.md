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

## Conventions frontend ⇄ backend
- Frontend (JS/React): `camelCase`
- Backend/API interne/DB: `snake_case`
- L’API expose/consomme du `camelCase` (via alias côté backend), tout en conservant `snake_case` en interne.

Exemples (côté frontend) :
- Article: `imageUrl`, `sourceUrl`
- Dictionnaire: `motsFrancais`, `motsProvencal`, `synonymesFrancais`

## Thème / couleurs
- Source de vérité: `src/theme.css` (variables CSS).
- Ne pas dupliquer des valeurs hex dans les composants: référencer les variables (`--primary`, `--accent`, ou alias `--color-*`).

## Observabilité (optionnel)
Activer les logs web-vitals :
- `REACT_APP_WEB_VITALS=1`

## Auth (note prod)
- Actuellement, le token est stocké dans `localStorage`.
- En production, préférer un cookie `HttpOnly; Secure; SameSite` (réduit le risque XSS).
