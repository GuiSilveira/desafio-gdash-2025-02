"""
Weather Collector Service Entry Point.

Collects weather data from Open-Meteo APIs and publishes to RabbitMQ.
Uses dependency injection for testability and follows SOLID principles.
"""

import signal
import sys
import time
from types import FrameType
from typing import Optional

import schedule

from src.collector import Collector
from src.config import get_settings
from src.logger import StructuredLogger, set_default_logger
from src.providers import OpenMeteoProvider
from src.queue import RabbitMQClient


class ServiceRunner:
    """
    Manages the service lifecycle with graceful shutdown.
    Encapsulates the running state to avoid global variables.
    """

    def __init__(
        self,
        collector: Collector,
        logger: StructuredLogger,
        interval_minutes: int = 5,
    ):
        """
        Initialize the service runner.
        
        Args:
            collector: The collector instance with injected dependencies.
            logger: Structured logger instance.
            interval_minutes: Collection interval in minutes.
        """
        self._collector = collector
        self._logger = logger
        self._interval_minutes = interval_minutes
        self._running = True

    def handle_shutdown(self, signum: int, frame: Optional[FrameType]) -> None:
        """Handle shutdown signals (SIGTERM/SIGINT)."""
        self._logger.warning("🛑 Sinal de parada recebido", signal=signum)
        self._running = False

    def run(self) -> None:
        """Main service loop."""
        # Register signal handlers
        signal.signal(signal.SIGINT, self.handle_shutdown)
        signal.signal(signal.SIGTERM, self.handle_shutdown)

        self._logger.info("🚀 Serviço Weather Collector Iniciado")

        # Initialize connections
        self._collector.start()

        # Schedule periodic collection
        schedule.every(self._interval_minutes).minutes.do(self._collector.collect_and_publish)

        # Run immediately on startup
        self._collector.collect_and_publish()

        # Main loop
        while self._running:
            try:
                schedule.run_pending()
                time.sleep(1)
            except Exception as e:
                self._logger.exception("🔥 Erro crítico no loop principal")
                time.sleep(5)

        # Cleanup
        self._logger.info("🔌 Fechando conexões...")
        self._collector.stop()
        self._logger.info("👋 Até logo!")


def create_collector() -> Collector:
    """
    Factory function to create collector with all dependencies.
    This is where dependency injection happens.
    """
    weather_provider = OpenMeteoProvider()
    message_queue = RabbitMQClient()
    
    return Collector(
        weather_provider=weather_provider,
        message_queue=message_queue,
    )


def create_logger() -> StructuredLogger:
    """Create and configure the structured logger from settings."""
    settings = get_settings()
    return StructuredLogger(
        name=settings.SERVICE_NAME,
        level=settings.LOG_LEVEL,
        json_output=settings.LOG_JSON,
    )


def main() -> None:
    """Application entry point."""
    logger = create_logger()
    set_default_logger(logger)
    
    collector = create_collector()
    runner = ServiceRunner(collector, logger, interval_minutes=5)
    runner.run()


if __name__ == "__main__":
    main()
