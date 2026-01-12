from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Histoire


def list_histoires(db: Session, *, offset: int, limit: int) -> list[Histoire]:
    return db.query(Histoire).offset(offset).limit(limit).all()


def list_all_histoires(db: Session) -> list[Histoire]:
    return db.query(Histoire).all()


def get_histoire_by_id(db: Session, *, histoire_id: int) -> Histoire | None:
    return db.query(Histoire).filter(Histoire.id == histoire_id).first()


def get_histoire_by_titre(db: Session, *, titre: str) -> Histoire | None:
    return db.query(Histoire).filter(Histoire.titre == titre).first()


def create_histoire(db: Session, *, payload: dict) -> Histoire:
    obj = Histoire(**payload)
    db.add(obj)
    return obj


def update_histoire(obj: Histoire, *, payload: dict) -> Histoire:
    for key, value in payload.items():
        setattr(obj, key, value)
    return obj


def delete_histoire(db: Session, *, obj: Histoire) -> None:
    db.delete(obj)
