
"""
Module: pagination.py
Description: Utilitaires pour la pagination des résultats SQLAlchemy.
"""

from typing import Any, List
from sqlalchemy.orm import Query


def paginate(query: Query, skip: int = 0, limit: int = 10) -> List[Any]:
    """
    Applique une pagination à une requête SQLAlchemy.

    :param query: Requête SQLAlchemy (ex: db.query(Model))
    :param skip: Nombre d'éléments à ignorer (offset)
    :param limit: Nombre maximum d'éléments à retourner
    :return: Liste des résultats paginés
    """
    return query.offset(skip).limit(limit).all()

def paginate_with_meta(query: Query, skip: int = 0, limit: int = 10) -> dict:
    """
    Retourne les résultats paginés avec des métadonnées.
    """
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }
