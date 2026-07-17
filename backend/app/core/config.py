from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "InvoiceMind AI"
    app_version: str = "1.0.0"
    database_url: str = "sqlite:///invoice.db"
    upload_dir: str = "app/uploads"
    gemini_api_key: str = ""
    # Comma-separated list, e.g. "http://localhost:5173,https://your-app.vercel.app"
    allowed_origins: str = "http://localhost:5173"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"

settings = Settings()