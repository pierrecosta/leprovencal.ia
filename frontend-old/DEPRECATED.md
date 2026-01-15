# ⚠️ FRONTEND DÉPRÉCIÉ

**Ce frontend Create React App est déprécié depuis le 15 janvier 2026.**

## Migration

**Frontend actif** : [`frontend/`](../frontend) (anciennement `frontend-vite/`)

Toutes les nouvelles fonctionnalités et corrections de bugs doivent être effectuées dans `frontend/`.

## Raisons de la déprécation

1. **Type safety** : Pas de TypeScript → bugs runtime fréquents
2. **Performance** : Webpack lent (30-60s build) vs Vite (< 5s)
3. **Maintenabilité** : Code dupliqué (ArticleCard, GeographyPage)
4. **Architecture** : Manque de patterns réutilisables
5. **DX** : Hot reload lent, pas d'alias `@/`
6. **Moderne** : CRA peu maintenu, React 19 incompatibilités

## Nouvelles fonctionnalités (frontend-vite)

✅ **TypeScript strict mode** - Type safety complète  
✅ **Vite 5** - Build 10x plus rapide  
✅ **Hook `useEditInPlace`** - Pattern edit-in-place réutilisable  
✅ **Validation helpers** - Utilitaires centralisés  
✅ **Error Boundary** - Gestion erreurs React  
✅ **Documentation** - README exhaustif + CHANGELOG  

## Ne plus modifier ce dossier

**Tout nouveau code doit être ajouté dans `frontend/`.**

Si vous avez absolument besoin de modifier ce frontend legacy :
1. Vérifiez d'abord si la fonctionnalité existe dans `frontend/`
2. Si oui, utilisez `frontend/`
3. Si non, implémentez d'abord dans `frontend/` puis backport si nécessaire (rare)

## Timeline

- **15 janvier 2026** : Déprécation officielle
- **Février 2026** : Migration complète en production
- **Mars 2026** : Suppression de ce dossier (archivage)

## Documentation

- [`frontend/README.md`](../frontend/README.md) - Documentation complète
- [`IMPLEMENTATION_SUMMARY.md`](../IMPLEMENTATION_SUMMARY.md) - Détails implémentation
- [`MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md) - Guide de migration

---

**Pour toute question, consulter les documents ci-dessus ou contacter l'équipe dev.**
