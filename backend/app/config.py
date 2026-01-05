"""
Central configuration for the backend.

- Loads .env once
- Provides typed settings via `settings`

Note: login rate limiting env vars (LOGIN_* ) are read in app/routes/auth.py.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _env(name: str, default: str | None = None) -> str | None:
    v = os.getenv(name)
    return v if v is not None and v != "" else default


def _env_int(name: str, default: int) -> int:
    v = _env(name)
    try:
        return int(v) if v is not None else default
    except ValueError:
        return default


def _is_production(env: str) -> bool:
    return env.lower() in {"prod", "production"}


@dataclass(frozen=True)
class Settings:
    env: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    log_level: str  # NEW


ENV = (_env("ENV", "development") or "development").lower()

_secret = _env("SECRET_KEY")
if not _secret:
    if _is_production(ENV):
        raise RuntimeError("SECRET_KEY must be set in production")
    _secret = "change-me"

# Fail-fast aussi si quelqu'un a explicitement mis la valeur par défaut en prod
if _is_production(ENV) and _secret == "change-me":
    raise RuntimeError("SECRET_KEY must not be the default value in production")

_requested_log_level = (_env("LOG_LEVEL", "INFO") or "INFO").upper()
# Désactive les comportements “dev” en prod (logs DEBUG)
_effective_log_level = "INFO" if (_is_production(ENV) and _requested_log_level == "DEBUG") else _requested_log_level

settings = Settings(
    env=ENV,
    secret_key=_secret,
    algorithm=_env("ALGORITHM", "HS256") or "HS256",
    access_token_expire_minutes=_env_int("ACCESS_TOKEN_EXPIRE_MINUTES", 30),
    log_level=_effective_log_level,
)
