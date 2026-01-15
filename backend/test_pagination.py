#!/usr/bin/env python
"""Test script to verify pagination works correctly"""

from app.database import SessionLocal
from app.models import Dictionnaire
from app.crud import dictionnaire as dict_crud

db = SessionLocal()

# Test the list_mots function
result = dict_crud.list_mots(
    db,
    theme=None,
    categorie=None,
    lettre=None,
    search=None,
    page=1,
    limit=5,
    sort_col=Dictionnaire.mots_francais,
    desc_order=False,
)

print(f"Total: {result['total']}")
print(f"Pages: {result['pages']}")
print(f"Page: {result['page']}")
print(f"Limit: {result['limit']}")
print(f"Items count: {len(result['items'])}")
print("\nFirst 3 items:")
for item in result['items'][:3]:
    print(f"  - {item.mots_francais} (ID: {item.id})")

db.close()
