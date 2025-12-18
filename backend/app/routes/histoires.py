
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, TypedDict, Optional

from app.database import get_db
from app.models import Histoire
from app.schemas import HistoireBase, HistoireOut
from app.utils.security import get_current_user_optional, require_authenticated  # Vérifie le token JWT

router = APIRouter()

# --- TypedDict pour typer précisément les items du menu ---
class MenuItem(TypedDict):
    id: int
    titre: str
    description_courte: str

# Lire les histoires avec pagination
@router.get("/", response_model=List[HistoireOut])
def get_histoires(page: int = 1, limit: int = 5, db: Session = Depends(get_db)):
    offset = (page - 1) * limit
    histoires = db.query(Histoire).offset(offset).limit(limit).all()
    return histoires

# Sommaire groupé
@router.get("/menu")
def get_menu_histoires(db: Session = Depends(get_db)) -> Dict[str, Dict[str, List[MenuItem]]]:
    """
    Renvoie une structure de sommaire groupée par typologie, puis par periode.
    Chaque entrée contient: id, titre, description_courte.
    {
      "Légende": {
        "Antiquité": [{"id": 1, "titre": "...", "description_courte": "..."}, ...],
        "Moyen Âge": [...]
      },
      "Histoire": {
        "XXe siècle": [...]
      }
    }
    """
    histoires = db.query(Histoire).all()
    grouped: Dict[str, Dict[str, List[MenuItem]]] = {}

    for h in histoires:
        typologie = getattr(h, "typologie", "Autre") or "Autre"
        periode = getattr(h, "periode", "Non défini") or "Non défini"
        titre = getattr(h, "titre", "") or ""
        desc = getattr(h, "description_courte", "") or ""

        grouped.setdefault(typologie, {})
        grouped[typologie].setdefault(periode, [])
        grouped[typologie][periode].append(MenuItem(
            id=h.id,
            titre=titre,
            description_courte=desc,
        ))

    # Optionnel: trier par typologie/period/titre pour un sommaire stable
    for t in grouped:
        for p in grouped[t]:
            grouped[t][p] = sorted(grouped[t][p], key=lambda x: x["titre"])
    return grouped

# Recherche par titre
@router.get("/find", response_model=HistoireOut)
def find_histoire(titre: str, db: Session = Depends(get_db)):
    histoire = db.query(Histoire).filter(Histoire.titre == titre).first()
    if not histoire:
        raise HTTPException(status_code=404, detail="Histoire non trouvée")
    return histoire

# Recherche par id
@router.get("/{histoire_id}", response_model=HistoireOut)
def get_histoire_by_id(histoire_id: int, db: Session = Depends(get_db)):
    histoire = db.query(Histoire).filter(Histoire.id == histoire_id).first()
    if not histoire:
        raise HTTPException(status_code=404, detail="Histoire non trouvée")
    return histoire

# Créer une histoire (auth requis)
@router.post("/", response_model=HistoireOut, status_code=status.HTTP_201_CREATED)
def create_histoire(histoire: HistoireBase, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    new_histoire = Histoire(**histoire.dict())
    db.add(new_histoire)
    db.commit()
    db.refresh(new_histoire)
    return new_histoire

# Mettre à jour une histoire (auth requis)
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

# Supprimer une histoire (auth requis)
@router.delete("/{histoire_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_histoire(histoire_id: int, db: Session = Depends(get_db), user: str = Depends(require_authenticated)):
    histoire = db.query(Histoire).filter(Histoire.id == histoire_id).first()
    if not histoire:
        raise HTTPException(status_code=404, detail="Histoire non trouvée")
    db.delete(histoire)
    db.commit()
    return None
