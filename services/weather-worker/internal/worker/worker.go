package worker

import (
	"context"
	"time"

	"weather-worker/internal/api"
	"weather-worker/internal/logger"
	"weather-worker/internal/queue"
)

type Worker struct {
	consumer   queue.Consumer
	apiClient  api.Client
	retryDelay time.Duration
	maxRetries int
	log        *logger.Logger
}

type Config struct {
	RetryDelay time.Duration
	MaxRetries int
}

func New(consumer queue.Consumer, apiClient api.Client, cfg Config, log *logger.Logger) *Worker {
	return &Worker{
		consumer:   consumer,
		apiClient:  apiClient,
		retryDelay: cfg.RetryDelay,
		maxRetries: cfg.MaxRetries,
		log:        log,
	}
}

func (w *Worker) Run(ctx context.Context) error {
	w.log.Info("🐹 Iniciando Worker Go...")

	if err := w.consumer.Connect(ctx); err != nil {
		return err
	}
	defer w.consumer.Close()

	messages, err := w.consumer.Consume(ctx)
	if err != nil {
		return err
	}

	w.log.Info(" [*] Aguardando mensagens...")

	for {
		select {
		case <-ctx.Done():
			w.log.Info("🛑 Encerrando worker...")
			return ctx.Err()
		case msg, ok := <-messages:
			if !ok {
				w.log.Warn("⚠️ Canal de mensagens fechado")
				return nil
			}
			w.processMessage(ctx, msg)
		}
	}
}

func (w *Worker) processMessage(ctx context.Context, msg *queue.Message) {
	msgLog := w.log.WithField("message_preview", truncate(string(msg.Body), 100))
	msgLog.Debug("📥 Processando mensagem")

	err := w.apiClient.SendWeatherData(ctx, msg.Body)
	if err == nil {
		if ackErr := msg.Ack(); ackErr != nil {
			msgLog.Error("❌ Erro ao confirmar mensagem: %s", ackErr)
			return
		}
		msgLog.Info("✅ Sucesso! Mensagem confirmada")
		return
	}

	msgLog.Error("❌ Falha ao enviar para API: %s", err)

	if apiErr, ok := err.(*api.APIError); ok && !apiErr.IsRetryable() {
		msgLog.WithField("status_code", apiErr.StatusCode).Warn("⚠️ Erro não recuperável. Removendo mensagem")
		if ackErr := msg.Ack(); ackErr != nil {
			msgLog.Error("❌ Erro ao confirmar mensagem: %s", ackErr)
		}
		return
	}

	msgLog.WithField("retry_delay", w.retryDelay.String()).Info("🔄 Devolvendo para fila...")
	time.Sleep(w.retryDelay)
	if nackErr := msg.Nack(true); nackErr != nil {
		msgLog.Error("❌ Erro ao devolver mensagem: %s", nackErr)
	}
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
