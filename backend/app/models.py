
from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(100))
    description = Column(Text)
    image_url = Column(String(200))
    source_url = Column(String(200))

class Dictionnaire(Base):
    __tablename__ = "dictionnaire"
    id = Column(Integer, primary_key=True, index=True)
    mots_francais = Column(String(200))
    synonymes_francais = Column(String(200))
    mots_provencal = Column(String(200))
    eg_provencal = Column(String(200))
    d_provencal = Column(String(200))
    a_provencal = Column(String(200))
    h_provencal = Column(String(200))
    av_provencal = Column(String(200))
    p_provencal = Column(String(200))
    x_provencal = Column(String(200))
    theme = Column(String(100))
    categorie = Column(String(100))
    description = Column(Text)

class Histoire(Base):
    __tablename__ = "histoires"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(100))
    typologie = Column(String(30))
    periode = Column(String(30))
    description_courte = Column(String(100))
    description_longue = Column(Text)
    source_url = Column(String(200))
