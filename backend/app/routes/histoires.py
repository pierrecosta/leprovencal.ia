from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from app.database import get_db
from app.schemas import HistoireCreate, HistoireUpdate, HistoireOut
from app.utils.security import require_authenticated
from app.services import histoires as histoires_service
from app.services.errors import NotFoundError, ValidationError
from app.utils.http_errors import http_error

router = APIRouter()

# Lire les histoires avec pagination
@router.get("/", response_model=List[HistoireOut])
def get_histoires(page: int = 1, limit: int = 5, db: Session = Depends(get_db)):
    return histoires_service.list_histoires_service(db, page=page, limit=limit)


# Sommaire groupé
@router.get("/menu")
def get_menu_histoires(db: Session = Depends(get_db)) -> Dict[str, Dict[str, List[histoires_service.MenuItem]]]:
    return histoires_service.menu_histoires_service(db)


# Recherche par titre
@router.get("/find", response_model=HistoireOut)
def find_histoire(titre: str, db: Session = Depends(get_db)):
    try:
        return histoires_service.find_histoire_service(db, titre=titre)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "histoire", "titre": titre})


# Recherche par id
@router.get("/{histoire_id}", response_model=HistoireOut)
def get_histoire_by_id(histoire_id: int, db: Session = Depends(get_db)):
    try:
        return histoires_service.get_histoire_by_id_service(db, histoire_id=histoire_id)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "histoire", "id": histoire_id})


# Créer une histoire (auth requis)
@router.post("/", response_model=HistoireOut, status_code=status.HTTP_201_CREATED)
def create_histoire(
    histoire: HistoireCreate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return histoires_service.create_histoire_service(db, histoire_in=histoire)
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e))


# Mettre à jour une histoire (auth requis)
@router.put("/{histoire_id}", response_model=HistoireOut)
def update_histoire(
    histoire_id: int,
    histoire: HistoireUpdate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return histoires_service.update_histoire_service(db, histoire_id=histoire_id, histoire_in=histoire)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "histoire", "id": histoire_id})
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e))


# Supprimer une histoire (auth requis)
@router.delete("/{histoire_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_histoire(histoire_id: int, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    try:
        histoires_service.delete_histoire_service(db, histoire_id=histoire_id)
        return None
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "histoire", "id": histoire_id})
