from fastapi import FastAPI

from app.core.config import settings
from app.db.database import Base, engine
from app.api.upload import router as upload_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {
        "message": "InvoiceMind AI API is running 🚀",
        "version": settings.app_version
    }