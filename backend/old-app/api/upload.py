from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.document import DocumentResponse
from app.services.upload_service import save_upload

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return save_upload(file, db)