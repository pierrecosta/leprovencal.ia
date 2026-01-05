from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# NOTE:
# - DB/internal: snake_case
# - API (frontend): camelCase via alias_generator (populate_by_name=True)
# - Frontend should send/consume camelCase; API layer may normalize defensively.

# --- camelCase aliases for the API (frontend) while keeping snake_case internally (backend/db) ---
# Errors contract (HTTPException.detail): {"code": "...", "message": "...", "field": "optional"}
# Common codes: validation_error, not_found, unauthorized, conflict, auth_required, auth_invalid, rate_limited
def _to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])


class APIModel(BaseModel):
    # API outputs use camelCase aliases; errors use HTTPException.detail as {code,message,field?}.
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        alias_generator=_to_camel,
    )


class UserCreate(APIModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class UserResponse(APIModel):
    id: int
    username: str


# ==========================
# Articles (Create/Update/Out)
# ==========================
class ArticleCreate(APIModel):
    titre: str = Field(min_length=1)
    description: Optional[str] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None


class ArticleUpdate(APIModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None


class ArticleOut(APIModel):
    id: int
    titre: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None


# Back-compat (imports existants)
ArticleResponse = ArticleOut


# ==========================
# Dictionnaire (Create/Update/Out)
# ==========================
class DictionnaireCreate(APIModel):
    mots_francais: str = Field(min_length=1)  # requis (cohérent avec NOT NULL)
    synonymes_francais: Optional[str] = None
    mots_provencal: Optional[str] = None
    eg_provencal: Optional[str] = None
    d_provencal: Optional[str] = None
    a_provencal: Optional[str] = None
    h_provencal: Optional[str] = None
    av_provencal: Optional[str] = None
    p_provencal: Optional[str] = None
    x_provencal: Optional[str] = None
    theme: Optional[str] = None
    categorie: Optional[str] = None
    description: Optional[str] = None


class DictionnaireUpdate(APIModel):
    # PATCH-like: tout optionnel
    mots_francais: Optional[str] = None
    synonymes_francais: Optional[str] = None
    mots_provencal: Optional[str] = None
    eg_provencal: Optional[str] = None
    d_provencal: Optional[str] = None
    a_provencal: Optional[str] = None
    h_provencal: Optional[str] = None
    av_provencal: Optional[str] = None
    p_provencal: Optional[str] = None
    x_provencal: Optional[str] = None
    theme: Optional[str] = None
    categorie: Optional[str] = None
    description: Optional[str] = None


class DictionnaireOut(DictionnaireCreate):
    id: int


# Back-compat (imports existants)
DictionnaireBase = DictionnaireCreate


# ==========================
# Histoires (Create/Update/Out + back-compat)
# ==========================
class HistoireCreate(APIModel):
    titre: str = Field(min_length=1)
    typologie: str = Field(min_length=1)
    periode: str = Field(min_length=1)
    description_courte: Optional[str] = None
    description_longue: Optional[str] = None
    source_url: Optional[str] = None


class HistoireUpdate(APIModel):
    titre: Optional[str] = None
    typologie: Optional[str] = None
    periode: Optional[str] = None
    description_courte: Optional[str] = None
    description_longue: Optional[str] = None
    source_url: Optional[str] = None


class HistoireOut(HistoireCreate):
    id: int


# Back-compat: certains modules importent encore HistoireBase
HistoireBase = HistoireCreate
