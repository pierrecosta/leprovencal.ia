"""
Module: auth.py
Description: Routes d'authentification (login, register) avec JWT et bcrypt.
Stack: FastAPI + SQLAlchemy + Passlib + PyJWT
"""

from fastapi import APIRouter, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
import time

from app.database import get_db
from app.schemas import UserCreate, UserResponse
from app.utils.security import require_authenticated
from app.services import auth as auth_service
from app.services.errors import ConflictError, UnauthorizedError, ValidationError
from app.utils.http_errors import http_error

router = APIRouter()

# --- Login rate limiting (in-memory, per-process) ---
# Env knobs (optional)
_LOGIN_WINDOW_SECONDS = int(os.getenv("LOGIN_WINDOW_SECONDS", "300"))  # rolling window for failures
_LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "5"))        # lockout threshold
_LOGIN_LOCKOUT_SECONDS = int(os.getenv("LOGIN_LOCKOUT_SECONDS", "900"))  # lockout duration after max attempts
_LOGIN_BASE_DELAY_SECONDS = float(os.getenv("LOGIN_BASE_DELAY_SECONDS", "1"))  # progressive backoff base
_LOGIN_MAX_DELAY_SECONDS = float(os.getenv("LOGIN_MAX_DELAY_SECONDS", "30"))   # cap for backoff delay

# state: key -> {"fail_count": int, "first_fail": float, "blocked_until": float, "last": float}
_LOGIN_STATE: dict[tuple[str, str], dict[str, float]] = {}

def _now() -> float:
    return time.time()

def _cleanup_login_state(now: float) -> None:
    # drop entries that are stale (avoid unbounded growth)
    ttl = _LOGIN_WINDOW_SECONDS + _LOGIN_LOCKOUT_SECONDS + 60
    for k in list(_LOGIN_STATE.keys()):
        if now - float(_LOGIN_STATE[k].get("last", now)) > ttl:
            _LOGIN_STATE.pop(k, None)

# If running behind a trusted reverse proxy, enable this to honor forwarded headers.
_TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "0").lower() in ("1", "true", "yes")

def _client_ip(request: Request) -> str:
    """
    Prefer socket IP. If TRUST_PROXY_HEADERS=1, use X-Forwarded-For (first hop).
    """
    if _TRUST_PROXY_HEADERS:
        xff = request.headers.get("x-forwarded-for")
        if xff:
            ip = xff.split(",")[0].strip()
            if ip:
                return ip
    return (request.client.host if request.client else "unknown") or "unknown"

def _key_ip(ip: str) -> tuple[str, str]:
    return ("ip", ip)

def _key_user(username: str) -> tuple[str, str]:
    return ("user", username.lower().strip() or "unknown")

def _blocked_seconds(key: tuple[str, str], now: float) -> int:
    st = _LOGIN_STATE.get(key)
    if not st:
        return 0
    blocked_until = float(st.get("blocked_until", 0.0))
    if blocked_until <= now:
        return 0
    return int(blocked_until - now) + 1

def _ensure_not_rate_limited(*, ip: str, username: str) -> None:
    now = _now()
    _cleanup_login_state(now)

    wait_ip = _blocked_seconds(_key_ip(ip), now)
    wait_user = _blocked_seconds(_key_user(username), now)
    wait = max(wait_ip, wait_user)
    if wait > 0:
        raise http_error(
            status.HTTP_429_TOO_MANY_REQUESTS,
            code="rate_limited",
            message=f"Trop de tentatives. Réessayez dans {wait}s.",
            headers={"Retry-After": str(wait)},
        )

def _register_login_failure(*, ip: str, username: str) -> None:
    now = _now()
    _cleanup_login_state(now)

    for key in (_key_ip(ip), _key_user(username)):
        st = _LOGIN_STATE.get(key) or {"fail_count": 0.0, "first_fail": now, "blocked_until": 0.0, "last": now}

        # reset window if too old
        first_fail = float(st.get("first_fail", now))
        if now - first_fail > _LOGIN_WINDOW_SECONDS:
            st = {"fail_count": 0.0, "first_fail": now, "blocked_until": 0.0, "last": now}

        fail_count = int(st.get("fail_count", 0.0)) + 1
        st["fail_count"] = float(fail_count)
        st["last"] = now

        # progressive delay
        delay = min(_LOGIN_MAX_DELAY_SECONDS, _LOGIN_BASE_DELAY_SECONDS * (2 ** max(0, fail_count - 1)))
        st["blocked_until"] = max(float(st.get("blocked_until", 0.0)), now + delay)

        # hard lockout after threshold
        if fail_count >= _LOGIN_MAX_ATTEMPTS:
            st["blocked_until"] = max(float(st.get("blocked_until", 0.0)), now + _LOGIN_LOCKOUT_SECONDS)

        _LOGIN_STATE[key] = st

def _clear_login_state(*, ip: str, username: str) -> None:
    _LOGIN_STATE.pop(_key_ip(ip), None)
    _LOGIN_STATE.pop(_key_user(username), None)

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
        raise http_error(status.HTTP_409_CONFLICT, code="conflict", message=str(e), field="username")
    except ValidationError as e:
        raise http_error(status.HTTP_422_UNPROCESSABLE_ENTITY, code="validation_error", message=str(e))


# ==========================
# LOGIN
# ==========================
@router.post("/login")
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authentifie un utilisateur et retourne un token JWT.
    Rate limit: par IP + par username, avec backoff/lockout (429 + Retry-After).
    """
    ip = _client_ip(request)
    username = form_data.username or ""

    _ensure_not_rate_limited(ip=ip, username=username)

    try:
        result = auth_service.login_service(db, username=username, password=form_data.password)
        _clear_login_state(ip=ip, username=username)

        # If the service returned an access_token, set it as a HttpOnly cookie
        token = result.get("access_token") if isinstance(result, dict) else None
        if token:
            # cookie attributes: HttpOnly, SameSite=Lax, path=/; secure in production
            secure = os.getenv("ENV", "development").lower() not in ("development", "dev", "local")
            response.set_cookie(
                key="access_token",
                value=token,
                httponly=True,
                secure=secure,
                samesite="lax",
                path="/",
            )
            # Also return JSON payload (keep existing behavior)
            return {**result}

        return result
    except UnauthorizedError as e:
        _register_login_failure(ip=ip, username=username)
        raise http_error(
            status.HTTP_401_UNAUTHORIZED,
            code="unauthorized",
            message=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


# ==========================
# ROUTE PROTÉGÉE
# ==========================
@router.get("/me")
def get_me(current_user: str = Depends(require_authenticated)):
    """
    Retourne l'utilisateur courant (extrait du token).
    """
    return {"username": current_user}


# Optional logout endpoint to clear cookie-based auth
@router.post("/logout")
def logout(response: Response):
    """Efface le cookie `access_token` si présent."""
    response.delete_cookie("access_token", path="/")
    return {"status": "ok"}
