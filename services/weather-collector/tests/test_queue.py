"""Tests for RabbitMQ client."""

import json
import unittest
from unittest.mock import MagicMock, patch

from pika.exceptions import AMQPConnectionError

from src.queue import RabbitMQClient


@patch("src.queue.rabbitmq.time.sleep")
class TestRabbitMQClient(unittest.TestCase):
    """Tests for RabbitMQClient."""

    @patch("src.queue.rabbitmq.pika.BlockingConnection")
    def test_publish_message_success(self, mock_connection_cls, mock_sleep):
        """Test successful message publishing."""
        # Setup mock connection
        mock_conn = MagicMock()
        mock_conn.is_closed = False
        mock_connection_cls.return_value = mock_conn

        # Setup mock channel
        mock_channel = MagicMock()
        mock_conn.channel.return_value = mock_channel

        # Create client and connect
        client = RabbitMQClient()
        client.connect()

        # Publish message
        payload = {"location": "Test", "temperature": 25.5}
        result = client.publish(payload)

        # Assertions
        self.assertTrue(result)
        mock_channel.basic_publish.assert_called_once()
        
        call_kwargs = mock_channel.basic_publish.call_args[1]
        self.assertEqual(call_kwargs["routing_key"], "weather_data_queue")
        self.assertEqual(json.loads(call_kwargs["body"]), payload)

    @patch("src.queue.rabbitmq.pika.BlockingConnection")
    def test_connection_retry_on_failure(self, mock_connection_cls, mock_sleep):
        """Test connection retry logic when RabbitMQ is unavailable."""
        # First attempt fails, second succeeds
        mock_success_conn = MagicMock()
        mock_success_conn.is_closed = False

        mock_connection_cls.side_effect = [
            AMQPConnectionError("Connection Refused"),
            mock_success_conn,
        ]

        client = RabbitMQClient()
        client.connect()

        # Should have retried
        mock_sleep.assert_called()
        self.assertEqual(mock_connection_cls.call_count, 2)

    @patch("src.queue.rabbitmq.pika.BlockingConnection")
    def test_is_connected_property(self, mock_connection_cls, mock_sleep):
        """Test is_connected property."""
        client = RabbitMQClient()
        
        # Initially not connected
        self.assertFalse(client.is_connected)

        # After connecting
        mock_conn = MagicMock()
        mock_conn.is_closed = False
        mock_connection_cls.return_value = mock_conn
        mock_conn.channel.return_value = MagicMock()

        client.connect()
        self.assertTrue(client.is_connected)

    @patch("src.queue.rabbitmq.pika.BlockingConnection")
    def test_close_connection(self, mock_connection_cls, mock_sleep):
        """Test graceful connection close."""
        mock_conn = MagicMock()
        mock_conn.is_closed = False
        mock_connection_cls.return_value = mock_conn
        mock_conn.channel.return_value = MagicMock()

        client = RabbitMQClient()
        client.connect()
        client.close()

        mock_conn.close.assert_called_once()
        self.assertFalse(client.is_connected)

    @patch("src.queue.rabbitmq.pika.BlockingConnection")
    def test_publish_reconnects_if_disconnected(self, mock_connection_cls, mock_sleep):
        """Test that publish reconnects if connection was lost."""
        mock_conn = MagicMock()
        mock_conn.is_closed = False
        mock_connection_cls.return_value = mock_conn
        
        mock_channel = MagicMock()
        mock_conn.channel.return_value = mock_channel

        client = RabbitMQClient()
        # Don't call connect, publish should trigger it
        result = client.publish({"test": "data"})

        self.assertTrue(result)
        mock_connection_cls.assert_called()  # Should have connected


if __name__ == "__main__":
    unittest.main()
