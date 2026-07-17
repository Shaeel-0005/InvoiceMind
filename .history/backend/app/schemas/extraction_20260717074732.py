from pydantic import BaseModel
from typing import List, Optional, Dict


class InvoiceItem(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None


class ExtractionResult(BaseModel):
    """What we ask the LLM to return."""
    invoice_number: Optional[str] = None
    vendor: Optional[str] = None
    customer: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[str] = None
    items: List[InvoiceItem] = []
    confidence: Dict[str, float] = {}


class ExtractionResponse(ExtractionResult):
    """What we return to the frontend (adds DB identifiers)."""
    id: int
    document_id: int
