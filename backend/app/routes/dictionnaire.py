
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
import csv
import io

from app.database import get_db
from app.models import Dictionnaire
from app.schemas import DictionnaireBase, DictionnaireOut
from app.utils.security import get_current_user_optional, require_authenticated  # Vérifie le token JWT

router = APIRouter()

# 🔎 Liste paginée avec filtres + tri (aligné avec Flask)
@router.get("/", response_model=List[DictionnaireOut])
def get_dictionnaire(
    theme: Optional[str] = Query(None),
    categorie: Optional[str] = Query(None),
    lettre: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
    sort: str = Query("mots_francais"),
    order: str = Query("asc"),
    db: Session = Depends(get_db),
):
    # Validation basique du champ de tri
    sortable_fields = {
        "mots_francais": Dictionnaire.mots_francais,
        "theme": Dictionnaire.theme,
        "categorie": Dictionnaire.categorie,
        "mots_provencal": Dictionnaire.mots_provencal,
        "id": Dictionnaire.id,
    }
    sort_col = sortable_fields.get(sort)
    if not sort_col:
        raise HTTPException(status_code=400, detail=f"Champ de tri invalide: {sort}")

    query = db.query(Dictionnaire)

    # Filtres
    if theme and theme.lower() != "tous":
        query = query.filter(Dictionnaire.theme == theme)
    if categorie and categorie.lower() != "toutes":
        query = query.filter(Dictionnaire.categorie == categorie)
    if lettre and lettre.lower() != "toutes":
        query = query.filter(Dictionnaire.mots_francais.startswith(lettre))
    if search:
        query = query.filter(Dictionnaire.mots_francais.ilike(f"%{search}%"))

    # Tri
    query = query.order_by(desc(sort_col) if order.lower() == "desc" else asc(sort_col))

    # Pagination
    total = query.count()
    mots = query.offset((page - 1) * limit).limit(limit).all()

    # ⚠️ Ici, tu renvoies juste la liste (response_model=List[DictionnaireOut])
    # Si tu veux le même format que Flask avec total/page/pages, vois plus bas.
    return mots

# 🧾 Liste des thèmes distincts
@router.get("/themes", response_model=List[str])
def get_themes(db: Session = Depends(get_db)):
    rows = db.query(Dictionnaire.theme).distinct().all()
    # rows = [('Nature',), ('Cuisine',), ...]
    return [t[0] for t in rows if t[0]]


# 🧾 Liste des catégories (toutes ou par thème)
@router.get("/categories", response_model=List[str])
def get_categories(
    theme: Optional[str] = Query("tous"),
    db: Session = Depends(get_db),
):
    q = db.query(Dictionnaire.categorie)
    if theme and theme.lower() != "tous":
        q = q.filter(Dictionnaire.theme == theme)
    rows = q.distinct().all()
    return [c[0] for c in rows if c[0]]

# ✅ Ajouter un mot (auth requis)
@router.post("/", response_model=DictionnaireOut, status_code=status.HTTP_201_CREATED)
def create_mot(mot: DictionnaireBase, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    new_mot = Dictionnaire(**mot.dict())
    db.add(new_mot)
    db.commit()
    db.refresh(new_mot)
    return new_mot

# ✅ Mettre à jour un mot (auth requis)
@router.put("/{mot_id}", response_model=DictionnaireOut)
def update_mot(mot_id: int, mot: DictionnaireBase, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    existing_mot = db.query(Dictionnaire).filter(Dictionnaire.id == mot_id).first()
    if not existing_mot:
        raise HTTPException(status_code=404, detail="Mot non trouvé")
    for key, value in mot.dict().items():
        setattr(existing_mot, key, value)
    db.commit()
    db.refresh(existing_mot)
    return existing_mot

# ✅ Supprimer un mot (auth requis)
@router.delete("/{mot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mot(mot_id: int, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    mot = db.query(Dictionnaire).filter(Dictionnaire.id == mot_id).first()
    if not mot:
        raise HTTPException(status_code=404, detail="Mot non trouvé")
    db.delete(mot)
    db.commit()
    return None

