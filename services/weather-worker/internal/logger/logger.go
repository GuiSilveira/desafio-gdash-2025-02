package logger

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"
)

type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
)

func (l Level) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

func (l Level) Emoji() string {
	switch l {
	case DEBUG:
		return "🔍"
	case INFO:
		return "ℹ️"
	case WARN:
		return "⚠️"
	case ERROR:
		return "❌"
	default:
		return "❓"
	}
}

func ParseLevel(s string) Level {
	switch strings.ToUpper(s) {
	case "DEBUG":
		return DEBUG
	case "INFO":
		return INFO
	case "WARN", "WARNING":
		return WARN
	case "ERROR":
		return ERROR
	default:
		return INFO
	}
}

type LogEntry struct {
	Timestamp     string                 `json:"timestamp"`
	Level         string                 `json:"level"`
	Message       string                 `json:"message"`
	Service       string                 `json:"service,omitempty"`
	CorrelationID string                 `json:"correlation_id,omitempty"`
	Caller        string                 `json:"caller,omitempty"`
	Fields        map[string]interface{} `json:"fields,omitempty"`
}

type Logger struct {
	mu            sync.Mutex
	output        io.Writer
	level         Level
	service       string
	jsonOutput    bool
	correlationID string
	fields        map[string]interface{}
}

type Config struct {
	Level         string
	Service       string
	JSONOutput    bool
	Output        io.Writer
	CorrelationID string
}

func DefaultConfig() Config {
	return Config{
		Level:      "INFO",
		Service:    "weather-worker",
		JSONOutput: true,
		Output:     os.Stdout,
	}
}

func New(cfg Config) *Logger {
	if cfg.Output == nil {
		cfg.Output = os.Stdout
	}
	if cfg.Service == "" {
		cfg.Service = "weather-worker"
	}

	return &Logger{
		output:        cfg.Output,
		level:         ParseLevel(cfg.Level),
		service:       cfg.Service,
		jsonOutput:    cfg.JSONOutput,
		correlationID: cfg.CorrelationID,
		fields:        make(map[string]interface{}),
	}
}

func (l *Logger) WithCorrelationID(id string) *Logger {
	return &Logger{
		output:        l.output,
		level:         l.level,
		service:       l.service,
		jsonOutput:    l.jsonOutput,
		correlationID: id,
		fields:        copyFields(l.fields),
	}
}

func (l *Logger) WithField(key string, value interface{}) *Logger {
	newFields := copyFields(l.fields)
	newFields[key] = value

	return &Logger{
		output:        l.output,
		level:         l.level,
		service:       l.service,
		jsonOutput:    l.jsonOutput,
		correlationID: l.correlationID,
		fields:        newFields,
	}
}

func (l *Logger) WithFields(fields map[string]interface{}) *Logger {
	newFields := copyFields(l.fields)
	for k, v := range fields {
		newFields[k] = v
	}

	return &Logger{
		output:        l.output,
		level:         l.level,
		service:       l.service,
		jsonOutput:    l.jsonOutput,
		correlationID: l.correlationID,
		fields:        newFields,
	}
}

func (l *Logger) Debug(msg string, args ...interface{}) {
	l.log(DEBUG, msg, args...)
}

func (l *Logger) Info(msg string, args ...interface{}) {
	l.log(INFO, msg, args...)
}

func (l *Logger) Warn(msg string, args ...interface{}) {
	l.log(WARN, msg, args...)
}

func (l *Logger) Error(msg string, args ...interface{}) {
	l.log(ERROR, msg, args...)
}

func (l *Logger) log(level Level, msg string, args ...interface{}) {
	if level < l.level {
		return
	}

	if len(args) > 0 {
		msg = fmt.Sprintf(msg, args...)
	}

	_, file, line, ok := runtime.Caller(2)
	caller := ""
	if ok {
		parts := strings.Split(file, "/")
		if len(parts) > 0 {
			caller = fmt.Sprintf("%s:%d", parts[len(parts)-1], line)
		}
	}

	entry := LogEntry{
		Timestamp:     time.Now().UTC().Format(time.RFC3339Nano),
		Level:         level.String(),
		Message:       msg,
		Service:       l.service,
		CorrelationID: l.correlationID,
		Caller:        caller,
		Fields:        l.fields,
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	if l.jsonOutput {
		l.writeJSON(entry)
	} else {
		l.writeText(level, entry)
	}
}

func (l *Logger) writeJSON(entry LogEntry) {
	if entry.CorrelationID == "" {
		entry.CorrelationID = ""
	}
	if len(entry.Fields) == 0 {
		entry.Fields = nil
	}

	data, err := json.Marshal(entry)
	if err != nil {
		fmt.Fprintf(l.output, `{"level":"ERROR","message":"failed to marshal log entry: %s"}`+"\n", err)
		return
	}
	fmt.Fprintln(l.output, string(data))
}

func (l *Logger) writeText(level Level, entry LogEntry) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	corrID := ""
	if entry.CorrelationID != "" {
		corrID = fmt.Sprintf(" [%s]", entry.CorrelationID)
	}

	fields := ""
	if len(entry.Fields) > 0 {
		data, _ := json.Marshal(entry.Fields)
		fields = fmt.Sprintf(" %s", string(data))
	}

	fmt.Fprintf(l.output, "%s %s [%s]%s %s%s\n",
		timestamp,
		level.Emoji(),
		level.String(),
		corrID,
		entry.Message,
		fields,
	)
}

func copyFields(src map[string]interface{}) map[string]interface{} {
	if src == nil {
		return make(map[string]interface{})
	}
	dst := make(map[string]interface{}, len(src))
	for k, v := range src {
		dst[k] = v
	}
	return dst
}

var defaultLogger *Logger
var defaultOnce sync.Once

func SetDefault(l *Logger) {
	defaultLogger = l
}

func Default() *Logger {
	defaultOnce.Do(func() {
		if defaultLogger == nil {
			defaultLogger = New(DefaultConfig())
		}
	})
	return defaultLogger
}

func Debug(msg string, args ...interface{}) {
	Default().Debug(msg, args...)
}

func Info(msg string, args ...interface{}) {
	Default().Info(msg, args...)
}

func Warn(msg string, args ...interface{}) {
	Default().Warn(msg, args...)
}

func Error(msg string, args ...interface{}) {
	Default().Error(msg, args...)
}
