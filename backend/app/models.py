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
    titre = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(200), nullable=True)
    source_url = Column(String(200), nullable=True)

class Dictionnaire(Base):
    __tablename__ = "dictionnaire"
    id = Column(Integer, primary_key=True, index=True)
    mots_francais = Column(String(200), nullable=False)
    synonymes_francais = Column(String(200), nullable=True)
    mots_provencal = Column(String(200), nullable=True)
    eg_provencal = Column(String(200), nullable=True)
    d_provencal = Column(String(200), nullable=True)
    a_provencal = Column(String(200), nullable=True)
    h_provencal = Column(String(200), nullable=True)
    av_provencal = Column(String(200), nullable=True)
    p_provencal = Column(String(200), nullable=True)
    x_provencal = Column(String(200), nullable=True)
    theme = Column(String(100), nullable=True)
    categorie = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

class Histoire(Base):
    __tablename__ = "histoires"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(100), nullable=False)
    typologie = Column(String(30), nullable=False)
    periode = Column(String(30), nullable=False)
    description_courte = Column(String(100), nullable=True)
    description_longue = Column(Text, nullable=True)
    source_url = Column(String(200), nullable=True)
