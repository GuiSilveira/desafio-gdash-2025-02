"""Weather data collector orchestrator."""

from .logger import get_logger
from .protocols import MessageQueue, WeatherProvider

logger = get_logger()


class Collector:
    """
    Orchestrates weather data collection and publishing.
    Uses dependency injection for testability (DIP).
    """

    def __init__(
        self,
        weather_provider: WeatherProvider,
        message_queue: MessageQueue,
    ):
        """
        Initialize collector with injected dependencies.

        Args:
            weather_provider: Provider for fetching weather data.
            message_queue: Queue for publishing collected data.
        """
        self._weather_provider = weather_provider
        self._message_queue = message_queue

    def collect_and_publish(self) -> bool:
        """
        Fetch weather data and publish to queue.

        Returns:
            True if data was collected and published successfully.
        """
        logger.info("🔄 Iniciando ciclo de coleta...")

        data = self._weather_provider.fetch()

        if data is None:
            logger.warning("⚠️ Nenhum dado coletado neste ciclo")
            return False

        return self._message_queue.publish(data.model_dump())

    def start(self) -> None:
        """Initialize connections."""
        self._message_queue.connect()

    def stop(self) -> None:
        """Clean up connections."""
        self._message_queue.close()
