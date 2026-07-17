from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.extraction import ExtractionResponse
from app.schemas.extraction_update import ExtractionUpdate
from app.services.extraction_service import get_extraction, update_extraction, to_response

router = APIRouter(prefix="/extraction", tags=["Extraction"])


@router.get("/{document_id}", response_model=ExtractionResponse)
def get_extraction_endpoint(document_id: int, db: Session = Depends(get_db)):
    extraction = get_extraction(document_id, db)
    return to_response(extraction)


@router.put("/{document_id}", response_model=ExtractionResponse)
def update_extraction_endpoint(document_id: int, payload: ExtractionUpdate, db: Session = Depends(get_db)):
    extraction = update_extraction(document_id, payload, db)
    return to_response(extraction)
