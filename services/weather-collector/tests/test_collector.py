"""Tests for Collector orchestrator."""

import unittest
from unittest.mock import MagicMock

from src.collector import Collector
from src.schemas import WeatherData


class MockWeatherProvider:
    """Mock implementation of WeatherProvider protocol."""

    def __init__(self, return_data=None):
        self.return_data = return_data
        self.fetch_called = False

    def fetch(self):
        self.fetch_called = True
        return self.return_data


class MockMessageQueue:
    """Mock implementation of MessageQueue protocol."""

    def __init__(self, publish_success=True):
        self.publish_success = publish_success
        self.connect_called = False
        self.close_called = False
        self.published_messages = []

    def connect(self):
        self.connect_called = True

    def publish(self, message):
        self.published_messages.append(message)
        return self.publish_success

    def close(self):
        self.close_called = True

    @property
    def is_connected(self):
        return self.connect_called


class TestCollector(unittest.TestCase):
    """Tests for Collector orchestrator."""

    def _create_weather_data(self):
        """Create sample WeatherData."""
        return WeatherData(
            location="Test City",
            temperature=25.5,
            humidity=60.0,
            condition="Céu Limpo",
            weather_code=0,
            collected_at="2025-01-01T12:00:00",
        )

    def test_collect_and_publish_success(self):
        """Test successful collection and publishing."""
        weather_data = self._create_weather_data()
        provider = MockWeatherProvider(return_data=weather_data)
        queue = MockMessageQueue(publish_success=True)

        collector = Collector(weather_provider=provider, message_queue=queue)
        result = collector.collect_and_publish()

        self.assertTrue(result)
        self.assertTrue(provider.fetch_called)
        self.assertEqual(len(queue.published_messages), 1)
        self.assertEqual(queue.published_messages[0]["location"], "Test City")

    def test_collect_and_publish_no_data(self):
        """Test handling when provider returns None."""
        provider = MockWeatherProvider(return_data=None)
        queue = MockMessageQueue()

        collector = Collector(weather_provider=provider, message_queue=queue)
        result = collector.collect_and_publish()

        self.assertFalse(result)
        self.assertTrue(provider.fetch_called)
        self.assertEqual(len(queue.published_messages), 0)

    def test_collect_and_publish_queue_failure(self):
        """Test handling when queue publish fails."""
        weather_data = self._create_weather_data()
        provider = MockWeatherProvider(return_data=weather_data)
        queue = MockMessageQueue(publish_success=False)

        collector = Collector(weather_provider=provider, message_queue=queue)
        result = collector.collect_and_publish()

        self.assertFalse(result)
        self.assertTrue(provider.fetch_called)

    def test_start_connects_queue(self):
        """Test start() connects to message queue."""
        provider = MockWeatherProvider()
        queue = MockMessageQueue()

        collector = Collector(weather_provider=provider, message_queue=queue)
        collector.start()

        self.assertTrue(queue.connect_called)

    def test_stop_closes_queue(self):
        """Test stop() closes message queue connection."""
        provider = MockWeatherProvider()
        queue = MockMessageQueue()

        collector = Collector(weather_provider=provider, message_queue=queue)
        collector.stop()

        self.assertTrue(queue.close_called)

    def test_dependency_injection(self):
        """Test that collector uses injected dependencies."""
        provider = MockWeatherProvider()
        queue = MockMessageQueue()

        collector = Collector(weather_provider=provider, message_queue=queue)

        self.assertIs(collector._weather_provider, provider)
        self.assertIs(collector._message_queue, queue)


if __name__ == "__main__":
    unittest.main()
