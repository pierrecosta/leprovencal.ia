from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Article


def list_articles(db: Session, *, skip: int, limit: int) -> list[Article]:
    return db.query(Article).offset(skip).limit(limit).all()


def get_article_by_id(db: Session, *, article_id: int) -> Article | None:
    return db.query(Article).filter(Article.id == article_id).first()


def create_article(db: Session, *, payload: dict) -> Article:
    obj = Article(**payload)
    db.add(obj)
    return obj


def update_article(obj: Article, *, payload: dict) -> Article:
    for key, value in payload.items():
        setattr(obj, key, value)
    return obj


def delete_article(db: Session, *, obj: Article) -> None:
    db.delete(obj)
