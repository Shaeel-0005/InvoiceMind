from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "InvoiceMind AI"
    app_version: str = "1.0.0"
    database_url: str = "sqlite:///invoice.db"
    upload_dir: str = "app/uploads"

    class Config:
        env_file = ".env"

settings = Settings()