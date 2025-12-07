"""Open-Meteo weather provider implementation."""

from datetime import datetime
from typing import Any, Optional

import requests

from ..config import settings
from ..logger import get_logger
from ..schemas import WeatherData
from ..wmo_codes import get_condition

logger = get_logger()


class OpenMeteoProvider:
    """
    Open-Meteo implementation of the WeatherProvider protocol.
    Fetches weather and air quality data from Open-Meteo APIs.
    """

    def __init__(
        self,
        weather_url: Optional[str] = None,
        air_quality_url: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        city: Optional[str] = None,
        timeout: float = 10.0,
    ):
        """
        Initialize Open-Meteo provider.
        
        Args:
            weather_url: Weather API URL (defaults to settings).
            air_quality_url: Air quality API URL (defaults to settings).
            latitude: Target latitude (defaults to settings).
            longitude: Target longitude (defaults to settings).
            city: City name for data labeling (defaults to settings).
            timeout: Request timeout in seconds.
        """
        self._weather_url = weather_url or settings.OPEN_METEO_URL
        self._air_quality_url = air_quality_url or settings.OPEN_METEO_AIR_QUALITY_URL
        self._latitude = latitude or settings.TARGET_LAT
        self._longitude = longitude or settings.TARGET_LON
        self._city = city or settings.TARGET_CITY
        self._timeout = timeout

    def fetch(self) -> Optional[WeatherData]:
        """
        Fetch current weather data from Open-Meteo.
        
        Returns:
            WeatherData if successful, None if failed.
        """
        try:
            weather_data = self._fetch_weather()
            air_quality_data = self._fetch_air_quality()

            result = self._combine_data(weather_data, air_quality_data)
            
            logger.info(
                "✅ Dados validados",
                temperature=result.temperature,
                us_aqi=result.us_aqi,
                uv_index=result.uv_index,
            )
            return result

        except Exception as e:
            logger.error("❌ Erro na coleta/validação", error=str(e))
            return None

    def _fetch_weather(self) -> dict[str, Any]:
        """Fetch weather data from Open-Meteo weather API."""
        params = {
            "latitude": self._latitude,
            "longitude": self._longitude,
            "timezone": "America/Sao_Paulo",
            "current": ",".join([
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "weather_code",
                "surface_pressure",
                "visibility",
            ]),
            "daily": ",".join([
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "sunrise",
                "sunset",
                "daylight_duration",
                "sunshine_duration",
            ]),
            "hourly": "temperature_2m,precipitation_probability",
            "forecast_days": 7,
        }

        logger.info("🌤️  Buscando dados meteorológicos...")
        response = requests.get(self._weather_url, params=params, timeout=self._timeout)
        response.raise_for_status()
        return response.json()

    def _fetch_air_quality(self) -> dict[str, Any]:
        """Fetch air quality data from Open-Meteo air quality API."""
        params = {
            "latitude": self._latitude,
            "longitude": self._longitude,
            "timezone": "America/Sao_Paulo",
            "current": ",".join([
                "us_aqi",
                "uv_index",
                "pm2_5",
                "pm10",
                "carbon_monoxide",
                "nitrogen_dioxide",
                "sulphur_dioxide",
                "ozone",
            ]),
            "hourly": "uv_index,us_aqi",
            "forecast_days": 7,
        }

        logger.info("🍃 Buscando dados de qualidade do ar...")
        response = requests.get(self._air_quality_url, params=params, timeout=self._timeout)
        response.raise_for_status()
        return response.json()

    def _combine_data(
        self, 
        weather_data: dict[str, Any], 
        air_quality_data: dict[str, Any]
    ) -> WeatherData:
        """Combine weather and air quality data into WeatherData model."""
        weather_current = weather_data.get("current", {})
        weather_daily = weather_data.get("daily", {})
        weather_hourly = weather_data.get("hourly", {})

        air_current = air_quality_data.get("current", {})
        air_hourly = air_quality_data.get("hourly", {})

        weather_code = weather_current.get("weather_code", 0)

        return WeatherData(
            location=self._city,
            collected_at=datetime.now().isoformat(),
            
            temperature=float(weather_current.get("temperature_2m", 0.0)),
            humidity=float(weather_current.get("relative_humidity_2m", 0.0)),
            apparent_temperature=weather_current.get("apparent_temperature"),
            weather_code=weather_code,
            surface_pressure=weather_current.get("surface_pressure"),
            visibility=weather_current.get("visibility"),
            condition=get_condition(weather_code),
            
            us_aqi=air_current.get("us_aqi"),
            uv_index=air_current.get("uv_index"),
            pm2_5=air_current.get("pm2_5"),
            pm10=air_current.get("pm10"),
            carbon_monoxide=air_current.get("carbon_monoxide"),
            nitrogen_dioxide=air_current.get("nitrogen_dioxide"),
            sulphur_dioxide=air_current.get("sulphur_dioxide"),
            ozone=air_current.get("ozone"),
            
            temperature_max=self._safe_first(weather_daily.get("temperature_2m_max")),
            sunrise=self._safe_first(weather_daily.get("sunrise")),
            sunset=self._safe_first(weather_daily.get("sunset")),
            daylight_duration=self._safe_first(weather_daily.get("daylight_duration")),
            sunshine_duration=self._safe_first(weather_daily.get("sunshine_duration")),
            
            precipitation_probability=self._safe_first(
                weather_hourly.get("precipitation_probability")
            ),
            
            hourly_time=self._safe_slice(weather_hourly.get("time"), 24),
            hourly_temperature=self._safe_float_slice(
                weather_hourly.get("temperature_2m"), 24
            ),
            hourly_precipitation_probability=self._safe_int_slice(
                weather_hourly.get("precipitation_probability"), 24
            ),
            hourly_uv_index=self._safe_float_slice(air_hourly.get("uv_index"), 24),
            hourly_us_aqi=self._safe_int_slice(air_hourly.get("us_aqi"), 24),
            
            daily_time=weather_daily.get("time"),
            daily_temperature_max=self._safe_float_list(
                weather_daily.get("temperature_2m_max")
            ),
            daily_temperature_min=self._safe_float_list(
                weather_daily.get("temperature_2m_min")
            ),
            daily_weather_code=self._safe_int_list(weather_daily.get("weather_code")),
        )

    @staticmethod
    def _safe_first(arr: Optional[list]) -> Optional[Any]:
        """Safely get first element of array."""
        if arr and len(arr) > 0:
            val = arr[0]
            return float(val) if isinstance(val, (int, float)) else val
        return None

    @staticmethod
    def _safe_slice(arr: Optional[list], size: int) -> Optional[list]:
        """Safely slice array to size."""
        if arr:
            return arr[:size]
        return None

    @staticmethod
    def _safe_float_slice(arr: Optional[list], size: int) -> Optional[list[float]]:
        """Safely slice array to size and convert to floats."""
        if arr:
            return [float(x) if x is not None else 0.0 for x in arr[:size]]
        return None

    @staticmethod
    def _safe_int_slice(arr: Optional[list], size: int) -> Optional[list[int]]:
        """Safely slice array to size and convert to ints."""
        if arr:
            return [int(x) if x is not None else 0 for x in arr[:size]]
        return None

    @staticmethod
    def _safe_float_list(arr: Optional[list]) -> Optional[list[float]]:
        """Safely convert list to floats."""
        if arr:
            return [float(x) if x is not None else 0.0 for x in arr]
        return None

    @staticmethod
    def _safe_int_list(arr: Optional[list]) -> Optional[list[int]]:
        """Safely convert list to ints."""
        if arr:
            return [int(x) if x is not None else 0 for x in arr]
        return None
