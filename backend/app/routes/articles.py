"""
Module: articles.py
Description: Routes CRUD pour les Articles avec authentification JWT et pagination.
Stack: FastAPI + SQLAlchemy + Pydantic
"""

from fastapi import APIRouter, Depends, status, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import ArticleCreate, ArticleUpdate, ArticleOut
from app.utils.security import require_authenticated
from app.services import articles as articles_service
from app.services.errors import NotFoundError, ValidationError
from app.utils.http_errors import http_error
from sqlalchemy.exc import DataError, IntegrityError, StatementError
from app.utils.db_errors import format_db_exception
from app.utils.images import validate_image_upload

router = APIRouter()

# ✅ Lire tous les articles
@router.get("/", response_model=List[ArticleOut])
def get_articles(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    return articles_service.list_articles_service(db, skip=skip, limit=limit)


# ✅ Lire un article par ID
@router.get("/{article_id}", response_model=ArticleOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    try:
        return articles_service.get_article_service(db, article_id=article_id)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=f"{e} (resource=article id={article_id})")


# ✅ Créer un article (auth requis)
@router.post("/", response_model=ArticleOut, status_code=status.HTTP_201_CREATED)
def create_article(
    article: ArticleCreate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return articles_service.create_article_service(db, article_in=article)
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e), field="titre")
    except (DataError, IntegrityError, StatementError) as e:
        user_msg, field, err_type = format_db_exception(e)
        raise http_error(400, code="db_error", message=user_msg, field=field, extra={"sql_error": err_type})


# ✅ Mettre à jour un article (auth requis)
@router.put("/{article_id}", response_model=ArticleOut)
def update_article(
    article_id: int,
    article: ArticleUpdate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return articles_service.update_article_service(db, article_id=article_id, article_in=article)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=f"{e} (resource=article id={article_id})")
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e), field="titre")
    except (DataError, IntegrityError, StatementError) as e:
        user_msg, field, err_type = format_db_exception(e)
        raise http_error(400, code="db_error", message=user_msg, field=field, extra={"sql_error": err_type})


# ✅ Supprimer un article (auth requis)
@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        articles_service.delete_article_service(db, article_id=article_id)
        return None
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=f"{e} (resource=article id={article_id})")


@router.get("/{article_id}/image")
def get_article_image(article_id: int, db: Session = Depends(get_db)):
    try:
        data, mime = articles_service.get_article_image_service(db, article_id=article_id)
        return Response(content=data, media_type=mime)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=f"{e} (resource=article_image article id={article_id})")


@router.put("/{article_id}/image", response_model=ArticleOut)
async def upload_article_image(
    article_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        data = await image.read()
        info = validate_image_upload(data=data, declared_mime=image.content_type)
        return articles_service.set_article_image_service(db, article_id=article_id, image_data=data, image_mime=info.mime)
    except ValueError as e:
        raise http_error(413, code="validation_error", message=str(e), field="image")
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=f"{e} (resource=article id={article_id})")
    except (DataError, IntegrityError, StatementError) as e:
        user_msg, field, err_type = format_db_exception(e)
        raise http_error(400, code="db_error", message=user_msg, field=field, extra={"sql_error": err_type})


@router.delete("/{article_id}/image", response_model=ArticleOut)
def delete_article_image(
    article_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return articles_service.clear_article_image_service(db, article_id=article_id)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=f"{e} (resource=article id={article_id})")
