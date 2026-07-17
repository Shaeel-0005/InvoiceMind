from pydantic import BaseModel
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    original_name: str
    stored_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True