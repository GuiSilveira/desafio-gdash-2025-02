package logger

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

func TestLevelString(t *testing.T) {
	tests := []struct {
		level    Level
		expected string
	}{
		{DEBUG, "DEBUG"},
		{INFO, "INFO"},
		{WARN, "WARN"},
		{ERROR, "ERROR"},
		{Level(-1), "UNKNOWN"},
	}

	for _, tt := range tests {
		if got := tt.level.String(); got != tt.expected {
			t.Errorf("Level(%d).String() = %s, want %s", tt.level, got, tt.expected)
		}
	}
}

func TestLevelEmoji(t *testing.T) {
	tests := []struct {
		level    Level
		expected string
	}{
		{DEBUG, "🔍"},
		{INFO, "ℹ️"},
		{WARN, "⚠️"},
		{ERROR, "❌"},
		{Level(-1), "❓"},
	}

	for _, tt := range tests {
		if got := tt.level.Emoji(); got != tt.expected {
			t.Errorf("Level(%d).Emoji() = %s, want %s", tt.level, got, tt.expected)
		}
	}
}

func TestParseLevel(t *testing.T) {
	tests := []struct {
		input    string
		expected Level
	}{
		{"DEBUG", DEBUG},
		{"debug", DEBUG},
		{"INFO", INFO},
		{"info", INFO},
		{"WARN", WARN},
		{"WARNING", WARN},
		{"warn", WARN},
		{"ERROR", ERROR},
		{"error", ERROR},
		{"invalid", INFO},
		{"", INFO},
	}

	for _, tt := range tests {
		if got := ParseLevel(tt.input); got != tt.expected {
			t.Errorf("ParseLevel(%q) = %d, want %d", tt.input, got, tt.expected)
		}
	}
}

func TestLoggerJSONOutput(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "DEBUG",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l.Info("test message")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	if entry.Level != "INFO" {
		t.Errorf("Level = %s, want INFO", entry.Level)
	}
	if entry.Message != "test message" {
		t.Errorf("Message = %s, want 'test message'", entry.Message)
	}
	if entry.Service != "test-service" {
		t.Errorf("Service = %s, want 'test-service'", entry.Service)
	}
	if entry.Timestamp == "" {
		t.Error("Timestamp should not be empty")
	}
}

func TestLoggerTextOutput(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: false,
		Output:     &buf,
	})

	l.Warn("warning message")

	output := buf.String()
	if !strings.Contains(output, "WARN") {
		t.Errorf("Output should contain 'WARN': %s", output)
	}
	if !strings.Contains(output, "warning message") {
		t.Errorf("Output should contain 'warning message': %s", output)
	}
	if !strings.Contains(output, "⚠️") {
		t.Errorf("Output should contain warning emoji: %s", output)
	}
}

func TestLoggerLevelFiltering(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "WARN",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l.Debug("debug message")
	l.Info("info message")

	if buf.Len() > 0 {
		t.Error("DEBUG and INFO messages should be filtered out when level is WARN")
	}

	l.Warn("warn message")
	if !strings.Contains(buf.String(), "warn message") {
		t.Error("WARN message should be logged")
	}

	buf.Reset()
	l.Error("error message")
	if !strings.Contains(buf.String(), "error message") {
		t.Error("ERROR message should be logged")
	}
}

func TestLoggerWithCorrelationID(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l2 := l.WithCorrelationID("abc-123")
	l2.Info("message with correlation")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	if entry.CorrelationID != "abc-123" {
		t.Errorf("CorrelationID = %s, want 'abc-123'", entry.CorrelationID)
	}
}

func TestLoggerWithField(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l2 := l.WithField("user_id", 123)
	l2.Info("message with field")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	if entry.Fields["user_id"] != float64(123) {
		t.Errorf("Fields[user_id] = %v, want 123", entry.Fields["user_id"])
	}
}

func TestLoggerWithFields(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l2 := l.WithFields(map[string]interface{}{
		"queue":   "weather_data",
		"retries": 3,
	})
	l2.Info("message with fields")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	if entry.Fields["queue"] != "weather_data" {
		t.Errorf("Fields[queue] = %v, want 'weather_data'", entry.Fields["queue"])
	}
	if entry.Fields["retries"] != float64(3) {
		t.Errorf("Fields[retries] = %v, want 3", entry.Fields["retries"])
	}
}

func TestLoggerFormatting(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l.Info("processing %d messages from %s", 5, "weather_queue")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	expected := "processing 5 messages from weather_queue"
	if entry.Message != expected {
		t.Errorf("Message = %s, want %s", entry.Message, expected)
	}
}

func TestLoggerImmutability(t *testing.T) {
	var buf bytes.Buffer

	l1 := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l2 := l1.WithCorrelationID("abc-123")
	l3 := l2.WithField("key", "value")

	l1.Info("message from l1")
	var entry1 LogEntry
	json.Unmarshal(buf.Bytes(), &entry1)
	if entry1.CorrelationID != "" {
		t.Error("l1 should not have correlation ID")
	}

	buf.Reset()
	l2.Info("message from l2")
	var entry2 LogEntry
	json.Unmarshal(buf.Bytes(), &entry2)
	if entry2.CorrelationID != "abc-123" {
		t.Error("l2 should have correlation ID")
	}
	if len(entry2.Fields) != 0 {
		t.Error("l2 should not have fields")
	}

	buf.Reset()
	l3.Info("message from l3")
	var entry3 LogEntry
	json.Unmarshal(buf.Bytes(), &entry3)
	if entry3.CorrelationID != "abc-123" {
		t.Error("l3 should have correlation ID")
	}
	if entry3.Fields["key"] != "value" {
		t.Error("l3 should have field 'key'")
	}
}

func TestDefaultLogger(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-default",
		JSONOutput: true,
		Output:     &buf,
	})
	SetDefault(l)

	Info("package level message")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	if entry.Service != "test-default" {
		t.Errorf("Service = %s, want 'test-default'", entry.Service)
	}
}

func TestCallerInfo(t *testing.T) {
	var buf bytes.Buffer

	l := New(Config{
		Level:      "INFO",
		Service:    "test-service",
		JSONOutput: true,
		Output:     &buf,
	})

	l.Info("test message")

	var entry LogEntry
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("Failed to parse JSON output: %v", err)
	}

	if entry.Caller == "" {
		t.Error("Caller should not be empty")
	}
	if !strings.Contains(entry.Caller, ".go:") {
		t.Errorf("Caller should contain file:line format, got: %s", entry.Caller)
	}
}
