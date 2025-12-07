package api

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"weather-worker/internal/config"
)

type Client interface {
	SendWeatherData(ctx context.Context, jsonData []byte) error
}

type HTTPClient struct {
	baseURL       string
	internalToken string
	httpClient    *http.Client
}

func NewHTTPClient(cfg config.APIConfig) *HTTPClient {
	return &HTTPClient{
		baseURL:       cfg.BaseURL,
		internalToken: cfg.InternalToken,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

func NewHTTPClientWithTransport(cfg config.APIConfig, transport http.RoundTripper) *HTTPClient {
	return &HTTPClient{
		baseURL:       cfg.BaseURL,
		internalToken: cfg.InternalToken,
		httpClient: &http.Client{
			Timeout:   cfg.Timeout,
			Transport: transport,
		},
	}
}

func (c *HTTPClient) SendWeatherData(ctx context.Context, jsonData []byte) error {
	targetURL := fmt.Sprintf("%s/weather", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-internal-token", c.internalToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	body, _ := io.ReadAll(resp.Body)
	return &APIError{
		StatusCode: resp.StatusCode,
		Body:       string(body),
	}
}

type APIError struct {
	StatusCode int
	Body       string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("API error: status %d, body: %s", e.StatusCode, e.Body)
}

func (e *APIError) IsRetryable() bool {
	return e.StatusCode >= 500
}

type Doer interface {
	Do(req *http.Request) (*http.Response, error)
}

type MockableHTTPClient struct {
	baseURL       string
	internalToken string
	doer          Doer
	timeout       time.Duration
}

func NewMockableHTTPClient(cfg config.APIConfig, doer Doer) *MockableHTTPClient {
	return &MockableHTTPClient{
		baseURL:       cfg.BaseURL,
		internalToken: cfg.InternalToken,
		doer:          doer,
		timeout:       cfg.Timeout,
	}
}

func (c *MockableHTTPClient) SendWeatherData(ctx context.Context, jsonData []byte) error {
	targetURL := fmt.Sprintf("%s/weather", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-internal-token", c.internalToken)

	resp, err := c.doer.Do(req)
	if err != nil {
		return fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	body, _ := io.ReadAll(resp.Body)
	return &APIError{
		StatusCode: resp.StatusCode,
		Body:       string(body),
	}
}
