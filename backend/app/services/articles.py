from __future__ import annotations

from sqlalchemy.orm import Session

from app.crud import articles as articles_crud
from app.models import Article
from app.schemas import ArticleCreate, ArticleUpdate
from app.services.errors import NotFoundError, ValidationError


def list_articles_service(db: Session, *, skip: int, limit: int) -> list[Article]:
    return articles_crud.list_articles(db, skip=skip, limit=limit)


def get_article_service(db: Session, *, article_id: int) -> Article:
    obj = articles_crud.get_article_by_id(db, article_id=article_id)
    if not obj:
        raise NotFoundError("Article non trouvé")
    return obj


def create_article_service(db: Session, *, article_in: ArticleCreate) -> Article:
    payload = article_in.model_dump(exclude_unset=True, by_alias=False)
    titre = (payload.get("titre") or "").strip()
    if not titre:
        raise ValidationError("Le champ 'titre' est requis")
    payload["titre"] = titre

    obj = articles_crud.create_article(db, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def update_article_service(db: Session, *, article_id: int, article_in: ArticleUpdate) -> Article:
    obj = articles_crud.get_article_by_id(db, article_id=article_id)
    if not obj:
        raise NotFoundError("Article non trouvé")

    payload = article_in.model_dump(exclude_unset=True, by_alias=False)
    if "titre" in payload:
        titre = (payload.get("titre") or "").strip()
        if not titre:
            raise ValidationError("Le champ 'titre' est requis")
        payload["titre"] = titre

    articles_crud.update_article(obj, payload=payload)
    db.commit()
    db.refresh(obj)
    return obj


def delete_article_service(db: Session, *, article_id: int) -> None:
    obj = articles_crud.get_article_by_id(db, article_id=article_id)
    if not obj:
        raise NotFoundError("Article non trouvé")

    articles_crud.delete_article(db, obj=obj)
    db.commit()
