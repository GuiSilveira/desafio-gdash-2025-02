"""RabbitMQ implementation of MessageQueue protocol."""

import json
import time
from typing import Optional

import pika
from pika.exceptions import AMQPConnectionError

from ..config import settings
from ..logger import get_logger

logger = get_logger()


class RabbitMQClient:
    """
    RabbitMQ implementation of the MessageQueue protocol.
    Handles connection, publishing, and reconnection logic.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        queue_name: Optional[str] = None,
        retry_delay: float = 5.0,
    ):
        """
        Initialize RabbitMQ client.
        
        Args:
            host: RabbitMQ host (defaults to settings).
            port: RabbitMQ port (defaults to settings).
            user: RabbitMQ user (defaults to settings).
            password: RabbitMQ password (defaults to settings).
            queue_name: Queue name (defaults to settings).
            retry_delay: Seconds to wait between connection retries.
        """
        self._host = host or settings.RABBITMQ_HOST
        self._port = port or settings.RABBITMQ_PORT
        self._user = user or settings.RABBITMQ_USER
        self._password = password or settings.RABBITMQ_PASS
        self._queue_name = queue_name or settings.RABBITMQ_QUEUE_NAME
        self._retry_delay = retry_delay
        
        self._connection: Optional[pika.BlockingConnection] = None
        self._channel: Optional[pika.adapters.blocking_connection.BlockingChannel] = None

    @property
    def is_connected(self) -> bool:
        """Check if currently connected to RabbitMQ."""
        return (
            self._connection is not None 
            and not self._connection.is_closed
            and self._channel is not None
        )

    def connect(self) -> None:
        """
        Connect to RabbitMQ with infinite retry.
        Blocks until connection is established.
        """
        while not self.is_connected:
            try:
                credentials = pika.PlainCredentials(self._user, self._password)
                parameters = pika.ConnectionParameters(
                    host=self._host,
                    port=self._port,
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                )
                self._connection = pika.BlockingConnection(parameters)
                self._channel = self._connection.channel()

                self._channel.queue_declare(queue=self._queue_name, durable=True)
                logger.info("🐰 Conectado ao RabbitMQ com sucesso!")

            except AMQPConnectionError as e:
                logger.warning("⚠️ RabbitMQ indisponível. Tentando novamente...", retry_delay=self._retry_delay, error=str(e))
                time.sleep(self._retry_delay)

    def publish(self, message: dict) -> bool:
        """
        Publish a message to the queue.
        
        Args:
            message: Dictionary to be JSON-serialized and sent.
            
        Returns:
            True if published successfully, False otherwise.
        """
        if not self.is_connected:
            self.connect()

        if self._channel is None:
            logger.error("❌ Canal não está disponível para publicar mensagens")
            return False

        try:
            self._channel.basic_publish(
                exchange="",
                routing_key=self._queue_name,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type="application/json",
                ),
            )
            logger.info("📤 Mensagem enviada para fila!")
            return True

        except Exception as e:
            logger.error("❌ Falha ao publicar mensagem", error=str(e))
            self._force_close()
            return False

    def close(self) -> None:
        """Close the connection gracefully."""
        if self._connection and not self._connection.is_closed:
            try:
                self._connection.close()
                logger.info("🔌 Conexão RabbitMQ fechada")
            except Exception as e:
                logger.warning("⚠️ Erro ao fechar conexão", error=str(e))
        
        self._connection = None
        self._channel = None

    def _force_close(self) -> None:
        """Force close connection (used after errors)."""
        if self._connection:
            try:
                self._connection.close()
            except Exception:
                pass
        self._connection = None
        self._channel = None
