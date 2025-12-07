package config

import (
	"os"
	"testing"
	"time"
)

func TestLoad_Defaults(t *testing.T) {
	envVars := []string{
		"RABBITMQ_HOST", "RABBITMQ_USER", "RABBITMQ_PASS", "RABBITMQ_PORT", "RABBITMQ_QUEUE",
		"API_URL", "INTERNAL_API_TOKEN", "API_TIMEOUT",
		"WORKER_RETRY_DELAY", "WORKER_MAX_RETRIES", "WORKER_PREFETCH_COUNT",
	}
	for _, key := range envVars {
		os.Unsetenv(key)
	}

	cfg := Load()

	if cfg.RabbitMQ.Host != "rabbitmq" {
		t.Errorf("Expected Host 'rabbitmq', got '%s'", cfg.RabbitMQ.Host)
	}
	if cfg.RabbitMQ.User != "guest" {
		t.Errorf("Expected User 'guest', got '%s'", cfg.RabbitMQ.User)
	}
	if cfg.RabbitMQ.Password != "guest" {
		t.Errorf("Expected Password 'guest', got '%s'", cfg.RabbitMQ.Password)
	}
	if cfg.RabbitMQ.Port != 5672 {
		t.Errorf("Expected Port 5672, got %d", cfg.RabbitMQ.Port)
	}
	if cfg.RabbitMQ.QueueName != "weather_data_queue" {
		t.Errorf("Expected QueueName 'weather_data_queue', got '%s'", cfg.RabbitMQ.QueueName)
	}

	if cfg.API.BaseURL != "http://core-api:3000" {
		t.Errorf("Expected BaseURL 'http://core-api:3000', got '%s'", cfg.API.BaseURL)
	}
	if cfg.API.InternalToken != "gdash_v1_secure_8f7d9a2b3c4e5f6" {
		t.Errorf("Expected InternalToken 'gdash_v1_secure_8f7d9a2b3c4e5f6', got '%s'", cfg.API.InternalToken)
	}
	if cfg.API.Timeout != 10*time.Second {
		t.Errorf("Expected Timeout 10s, got %s", cfg.API.Timeout)
	}

	if cfg.Worker.RetryDelay != 5*time.Second {
		t.Errorf("Expected RetryDelay 5s, got %s", cfg.Worker.RetryDelay)
	}
	if cfg.Worker.MaxRetries != 3 {
		t.Errorf("Expected MaxRetries 3, got %d", cfg.Worker.MaxRetries)
	}
	if cfg.Worker.PrefetchCount != 1 {
		t.Errorf("Expected PrefetchCount 1, got %d", cfg.Worker.PrefetchCount)
	}
}

func TestLoad_CustomValues(t *testing.T) {
	os.Setenv("RABBITMQ_HOST", "custom-host")
	os.Setenv("RABBITMQ_USER", "myuser")
	os.Setenv("RABBITMQ_PASS", "mypass")
	os.Setenv("RABBITMQ_PORT", "15672")
	os.Setenv("RABBITMQ_QUEUE", "custom_queue")
	os.Setenv("API_URL", "http://localhost:8080")
	os.Setenv("INTERNAL_API_TOKEN", "custom_token")
	os.Setenv("API_TIMEOUT", "30s")
	os.Setenv("WORKER_RETRY_DELAY", "10s")
	os.Setenv("WORKER_MAX_RETRIES", "5")
	os.Setenv("WORKER_PREFETCH_COUNT", "10")
	defer func() {
		os.Unsetenv("RABBITMQ_HOST")
		os.Unsetenv("RABBITMQ_USER")
		os.Unsetenv("RABBITMQ_PASS")
		os.Unsetenv("RABBITMQ_PORT")
		os.Unsetenv("RABBITMQ_QUEUE")
		os.Unsetenv("API_URL")
		os.Unsetenv("INTERNAL_API_TOKEN")
		os.Unsetenv("API_TIMEOUT")
		os.Unsetenv("WORKER_RETRY_DELAY")
		os.Unsetenv("WORKER_MAX_RETRIES")
		os.Unsetenv("WORKER_PREFETCH_COUNT")
	}()

	cfg := Load()

	if cfg.RabbitMQ.Host != "custom-host" {
		t.Errorf("Expected Host 'custom-host', got '%s'", cfg.RabbitMQ.Host)
	}
	if cfg.RabbitMQ.User != "myuser" {
		t.Errorf("Expected User 'myuser', got '%s'", cfg.RabbitMQ.User)
	}
	if cfg.RabbitMQ.Password != "mypass" {
		t.Errorf("Expected Password 'mypass', got '%s'", cfg.RabbitMQ.Password)
	}
	if cfg.RabbitMQ.Port != 15672 {
		t.Errorf("Expected Port 15672, got %d", cfg.RabbitMQ.Port)
	}
	if cfg.RabbitMQ.QueueName != "custom_queue" {
		t.Errorf("Expected QueueName 'custom_queue', got '%s'", cfg.RabbitMQ.QueueName)
	}

	if cfg.API.BaseURL != "http://localhost:8080" {
		t.Errorf("Expected BaseURL 'http://localhost:8080', got '%s'", cfg.API.BaseURL)
	}
	if cfg.API.InternalToken != "custom_token" {
		t.Errorf("Expected InternalToken 'custom_token', got '%s'", cfg.API.InternalToken)
	}
	if cfg.API.Timeout != 30*time.Second {
		t.Errorf("Expected Timeout 30s, got %s", cfg.API.Timeout)
	}

	if cfg.Worker.RetryDelay != 10*time.Second {
		t.Errorf("Expected RetryDelay 10s, got %s", cfg.Worker.RetryDelay)
	}
	if cfg.Worker.MaxRetries != 5 {
		t.Errorf("Expected MaxRetries 5, got %d", cfg.Worker.MaxRetries)
	}
	if cfg.Worker.PrefetchCount != 10 {
		t.Errorf("Expected PrefetchCount 10, got %d", cfg.Worker.PrefetchCount)
	}
}

