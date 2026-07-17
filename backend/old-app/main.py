from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.api.upload import router as upload_router
from app.api.extract import router as extract_router
from app.api.extract_fields import router as extract_fields_router
from app.api.documents import router as documents_router

# Import models so they're registered on Base before create_all runs
from app.models.document import Document  # noqa: F401
from app.models.extraction import Extraction  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(extract_router)
app.include_router(extract_fields_router)
app.include_router(documents_router)

@app.get("/")
def home():
    return {
        "message": "InvoiceMind AI API is running 🚀",
        "version": settings.app_version
    }