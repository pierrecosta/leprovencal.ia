from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Carte


def list_cartes(db: Session, *, skip: int = 0, limit: int = 100) -> list[Carte]:
    return db.query(Carte).order_by(Carte.id.asc()).offset(skip).limit(limit).all()


def get_carte_by_id(db: Session, *, carte_id: int) -> Carte | None:
    return db.query(Carte).filter(Carte.id == carte_id).first()


def create_carte(db: Session, *, payload: dict) -> Carte:
    obj = Carte(**payload)
    db.add(obj)
    return obj


def update_carte(obj: Carte, *, payload: dict) -> Carte:
    for k, v in payload.items():
        setattr(obj, k, v)
    return obj


def delete_carte(db: Session, *, obj: Carte) -> None:
    db.delete(obj)
