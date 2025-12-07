package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"weather-worker/internal/api"
	"weather-worker/internal/config"
	"weather-worker/internal/logger"
	"weather-worker/internal/queue"
	"weather-worker/internal/worker"
)

func main() {
	cfg := config.Load()

	log := logger.New(logger.Config{
		Level:      cfg.Logger.Level,
		Service:    cfg.Logger.Service,
		JSONOutput: cfg.Logger.JSONOutput,
	})
	logger.SetDefault(log)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go handleShutdown(cancel, log)

	consumer := queue.NewRabbitMQConsumer(
		cfg.RabbitMQ,
		cfg.Worker.PrefetchCount,
		cfg.Worker.RetryDelay,
	)

	apiClient := api.NewHTTPClient(cfg.API)

	w := worker.New(consumer, apiClient, worker.Config{
		RetryDelay: cfg.Worker.RetryDelay,
		MaxRetries: cfg.Worker.MaxRetries,
	}, log)

	if err := w.Run(ctx); err != nil {
		if err == context.Canceled {
			log.Info("✅ Worker encerrado com sucesso")
			return
		}
		log.Error("❌ Worker falhou: %s", err)
		os.Exit(1)
	}
}

func handleShutdown(cancel context.CancelFunc, log *logger.Logger) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	sig := <-sigChan
	log.Warn("📛 Recebido sinal %s. Encerrando...", sig)
	cancel()
}
