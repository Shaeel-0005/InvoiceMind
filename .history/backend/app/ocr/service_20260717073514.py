"""
OCR service using PaddleOCR's v3 pipeline API.

Key point vs. the old tutorials: `PaddleOCR().predict(input=...)` accepts a
file path directly -- an image path OR a PDF path. It handles multi-page
PDFs internally and returns one result per page. You do NOT need to open
the file with PIL or convert to numpy yourself; passing a PIL.Image object
is what caused the "Not supported input data type" error before.
"""

from paddleocr import PaddleOCR

_ocr_engine: PaddleOCR | None = None


def get_ocr_engine() -> PaddleOCR:
    """Lazily create a single shared PaddleOCR instance.

    Loading the models is expensive (multiple seconds), so we do it once
    per process, not once per request.
    """
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    enable_mkldnn=False,
        )
    return _ocr_engine


def extract_text(file_path: str) -> str:
    """Run OCR on an image or PDF file and return the extracted text.

    For a multi-page PDF, `predict` returns one result object per page;
    we join them with a blank line between pages.
    """
    ocr = get_ocr_engine()
    results = ocr.predict(input=file_path)

    pages = []
    for page_result in results:
        rec_texts = page_result.get("rec_texts", [])
        pages.append("\n".join(rec_texts))

    return "\n\n".join(pages).strip()
