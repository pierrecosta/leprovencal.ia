from __future__ import annotations

from sqlalchemy.orm import Session

from app.crud import dictionnaire as dict_crud
from app.models import Dictionnaire
from app.schemas import DictionnaireCreate, DictionnaireUpdate
from app.services.errors import NotFoundError, ValidationError


_SORTABLE_FIELDS = {
    "mots_francais": Dictionnaire.mots_francais,
    "theme": Dictionnaire.theme,
    "categorie": Dictionnaire.categorie,
    "mots_provencal": Dictionnaire.mots_provencal,
    "id": Dictionnaire.id,
}


def list_mots_service(
    db: Session,
    *,
    theme: str | None,
    categorie: str | None,
    lettre: str | None,
    search: str | None,
    page: int,
    limit: int,
    sort: str,
    order: str,
) -> list[Dictionnaire]:
    sort_col = _SORTABLE_FIELDS.get(sort)
    if not sort_col:
        raise ValidationError(f"Champ de tri invalide: {sort}")

    desc_order = order.lower() == "desc"
    return dict_crud.list_mots(
        db,
        theme=theme,
        categorie=categorie,
        lettre=lettre,
        search=search,
        page=page,
        limit=limit,
        sort_col=sort_col,
        desc_order=desc_order,
    )


def list_themes_service(db: Session) -> list[str]:
    return dict_crud.list_themes(db)


def list_categories_service(db: Session, *, theme: str | None) -> list[str]:
    return dict_crud.list_categories(db, theme=theme)


def create_mot_service(db: Session, *, mot_in: DictionnaireCreate) -> Dictionnaire:
    payload = mot_in.model_dump(exclude_unset=True, by_alias=False)
    mf = (payload.get("mots_francais") or "").strip()
    if not mf:
        raise ValidationError("Le champ 'mots_francais' est requis")
    payload["mots_francais"] = mf

    obj = dict_crud.create_mot(db, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def update_mot_service(db: Session, *, mot_id: int, mot_in: DictionnaireUpdate) -> Dictionnaire:
    obj = dict_crud.get_mot_by_id(db, mot_id=mot_id)
    if not obj:
        raise NotFoundError("Mot non trouvé")

    payload = mot_in.model_dump(exclude_unset=True, by_alias=False)
    if "mots_francais" in payload:
        mf = (payload.get("mots_francais") or "").strip()
        if not mf:
            raise ValidationError("Le champ 'mots_francais' est requis")
        payload["mots_francais"] = mf

    dict_crud.update_mot(obj, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def delete_mot_service(db: Session, *, mot_id: int) -> None:
    obj = dict_crud.get_mot_by_id(db, mot_id=mot_id)
    if not obj:
        raise NotFoundError("Mot non trouvé")

    dict_crud.delete_mot(db, obj=obj)
    db.commit()
