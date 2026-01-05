from __future__ import annotations

from typing import Dict, List, TypedDict

from sqlalchemy.orm import Session

from app.crud import histoires as histoires_crud
from app.models import Histoire
from app.schemas import HistoireCreate, HistoireUpdate
from app.services.errors import NotFoundError, ValidationError


class MenuItem(TypedDict):
    id: int
    titre: str
    description_courte: str


def list_histoires_service(db: Session, *, page: int, limit: int) -> list[Histoire]:
    offset = (page - 1) * limit
    return histoires_crud.list_histoires(db, offset=offset, limit=limit)


def menu_histoires_service(db: Session) -> Dict[str, Dict[str, List[MenuItem]]]:
    histoires = histoires_crud.list_all_histoires(db)
    grouped: Dict[str, Dict[str, List[MenuItem]]] = {}

    for h in histoires:
        typologie = getattr(h, "typologie", "Autre") or "Autre"
        periode = getattr(h, "periode", "Non défini") or "Non défini"
        titre = getattr(h, "titre", "") or ""
        desc = getattr(h, "description_courte", "") or ""

        grouped.setdefault(typologie, {}).setdefault(periode, []).append(
            MenuItem(id=h.id, titre=titre, description_courte=desc)
        )

    for t in grouped:
        for p in grouped[t]:
            grouped[t][p] = sorted(grouped[t][p], key=lambda x: x["titre"])
    return grouped


def get_histoire_by_id_service(db: Session, *, histoire_id: int) -> Histoire:
    obj = histoires_crud.get_histoire_by_id(db, histoire_id=histoire_id)
    if not obj:
        raise NotFoundError("Histoire non trouvée")
    return obj


def find_histoire_service(db: Session, *, titre: str) -> Histoire:
    obj = histoires_crud.get_histoire_by_titre(db, titre=titre)
    if not obj:
        raise NotFoundError("Histoire non trouvée")
    return obj


def create_histoire_service(db: Session, *, histoire_in: HistoireCreate) -> Histoire:
    payload = histoire_in.model_dump(exclude_unset=True, by_alias=False)

    titre = (payload.get("titre") or "").strip()
    typologie = (payload.get("typologie") or "").strip()
    periode = (payload.get("periode") or "").strip()
    if not titre:
        raise ValidationError("Le champ 'titre' est requis")
    if not typologie:
        raise ValidationError("Le champ 'typologie' est requis")
    if not periode:
        raise ValidationError("Le champ 'periode' est requis")

    payload.update(titre=titre, typologie=typologie, periode=periode)

    obj = histoires_crud.create_histoire(db, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def update_histoire_service(db: Session, *, histoire_id: int, histoire_in: HistoireUpdate) -> Histoire:
    obj = histoires_crud.get_histoire_by_id(db, histoire_id=histoire_id)
    if not obj:
        raise NotFoundError("Histoire non trouvée")

    payload = histoire_in.model_dump(exclude_unset=True, by_alias=False)

    if "titre" in payload and not (payload.get("titre") or "").strip():
        raise ValidationError("Le champ 'titre' est requis")
    if "typologie" in payload and not (payload.get("typologie") or "").strip():
        raise ValidationError("Le champ 'typologie' est requis")
    if "periode" in payload and not (payload.get("periode") or "").strip():
        raise ValidationError("Le champ 'periode' est requis")

    payload = {k: (v.strip() if isinstance(v, str) else v) for k, v in payload.items()}

    histoires_crud.update_histoire(obj, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def delete_histoire_service(db: Session, *, histoire_id: int) -> None:
    obj = histoires_crud.get_histoire_by_id(db, histoire_id=histoire_id)
    if not obj:
        raise NotFoundError("Histoire non trouvée")

    histoires_crud.delete_histoire(db, obj=obj)
    db.commit()
