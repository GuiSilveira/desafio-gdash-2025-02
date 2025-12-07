"""Protocol for weather data provider abstraction (DIP)."""

from typing import Optional, Protocol, runtime_checkable

from ..schemas import WeatherData


@runtime_checkable
class WeatherProvider(Protocol):
    """
    Abstract interface for weather data providers.
    Allows swapping Open-Meteo for other APIs (OpenWeather, WeatherAPI, etc.)
    """

    def fetch(self) -> Optional[WeatherData]:
        """
        Fetch current weather data from the provider.
        
        Returns:
            WeatherData if successful, None if failed.
        """
        ...
