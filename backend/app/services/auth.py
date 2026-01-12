from __future__ import annotations

from datetime import timedelta
from sqlalchemy.orm import Session

# NOTE: rate limiting (brute-force protection) is enforced at the route layer (/auth/login).

from app.crud import users as users_crud
from app.schemas import UserCreate
from app.services.errors import ConflictError, UnauthorizedError, ValidationError
from app.utils.security import create_access_token, hash_password, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES


def register_user_service(db: Session, *, user_in: UserCreate):
    username = (user_in.username or "").strip()
    password = user_in.password or ""
    if not username:
        raise ValidationError("Nom d'utilisateur requis")
    if not password:
        raise ValidationError("Mot de passe requis")

    if users_crud.get_user_by_username(db, username=username):
        raise ConflictError("Nom d'utilisateur déjà pris")

    hashed = hash_password(password)
    obj = users_crud.create_user(db, username=username, hashed_password=hashed)
    db.commit()
    db.refresh(obj)
    return obj


def login_service(db: Session, *, username: str, password: str) -> dict:
    user = users_crud.get_user_by_username(db, username=username)
    if not user or not verify_password(password, user.password):
        raise UnauthorizedError("Identifiants invalides")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer"}
