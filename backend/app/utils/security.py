"""
Module: security.py
Description: Gestion de la sécurité (hashage des mots de passe, génération et validation des tokens JWT)
Stack: FastAPI + Passlib + PyJWT (via jose)
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
import os

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from passlib.context import CryptContext
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.http_errors import http_error

from app.config import settings as _settings

def _is_production(env: str) -> bool:
    return env.lower() in {"prod", "production"}

# ==========================
# Configuration
# ==========================
ENV: str = str(getattr(_settings, "env", os.getenv("ENV", "development") or "development")).lower()

SECRET_KEY: str = str(getattr(_settings, "secret_key", os.getenv("SECRET_KEY", "change-me")))
if _is_production(ENV) and (not SECRET_KEY or SECRET_KEY == "change-me"):
    raise RuntimeError("Invalid SECRET_KEY in production (must be set and not default)")

ALGORITHM: str = str(getattr(_settings, "algorithm", os.getenv("ALGORITHM", "HS256") or "HS256"))
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    getattr(_settings, "access_token_expire_minutes", os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
)

# ==========================
# Context pour hashage
# ==========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================
# OAuth2
# ==========================
# NOTE: auto_error=False pour permettre un usage "optionnel" sur routes publiques.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


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
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, str]]:
    """
    Décode un token JWT et retourne le payload si valide, sinon None.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except (ExpiredSignatureError, JWTError):
        return None


# ==========================
# Dépendance FastAPI
# ==========================
def require_authenticated(token: Optional[str] = Depends(oauth2_scheme)) -> str:
    """
    Dépendance à utiliser sur les routes PRIVÉES.
    Exige un token valide, sinon lève 401.
    Retourne le username (sub).
    """
    if not token:
        raise http_error(
            status.HTTP_401_UNAUTHORIZED,
            code="auth_required",
            message="Authentification requise",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise http_error(
            status.HTTP_401_UNAUTHORIZED,
            code="auth_invalid",
            message="Authentification requise (token invalide ou expiré)",
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
