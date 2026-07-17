from pydantic import BaseModel
from typing import List, Optional


class InvoiceItem(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None


class ConfidenceScores(BaseModel):
    invoice_number: Optional[float] = None
    vendor: Optional[float] = None
    customer: Optional[float] = None
    invoice_date: Optional[float] = None
    due_date: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[float] = None


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
    confidence: ConfidenceScores = ConfidenceScores()


class ExtractionResponse(BaseModel):
    """What we return to the frontend (adds DB identifiers, confidence as plain dict)."""
    id: int
    document_id: int
    invoice_number: Optional[str] = None
    vendor: Optional[str] = None
    customer: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[str] = None
    items: List[InvoiceItem] = []
    confidence: dict = {}
