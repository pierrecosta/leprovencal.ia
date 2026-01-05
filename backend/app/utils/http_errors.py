from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException


def http_error(
    status_code: int,
    *,
    code: str,
    message: str,
    field: Optional[str] = None,
    extra: Optional[dict[str, Any]] = None,
    headers: Optional[dict[str, str]] = None,
) -> HTTPException:
    detail: dict[str, Any] = {"code": code, "message": message}
    if field:
        detail["field"] = field
    if extra:
        detail["extra"] = extra

    return HTTPException(status_code=status_code, detail=detail, headers=headers)
