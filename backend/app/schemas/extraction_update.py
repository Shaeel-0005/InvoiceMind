from pydantic import BaseModel
from typing import List, Optional

from app.schemas.extraction import InvoiceItem


class ExtractionUpdate(BaseModel):
    invoice_number: Optional[str] = None
    vendor: Optional[str] = None
    customer: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[str] = None
    items: List[InvoiceItem] = []
