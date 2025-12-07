import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherService } from './weather.service';
import { WeatherLog } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';

describe('WeatherService', () => {
  let service: WeatherService;
  let model: Model<WeatherLog>;

  const mockWeatherLog = {
    _id: '507f1f77bcf86cd799439011',
    temperature: 25,
    humidity: 60,
    condition: 'Clear',
    weather_code: 0,
    location: 'São Paulo',
    collected_at: new Date('2025-01-01T12:00:00Z'),
  };

  const mockWeatherModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    model = module.get<Model<WeatherLog>>(getModelToken(WeatherLog.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a weather log', async () => {

      const createWeatherDto: CreateWeatherDto = {
        temperature: 25,
        humidity: 60,
        condition: 'Clear',
        weather_code: 0,
        location: 'São Paulo',
        collected_at: '2025-01-01T12:00:00Z',
      };

      const saveMock = jest.fn().mockResolvedValue(mockWeatherLog);


      (model as any) = jest.fn().mockImplementation(() => ({
        ...createWeatherDto,
        save: saveMock,
      }));


      (service as any).weatherModel = model;


      const result = await service.create(createWeatherDto);


      expect(result).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
      expect(model).toHaveBeenCalledWith(createWeatherDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated weather logs', async () => {

      const logs = [
        mockWeatherLog,
        { ...mockWeatherLog, _id: '507f1f77bcf86cd799439012' },
      ];
      const total = 25;

      const sortMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(logs);

      mockWeatherModel.find.mockReturnValue({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        exec: execMock,
      });

      mockWeatherModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(total),
      });


      const result = await service.findAll(1, 10);


      expect(result).toEqual({
        data: logs,
        total,
        page: 1,
        limit: 10,
        totalPages: 3,
      });
      expect(mockWeatherModel.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ collected_at: -1 });
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
    });

    it('should calculate correct pagination for page 2', async () => {

      const logs = [mockWeatherLog];
      const total = 25;

      const sortMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(logs);

      mockWeatherModel.find.mockReturnValue({
        sort: sortMock,
        skip: skipMock,
        limit: limitMock,
        exec: execMock,
      });

      mockWeatherModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(total),
      });


      const result = await service.findAll(2, 10);


      expect(skipMock).toHaveBeenCalledWith(10);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('should handle empty results', async () => {

      mockWeatherModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      mockWeatherModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });


      const result = await service.findAll(1, 10);


      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('getAll', () => {
    it('should return all weather logs with default limit', async () => {

      const logs = [
        mockWeatherLog,
        { ...mockWeatherLog, _id: '507f1f77bcf86cd799439012' },
      ];

      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(logs);

      mockWeatherModel.find.mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        exec: execMock,
      });


      const result = await service.getAll();


      expect(result).toEqual(logs);
      expect(sortMock).toHaveBeenCalledWith({ collected_at: -1 });
      expect(limitMock).toHaveBeenCalledWith(1000);
    });

    it('should respect custom limit', async () => {

      const logs = [mockWeatherLog];

      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(logs);

      mockWeatherModel.find.mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        exec: execMock,
      });


      await service.getAll(50);


      expect(limitMock).toHaveBeenCalledWith(50);
    });
  });

  describe('findRecent', () => {
    it('should return weather logs from last N hours', async () => {

      const hours = 12;
      const logs = [
        mockWeatherLog,
        { ...mockWeatherLog, _id: '507f1f77bcf86cd799439012' },
      ];


      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));

      const sortMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(logs);

      mockWeatherModel.find.mockReturnValue({
        sort: sortMock,
        exec: execMock,
      });


      const result = await service.findRecent(hours);


      expect(result).toEqual(logs);
      expect(mockWeatherModel.find).toHaveBeenCalledWith({
        collected_at: { $gte: expect.any(Date) },
      });
      expect(sortMock).toHaveBeenCalledWith({ collected_at: -1 });


      jest.useRealTimers();
    });

    it('should calculate correct cutoff date', async () => {

      const hours = 6;
      const now = new Date('2025-01-01T18:00:00Z');
      const expectedCutoff = new Date('2025-01-01T12:00:00Z');


      jest.useFakeTimers();
      jest.setSystemTime(now);

      const sortMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue([]);

      let capturedQuery: any;
      mockWeatherModel.find.mockImplementation((query: any) => {
        capturedQuery = query;
        return {
          sort: sortMock,
          exec: execMock,
        };
      });


      await service.findRecent(hours);


      expect(capturedQuery.collected_at.$gte).toEqual(expectedCutoff);


      jest.useRealTimers();
    });

    it('should return empty array when no recent data', async () => {

      const sortMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue([]);

      mockWeatherModel.find.mockReturnValue({
        sort: sortMock,
        exec: execMock,
      });


      const result = await service.findRecent(24);


      expect(result).toEqual([]);
    });
  });
});
