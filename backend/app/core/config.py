from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Tuple

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str
    allowed_origins: Tuple[str, ...]


def _parse_origins(value: str) -> Tuple[str, ...]:
    # Comma-separated list: "http://localhost:3000,http://127.0.0.1:3000"
    items = [s.strip() for s in (value or "").split(",")]
    return tuple([s for s in items if s])


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set. Add it to your .env.")

    origins = _parse_origins(
        os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        )
    )

    return Settings(database_url=database_url, allowed_origins=origins)
