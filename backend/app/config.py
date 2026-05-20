"""Configuración de la aplicación"""
from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    """Configuración global de la aplicación"""
    # Base de datos
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/cumple_db"

    # JWT
    SECRET_KEY: str = secrets.token_urlsafe(64)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://cumple.app"
    ]

    # APIs Externas
    OPENAI_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Entorno
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
