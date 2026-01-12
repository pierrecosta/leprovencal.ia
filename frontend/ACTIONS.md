## 1) API Contracts

- [ ] Inventory every frontend call and map it to a backend route (method/path/query/body)
- [ ] Align pagination to backend expectations (skip/limit vs page/limit) and make it consistent across pages
- [x] Ensure `REACT_APP_API_URL` is the single base URL (api.js only)
- [ ] Normalize endpoint names (avoid “paged” unless backend provides it)

## 2) Payload casing

- [x] Enforce “frontend camelCase only” at UI boundaries (HistoryPage + ArticleCard)
- [x] Payload normalizers in API layer (articles/dictionnaire)
- [x] Response normalizers where backend returns snake_case or mixed casing (histoires + articles + dictionnaire)
- [ ] Remove remaining back-compat props from UI (e.g. `image_url`, `source_url`) once all callers use normalized services
- [ ] Validate required fields before submit across all forms (DictionaryPage still pending)

## 3) Auth Flow

### Token handling
- [x] Single token helpers in `services/api.js` (get/set/clear)
- [x] Centralized Bearer injection via `authHttp` interceptor
- [x] Predictable logout on 401 (clear token + redirect + `auth:logout`)
- [x] `/auth/me` deduped per page load (useAuth)

### 429 backoff
- [x] Read `Retry-After` and show wait message (LoginPage)
- [x] Disable submit during lockout (LoginPage)
- [x] Use `getApiErrorMessage(err)` for UI-safe messages
- [x] Reusable alert component (ApiAlert)

## CSS System (Next)
## CSS System (Next)
- [x] Make `theme.css` the only source for palette/typography/shadows — UPDATED: moved App.css drop-shadow values into `theme.css` variables; converted `olive.svg`, `lavender.svg`, and `logo.svg` to `currentColor`; added small SVG utility classes in `theme.css`.
- [x] Remove remaining duplicated styles between App/theme/Tailwind — UPDATED: moved `.btn` margin into `theme.css` and removed duplicated `.container`/`.section`/`.card`/`.btn` rules from `App.css`.