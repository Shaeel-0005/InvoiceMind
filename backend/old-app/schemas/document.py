from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    original_name: str
    stored_name: str
    status: str
    created_at: datetime
    ocr_text: Optional[str] = None

    class Config:
        from_attributes = True