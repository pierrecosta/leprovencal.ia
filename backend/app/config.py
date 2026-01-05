"""
Central configuration for the backend.

- Loads .env once
- Provides typed settings via `settings`
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


@dataclass(frozen=True)
class Settings:
    env: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int


ENV = (_env("ENV", "development") or "development").lower()

_secret = _env("SECRET_KEY")
if not _secret:
    if ENV in {"prod", "production"}:
        raise RuntimeError("SECRET_KEY must be set in production")
    _secret = "change-me"

settings = Settings(
    env=ENV,
    secret_key=_secret,
    algorithm=_env("ALGORITHM", "HS256") or "HS256",
    access_token_expire_minutes=_env_int("ACCESS_TOKEN_EXPIRE_MINUTES", 30),
)
