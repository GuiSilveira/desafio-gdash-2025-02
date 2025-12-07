package queue

import (
	"context"
	"fmt"
	"time"

	"weather-worker/internal/config"
	"weather-worker/internal/logger"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Message struct {
	Body     []byte
	delivery amqp.Delivery
}

func (m *Message) Ack() error {
	return m.delivery.Ack(false)
}

func (m *Message) Nack(requeue bool) error {
	return m.delivery.Nack(false, requeue)
}

type Consumer interface {
	Connect(ctx context.Context) error
	Consume(ctx context.Context) (<-chan *Message, error)
	Close() error
}

type RabbitMQConsumer struct {
	config     config.RabbitMQConfig
	prefetch   int
	conn       *amqp.Connection
	channel    *amqp.Channel
	retryDelay time.Duration
}

func NewRabbitMQConsumer(cfg config.RabbitMQConfig, prefetch int, retryDelay time.Duration) *RabbitMQConsumer {
	return &RabbitMQConsumer{
		config:     cfg,
		prefetch:   prefetch,
		retryDelay: retryDelay,
	}
}

func (c *RabbitMQConsumer) Connect(ctx context.Context) error {
	connString := c.config.ConnectionString()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			conn, err := amqp.Dial(connString)
			if err == nil {
				c.conn = conn
				logger.Info("✅ Conectado ao RabbitMQ!")

				ch, err := conn.Channel()
				if err != nil {
					return fmt.Errorf("failed to open channel: %w", err)
				}
				c.channel = ch

				_, err = ch.QueueDeclare(
					c.config.QueueName,
					true,
					false,
					false,
					false,
					nil,
				)
				if err != nil {
					return fmt.Errorf("failed to declare queue: %w", err)
				}

				if err := ch.Qos(c.prefetch, 0, false); err != nil {
					return fmt.Errorf("failed to set QoS: %w", err)
				}

				return nil
			}

			logger.Warn("⚠️ Aguardando RabbitMQ... (%s)", err)
			time.Sleep(c.retryDelay)
		}
	}
}

func (c *RabbitMQConsumer) Consume(ctx context.Context) (<-chan *Message, error) {
	if c.channel == nil {
		return nil, fmt.Errorf("not connected to RabbitMQ")
	}

	deliveries, err := c.channel.Consume(
		c.config.QueueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to register consumer: %w", err)
	}

	messages := make(chan *Message)

	go func() {
		defer close(messages)
		for {
			select {
			case <-ctx.Done():
				return
			case d, ok := <-deliveries:
				if !ok {
					return
				}
				messages <- &Message{
					Body:     d.Body,
					delivery: d,
				}
			}
		}
	}()

	return messages, nil
}

func (c *RabbitMQConsumer) Close() error {
	var errs []error

	if c.channel != nil {
		if err := c.channel.Close(); err != nil {
			errs = append(errs, fmt.Errorf("failed to close channel: %w", err))
		}
	}

	if c.conn != nil {
		if err := c.conn.Close(); err != nil {
			errs = append(errs, fmt.Errorf("failed to close connection: %w", err))
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("errors closing consumer: %v", errs)
	}

	return nil
}
