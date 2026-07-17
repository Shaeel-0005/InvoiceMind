import os
import uuid
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

def save_upload(file: UploadFile, db: Session):
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Unsupported file type")

    os.makedirs(settings.upload_dir, exist_ok=True)

    stored_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.upload_dir, stored_name)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    document = Document(
        original_name=file.filename,
        stored_name=stored_name,
        file_path=file_path,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document