"""
Module: security.py
Description: Gestion de la sécurité (hashage des mots de passe, génération et validation des tokens JWT)
Stack: FastAPI + Passlib + PyJWT (via jose)
"""

from datetime import datetime, timedelta
from typing import Optional, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# --- central config ---
try:
    # preferred: backend/core/config.py
    from core.config import settings as _settings  # type: ignore
except Exception:  # pragma: no cover
    # fallback (if your project exposes settings elsewhere)
    from app.config import settings as _settings  # type: ignore


def _setting(name: str, default):
    return getattr(_settings, name, default)


# ==========================
# Configuration
# ==========================
SECRET_KEY: str = _setting("SECRET_KEY", _setting("secret_key", "change-me"))
ALGORITHM: str = _setting("ALGORITHM", _setting("algorithm", "HS256"))
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    _setting(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        _setting("access_token_expire_minutes", 30),
    )
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
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise",
            headers={"WWW-Authenticate": "Bearer"},
        )

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
