from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException

# Stable error contract:
# detail = {"code": "...", "message": "...", "field"?: "..."} (ex: code="rate_limited")
def http_error(
    status_code: int,
    *,
    code: str,
    message: str,
    field: Optional[str] = None,
    extra: Optional[dict[str, Any]] = None,
    headers: Optional[dict[str, str]] = None,
) -> HTTPException:
    # Contrat stable exploitable côté front: {code,message,field?}
    detail: dict[str, Any] = {"code": code, "message": message}
    if field:
        detail["field"] = str(field)

    return HTTPException(status_code=status_code, detail=detail, headers=headers)
