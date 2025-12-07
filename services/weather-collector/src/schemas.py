from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, field_validator


class WeatherData(BaseModel):
    """Modelo completo de dados meteorológicos e qualidade do ar."""

    location: str
    collected_at: str

    temperature: float
    humidity: float
    apparent_temperature: Optional[float] = None
    weather_code: int
    surface_pressure: Optional[float] = None
    visibility: Optional[float] = None
    condition: str

    us_aqi: Optional[int] = None
    uv_index: Optional[float] = None
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    carbon_monoxide: Optional[float] = None
    nitrogen_dioxide: Optional[float] = None
    sulphur_dioxide: Optional[float] = None
    ozone: Optional[float] = None

    temperature_max: Optional[float] = None
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    daylight_duration: Optional[float] = None
    sunshine_duration: Optional[float] = None

    precipitation_probability: Optional[float] = None

    hourly_time: Optional[List[str]] = None
    hourly_temperature: Optional[List[float]] = None
    hourly_precipitation_probability: Optional[List[int]] = None
    hourly_uv_index: Optional[List[float]] = None
    hourly_us_aqi: Optional[List[int]] = None

    daily_time: Optional[List[str]] = None
    daily_temperature_max: Optional[List[float]] = None
    daily_temperature_min: Optional[List[float]] = None
    daily_weather_code: Optional[List[int]] = None

    @field_validator("collected_at")
    def validate_date(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError("collected_at deve ser uma data ISO válida")
