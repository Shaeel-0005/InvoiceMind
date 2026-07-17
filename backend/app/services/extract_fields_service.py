import json

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.extraction import Extraction
from app.llm.service import extract_fields
from app.schemas.extraction import ExtractionResult


def run_extraction(document_id: int, db: Session) -> Extraction:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not document.ocr_text:
        raise HTTPException(
            status_code=400,
            detail="No OCR text on this document yet. Run POST /extract/{id} first.",
        )

    try:
        raw = extract_fields(document.ocr_text)
        parsed = ExtractionResult(**raw)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Field extraction failed: {exc}")

    extraction = db.query(Extraction).filter(Extraction.document_id == document_id).first()
    if extraction is None:
        extraction = Extraction(document_id=document_id)
        db.add(extraction)

    extraction.invoice_number = parsed.invoice_number
    extraction.vendor = parsed.vendor
    extraction.customer = parsed.customer
    extraction.invoice_date = parsed.invoice_date
    extraction.due_date = parsed.due_date
    extraction.tax = parsed.tax
    extraction.total = parsed.total
    extraction.currency = parsed.currency
    extraction.items = json.dumps([item.model_dump() for item in parsed.items])
    extraction.confidence = json.dumps(parsed.confidence.model_dump())

    document.status = "extracted"

    db.commit()
    db.refresh(extraction)
    return extraction
