from fastapi import APIRouter, Depends, status, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import CarteCreate, CarteUpdate, CarteOut
from app.utils.security import require_authenticated
from app.services import cartes as cartes_service
from app.services.errors import NotFoundError, ValidationError
from app.utils.http_errors import http_error
from app.utils.images import validate_image_upload

router = APIRouter()


@router.get("/", response_model=List[CarteOut])
def get_cartes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return cartes_service.list_cartes_service(db, skip=skip, limit=limit)


@router.get("/{carte_id}", response_model=CarteOut)
def get_carte_by_id(carte_id: int, db: Session = Depends(get_db)):
    try:
        return cartes_service.get_carte_service(db, carte_id=carte_id)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "carte", "id": carte_id})


@router.post("/", response_model=CarteOut, status_code=status.HTTP_201_CREATED)
def create_carte(
    carte: CarteCreate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return cartes_service.create_carte_service(db, carte_in=carte)
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e))


@router.put("/{carte_id}", response_model=CarteOut)
def update_carte(
    carte_id: int,
    carte: CarteUpdate,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return cartes_service.update_carte_service(db, carte_id=carte_id, carte_in=carte)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "carte", "id": carte_id})
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e))


@router.delete("/{carte_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_carte(
    carte_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        cartes_service.delete_carte_service(db, carte_id=carte_id)
        return None
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "carte", "id": carte_id})


@router.get("/{carte_id}/image")
def get_carte_image(carte_id: int, db: Session = Depends(get_db)):
    try:
        data, mime = cartes_service.get_carte_image_service(db, carte_id=carte_id)
        return Response(content=data, media_type=mime)
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "carte_image", "id": carte_id})


@router.put("/{carte_id}/image", response_model=CarteOut)
async def upload_carte_image(
    carte_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        data = await image.read()
        info = validate_image_upload(data=data, declared_mime=image.content_type)
        return cartes_service.set_carte_image_service(db, carte_id=carte_id, image_data=data, image_mime=info.mime)
    except ValueError as e:
        raise http_error(413, code="validation_error", message=str(e), field="image")
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "carte", "id": carte_id})


@router.delete("/{carte_id}/image", response_model=CarteOut)
def delete_carte_image(
    carte_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(require_authenticated),
):
    try:
        return cartes_service.clear_carte_image_service(db, carte_id=carte_id)
    except ValidationError as e:
        raise http_error(422, code="validation_error", message=str(e))
    except NotFoundError as e:
        raise http_error(404, code="not_found", message=str(e), extra={"resource": "carte", "id": carte_id})
