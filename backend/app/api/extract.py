from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.document import DocumentResponse
from app.services.extract_service import run_ocr

router = APIRouter(prefix="/extract", tags=["Extract"])


@router.post("/{document_id}", response_model=DocumentResponse)
def extract_document(document_id: int, db: Session = Depends(get_db)):
    return run_ocr(document_id, db)
