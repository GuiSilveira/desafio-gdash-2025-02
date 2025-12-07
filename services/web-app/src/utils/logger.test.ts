import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StructuredLogger,
  getLogger,
  setDefaultLogger,
  createLogger,
  type LogLevel,
} from './logger';

describe('StructuredLogger', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log level filtering', () => {
    it('should log messages at or above configured level', () => {
      const logger = new StructuredLogger({ level: 'info', json: false, service: 'test' });

      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should filter messages below configured level', () => {
      const logger = new StructuredLogger({ level: 'warn', json: false, service: 'test' });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log debug messages when level is debug', () => {
      const logger = new StructuredLogger({ level: 'debug', json: false, service: 'test' });

      logger.debug('debug message');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });

    it('should only log errors when level is error', () => {
      const logger = new StructuredLogger({ level: 'error', json: false, service: 'test' });

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('JSON output', () => {
    it('should output valid JSON when json mode is enabled', () => {
      const logger = new StructuredLogger({ level: 'info', json: true, service: 'test' });

      logger.info('test message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('test message');
      expect(parsed.level).toBe('info');
      expect(parsed.service).toBe('test');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should include additional data in JSON output', () => {
      const logger = new StructuredLogger({ level: 'info', json: true, service: 'test' });

      logger.info('test message', { userId: 123, action: 'login' });

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.userId).toBe(123);
      expect(parsed.action).toBe('login');
    });
  });

  describe('text output', () => {
    it('should output human-readable text when json mode is disabled', () => {
      const logger = new StructuredLogger({ level: 'info', json: false, service: 'test' });

      logger.info('test message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const output = consoleInfoSpy.mock.calls[0][0] as string;

      expect(output).toContain('[test]');
      expect(output).toContain('test message');
      expect(output).toContain('ℹ️');
    });

    it('should include additional data in text output', () => {
      const logger = new StructuredLogger({ level: 'info', json: false, service: 'test' });

      logger.info('test message', { userId: 123 });

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      expect(output).toContain('userId');
      expect(output).toContain('123');
    });
  });

  describe('withField and withFields', () => {
    it('should create child logger with additional field', () => {
      const logger = new StructuredLogger({ level: 'info', json: true, service: 'test' });
      const childLogger = logger.withField('requestId', 'abc-123');

      childLogger.info('test message');

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.requestId).toBe('abc-123');
    });

    it('should create child logger with multiple fields', () => {
      const logger = new StructuredLogger({ level: 'info', json: true, service: 'test' });
      const childLogger = logger.withFields({ userId: 1, sessionId: 'xyz' });

      childLogger.info('test message');

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.userId).toBe(1);
      expect(parsed.sessionId).toBe('xyz');
    });

    it('should not modify parent logger when creating child', () => {
      const parentLogger = new StructuredLogger({ level: 'info', json: true, service: 'test' });
      const childLogger = parentLogger.withField('childField', 'value');

      parentLogger.info('parent message');

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.childField).toBeUndefined();
    });

    it('should chain field additions', () => {
      const logger = new StructuredLogger({ level: 'info', json: true, service: 'test' });
      const childLogger = logger.withField('a', 1).withField('b', 2).withField('c', 3);

      childLogger.info('test');

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.a).toBe(1);
      expect(parsed.b).toBe(2);
      expect(parsed.c).toBe(3);
    });
  });

  describe('withCorrelationId', () => {
    it('should add correlation ID to logs', () => {
      const logger = new StructuredLogger({ level: 'info', json: true, service: 'test' });
      const correlatedLogger = logger.withCorrelationId('corr-123');

      correlatedLogger.info('test message');

      const output = consoleInfoSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.correlationId).toBe('corr-123');
    });
  });

  describe('logError', () => {
    it('should log error with stack trace', () => {
      const logger = new StructuredLogger({ level: 'error', json: true, service: 'test' });
      const error = new Error('Something went wrong');

      logger.logError(error);

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Something went wrong');
      expect(parsed.errorName).toBe('Error');
      expect(parsed.errorMessage).toBe('Something went wrong');
      expect(parsed.stack).toBeDefined();
    });

    it('should include context in error message', () => {
      const logger = new StructuredLogger({ level: 'error', json: true, service: 'test' });
      const error = new Error('Connection failed');

      logger.logError(error, 'Database operation');

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.message).toBe('Database operation: Connection failed');
    });

    it('should include additional data with error', () => {
      const logger = new StructuredLogger({ level: 'error', json: true, service: 'test' });
      const error = new Error('Not found');

      logger.logError(error, 'User lookup', { userId: 123 });

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.userId).toBe(123);
    });
  });

  describe('module functions', () => {
    it('getLogger should return a logger instance', () => {
      const logger = getLogger();
      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    it('setDefaultLogger should change the default logger', () => {
      const customLogger = new StructuredLogger({ level: 'error', json: true, service: 'custom' });
      setDefaultLogger(customLogger);

      const logger = getLogger();
      expect(logger).toBe(customLogger);
    });

    it('createLogger should create a new logger with config', () => {
      const logger = createLogger({ level: 'warn', json: true, service: 'test-service' });

      logger.info('should not log');
      logger.warn('should log');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('log levels', () => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

    levels.forEach((level) => {
      it(`should use correct console method for ${level}`, () => {
        const logger = new StructuredLogger({ level: 'debug', json: false, service: 'test' });

        logger[level](`${level} message`);

        const spyMap = {
          debug: consoleDebugSpy,
          info: consoleInfoSpy,
          warn: consoleWarnSpy,
          error: consoleErrorSpy,
        };

        expect(spyMap[level]).toHaveBeenCalledTimes(1);
      });
    });
  });
});
