from fastapi import FastAPI

app = FastAPI(
    title="InvoiceMind AI",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "InvoiceMind AI API is running 🚀"
    }