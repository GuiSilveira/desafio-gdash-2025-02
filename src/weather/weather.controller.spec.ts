import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherAnalysisService } from './weather-analysis.service';
import { WeatherExportService } from './weather-export.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { InternalTokenGuard } from '../auth/guards/internal-token.guard';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;
  let analysisService: WeatherAnalysisService;
  let exportService: WeatherExportService;

  const mockWeatherLog = {
    _id: '507f1f77bcf86cd799439011',
    location: 'São Paulo',
    temperature: 25.5,
    humidity: 60,
    condition: 'Ensolarado',
    timestamp: new Date(),
  };

  const mockWeatherService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findRecent: jest.fn(),
  };

  const mockAnalysisService = {
    generateInsights: jest.fn(),
    generateForecastInsights: jest.fn(),
  };

  const mockExportService = {
    export: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-internal-token'),
  };

  const mockInternalTokenGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
        {
          provide: WeatherAnalysisService,
          useValue: mockAnalysisService,
        },
        {
          provide: WeatherExportService,
          useValue: mockExportService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(InternalTokenGuard)
      .useValue(mockInternalTokenGuard)
      .compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
    analysisService = module.get<WeatherAnalysisService>(WeatherAnalysisService);
    exportService = module.get<WeatherExportService>(WeatherExportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createWeatherDto: CreateWeatherDto = {
      location: 'São Paulo',
      temperature: 25.5,
      humidity: 60,
      condition: 'Ensolarado',
      wmoCode: 0,
    };

    it('should create a weather log successfully', async () => {
      mockWeatherService.create.mockResolvedValue(mockWeatherLog);

      const result = await controller.create(createWeatherDto);

      expect(result).toEqual(mockWeatherLog);
      expect(weatherService.create).toHaveBeenCalledWith(createWeatherDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated weather logs', async () => {
      const paginatedResult = {
        data: [mockWeatherLog],
        total: 1,
        page: 1,
        limit: 100,
      };
      mockWeatherService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 100);

      expect(result).toEqual(paginatedResult);
      expect(weatherService.findAll).toHaveBeenCalledWith(1, 100);
    });

    it('should use default values when not provided', async () => {
      const paginatedResult = {
        data: [mockWeatherLog],
        total: 1,
        page: 1,
        limit: 100,
      };
      mockWeatherService.findAll.mockResolvedValue(paginatedResult);

      await controller.findAll();

      expect(weatherService.findAll).toHaveBeenCalledWith(1, 100);
    });

    it('should throw BadRequestException when page is NaN', async () => {
      await expect(
        controller.findAll('invalid' as unknown as number, 100),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.findAll('invalid' as unknown as number, 100),
      ).rejects.toThrow('Os parâmetros page e limit devem ser números');
    });

    it('should throw BadRequestException when limit is NaN', async () => {
      await expect(
        controller.findAll(1, 'invalid' as unknown as number),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when page is less than 1', async () => {
      await expect(controller.findAll(0, 100)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll(0, 100)).rejects.toThrow(
        'O parâmetro page deve ser maior que 0',
      );
    });

    it('should throw BadRequestException when limit is less than 1', async () => {
      await expect(controller.findAll(1, 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll(1, 0)).rejects.toThrow(
        'O parâmetro limit deve ser maior que 0',
      );
    });
  });

  describe('findRecent', () => {
    it('should return recent weather logs', async () => {
      const recentLogs = [mockWeatherLog];
      mockWeatherService.findRecent.mockResolvedValue(recentLogs);

      const result = await controller.findRecent(24);

      expect(result).toEqual(recentLogs);
      expect(weatherService.findRecent).toHaveBeenCalledWith(24);
    });

    it('should throw BadRequestException when hours is negative', async () => {
      await expect(controller.findRecent(-1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findRecent(-1)).rejects.toThrow(
        'O parâmetro hours não pode ser negativo',
      );
    });

    it('should allow zero hours', async () => {
      mockWeatherService.findRecent.mockResolvedValue([]);

      await controller.findRecent(0);

      expect(weatherService.findRecent).toHaveBeenCalledWith(0);
    });
  });

  describe('generateInsights', () => {
    it('should generate insights with default hours', async () => {
      const insights = {
        summary: 'Temperatura média: 22°C',
        trend: 'stable',
      };
      mockAnalysisService.generateInsights.mockResolvedValue(insights);

      const result = await controller.generateInsights();

      expect(result).toEqual({ insights: 'Temperatura média: 22°C' });
      expect(analysisService.generateInsights).toHaveBeenCalledWith(12);
    });

    it('should generate insights with custom hours', async () => {
      const insights = {
        summary: 'Análise das últimas 24 horas',
        trend: 'up',
      };
      mockAnalysisService.generateInsights.mockResolvedValue(insights);

      const result = await controller.generateInsights(24);

      expect(result).toEqual({ insights: 'Análise das últimas 24 horas' });
      expect(analysisService.generateInsights).toHaveBeenCalledWith(24);
    });
  });

  describe('getInsights', () => {
    it('should return full insights for last 12 hours', async () => {
      const fullInsights = {
        summary: 'Resumo completo',
        trend: 'stable',
        comfortScore: 8,
        tags: ['ensolarado', 'agradável'],
      };
      mockAnalysisService.generateInsights.mockResolvedValue(fullInsights);

      const result = await controller.getInsights();

      expect(result).toEqual(fullInsights);
      expect(analysisService.generateInsights).toHaveBeenCalledWith(12);
    });
  });

  describe('getForecastInsights', () => {
    it('should return forecast insights', async () => {
      const forecastInsights = {
        summary: 'Previsão para os próximos 7 dias',
        trend: 'up',
        comfortScore: 7,
        tags: ['calor', 'ensolarado'],
      };
      mockAnalysisService.generateForecastInsights.mockResolvedValue(
        forecastInsights,
      );

      const result = await controller.getForecastInsights();

      expect(result).toEqual(forecastInsights);
      expect(analysisService.generateForecastInsights).toHaveBeenCalled();
    });
  });

  describe('exportData', () => {
    const createMockResponse = (): Partial<Response> => ({
      setHeader: jest.fn(),
      send: jest.fn(),
    });

    it('should export data as CSV', async () => {
      const exportResult = {
        data: 'location,temperature\nSão Paulo,25.5',
        mimeType: 'text/csv',
        extension: 'csv',
      };
      mockExportService.export.mockResolvedValue(exportResult);

      const mockRes = createMockResponse();

      await controller.exportData('csv', mockRes as Response);

      expect(exportService.export).toHaveBeenCalledWith('csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="weather_logs.csv"',
      );
      expect(mockRes.send).toHaveBeenCalledWith(exportResult.data);
    });

    it('should export data as XLSX (buffer)', async () => {
      const bufferData = Buffer.from('xlsx binary data');
      const exportResult = {
        data: bufferData,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
      };
      mockExportService.export.mockResolvedValue(exportResult);

      const mockRes = createMockResponse();

      await controller.exportData('xlsx', mockRes as Response);

      expect(exportService.export).toHaveBeenCalledWith('xlsx');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="weather_logs.xlsx"',
      );
      expect(mockRes.send).toHaveBeenCalledWith(bufferData);
    });

    it('should export data as JSON', async () => {
      const exportResult = {
        data: JSON.stringify([mockWeatherLog]),
        mimeType: 'application/json',
        extension: 'json',
      };
      mockExportService.export.mockResolvedValue(exportResult);

      const mockRes = createMockResponse();

      await controller.exportData('json', mockRes as Response);

      expect(exportService.export).toHaveBeenCalledWith('json');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json',
      );
    });

    it('should throw BadRequestException for invalid format', async () => {
      const mockRes = createMockResponse();

      await expect(
        controller.exportData('pdf', mockRes as Response),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.exportData('pdf', mockRes as Response),
      ).rejects.toThrow(
        "Formato 'pdf' não suportado. Formatos disponíveis: csv, xlsx, json",
      );
    });

    it('should throw BadRequestException for empty format', async () => {
      const mockRes = createMockResponse();

      await expect(
        controller.exportData('', mockRes as Response),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
