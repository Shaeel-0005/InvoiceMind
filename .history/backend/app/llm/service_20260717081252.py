import json

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.extraction import ExtractionResult

_client = None


def get_client():
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it to backend/.env "
                "(get a key at https://aistudio.google.com/apikey)"
            )
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


PROMPT = """You are an invoice data extraction engine. Read the raw OCR text below \
(it may contain OCR noise, misaligned columns, or line breaks in odd places) and \
extract the invoice fields as structured JSON matching the schema.

Rules:
- If a field is not present in the text, use null for it. Do not guess or invent values.
- Numbers (tax, total, item amounts) must be plain numbers, no currency symbols or commas.
- currency should be a 3-letter code if you can infer it (e.g. USD, PKR), else null.
- For each top-level field (invoice_number, vendor, customer, invoice_date, due_date, tax, total, currency), \
include a confidence score between 0 and 1 in the "confidence" object reflecting how certain you are \
the value was read correctly from the text.

OCR TEXT:
---
{ocr_text}
---
"""


def extract_fields(ocr_text: str) -> dict:
    """Send OCR text to Gemini and get back structured invoice fields."""
    client = get_client()

    response = client.models.generate_content(
        model="model="gemini-flash-latest",",
        contents=PROMPT.format(ocr_text=ocr_text),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractionResult,
        ),
    )

    return json.loads(response.text)
