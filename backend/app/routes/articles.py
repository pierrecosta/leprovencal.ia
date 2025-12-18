
"""
Module: articles.py
Description: Routes CRUD pour les Articles avec authentification JWT et pagination.
Stack: FastAPI + SQLAlchemy + Pydantic
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Article
from app.schemas import ArticleCreate, ArticleResponse
from app.utils.security import get_current_user_optional, require_authenticated  # Vérifie le token JWT
										 

router = APIRouter()

# ✅ Lire tous les articles
@router.get("/", response_model=List[ArticleResponse])

def get_articles(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    # Tu peux utiliser current_user pour adapter la réponse (ex: flags)
    articles = db.query(Article).offset(skip).limit(limit).all()
    return articles


# ✅ Lire un article par ID
@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return article

# ✅ Créer un article (auth requis)
@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(article: ArticleCreate, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    new_article = Article(**article.dict())
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article

# ✅ Mettre à jour un article (auth requis)
@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(article_id: int, article: ArticleCreate, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    existing_article = db.query(Article).filter(Article.id == article_id).first()
    if not existing_article:
        raise HTTPException(status_code=404, detail="Article non trouvé")

    for key, value in article.dict(exclude_unset=True).items():
        setattr(existing_article, key, value)

    db.commit()
    db.refresh(existing_article)
    return existing_article

# ✅ Supprimer un article (auth requis)
@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    db.delete(article)
    db.commit()
    return None
