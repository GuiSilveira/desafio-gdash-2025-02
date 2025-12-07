package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	RabbitMQ RabbitMQConfig
	API      APIConfig
	Worker   WorkerConfig
	Logger   LoggerConfig
}

type LoggerConfig struct {
	Level      string
	JSONOutput bool
	Service    string
}

type RabbitMQConfig struct {
	Host      string
	User      string
	Password  string
	Port      int
	QueueName string
}

func (c RabbitMQConfig) ConnectionString() string {
	return fmt.Sprintf("amqp://%s:%s@%s:%d/", c.User, c.Password, c.Host, c.Port)
}

type APIConfig struct {
	BaseURL       string
	InternalToken string
	Timeout       time.Duration
}

type WorkerConfig struct {
	RetryDelay    time.Duration
	MaxRetries    int
	PrefetchCount int
}

func Load() *Config {
	return &Config{
		RabbitMQ: RabbitMQConfig{
			Host:      getEnv("RABBITMQ_HOST", "rabbitmq"),
			User:      getEnv("RABBITMQ_USER", "guest"),
			Password:  getEnv("RABBITMQ_PASS", "guest"),
			Port:      getEnvInt("RABBITMQ_PORT", 5672),
			QueueName: getEnv("RABBITMQ_QUEUE", "weather_data_queue"),
		},
		API: APIConfig{
			BaseURL:       getEnv("API_URL", "http://core-api:3000"),
			InternalToken: getEnv("INTERNAL_API_TOKEN", "gdash_v1_secure_8f7d9a2b3c4e5f6"),
			Timeout:       getEnvDuration("API_TIMEOUT", 10*time.Second),
		},
		Worker: WorkerConfig{
			RetryDelay:    getEnvDuration("WORKER_RETRY_DELAY", 5*time.Second),
			MaxRetries:    getEnvInt("WORKER_MAX_RETRIES", 3),
			PrefetchCount: getEnvInt("WORKER_PREFETCH_COUNT", 1),
		},
		Logger: LoggerConfig{
			Level:      getEnv("LOG_LEVEL", "INFO"),
			JSONOutput: getEnvBool("LOG_JSON", true),
			Service:    getEnv("SERVICE_NAME", "weather-worker"),
		},
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	if value, ok := os.LookupEnv(key); ok {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if value, ok := os.LookupEnv(key); ok {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return fallback
}
