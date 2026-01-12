from __future__ import annotations

from sqlalchemy.orm import Session

from app.crud import cartes as cartes_crud
from app.models import Carte
from app.schemas import CarteCreate, CarteUpdate
from app.services.errors import NotFoundError, ValidationError


def list_cartes_service(db: Session, *, skip: int, limit: int) -> list[Carte]:
    return cartes_crud.list_cartes(db, skip=skip, limit=limit)


def get_carte_service(db: Session, *, carte_id: int) -> Carte:
    obj = cartes_crud.get_carte_by_id(db, carte_id=carte_id)
    if not obj:
        raise NotFoundError("Carte non trouvée")
    return obj


def create_carte_service(db: Session, *, carte_in: CarteCreate) -> Carte:
    payload = carte_in.model_dump(exclude_unset=True, by_alias=False)

    titre = (payload.get("titre") or "").strip()
    iframe_url = (payload.get("iframe_url") or "").strip() or None
    if not titre:
        raise ValidationError("Le champ 'titre' est requis")

    payload["titre"] = titre
    payload["iframe_url"] = iframe_url

    obj = cartes_crud.create_carte(db, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def update_carte_service(db: Session, *, carte_id: int, carte_in: CarteUpdate) -> Carte:
    obj = cartes_crud.get_carte_by_id(db, carte_id=carte_id)
    if not obj:
        raise NotFoundError("Carte non trouvée")

    payload = carte_in.model_dump(exclude_unset=True, by_alias=False)

    if "titre" in payload and not (payload.get("titre") or "").strip():
        raise ValidationError("Le champ 'titre' est requis")

    if "iframe_url" in payload:
        raw = payload.get("iframe_url")
        new_iframe = (raw.strip() if isinstance(raw, str) else raw)
        if isinstance(new_iframe, str) and new_iframe.strip() == "":
            new_iframe = None
        if new_iframe is None and not (obj.image_data and obj.image_mime):
            raise ValidationError("Il faut une iframe URL ou une image")
        payload["iframe_url"] = new_iframe

    payload = {k: (v.strip() if isinstance(v, str) else v) for k, v in payload.items()}

    cartes_crud.update_carte(obj, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def delete_carte_service(db: Session, *, carte_id: int) -> None:
    obj = cartes_crud.get_carte_by_id(db, carte_id=carte_id)
    if not obj:
        raise NotFoundError("Carte non trouvée")

    cartes_crud.delete_carte(db, obj=obj)
    db.commit()


def set_carte_image_service(db: Session, *, carte_id: int, image_data: bytes, image_mime: str) -> Carte:
    obj = cartes_crud.get_carte_by_id(db, carte_id=carte_id)
    if not obj:
        raise NotFoundError("Carte non trouvée")

    obj.image_data = image_data
    obj.image_mime = image_mime
    db.commit()
    db.refresh(obj)
    return obj


def clear_carte_image_service(db: Session, *, carte_id: int) -> Carte:
    obj = cartes_crud.get_carte_by_id(db, carte_id=carte_id)
    if not obj:
        raise NotFoundError("Carte non trouvée")

    if not (obj.iframe_url and str(obj.iframe_url).strip()):
        raise ValidationError("Il faut une iframe URL ou une image")

    obj.image_data = None
    obj.image_mime = None
    db.commit()
    db.refresh(obj)
    return obj


def get_carte_image_service(db: Session, *, carte_id: int) -> tuple[bytes, str]:
    obj = cartes_crud.get_carte_by_id(db, carte_id=carte_id)
    if not obj:
        raise NotFoundError("Carte non trouvée")

    if not obj.image_data or not obj.image_mime:
        raise NotFoundError("Image non trouvée")

    return obj.image_data, obj.image_mime
