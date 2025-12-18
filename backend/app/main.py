
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, articles, dictionnaire, histoires
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Provençale", version="2.0")

# Origines autorisées
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",  # utile si tu lances avec 127.0.0.1
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,          # True si tu utilises cookies ou Authorization/Bearer
    allow_methods=["*"],             # ou liste précise ["GET","POST","PUT","DELETE","OPTIONS"]
    allow_headers=["*"],             # ou ["Content-Type","Authorization","X-Requested-With"]
    expose_headers=["*"],            # si tu veux lire certains headers côté front
)

# Monte tes routers (ne pas ajouter CORS dans les routers)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(articles.router, prefix="/articles", tags=["Articles"])
app.include_router(dictionnaire.router, prefix="/dictionnaire", tags=["Dictionnaire"])
app.include_router(histoires.router, prefix="/histoires", tags=["Histoires"])