func TestLoad_InvalidValues_UsesDefaults(t *testing.T) {
	os.Setenv("RABBITMQ_PORT", "invalid")
	os.Setenv("API_TIMEOUT", "invalid")
	os.Setenv("WORKER_MAX_RETRIES", "invalid")
	defer func() {
		os.Unsetenv("RABBITMQ_PORT")
		os.Unsetenv("API_TIMEOUT")
		os.Unsetenv("WORKER_MAX_RETRIES")
	}()

	cfg := Load()

	if cfg.RabbitMQ.Port != 5672 {
		t.Errorf("Expected Port 5672 (default), got %d", cfg.RabbitMQ.Port)
	}
	if cfg.API.Timeout != 10*time.Second {
		t.Errorf("Expected Timeout 10s (default), got %s", cfg.API.Timeout)
	}
	if cfg.Worker.MaxRetries != 3 {
		t.Errorf("Expected MaxRetries 3 (default), got %d", cfg.Worker.MaxRetries)
	}
}

func TestRabbitMQConfig_ConnectionString(t *testing.T) {
	cfg := RabbitMQConfig{
		Host:     "localhost",
		User:     "admin",
		Password: "secret",
		Port:     5672,
	}

	expected := "amqp://admin:secret@localhost:5672/"
	if got := cfg.ConnectionString(); got != expected {
		t.Errorf("Expected connection string '%s', got '%s'", expected, got)
	}
}

func TestGetEnv(t *testing.T) {
	os.Setenv("TEST_VAR", "test_value")
	defer os.Unsetenv("TEST_VAR")

	if got := getEnv("TEST_VAR", "fallback"); got != "test_value" {
		t.Errorf("Expected 'test_value', got '%s'", got)
	}

	if got := getEnv("NON_EXISTING_VAR", "fallback"); got != "fallback" {
		t.Errorf("Expected 'fallback', got '%s'", got)
	}
}

func TestGetEnvInt(t *testing.T) {
	os.Setenv("TEST_INT", "42")
	defer os.Unsetenv("TEST_INT")

	if got := getEnvInt("TEST_INT", 0); got != 42 {
		t.Errorf("Expected 42, got %d", got)
	}

	os.Setenv("TEST_INVALID_INT", "not_a_number")
	defer os.Unsetenv("TEST_INVALID_INT")

	if got := getEnvInt("TEST_INVALID_INT", 100); got != 100 {
		t.Errorf("Expected 100 (fallback), got %d", got)
	}

	if got := getEnvInt("NON_EXISTING_INT", 99); got != 99 {
		t.Errorf("Expected 99 (fallback), got %d", got)
	}
}

func TestGetEnvDuration(t *testing.T) {
	os.Setenv("TEST_DURATION", "5m30s")
	defer os.Unsetenv("TEST_DURATION")

	expected := 5*time.Minute + 30*time.Second
	if got := getEnvDuration("TEST_DURATION", time.Second); got != expected {
		t.Errorf("Expected %s, got %s", expected, got)
	}

	os.Setenv("TEST_INVALID_DURATION", "invalid")
	defer os.Unsetenv("TEST_INVALID_DURATION")

	if got := getEnvDuration("TEST_INVALID_DURATION", time.Minute); got != time.Minute {
		t.Errorf("Expected 1m (fallback), got %s", got)
	}

	if got := getEnvDuration("NON_EXISTING_DURATION", 2*time.Hour); got != 2*time.Hour {
		t.Errorf("Expected 2h (fallback), got %s", got)
	}
}
