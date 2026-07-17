from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    original_name = Column(String, nullable=False)
    stored_name = Column(String, nullable=False, unique=True)
    file_path = Column(String, nullable=False)
    status = Column(String, default="uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)
    ocr_text = Column(Text, nullable=True, default="")