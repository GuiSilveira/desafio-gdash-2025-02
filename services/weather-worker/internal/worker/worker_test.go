package worker

import (
	"bytes"
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"weather-worker/internal/api"
	"weather-worker/internal/logger"
	"weather-worker/internal/queue"
)

func testLogger() *logger.Logger {
	return logger.New(logger.Config{
		Level:      "DEBUG",
		Service:    "test-worker",
		JSONOutput: true,
		Output:     &bytes.Buffer{},
	})
}

type MockConsumer struct {
	ConnectFunc func(ctx context.Context) error
	ConsumeFunc func(ctx context.Context) (<-chan *queue.Message, error)
	CloseFunc   func() error
}

func (m *MockConsumer) Connect(ctx context.Context) error {
	if m.ConnectFunc != nil {
		return m.ConnectFunc(ctx)
	}
	return nil
}

func (m *MockConsumer) Consume(ctx context.Context) (<-chan *queue.Message, error) {
	if m.ConsumeFunc != nil {
		return m.ConsumeFunc(ctx)
	}
	return make(chan *queue.Message), nil
}

func (m *MockConsumer) Close() error {
	if m.CloseFunc != nil {
		return m.CloseFunc()
	}
	return nil
}

type MockAPIClient struct {
	SendWeatherDataFunc func(ctx context.Context, jsonData []byte) error
}

func (m *MockAPIClient) SendWeatherData(ctx context.Context, jsonData []byte) error {
	if m.SendWeatherDataFunc != nil {
		return m.SendWeatherDataFunc(ctx, jsonData)
	}
	return nil
}

type MockMessage struct {
	Body    []byte
	AckErr  error
	NackErr error
	acked   bool
	nacked  bool
	requeue bool
	mu      sync.Mutex
}

func (m *MockMessage) Ack() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.acked = true
	return m.AckErr
}

func (m *MockMessage) Nack(requeue bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.nacked = true
	m.requeue = requeue
	return m.NackErr
}

func (m *MockMessage) WasAcked() bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.acked
}

func (m *MockMessage) WasNacked() bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.nacked
}

func TestNew(t *testing.T) {
	consumer := &MockConsumer{}
	apiClient := &MockAPIClient{}
	cfg := Config{
		RetryDelay: 5 * time.Second,
		MaxRetries: 3,
	}
	log := testLogger()

	w := New(consumer, apiClient, cfg, log)

	if w.consumer != consumer {
		t.Error("Expected consumer to be set")
	}
	if w.apiClient != apiClient {
		t.Error("Expected apiClient to be set")
	}
	if w.retryDelay != cfg.RetryDelay {
		t.Errorf("Expected retryDelay %s, got %s", cfg.RetryDelay, w.retryDelay)
	}
	if w.maxRetries != cfg.MaxRetries {
		t.Errorf("Expected maxRetries %d, got %d", cfg.MaxRetries, w.maxRetries)
	}
}

func TestWorker_Run_ConnectError(t *testing.T) {
	expectedErr := errors.New("connection failed")
	consumer := &MockConsumer{
		ConnectFunc: func(ctx context.Context) error {
			return expectedErr
		},
	}
	apiClient := &MockAPIClient{}
	cfg := Config{RetryDelay: time.Millisecond, MaxRetries: 1}

	w := New(consumer, apiClient, cfg, testLogger())
	err := w.Run(context.Background())

	if err != expectedErr {
		t.Errorf("Expected error '%v', got '%v'", expectedErr, err)
	}
}

func TestWorker_Run_ConsumeError(t *testing.T) {
	expectedErr := errors.New("consume failed")
	consumer := &MockConsumer{
		ConsumeFunc: func(ctx context.Context) (<-chan *queue.Message, error) {
			return nil, expectedErr
		},
	}
	apiClient := &MockAPIClient{}
	cfg := Config{RetryDelay: time.Millisecond, MaxRetries: 1}

	w := New(consumer, apiClient, cfg, testLogger())
	err := w.Run(context.Background())

	if err != expectedErr {
		t.Errorf("Expected error '%v', got '%v'", expectedErr, err)
	}
}

func TestWorker_Run_ContextCancelled(t *testing.T) {
	consumer := &MockConsumer{
		ConsumeFunc: func(ctx context.Context) (<-chan *queue.Message, error) {
			return make(chan *queue.Message), nil
		},
	}
	apiClient := &MockAPIClient{}
	cfg := Config{RetryDelay: time.Millisecond, MaxRetries: 1}

	w := New(consumer, apiClient, cfg, testLogger())

	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		time.Sleep(10 * time.Millisecond)
		cancel()
	}()

	err := w.Run(ctx)

	if err != context.Canceled {
		t.Errorf("Expected context.Canceled, got '%v'", err)
	}
}

func TestWorker_Run_ChannelClosed(t *testing.T) {
	msgChan := make(chan *queue.Message)
	consumer := &MockConsumer{
		ConsumeFunc: func(ctx context.Context) (<-chan *queue.Message, error) {
			return msgChan, nil
		},
	}
	apiClient := &MockAPIClient{}
	cfg := Config{RetryDelay: time.Millisecond, MaxRetries: 1}

	w := New(consumer, apiClient, cfg, testLogger())

	go func() {
		time.Sleep(10 * time.Millisecond)
		close(msgChan)
	}()

	err := w.Run(context.Background())

	if err != nil {
		t.Errorf("Expected nil error when channel closes, got '%v'", err)
	}
}

func TestTruncate(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		max      int
		expected string
	}{
		{"Short string", "hello", 10, "hello"},
		{"Exact length", "hello", 5, "hello"},
		{"Long string", "hello world", 5, "hello..."},
		{"Empty string", "", 5, ""},
		{"Zero max", "hello", 0, "..."},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := truncate(tc.input, tc.max)
			if result != tc.expected {
				t.Errorf("Expected '%s', got '%s'", tc.expected, result)
			}
		})
	}
}

func TestInterfaces(t *testing.T) {
	var _ queue.Consumer = (*MockConsumer)(nil)
	var _ api.Client = (*MockAPIClient)(nil)
}

func TestWorker_ProcessMessage_Success(t *testing.T) {
	msgChan := make(chan *queue.Message, 1)
	consumer := &MockConsumer{
		ConsumeFunc: func(ctx context.Context) (<-chan *queue.Message, error) {
			return msgChan, nil
		},
	}

	var receivedData []byte
	apiClient := &MockAPIClient{
		SendWeatherDataFunc: func(ctx context.Context, jsonData []byte) error {
			receivedData = jsonData
			return nil
		},
	}

	cfg := Config{RetryDelay: time.Millisecond, MaxRetries: 1}
	w := New(consumer, apiClient, cfg, testLogger())

	ctx, cancel := context.WithCancel(context.Background())

	testData := []byte(`{"location": "test"}`)

	done := make(chan error, 1)
	go func() {
		done <- w.Run(ctx)
	}()

	msgChan <- &queue.Message{Body: testData}
	time.Sleep(50 * time.Millisecond)

	cancel()
	<-done

	if string(receivedData) != string(testData) {
		t.Errorf("Expected data '%s', got '%s'", testData, receivedData)
	}
}
