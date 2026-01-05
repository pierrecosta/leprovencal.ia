from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routes import auth, articles, dictionnaire, histoires

settings = get_settings()

app = FastAPI(title="API Provençale", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

# Monte tes routers (ne pas ajouter CORS dans les routers)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(articles.router, prefix="/articles", tags=["Articles"])
app.include_router(dictionnaire.router, prefix="/dictionnaire", tags=["Dictionnaire"])
app.include_router(histoires.router, prefix="/histoires", tags=["Histoires"])