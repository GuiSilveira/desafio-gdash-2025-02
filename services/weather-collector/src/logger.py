"""
Structured JSON logging for Weather Collector.

Provides consistent structured logging with log levels, 
correlation IDs, and JSON output format.
"""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """
    Custom formatter that outputs structured JSON logs.
    
    Log entry format:
    {
        "timestamp": "2024-01-01T12:00:00.000000Z",
        "level": "INFO",
        "message": "Log message",
        "service": "weather-collector",
        "correlation_id": "abc-123",  // optional
        "caller": "module.py:42",
        "fields": {}  // optional extra fields
    }
    """

    def __init__(self, service: str = "weather-collector"):
        super().__init__()
        self.service = service

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "service": self.service,
            "caller": f"{record.filename}:{record.lineno}",
        }

        correlation_id = getattr(record, "correlation_id", None)
        if correlation_id:
            log_entry["correlation_id"] = correlation_id

        fields = getattr(record, "fields", None)
        if fields:
            log_entry["fields"] = fields

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, ensure_ascii=False)


class TextFormatter(logging.Formatter):
    """
    Human-readable formatter for development.
    
    Format: 2024-01-01 12:00:00 ℹ️ [INFO] [abc-123] Message {fields}
    """

    LEVEL_EMOJIS = {
        "DEBUG": "🔍",
        "INFO": "ℹ️",
        "WARNING": "⚠️",
        "ERROR": "❌",
        "CRITICAL": "🔥",
    }

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        emoji = self.LEVEL_EMOJIS.get(record.levelname, "❓")
        
        correlation_id = getattr(record, "correlation_id", None)
        corr_str = f" [{correlation_id}]" if correlation_id else ""
        
        fields = getattr(record, "fields", None)
        fields_str = f" {json.dumps(fields)}" if fields else ""
        
        message = record.getMessage()
        
        formatted = f"{timestamp} {emoji} [{record.levelname}]{corr_str} {message}{fields_str}"
        
        if record.exc_info:
            formatted += f"\n{self.formatException(record.exc_info)}"
        
        return formatted


class StructuredLogger:
    """
    Structured logger with correlation ID support and extra fields.
    
    Usage:
        logger = StructuredLogger("weather-collector")
        logger.info("Message", correlation_id="abc-123", queue="weather_data")
    """

    def __init__(
        self,
        name: str = "weather-collector",
        level: str = "INFO",
        json_output: bool = True,
        correlation_id: Optional[str] = None,
    ):
        self.name = name
        self._correlation_id = correlation_id
        self._fields: Dict[str, Any] = {}
        
        self._logger = logging.getLogger(name)
        self._logger.setLevel(getattr(logging, level.upper(), logging.INFO))
        
        self._logger.handlers.clear()
        
        handler = logging.StreamHandler(sys.stdout)
        if json_output:
            handler.setFormatter(JSONFormatter(service=name))
        else:
            handler.setFormatter(TextFormatter())
        
        self._logger.addHandler(handler)
        
        self._logger.propagate = False

    def with_correlation_id(self, correlation_id: str) -> "StructuredLogger":
        """Return a new logger with the given correlation ID."""
        new_logger = StructuredLogger.__new__(StructuredLogger)
        new_logger.name = self.name
        new_logger._correlation_id = correlation_id
        new_logger._fields = self._fields.copy()
        new_logger._logger = self._logger
        return new_logger

    def with_field(self, key: str, value: Any) -> "StructuredLogger":
        """Return a new logger with an additional field."""
        new_logger = StructuredLogger.__new__(StructuredLogger)
        new_logger.name = self.name
        new_logger._correlation_id = self._correlation_id
        new_logger._fields = {**self._fields, key: value}
        new_logger._logger = self._logger
        return new_logger

    def with_fields(self, **fields: Any) -> "StructuredLogger":
        """Return a new logger with additional fields."""
        new_logger = StructuredLogger.__new__(StructuredLogger)
        new_logger.name = self.name
        new_logger._correlation_id = self._correlation_id
        new_logger._fields = {**self._fields, **fields}
        new_logger._logger = self._logger
        return new_logger

    def _log(self, level: int, msg: str, *args: Any, **kwargs: Any) -> None:
        """Internal log method that adds correlation ID and fields."""
        extra_fields = {**self._fields}
        for key in list(kwargs.keys()):
            if key not in ("exc_info", "stack_info", "stacklevel"):
                extra_fields[key] = kwargs.pop(key)
        
        extra = {
            "correlation_id": self._correlation_id,
            "fields": extra_fields if extra_fields else None,
        }
        
        self._logger.log(level, msg, *args, extra=extra, **kwargs)

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a debug message."""
        self._log(logging.DEBUG, msg, *args, **kwargs)

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an info message."""
        self._log(logging.INFO, msg, *args, **kwargs)

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a warning message."""
        self._log(logging.WARNING, msg, *args, **kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an error message."""
        self._log(logging.ERROR, msg, *args, **kwargs)

    def critical(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log a critical message."""
        self._log(logging.CRITICAL, msg, *args, **kwargs)

    def exception(self, msg: str, *args: Any, **kwargs: Any) -> None:
        """Log an error message with exception info."""
        kwargs["exc_info"] = True
        self._log(logging.ERROR, msg, *args, **kwargs)


_default_logger: Optional[StructuredLogger] = None


def get_logger(
    name: str = "weather-collector",
    level: str = "INFO",
    json_output: bool = True,
) -> StructuredLogger:
    """
    Get or create the default structured logger.
    
    Args:
        name: Service name for logs.
        level: Log level (DEBUG, INFO, WARNING, ERROR).
        json_output: True for JSON format, False for human-readable.
    
    Returns:
        StructuredLogger instance.
    """
    global _default_logger
    if _default_logger is None:
        _default_logger = StructuredLogger(
            name=name,
            level=level,
            json_output=json_output,
        )
    return _default_logger


def set_default_logger(logger: StructuredLogger) -> None:
    """Set the default logger instance."""
    global _default_logger
    _default_logger = logger
