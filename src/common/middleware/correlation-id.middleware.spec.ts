import { Request, Response, NextFunction } from 'express';
import {
  CorrelationIdMiddleware,
  CORRELATION_ID_HEADER,
} from './correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should generate a new correlation ID when header is not present', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.correlationId).toBeDefined();
    expect(typeof mockRequest.correlationId).toBe('string');
    expect(mockRequest.correlationId?.length).toBeGreaterThan(0);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      mockRequest.correlationId,
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should use existing correlation ID from header', () => {
    const existingId = 'existing-correlation-id-123';
    mockRequest.headers = {
      [CORRELATION_ID_HEADER]: existingId,
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.correlationId).toBe(existingId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      existingId,
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should generate UUID-like format', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    const correlationId = mockRequest.correlationId!;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(correlationId).toMatch(uuidRegex);
  });

  it('should generate unique IDs for different requests', () => {
    const ids: string[] = [];

    for (let i = 0; i < 10; i++) {
      const req: Partial<Request> = { headers: {} };
      const res: Partial<Response> = { setHeader: jest.fn() };

      middleware.use(req as Request, res as Response, nextFunction);
      ids.push(req.correlationId!);
    }

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  it('should always call next function', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
