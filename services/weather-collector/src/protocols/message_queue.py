"""Protocol for message queue abstraction (DIP)."""

from typing import Protocol, runtime_checkable


@runtime_checkable
class MessageQueue(Protocol):
    """
    Abstract interface for message queue operations.
    Allows swapping RabbitMQ for other brokers (Kafka, Redis, etc.)
    """

    def connect(self) -> None:
        """Establish connection to the message broker."""
        ...

    def publish(self, message: dict) -> bool:
        """
        Publish a message to the queue.
        
        Args:
            message: Dictionary to be serialized and sent.
            
        Returns:
            True if published successfully, False otherwise.
        """
        ...

    def close(self) -> None:
        """Close the connection gracefully."""
        ...

    @property
    def is_connected(self) -> bool:
        """Check if currently connected to the broker."""
        ...
