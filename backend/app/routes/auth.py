
"""
Module: auth.py
Description: Routes d'authentification (login, register) avec JWT et bcrypt.
Stack: FastAPI + SQLAlchemy + Passlib + PyJWT
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import os

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
from app.utils.security import (
    verify_password,
    hash_password,
    create_access_token,
    require_authenticated,
)

router = APIRouter()

# ==========================
# Configuration
# ==========================
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


# ==========================
# REGISTER
# ==========================
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crée un nouvel utilisateur avec mot de passe hashé.
    """
    # Vérifier si l'utilisateur existe déjà
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nom d'utilisateur déjà pris",
        )

    # Hash du mot de passe
    hashed_password = hash_password(user.password)

    # Création de l'utilisateur
    new_user = User(username=user.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ==========================
# LOGIN
# ==========================
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authentifie un utilisateur et retourne un token JWT.
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides",
        )

    # Génération du token JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


# ==========================
# ROUTE PROTÉGÉE (EXEMPLE)
# ==========================
@router.get("/me")
def get_me(current_user: str = Depends(require_authenticated)):
    """
    Retourne l'utilisateur courant (extrait du token).
    """
    return {"username": current_user}
