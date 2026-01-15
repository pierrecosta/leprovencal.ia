from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Tuple
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    env: str
    database_url: str
    allowed_origins: Tuple[str, ...]


def _parse_origins(value: str) -> Tuple[str, ...]:
    # Comma-separated list: "http://localhost:3000,http://127.0.0.1:3000"
    items = [s.strip() for s in (value or "").split(",")]
    return tuple([s for s in items if s])


def _is_production(env: str) -> bool:
    return env.lower() in {"prod", "production"}


def _is_localhost_origin(origin: str) -> bool:
    u = urlparse(origin)
    return (u.scheme in {"http", "https"}) and (u.hostname in {"localhost", "127.0.0.1"})


def _validate_origins(env: str, origins: Tuple[str, ...]) -> None:
    if any(o == "*" for o in origins):
        raise RuntimeError("ALLOWED_ORIGINS must not include '*'")

    if _is_production(env):
        if not origins:
            raise RuntimeError("ALLOWED_ORIGINS must be set in production (comma-separated list)")
        if any(_is_localhost_origin(o) for o in origins):
            raise RuntimeError("ALLOWED_ORIGINS must not include localhost/127.0.0.1 in production")
    else:
        # dev: uniquement localhost
        if any(not _is_localhost_origin(o) for o in origins):
            raise RuntimeError("In development, ALLOWED_ORIGINS must only include localhost/127.0.0.1 origins")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    env = (os.getenv("ENV", "development") or "development").strip().lower()

    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set. Add it to your .env.")

    origins = _parse_origins(
        os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:8000,http://127.0.0.1:8000",
        )
    )
    _validate_origins(env, origins)

    return Settings(env=env, database_url=database_url, allowed_origins=origins)
