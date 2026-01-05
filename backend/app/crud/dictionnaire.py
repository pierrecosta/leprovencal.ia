from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.models import Dictionnaire


def list_mots(
    db: Session,
    *,
    theme: str | None,
    categorie: str | None,
    lettre: str | None,
    search: str | None,
    page: int,
    limit: int,
    sort_col: ColumnElement,
    desc_order: bool,
) -> list[Dictionnaire]:
    query = db.query(Dictionnaire)

    if theme and theme.lower() != "tous":
        query = query.filter(Dictionnaire.theme == theme)
    if categorie and categorie.lower() != "toutes":
        query = query.filter(Dictionnaire.categorie == categorie)
    if lettre and lettre.lower() != "toutes":
        query = query.filter(Dictionnaire.mots_francais.startswith(lettre))
    if search:
        query = query.filter(Dictionnaire.mots_francais.ilike(f"%{search}%"))

    query = query.order_by(sort_col.desc() if desc_order else sort_col.asc())
    return query.offset((page - 1) * limit).limit(limit).all()


def list_themes(db: Session) -> list[str]:
    rows = db.query(Dictionnaire.theme).distinct().all()
    return [t[0] for t in rows if t[0]]


def list_categories(db: Session, *, theme: str | None) -> list[str]:
    q = db.query(Dictionnaire.categorie)
    if theme and theme.lower() != "tous":
        q = q.filter(Dictionnaire.theme == theme)
    rows = q.distinct().all()
    return [c[0] for c in rows if c[0]]


def get_mot_by_id(db: Session, *, mot_id: int) -> Dictionnaire | None:
    return db.query(Dictionnaire).filter(Dictionnaire.id == mot_id).first()


def create_mot(db: Session, *, payload: dict) -> Dictionnaire:
    obj = Dictionnaire(**payload)
    db.add(obj)
    return obj


def update_mot(obj: Dictionnaire, *, payload: dict) -> Dictionnaire:
    for key, value in payload.items():
        setattr(obj, key, value)
    return obj


def delete_mot(db: Session, *, obj: Dictionnaire) -> None:
    db.delete(obj)
