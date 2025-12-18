"""
Module: security.py
Description: Gestion de la sécurité (hashage des mots de passe, génération et validation des tokens JWT)
Stack: FastAPI + Passlib + PyJWT (via jose)
"""

from datetime import datetime, timedelta
from typing import Optional, Dict

import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

load_dotenv()
# ==========================
# Configuration
# ==========================
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# ==========================
# Context pour hashage
# ==========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================
# OAuth2
# ==========================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ==========================
# Fonctions de hashage
# ==========================
def hash_password(password: str) -> str:
    """
    Hash un mot de passe avec bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie si le mot de passe en clair correspond au hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ==========================
# JWT : création et validation
# ==========================
def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crée un token JWT avec une date d'expiration.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, str]]:
    """
    Décode un token JWT et retourne le payload si valide, sinon None.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ==========================
# Dépendance FastAPI
# ==========================
def require_authenticated(token: str = Depends(oauth2_scheme)) -> str:
    """
    Dépendance à utiliser sur les routes PRIVÉES.
    Exige un token valide, sinon lève 401.
    Retourne le username (sub).
    """
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise (token invalide ou expiré)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload["sub"]


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """
    Dépendance optionnelle pour les routes PUBLIQUES.
    N'exige pas le token : retourne None si absent/invalide.
    """
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        return None
    return payload["sub"]
