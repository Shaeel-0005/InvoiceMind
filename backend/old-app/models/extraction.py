from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime

from app.db.database import Base


class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)

    invoice_number = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    customer = Column(String, nullable=True)
    invoice_date = Column(String, nullable=True)
    due_date = Column(String, nullable=True)
    tax = Column(Float, nullable=True)
    total = Column(Float, nullable=True)
    currency = Column(String, nullable=True)

    # JSON-encoded list of {description, quantity, unit_price, amount}
    items = Column(Text, nullable=True, default="[]")

    # JSON-encoded dict of {field_name: confidence_0_to_1}
    confidence = Column(Text, nullable=True, default="{}")

    created_at = Column(DateTime, default=datetime.utcnow)
