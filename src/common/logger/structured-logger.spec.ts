import { StructuredLogger } from './structured-logger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('JSON output', () => {
    beforeEach(() => {
      logger = new StructuredLogger({
        service: 'test-service',
        jsonOutput: true,
      });
    });

    it('should log a message in JSON format', () => {
      logger.log('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.level).toBe('LOG');
      expect(output.message).toBe('Test message');
      expect(output.service).toBe('test-service');
      expect(output.timestamp).toBeDefined();
    });

    it('should include context as caller', () => {
      logger.log('Test message', 'TestContext');

      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.caller).toBe('TestContext');
    });

    it('should log errors with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.level).toBe('ERROR');
      expect(output.stack).toContain('Error: Test error');
      expect(output.fields?.errorName).toBe('Error');
      expect(output.fields?.errorMessage).toBe('Test error');
    });

    it('should log with correlation ID', () => {
      const childLogger = logger.withCorrelationId('abc-123');
      childLogger.log('Message with correlation');

      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.correlationId).toBe('abc-123');
    });

    it('should log with additional field', () => {
      const childLogger = logger.withField('userId', 42);
      childLogger.log('Message with field');

      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.fields?.userId).toBe(42);
    });

    it('should log with multiple fields', () => {
      const childLogger = logger.withFields({
        queue: 'weather_data',
        retries: 3,
      });
      childLogger.log('Message with fields');

      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.fields?.queue).toBe('weather_data');
      expect(output.fields?.retries).toBe(3);
    });

    it('should be immutable when creating child loggers', () => {
      const child1 = logger.withCorrelationId('corr-1');
      const child2 = child1.withField('key', 'value');

      logger.log('Parent message');
      const parentOutput = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(parentOutput.correlationId).toBeUndefined();

      child1.log('Child1 message');
      const child1Output = JSON.parse(consoleSpy.mock.calls[1][0]);
      expect(child1Output.correlationId).toBe('corr-1');
      expect(child1Output.fields?.key).toBeUndefined();

      child2.log('Child2 message');
      const child2Output = JSON.parse(consoleSpy.mock.calls[2][0]);
      expect(child2Output.correlationId).toBe('corr-1');
      expect(child2Output.fields?.key).toBe('value');
    });
  });

  describe('text output', () => {
    beforeEach(() => {
      logger = new StructuredLogger({
        service: 'test-service',
        jsonOutput: false,
      });
    });

    it('should log in human-readable format', () => {
      logger.log('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      expect(output).toContain('[LOG]');
      expect(output).toContain('Test message');
      expect(output).toContain('ℹ️');
    });

    it('should include correlation ID in text format', () => {
      const childLogger = logger.withCorrelationId('xyz-789');
      childLogger.warn('Warning message');

      const output = consoleSpy.mock.calls[0][0];

      expect(output).toContain('[xyz-789]');
      expect(output).toContain('⚠️');
    });
  });

  describe('log levels', () => {
    it('should call all log level methods', () => {
      logger = new StructuredLogger({
        service: 'test-service',
        jsonOutput: true,
        level: 'verbose',
      });

      logger.verbose('Verbose message');
      logger.debug('Debug message');
      logger.log('Log message');
      logger.warn('Warn message');
      logger.error('Error message');
      logger.fatal('Fatal message');

      expect(consoleSpy).toHaveBeenCalledTimes(6);

      const levels = consoleSpy.mock.calls.map(
        (call) => JSON.parse(call[0]).level,
      );
      expect(levels).toEqual([
        'VERBOSE',
        'DEBUG',
        'LOG',
        'WARN',
        'ERROR',
        'FATAL',
      ]);
    });

    it('should filter logs below minimum level', () => {
      logger = new StructuredLogger({
        service: 'test-service',
        jsonOutput: true,
        level: 'warn',
      });

      logger.verbose('Verbose');
      logger.debug('Debug');
      logger.log('Log');
      logger.warn('Warn');
      logger.error('Error');

      expect(consoleSpy).toHaveBeenCalledTimes(2); // Only warn and error
    });
  });

  describe('object params', () => {
    beforeEach(() => {
      logger = new StructuredLogger({
        service: 'test-service',
        jsonOutput: true,
      });
    });

    it('should include object params as fields', () => {
      logger.log('Message', { requestId: 'req-123', duration: 42 });

      const output = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(output.fields?.requestId).toBe('req-123');
      expect(output.fields?.duration).toBe(42);
    });
  });
});
