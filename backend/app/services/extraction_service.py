import json

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.extraction import Extraction
from app.schemas.extraction import ExtractionResponse
from app.schemas.extraction_update import ExtractionUpdate


def to_response(extraction: Extraction) -> ExtractionResponse:
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


def get_extraction(document_id: int, db: Session) -> Extraction:
    extraction = db.query(Extraction).filter(Extraction.document_id == document_id).first()
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction found for this document")
    return extraction


def update_extraction(document_id: int, payload: ExtractionUpdate, db: Session) -> Extraction:
    extraction = get_extraction(document_id, db)

    extraction.invoice_number = payload.invoice_number
    extraction.vendor = payload.vendor
    extraction.customer = payload.customer
    extraction.invoice_date = payload.invoice_date
    extraction.due_date = payload.due_date
    extraction.tax = payload.tax
    extraction.total = payload.total
    extraction.currency = payload.currency
    extraction.items = json.dumps([item.model_dump() for item in payload.items])

    db.commit()
    db.refresh(extraction)
    return extraction
