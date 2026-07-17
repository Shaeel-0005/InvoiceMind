from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.extraction import ExtractionResponse
from app.services.extract_fields_service import run_extraction
from app.services.extraction_service import to_response

router = APIRouter(prefix="/extract-fields", tags=["Extract Fields"])


@router.post("/{document_id}", response_model=ExtractionResponse)
def extract_fields_endpoint(document_id: int, db: Session = Depends(get_db)):
    extraction = run_extraction(document_id, db)
    return to_response(extraction)
