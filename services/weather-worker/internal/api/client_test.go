package api

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"weather-worker/internal/config"
)

type MockDoer struct {
	DoFunc func(req *http.Request) (*http.Response, error)
}

func (m *MockDoer) Do(req *http.Request) (*http.Response, error) {
	return m.DoFunc(req)
}

func TestNewHTTPClient(t *testing.T) {
	cfg := config.APIConfig{
		BaseURL:       "http://localhost:3000",
		InternalToken: "test_token",
		Timeout:       5 * time.Second,
	}

	client := NewHTTPClient(cfg)

	if client.baseURL != cfg.BaseURL {
		t.Errorf("Expected baseURL '%s', got '%s'", cfg.BaseURL, client.baseURL)
	}
	if client.internalToken != cfg.InternalToken {
		t.Errorf("Expected internalToken '%s', got '%s'", cfg.InternalToken, client.internalToken)
	}
	if client.httpClient == nil {
		t.Error("Expected httpClient to be initialized")
	}
}

func TestMockableHTTPClient_SendWeatherData_Success(t *testing.T) {
	mockDoer := &MockDoer{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			if req.Method != http.MethodPost {
				t.Errorf("Expected POST method, got %s", req.Method)
			}
			if req.URL.String() != "http://localhost:3000/weather" {
				t.Errorf("Expected URL 'http://localhost:3000/weather', got '%s'", req.URL.String())
			}
			if req.Header.Get("Content-Type") != "application/json" {
				t.Errorf("Expected Content-Type 'application/json', got '%s'", req.Header.Get("Content-Type"))
			}
			if req.Header.Get("x-internal-token") != "test_token" {
				t.Errorf("Expected x-internal-token 'test_token', got '%s'", req.Header.Get("x-internal-token"))
			}

			return &http.Response{
				StatusCode: http.StatusCreated,
				Body:       io.NopCloser(strings.NewReader(`{"id": "123"}`)),
			}, nil
		},
	}

	cfg := config.APIConfig{
		BaseURL:       "http://localhost:3000",
		InternalToken: "test_token",
		Timeout:       5 * time.Second,
	}

	client := NewMockableHTTPClient(cfg, mockDoer)
	err := client.SendWeatherData(context.Background(), []byte(`{"location": "test"}`))

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}

func TestMockableHTTPClient_SendWeatherData_ClientError(t *testing.T) {
	mockDoer := &MockDoer{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusBadRequest,
				Body:       io.NopCloser(strings.NewReader(`{"error": "invalid data"}`)),
			}, nil
		},
	}

	cfg := config.APIConfig{
		BaseURL:       "http://localhost:3000",
		InternalToken: "test_token",
		Timeout:       5 * time.Second,
	}

	client := NewMockableHTTPClient(cfg, mockDoer)
	err := client.SendWeatherData(context.Background(), []byte(`{"invalid": "data"}`))

	if err == nil {
		t.Error("Expected error, got nil")
	}

	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("Expected APIError, got %T", err)
	}

	if apiErr.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", apiErr.StatusCode)
	}

	if !strings.Contains(apiErr.Body, "invalid data") {
		t.Errorf("Expected body to contain 'invalid data', got '%s'", apiErr.Body)
	}
}

func TestMockableHTTPClient_SendWeatherData_ServerError(t *testing.T) {
	mockDoer := &MockDoer{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(strings.NewReader(`{"error": "server error"}`)),
			}, nil
		},
	}

	cfg := config.APIConfig{
		BaseURL:       "http://localhost:3000",
		InternalToken: "test_token",
		Timeout:       5 * time.Second,
	}

	client := NewMockableHTTPClient(cfg, mockDoer)
	err := client.SendWeatherData(context.Background(), []byte(`{"location": "test"}`))

	if err == nil {
		t.Error("Expected error, got nil")
	}

	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("Expected APIError, got %T", err)
	}

	if apiErr.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status 500, got %d", apiErr.StatusCode)
	}
}

func TestAPIError_Error(t *testing.T) {
	err := &APIError{
		StatusCode: 404,
		Body:       "Not Found",
	}

	expected := "API error: status 404, body: Not Found"
	if got := err.Error(); got != expected {
		t.Errorf("Expected '%s', got '%s'", expected, got)
	}
}

func TestAPIError_IsRetryable(t *testing.T) {
	testCases := []struct {
		name       string
		statusCode int
		expected   bool
	}{
		{"400 Bad Request", 400, false},
		{"401 Unauthorized", 401, false},
		{"403 Forbidden", 403, false},
		{"404 Not Found", 404, false},
		{"422 Unprocessable Entity", 422, false},
		{"500 Internal Server Error", 500, true},
		{"502 Bad Gateway", 502, true},
		{"503 Service Unavailable", 503, true},
		{"504 Gateway Timeout", 504, true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := &APIError{StatusCode: tc.statusCode}
			if got := err.IsRetryable(); got != tc.expected {
				t.Errorf("Expected IsRetryable() = %v for status %d, got %v", tc.expected, tc.statusCode, got)
			}
		})
	}
}

func TestNewHTTPClientWithTransport(t *testing.T) {
	cfg := config.APIConfig{
		BaseURL:       "http://localhost:3000",
		InternalToken: "test_token",
		Timeout:       5 * time.Second,
	}

	customTransport := &http.Transport{}
	client := NewHTTPClientWithTransport(cfg, customTransport)

	if client.baseURL != cfg.BaseURL {
		t.Errorf("Expected baseURL '%s', got '%s'", cfg.BaseURL, client.baseURL)
	}
	if client.httpClient.Transport != customTransport {
		t.Error("Expected custom transport to be set")
	}
}
