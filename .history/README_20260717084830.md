# InvoiceMind AI

AI-powered invoice extraction using OCR + LLMs. Upload a PDF or image invoice, get back clean, structured, editable data — no manual data entry.

![status](https://img.shields.io/badge/status-MVP-brightgreen)

![alt text](image.png)
<!-- Replace with an actual screen recording (upload -> OCR -> AI extract -> edit -> export) -->

## What it does

1. **Upload** an invoice (PDF, JPG, or PNG)
2. **OCR** extracts raw text from the document (PaddleOCR)
3. **AI extraction** turns that raw text into structured fields — invoice number, vendor, customer, dates, tax, total, currency, and line items — each with a confidence score (Google Gemini, structured JSON output)
4. **Review & edit** the extracted data in a table before it's final
5. **Export** as JSON or Excel
6. **History** — every upload is saved and revisitable

## Why this exists

Manually re-typing invoice data is slow and error-prone. This automates the pipeline from "raw document" to "structured, trustworthy data" while keeping a human in the loop to catch what the AI gets wrong (that's what the confidence scores and editable table are for).

## Architecture

```
┌─────────────┐      upload       ┌──────────────┐
│   React     │ ────────────────► │   FastAPI    │
│  (Vite +    │                   │   Backend    │
│  shadcn/ui) │ ◄──────────────── │              │
└─────────────┘    JSON / files   └──────┬───────┘
                                          │
                          ┌───────────────┼────────────────┐
                          ▼               ▼                ▼
                    ┌──────────┐   ┌─────────────┐  ┌─────────────┐
                    │PaddleOCR │   │Google Gemini│  │   SQLite    │
                    │  (OCR)   │   │(structured  │  │ (documents +│
                    │          │   │ extraction) │  │ extractions)│
                    └──────────┘   └─────────────┘  └─────────────┘
```

**Flow per document:**
```
upload → save file + row (status: uploaded)
       → OCR pass → ocr_text saved (status: ocr_done)
       → LLM pass → structured fields saved (status: extracted)
       → user edits → PUT saves changes
       → export → JSON / Excel generated on demand
```

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4 + shadcn/ui (dark UI by default)
- react-dropzone for uploads
- axios for API calls

**Backend**
- FastAPI + SQLAlchemy
- SQLite (swap `DATABASE_URL` for Postgres in production if needed)
- PaddleOCR (v3 pipeline API) for text extraction — handles images and multi-page PDFs natively
- Google Gemini (`google-genai` SDK) for structured field extraction with per-field confidence scoring
- openpyxl for Excel export

## Project Structure

```
InvoiceMind/
├── backend/
│   ├── app/
│   │   ├── api/          # route handlers (upload, extract, extraction, export, documents)
│   │   ├── core/          # settings/config
│   │   ├── db/            # SQLAlchemy engine/session
│   │   ├── llm/            # Gemini structured extraction
│   │   ├── models/        # Document, Extraction ORM models
│   │   ├── ocr/            # PaddleOCR service
│   │   ├── schemas/       # Pydantic request/response models
│   │   └── services/      # business logic
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/    # UploadCard, FieldsTable, History, ui/
    │   └── lib/            # api client
    └── package.json
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload/` | Upload a PDF/JPG/PNG, creates a document record |
| POST | `/extract/{document_id}` | Run OCR on an uploaded document |
| POST | `/extract-fields/{document_id}` | Run AI structured extraction on OCR text |
| GET | `/extraction/{document_id}` | Fetch structured extraction for a document |
| PUT | `/extraction/{document_id}` | Save user edits to extracted fields |
| GET | `/history` | List all uploaded documents |
| GET | `/document/{document_id}` | Fetch a single document |
| GET | `/export/json/{document_id}` | Download document + extraction as JSON |
| GET | `/export/excel/{document_id}` | Download document + extraction as Excel |

Full interactive docs at `/docs` (Swagger UI) once the backend is running.

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # macOS/Linux

pip install -r requirements.txt --break-system-packages

cp .env.example .env
# edit .env and add your GEMINI_API_KEY (https://aistudio.google.com/apikey)

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000` (docs at `/docs`).

> **Note (Windows/CPU users):** if OCR throws a `ConvertPirAttribute2RuntimeAttribute` error, this is a known PaddlePaddle 3.3.x bug with MKL-DNN on CPU — already worked around in `app/ocr/service.py` via `enable_mkldnn=False`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Deployment

**Frontend → Vercel**
1. Push this repo to GitHub
2. Import the repo in Vercel, set the project root to `frontend/`
3. Add environment variable `VITE_API_URL` = your EC2 backend URL (e.g. `https://api.yourdomain.com`)
4. Deploy

**Backend → EC2**
1. Launch an EC2 instance (Ubuntu recommended), open inbound port 8000 (or put it behind Nginx on 80/443)
2. Clone the repo, `cd backend`
3. `python3 -m venv .venv && source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. Create `.env` with `GEMINI_API_KEY` and `ALLOWED_ORIGINS=https://your-app.vercel.app`
6. Run with a process manager, not raw `uvicorn --reload`:
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
   ```
   (or set it up as a `systemd` service so it survives reboots)
7. Point a domain + SSL (Nginx + Certbot, or an ALB) at it if you want HTTPS — Vercel will otherwise mixed-content-block a plain `http://` API from an `https://` frontend

**Data note:** SQLite is fine for a portfolio demo but is a single file on local disk — it will NOT survive EC2 instance replacement/termination. For anything beyond a demo, point `DATABASE_URL` at a managed Postgres (RDS free tier works).

## Known Limitations

- OCR accuracy drops on rotated, low-resolution, or heavily handwritten invoices
- Very long invoices (many line items) haven't been stress-tested
- SQLite + local file storage isn't suitable for multi-instance/production deployment as-is
- No auth — anyone with the URL can upload/view/export (fine for a portfolio demo, not for real invoice data)

## Roadmap

- [ ] User authentication
- [ ] PostgreSQL for production
- [ ] S3 (or equivalent) for file storage instead of local disk
- [ ] Batch upload
- [ ] PDF export option

## Challenges Solved

- **PaddleOCR v3 API migration** — older tutorials pass PIL images directly; the current pipeline API takes file paths (images or PDFs) natively and returns per-page results
- **MKL-DNN CPU inference crash** (`ConvertPirAttribute2RuntimeAttribute`) — known PaddlePaddle 3.3.x regression on CPU, worked around by disabling MKL-DNN
- **Gemini free-tier schema constraints** — the Developer API rejects `additionalProperties` (free-form dicts) in structured output schemas; confidence scores were restructured from a dynamic dict to a fixed Pydantic model
- **Deprecated model versions** — Gemini retires model IDs over time; using the `gemini-flash-latest` alias avoids hardcoding a version that gets sunset

## License

MIT (or update to whatever you prefer)