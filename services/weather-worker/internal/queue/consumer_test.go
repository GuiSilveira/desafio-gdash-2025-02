package queue

import (
	"testing"
	"time"

	"weather-worker/internal/config"
)

func TestNewRabbitMQConsumer(t *testing.T) {
	cfg := config.RabbitMQConfig{
		Host:      "localhost",
		User:      "guest",
		Password:  "guest",
		Port:      5672,
		QueueName: "test_queue",
	}

	consumer := NewRabbitMQConsumer(cfg, 10, 5*time.Second)

	if consumer.config.Host != cfg.Host {
		t.Errorf("Expected Host '%s', got '%s'", cfg.Host, consumer.config.Host)
	}
	if consumer.config.User != cfg.User {
		t.Errorf("Expected User '%s', got '%s'", cfg.User, consumer.config.User)
	}
	if consumer.config.Password != cfg.Password {
		t.Errorf("Expected Password '%s', got '%s'", cfg.Password, consumer.config.Password)
	}
	if consumer.config.Port != cfg.Port {
		t.Errorf("Expected Port %d, got %d", cfg.Port, consumer.config.Port)
	}
	if consumer.config.QueueName != cfg.QueueName {
		t.Errorf("Expected QueueName '%s', got '%s'", cfg.QueueName, consumer.config.QueueName)
	}
	if consumer.prefetch != 10 {
		t.Errorf("Expected prefetch 10, got %d", consumer.prefetch)
	}
	if consumer.retryDelay != 5*time.Second {
		t.Errorf("Expected retryDelay 5s, got %s", consumer.retryDelay)
	}
}

func TestRabbitMQConsumer_Close_NilConnection(t *testing.T) {
	consumer := &RabbitMQConsumer{
		conn:    nil,
		channel: nil,
	}

	err := consumer.Close()
	if err != nil {
		t.Errorf("Expected no error when closing nil connection, got %v", err)
	}
}

func TestConsumerInterface(t *testing.T) {
	var _ Consumer = (*RabbitMQConsumer)(nil)
}
