"""
Module: auth.py
Description: Routes d'authentification (login, register) avec JWT et bcrypt.
Stack: FastAPI + SQLAlchemy + Passlib + PyJWT
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate, UserResponse
from app.utils.security import require_authenticated
from app.services import auth as auth_service
from app.services.errors import ConflictError, UnauthorizedError, ValidationError
from app.utils.http_errors import http_error

router = APIRouter()

# ==========================
# REGISTER
# ==========================
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crée un nouvel utilisateur avec mot de passe hashé.
    """
    try:
        return auth_service.register_user_service(db, user_in=user)
    except ConflictError as e:
        raise http_error(status.HTTP_400_BAD_REQUEST, code="conflict", message=str(e), field="username")
    except ValidationError as e:
        raise http_error(status.HTTP_422_UNPROCESSABLE_ENTITY, code="validation_error", message=str(e))


# ==========================
# LOGIN
# ==========================
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authentifie un utilisateur et retourne un token JWT.
    """
    try:
        return auth_service.login_service(
            db, username=form_data.username, password=form_data.password
        )
    except UnauthorizedError as e:
        raise http_error(status.HTTP_401_UNAUTHORIZED, code="unauthorized", message=str(e))


# ==========================
# ROUTE PROTÉGÉE
# ==========================
@router.get("/me")
def get_me(current_user: str = Depends(require_authenticated)):
    """
    Retourne l'utilisateur courant (extrait du token).
    """
    return {"username": current_user}
