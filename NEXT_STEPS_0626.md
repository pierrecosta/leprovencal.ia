# NEXT STEPS — todo0626 (2026-06-26)

## Statut actuel
- CI corrigée (paths frontend + robustesse Python/setup).
- Vérification d’exécution CI à confirmer sur Actions.
- Plan de maintenance enclenché.

## Priorités

### P0 — Cette semaine
1. Vérifier que le workflow CI passe sur `main`.
2. Corriger immédiatement toute casse backend/frontend détectée par CI.
3. Activer la maintenance continue des dépendances (Dependabot).

### P1 — 1 à 2 semaines
1. Audit sécurité backend (pip) et frontend (npm) via CI.
2. Appliquer les updates patch/minor sans risque.
3. Ajouter badges CI dans README.
4. Créer un `CHANGELOG.md`.

### P2 — 2 à 4 semaines
1. Revue de pertinence produit (README vs besoin 2026).
2. Vérification des intégrations externes/API IA.
3. Cartographie de dette technique et plan de réduction incrémental.

## Décision provisoire (todo0626)
- Option retenue: **B — Refresh léger (1–3 jours initiaux + suivi)**
- Motif: le socle est exploitable, mais la maintenance doit être réactivée.

## Risques principaux
- Dérive de dépendances si maintenance passive.
- Régressions silencieuses si CI non surveillée.
- Écart fonctionnel progressif avec les besoins 2026.

## Critères de sortie du plan
- CI verte sur main.
- Dépendances critiques traitées.
- Documentation minimale de run/reprise à jour.
- Backlog priorisé P0/P1/P2 validé.
