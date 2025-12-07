"""Protocol definitions for dependency injection."""

from .message_queue import MessageQueue
from .weather_provider import WeatherProvider

__all__ = ["MessageQueue", "WeatherProvider"]
