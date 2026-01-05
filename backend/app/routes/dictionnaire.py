from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas import DictionnaireCreate, DictionnaireUpdate, DictionnaireOut
from app.utils.security import require_authenticated
from app.services import dictionnaire as dict_service
from app.services.errors import NotFoundError, ValidationError
from app.utils.http_errors import http_error

router = APIRouter()

# 🔎 Liste paginée avec filtres + tri
@router.get("/", response_model=List[DictionnaireOut])
def get_dictionnaire(
    theme: Optional[str] = Query(None),
    categorie: Optional[str] = Query(None),
    lettre: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
    sort: str = Query("mots_francais"),
    order: str = Query("asc"),
    db: Session = Depends(get_db),
):
    try:
        return dict_service.list_mots_service(
            db,
            theme=theme,
            categorie=categorie,
            lettre=lettre,
            search=search,
            page=page,
            limit=limit,
            sort=sort,
            order=order,
        )
    except ValidationError as e:
        raise http_error(400, code="validation_error", message=str(e), field="sort")


# 🧾 Liste des thèmes distincts
@router.get("/themes", response_model=List[str])
def get_themes(db: Session = Depends(get_db)):
    return dict_service.list_themes_service(db)


# 🧾 Liste des catégories (toutes ou par thème)
@router.get("/categories", response_model=List[str])
def get_categories(theme: Optional[str] = Query("tous"), db: Session = Depends(get_db)):
    return dict_service.list_categories_service(db, theme=theme)


# ✅ Ajouter un mot (auth requis)
@router.post("/", response_model=DictionnaireOut, status_code=status.HTTP_201_CREATED)
def create_mot(
    mot: DictionnaireCreate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return dict_service.create_mot_service(db, mot_in=mot)
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e), field="motsFrancais")


# ✅ Mettre à jour un mot (auth requis)
@router.put("/{mot_id}", response_model=DictionnaireOut)
def update_mot(
    mot_id: int,
    mot: DictionnaireUpdate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return dict_service.update_mot_service(db, mot_id=mot_id, mot_in=mot)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "dictionnaire", "id": mot_id})
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e), field="motsFrancais")


# ✅ Supprimer un mot (auth requis)
@router.delete("/{mot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mot(mot_id: int, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    try:
        dict_service.delete_mot_service(db, mot_id=mot_id)
        return None
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "dictionnaire", "id": mot_id})

