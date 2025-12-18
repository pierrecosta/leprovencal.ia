
from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class ArticleBase(BaseModel):
    titre: str
    description: str
    image_url: Optional[str]
    source_url: Optional[str]

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    class Config:
        from_attributes = True

class DictionnaireBase(BaseModel):
    mots_francais: str
    synonymes_francais: Optional[str]
    mots_provencal: Optional[str]
    theme: Optional[str]
    categorie: Optional[str]
    description: Optional[str]

class DictionnaireOut(DictionnaireBase):
    id: int
    class Config:
        from_attributes = True

class HistoireBase(BaseModel):
    titre: str
    typologie: str
    periode: str
    description_courte: str
    description_longue: str
    source_url: Optional[str]

class HistoireOut(HistoireBase):
    id: int
    class Config:
        from_attributes = True
