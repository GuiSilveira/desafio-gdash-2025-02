"""Tests for the structured logger module."""

import json
import logging
from io import StringIO
from unittest.mock import patch

import pytest

from src.logger import (
    JSONFormatter,
    TextFormatter,
    StructuredLogger,
    get_logger,
    set_default_logger,
)


class TestJSONFormatter:
    """Tests for JSONFormatter."""

    def test_formats_basic_log_entry(self):
        """Test that basic log entries are formatted as JSON."""
        formatter = JSONFormatter(service="test-service")
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=42,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        
        result = formatter.format(record)
        parsed = json.loads(result)
        
        assert parsed["level"] == "INFO"
        assert parsed["message"] == "Test message"
        assert parsed["service"] == "test-service"
        assert parsed["caller"] == "test.py:42"
        assert "timestamp" in parsed

    def test_includes_correlation_id_when_present(self):
        """Test that correlation ID is included when set."""
        formatter = JSONFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=1,
            msg="Message",
            args=(),
            exc_info=None,
        )
        record.correlation_id = "abc-123"
        
        result = formatter.format(record)
        parsed = json.loads(result)
        
        assert parsed["correlation_id"] == "abc-123"

    def test_includes_fields_when_present(self):
        """Test that extra fields are included."""
        formatter = JSONFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=1,
            msg="Message",
            args=(),
            exc_info=None,
        )
        record.fields = {"queue": "weather_data", "retries": 3}
        
        result = formatter.format(record)
        parsed = json.loads(result)
        
        assert parsed["fields"]["queue"] == "weather_data"
        assert parsed["fields"]["retries"] == 3

    def test_handles_exception_info(self):
        """Test that exception info is included."""
        formatter = JSONFormatter()
        
        try:
            raise ValueError("Test error")
        except ValueError:
            import sys
            exc_info = sys.exc_info()
        
        record = logging.LogRecord(
            name="test",
            level=logging.ERROR,
            pathname="test.py",
            lineno=1,
            msg="Error occurred",
            args=(),
            exc_info=exc_info,
        )
        
        result = formatter.format(record)
        parsed = json.loads(result)
        
        assert "exception" in parsed
        assert "ValueError: Test error" in parsed["exception"]


class TestTextFormatter:
    """Tests for TextFormatter."""

    def test_formats_basic_log_entry(self):
        """Test human-readable format."""
        formatter = TextFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="test.py",
            lineno=42,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        
        result = formatter.format(record)
        
        assert "[INFO]" in result
        assert "Test message" in result
        assert "ℹ️" in result

    def test_includes_correlation_id(self):
        """Test correlation ID in text format."""
        formatter = TextFormatter()
        record = logging.LogRecord(
            name="test",
            level=logging.WARNING,
            pathname="test.py",
            lineno=1,
            msg="Warning",
            args=(),
            exc_info=None,
        )
        record.correlation_id = "xyz-789"
        
        result = formatter.format(record)
        
        assert "[xyz-789]" in result
        assert "⚠️" in result


