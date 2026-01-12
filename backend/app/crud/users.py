from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import User


def get_user_by_username(db: Session, *, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, *, username: str, hashed_password: str) -> User:
    obj = User(username=username, password=hashed_password)
    db.add(obj)
    return obj
