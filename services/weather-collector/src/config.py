"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASS: str = "guest"
    RABBITMQ_QUEUE_NAME: str = "weather_data_queue"

    TARGET_CITY: str = "Caruaru"
    TARGET_LAT: float = -8.2833
    TARGET_LON: float = -35.9761

    OPEN_METEO_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_AIR_QUALITY_URL: str = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
    )

    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True
    SERVICE_NAME: str = "weather-collector"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache for lazy loading and singleton pattern.
    """
    return Settings()


settings = get_settings()
