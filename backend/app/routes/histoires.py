
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Histoire
from app.schemas import HistoireBase, HistoireOut
from app.utils.security import get_current_user_optional, require_authenticated  # Vérifie le token JWT

router = APIRouter()

# ✅ Lire les histoires avec pagination
@router.get("/", response_model=List[HistoireOut])
def get_histoires(page: int = 1, limit: int = 5, db: Session = Depends(get_db)):
    offset = (page - 1) * limit
    histoires = db.query(Histoire).offset(offset).limit(limit).all()
    return histoires

# ✅ Recherche par titre
@router.get("/find", response_model=HistoireOut)
def find_histoire(titre: str, db: Session = Depends(get_db)):
    histoire = db.query(Histoire).filter(Histoire.titre == titre).first()
    if not histoire:
        raise HTTPException(status_code=404, detail="Histoire non trouvée")
    return histoire

# ✅ Créer une histoire (auth requis)
@router.post("/", response_model=HistoireOut, status_code=status.HTTP_201_CREATED)
def create_histoire(histoire: HistoireBase, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    new_histoire = Histoire(**histoire.dict())
    db.add(new_histoire)
    db.commit()
    db.refresh(new_histoire)
    return new_histoire

# ✅ Mettre à jour une histoire (auth requis)
@router.put("/{histoire_id}", response_model=HistoireOut)
def update_histoire(histoire_id: int, histoire: HistoireBase, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    existing_histoire = db.query(Histoire).filter(Histoire.id == histoire_id).first()
    if not existing_histoire:
        raise HTTPException(status_code=404, detail="Histoire non trouvée")
    for key, value in histoire.dict().items():
        setattr(existing_histoire, key, value)
    db.commit()
    db.refresh(existing_histoire)
    return existing_histoire

# ✅ Supprimer une histoire (auth requis)
@router.delete("/{histoire_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_histoire(histoire_id: int, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    histoire = db.query(Histoire).filter(Histoire.id == histoire_id).first()
    if not histoire:
        raise HTTPException(status_code=404, detail="Histoire non trouvée")
    db.delete(histoire)
    db.commit()
    return None
