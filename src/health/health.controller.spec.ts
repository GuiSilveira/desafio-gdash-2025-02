import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockMongooseHealthIndicator = {
    pingCheck: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: MongooseHealthIndicator,
          useValue: mockMongooseHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when MongoDB is connected', async () => {
      const healthyResult: HealthCheckResult = {
        status: 'ok',
        info: {
          mongodb: { status: 'up' },
        },
        error: {},
        details: {
          mongodb: { status: 'up' },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(healthyResult);

      const result = await controller.check();

      expect(result).toEqual(healthyResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should return unhealthy status when MongoDB is down', async () => {
      const unhealthyResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          mongodb: { status: 'down', message: 'Connection refused' },
        },
        details: {
          mongodb: { status: 'down', message: 'Connection refused' },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(unhealthyResult);

      const result = await controller.check();

      expect(result).toEqual(unhealthyResult);
    });
  });

  describe('liveness', () => {
    it('should return ok status with timestamp', () => {
      const beforeCall = new Date();

      const result = controller.liveness();

      const afterCall = new Date();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();

      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should return ISO formatted timestamp', () => {
      const result = controller.liveness();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    });
  });

  describe('readiness', () => {
    it('should return ready status when MongoDB is connected', async () => {
      const readyResult: HealthCheckResult = {
        status: 'ok',
        info: {
          mongodb: { status: 'up' },
        },
        error: {},
        details: {
          mongodb: { status: 'up' },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(readyResult);

      const result = await controller.readiness();

      expect(result).toEqual(readyResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should return not ready when MongoDB is down', async () => {
      const notReadyResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          mongodb: { status: 'down' },
        },
        details: {
          mongodb: { status: 'down' },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(notReadyResult);

      const result = await controller.readiness();

      expect(result).toEqual(notReadyResult);
    });
  });
});
