from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from openpyxl import Workbook

from app.db.database import get_db
from app.models.document import Document
from app.models.extraction import Extraction
from app.services.extraction_service import to_response

router = APIRouter(prefix="/export", tags=["Export"])


def _get_document_and_extraction(document_id: int, db: Session):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    extraction = db.query(Extraction).filter(Extraction.document_id == document_id).first()
    return document, extraction


@router.get("/json/{document_id}")
def export_json(document_id: int, db: Session = Depends(get_db)):
    document, extraction = _get_document_and_extraction(document_id, db)

    payload = {
        "document": {
            "id": document.id,
            "original_name": document.original_name,
            "status": document.status,
            "created_at": document.created_at,
        },
        "extraction": to_response(extraction).model_dump() if extraction else None,
    }

    content = jsonable_encoder(payload)
    return JSONResponse(
        content=content,
        headers={"Content-Disposition": f'attachment; filename="invoice_{document_id}.json"'},
    )


@router.get("/excel/{document_id}")
def export_excel(document_id: int, db: Session = Depends(get_db)):
    document, extraction = _get_document_and_extraction(document_id, db)

    wb = Workbook()

    summary = wb.active
    summary.title = "Invoice"
    summary.append(["Field", "Value"])

    if extraction:
        data = to_response(extraction)
        rows = [
            ("File Name", document.original_name),
            ("Invoice Number", data.invoice_number),
            ("Vendor", data.vendor),
            ("Customer", data.customer),
            ("Invoice Date", data.invoice_date),
            ("Due Date", data.due_date),
            ("Tax", data.tax),
            ("Total", data.total),
            ("Currency", data.currency),
        ]
        for row in rows:
            summary.append(row)

        items_sheet = wb.create_sheet("Line Items")
        items_sheet.append(["Description", "Quantity", "Unit Price", "Amount"])
        for item in data.items:
            items_sheet.append([item.description, item.quantity, item.unit_price, item.amount])
    else:
        summary.append(["File Name", document.original_name])
        summary.append(["Note", "No AI extraction has been run for this document yet."])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="invoice_{document_id}.xlsx"'},
    )