class TestStructuredLogger:
    """Tests for StructuredLogger."""

    def test_logs_info_message(self):
        """Test logging an info message."""
        output = StringIO()
        logger = StructuredLogger(name="test", json_output=True)
        # Replace handler with one that writes to our StringIO
        logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        logger._logger.addHandler(handler)
        
        logger.info("Test message")
        
        result = output.getvalue()
        parsed = json.loads(result)
        assert parsed["level"] == "INFO"
        assert parsed["message"] == "Test message"

    def test_with_correlation_id(self):
        """Test creating logger with correlation ID."""
        output = StringIO()
        base_logger = StructuredLogger(name="test", json_output=True)
        base_logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        base_logger._logger.addHandler(handler)
        
        logger = base_logger.with_correlation_id("corr-123")
        logger.info("Message with correlation")
        
        result = output.getvalue()
        parsed = json.loads(result)
        assert parsed["correlation_id"] == "corr-123"

    def test_with_field(self):
        """Test adding a single field."""
        output = StringIO()
        base_logger = StructuredLogger(name="test", json_output=True)
        base_logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        base_logger._logger.addHandler(handler)
        
        logger = base_logger.with_field("user_id", 123)
        logger.info("Message")
        
        result = output.getvalue()
        parsed = json.loads(result)
        assert parsed["fields"]["user_id"] == 123

    def test_with_fields(self):
        """Test adding multiple fields."""
        output = StringIO()
        base_logger = StructuredLogger(name="test", json_output=True)
        base_logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        base_logger._logger.addHandler(handler)
        
        logger = base_logger.with_fields(queue="weather", retries=5)
        logger.info("Message")
        
        result = output.getvalue()
        parsed = json.loads(result)
        assert parsed["fields"]["queue"] == "weather"
        assert parsed["fields"]["retries"] == 5

    def test_inline_fields_in_log_call(self):
        """Test passing fields directly in log call."""
        output = StringIO()
        logger = StructuredLogger(name="test", json_output=True)
        logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        logger._logger.addHandler(handler)
        
        logger.info("Message", location="São Paulo", temp=25.5)
        
        result = output.getvalue()
        parsed = json.loads(result)
        assert parsed["fields"]["location"] == "São Paulo"
        assert parsed["fields"]["temp"] == 25.5

    def test_immutability(self):
        """Test that with_* methods don't modify original logger."""
        output = StringIO()
        original = StructuredLogger(name="test", json_output=True)
        original._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        original._logger.addHandler(handler)
        
        with_corr = original.with_correlation_id("abc")
        with_field = with_corr.with_field("key", "value")
        
        # Log from original - should not have correlation ID
        original.info("Original message")
        line1 = output.getvalue()
        parsed1 = json.loads(line1.strip().split('\n')[-1])
        assert parsed1.get("correlation_id") is None
        
        # Log from with_field - should have both
        with_field.info("With field message")
        lines = output.getvalue().strip().split('\n')
        parsed2 = json.loads(lines[-1])
        assert parsed2["correlation_id"] == "abc"
        assert parsed2["fields"]["key"] == "value"

    def test_level_filtering(self):
        """Test that log level filtering works."""
        output = StringIO()
        logger = StructuredLogger(name="test", level="WARNING", json_output=True)
        logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        logger._logger.addHandler(handler)
        
        logger.debug("Debug message")
        logger.info("Info message")
        
        result = output.getvalue()
        assert result == ""  # Nothing logged because level is WARNING

    def test_all_log_levels(self):
        """Test all log level methods work."""
        output = StringIO()
        logger = StructuredLogger(name="test", level="DEBUG", json_output=True)
        logger._logger.handlers.clear()
        handler = logging.StreamHandler(output)
        handler.setFormatter(JSONFormatter(service="test"))
        logger._logger.addHandler(handler)
        
        logger.debug("Debug")
        logger.info("Info")
        logger.warning("Warning")
        logger.error("Error")
        logger.critical("Critical")
        
        lines = output.getvalue().strip().split('\n')
        assert len(lines) == 5
        
        levels = [json.loads(line)["level"] for line in lines]
        assert levels == ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


class TestGetLogger:
    """Tests for get_logger function."""

    def test_returns_structured_logger(self):
        """Test that get_logger returns a StructuredLogger."""
        # Reset default logger
        import src.logger as logger_module
        logger_module._default_logger = None
        
        logger = get_logger("test-service")
        
        assert isinstance(logger, StructuredLogger)

    def test_returns_same_instance(self):
        """Test that get_logger returns the same instance."""
        import src.logger as logger_module
        logger_module._default_logger = None
        
        logger1 = get_logger("test")
        logger2 = get_logger("test")
        
        assert logger1 is logger2


class TestSetDefaultLogger:
    """Tests for set_default_logger function."""

    def test_sets_default_logger(self):
        """Test that set_default_logger works."""
        import src.logger as logger_module
        
        custom_logger = StructuredLogger(name="custom")
        set_default_logger(custom_logger)
        
        assert logger_module._default_logger is custom_logger
