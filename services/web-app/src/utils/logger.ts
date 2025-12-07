export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  json: boolean;
  service: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_EMOJI: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

function parseLogLevel(level: string | undefined): LogLevel {
  const normalized = level?.toLowerCase();
  if (
    normalized === 'debug' ||
    normalized === 'info' ||
    normalized === 'warn' ||
    normalized === 'error'
  ) {
    return normalized;
  }
  return 'info';
}

function getConfigFromEnv(): LoggerConfig {
  return {
    level: parseLogLevel(import.meta.env.VITE_LOG_LEVEL),
    json: import.meta.env.VITE_LOG_JSON === 'true',
    service: import.meta.env.VITE_SERVICE_NAME || 'web-app',
  };
}

export class StructuredLogger {
  private config: LoggerConfig;
  private fields: Record<string, unknown>;

  constructor(config?: Partial<LoggerConfig>, fields?: Record<string, unknown>) {
    const envConfig = getConfigFromEnv();
    this.config = {
      level: config?.level ?? envConfig.level,
      json: config?.json ?? envConfig.json,
      service: config?.service ?? envConfig.service,
    };
    this.fields = fields ?? {};
  }

  withField(key: string, value: unknown): StructuredLogger {
    return new StructuredLogger(this.config, {
      ...this.fields,
      [key]: value,
    });
  }

  withFields(fields: Record<string, unknown>): StructuredLogger {
    return new StructuredLogger(this.config, {
      ...this.fields,
      ...fields,
    });
  }

  withCorrelationId(correlationId: string): StructuredLogger {
    return this.withField('correlationId', correlationId);
  }

  private isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.level];
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.config.service,
      ...this.fields,
      ...data,
    };

    if (this.config.json) {
      this.outputJson(level, entry);
    } else {
      this.outputText(level, entry);
    }
  }

  private outputJson(level: LogLevel, entry: LogEntry): void {
    const output = JSON.stringify(entry);
    this.consoleOutput(level, output);
  }

  private outputText(level: LogLevel, entry: LogEntry): void {
    const { timestamp, level: lvl, message, service, ...rest } = entry;
    const emoji = LOG_LEVEL_EMOJI[lvl];
    const fields = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    const output = `${timestamp} ${emoji} [${service}] ${message}${fields}`;
    this.consoleOutput(level, output);
  }

  private consoleOutput(level: LogLevel, output: string): void {
    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  logError(error: Error, context?: string, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      ...data,
    };

    const message = context ? `${context}: ${error.message}` : error.message;
    this.error(message, errorData);
  }
}

let defaultLogger: StructuredLogger | null = null;

export function getLogger(): StructuredLogger {
  if (!defaultLogger) {
    defaultLogger = new StructuredLogger();
  }
  return defaultLogger;
}

export function setDefaultLogger(logger: StructuredLogger): void {
  defaultLogger = logger;
}

export function createLogger(config?: Partial<LoggerConfig>): StructuredLogger {
  return new StructuredLogger(config);
}
