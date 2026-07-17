import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.extraction import ExtractionResponse
from app.services.extract_fields_service import run_extraction

router = APIRouter(prefix="/extract-fields", tags=["Extract Fields"])


@router.post("/{document_id}", response_model=ExtractionResponse)
def extract_fields_endpoint(document_id: int, db: Session = Depends(get_db)):
    extraction = run_extraction(document_id, db)

    return ExtractionResponse(
        id=extraction.id,
        document_id=extraction.document_id,
        invoice_number=extraction.invoice_number,
        vendor=extraction.vendor,
        customer=extraction.customer,
        invoice_date=extraction.invoice_date,
        due_date=extraction.due_date,
        tax=extraction.tax,
        total=extraction.total,
        currency=extraction.currency,
        items=json.loads(extraction.items or "[]"),
        confidence=json.loads(extraction.confidence or "{}"),
    )
