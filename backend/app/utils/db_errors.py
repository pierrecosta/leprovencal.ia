from __future__ import annotations

from typing import Optional, Tuple

from sqlalchemy.exc import DataError, IntegrityError, StatementError


def format_db_exception(exc: Exception) -> Tuple[str, Optional[str], str]:
    """Return a user-friendly message, optional field name, and the original error class name.

    - Tries to detect common psycopg2 errors (StringDataRightTruncation, UniqueViolation).
    - Returns (message, field, error_type)
    """
    orig = getattr(exc, "orig", None)
    err_cls = orig.__class__.__name__ if orig is not None else exc.__class__.__name__

    # String too long (psycopg2.errors.StringDataRightTruncation)
    if "StringDataRightTruncation" in err_cls or "value too long" in str(exc).lower():
        # try to extract column name from diagnostic if available
        col = None
        diag = getattr(orig, "diag", None)
        if diag is not None:
            col = getattr(diag, "column_name", None)
        if col:
            return ("Valeur trop longue pour le champ.", col, err_cls)
        return ("Valeur trop longue pour un champ.", None, err_cls)

    # Unique constraint violation (duplicate key)
    if "UniqueViolation" in err_cls or "unique" in str(exc).lower():
        col = None
        diag = getattr(orig, "diag", None)
        if diag is not None:
            col = getattr(diag, "constraint_name", None)
        return ("Valeur déjà utilisée.", col, err_cls)

    # Fallback for other DB errors
    if isinstance(exc, (DataError, IntegrityError, StatementError)):
        return ("Erreur lors de l'enregistrement en base de données.", None, err_cls)

    # Generic
    return ("Erreur base de données.", None, err_cls)
