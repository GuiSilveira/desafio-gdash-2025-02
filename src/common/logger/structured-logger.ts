import { LoggerService, LogLevel } from '@nestjs/common';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  correlationId?: string;
  caller?: string;
  fields?: Record<string, unknown>;
  stack?: string;
}

export interface StructuredLoggerOptions {
  service?: string;
  jsonOutput?: boolean;
  level?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  verbose: 0,
  debug: 1,
  log: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const LEVEL_EMOJIS: Record<LogLevel, string> = {
  verbose: '📝',
  debug: '🔍',
  log: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  fatal: '🔥',
};

export class StructuredLogger implements LoggerService {
  private readonly service: string;
  private readonly jsonOutput: boolean;
  private readonly minLevel: number;
  private correlationId?: string;
  private fields: Record<string, unknown> = {};

  constructor(options: StructuredLoggerOptions = {}) {
    this.service = options.service || 'core-api';
    this.jsonOutput = options.jsonOutput ?? true;
    this.minLevel = LOG_LEVELS[options.level || 'log'];
  }

  withCorrelationId(correlationId: string): StructuredLogger {
    const child = new StructuredLogger({
      service: this.service,
      jsonOutput: this.jsonOutput,
    });
    child.correlationId = correlationId;
    child.fields = { ...this.fields };
    return child;
  }

  withField(key: string, value: unknown): StructuredLogger {
    const child = new StructuredLogger({
      service: this.service,
      jsonOutput: this.jsonOutput,
    });
    child.correlationId = this.correlationId;
    child.fields = { ...this.fields, [key]: value };
    return child;
  }

  withFields(fields: Record<string, unknown>): StructuredLogger {
    const child = new StructuredLogger({
      service: this.service,
      jsonOutput: this.jsonOutput,
    });
    child.correlationId = this.correlationId;
    child.fields = { ...this.fields, ...fields };
    return child;
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.writeLog('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.writeLog('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.writeLog('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.writeLog('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.writeLog('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.writeLog('fatal', message, optionalParams);
  }

  private writeLog(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    if (LOG_LEVELS[level] < this.minLevel) {
      return;
    }

    let context: string | undefined;
    let stack: string | undefined;
    const extraFields: Record<string, unknown> = {};

    for (const param of optionalParams) {
      if (typeof param === 'string') {
        context = param;
      } else if (param instanceof Error) {
        stack = param.stack;
        extraFields.errorName = param.name;
        extraFields.errorMessage = param.message;
      } else if (typeof param === 'object' && param !== null) {
        Object.assign(extraFields, param);
      }
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: String(message),
      service: this.service,
    };

    if (this.correlationId) {
      entry.correlationId = this.correlationId;
    }

    if (context) {
      entry.caller = context;
    }

    const allFields = { ...this.fields, ...extraFields };
    if (Object.keys(allFields).length > 0) {
      entry.fields = allFields;
    }

    if (stack) {
      entry.stack = stack;
    }

    if (this.jsonOutput) {
      this.writeJSON(entry);
    } else {
      this.writeText(level, entry);
    }
  }

  private writeJSON(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  private writeText(level: LogLevel, entry: LogEntry): void {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const emoji = LEVEL_EMOJIS[level] || '❓';
    const corrId = entry.correlationId ? ` [${entry.correlationId}]` : '';
    const context = entry.caller ? ` [${entry.caller}]` : '';
    const fields =
      entry.fields && Object.keys(entry.fields).length > 0
        ? ` ${JSON.stringify(entry.fields)}`
        : '';

    const output = `${timestamp} ${emoji} [${entry.level}]${corrId}${context} ${entry.message}${fields}`;

    if (entry.stack) {
      console.log(`${output}\n${entry.stack}`);
    } else {
      console.log(output);
    }
  }
}

let defaultLogger: StructuredLogger | null = null;

export function getLogger(options?: StructuredLoggerOptions): StructuredLogger {
  if (!defaultLogger) {
    defaultLogger = new StructuredLogger(options);
  }
  return defaultLogger;
}

export function setDefaultLogger(logger: StructuredLogger): void {
  defaultLogger = logger;
}

export function createLoggerFromEnv(): StructuredLogger {
  const level = (process.env.LOG_LEVEL || 'log') as LogLevel;
  const jsonOutput = process.env.LOG_JSON !== 'false';
  const service = process.env.SERVICE_NAME || 'core-api';

  return new StructuredLogger({
    service,
    jsonOutput,
    level,
  });
}
