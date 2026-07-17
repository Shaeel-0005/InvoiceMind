from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.ocr.service import extract_text


def run_ocr(document_id: int, db: Session) -> Document:
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        text = extract_text(document.file_path)
    except Exception as exc:
        document.status = "ocr_failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"OCR failed: {exc}")

    document.ocr_text = text
    document.status = "ocr_done"
    db.commit()
    db.refresh(document)

    return document
