import { Test, TestingModule } from '@nestjs/testing';
import { WeatherAnalysisService } from './weather-analysis.service';
import { WeatherService } from './weather.service';
import { AI_SERVICE, IAIService } from '../ai';

describe('WeatherAnalysisService', () => {
  let service: WeatherAnalysisService;
  let weatherService: WeatherService;
  let mockAIService: jest.Mocked<IAIService>;

  const mockWeatherLogs = [
    {
      _id: '1',
      temperature: 25,
      wind_speed: 10,
      condition: 'Clear',
      collected_at: new Date('2025-01-01T10:00:00Z'),
      location: 'São Paulo',
      humidity: 60,
      weather_code: 0,
    },
    {
      _id: '2',
      temperature: 27,
      wind_speed: 12,
      condition: 'Clear',
      collected_at: new Date('2025-01-01T11:00:00Z'),
      location: 'São Paulo',
      humidity: 58,
      weather_code: 0,
    },
    {
      _id: '3',
      temperature: 30,
      wind_speed: 15,
      condition: 'Partly Cloudy',
      collected_at: new Date('2025-01-01T12:00:00Z'),
      location: 'São Paulo',
      humidity: 55,
      weather_code: 1,
    },
  ];

  beforeEach(async () => {
    mockAIService = {
      generateContent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherAnalysisService,
        {
          provide: WeatherService,
          useValue: {
            findRecent: jest.fn(),
          },
        },
        {
          provide: AI_SERVICE,
          useValue: mockAIService,
        },
      ],
    }).compile();

    service = module.get<WeatherAnalysisService>(WeatherAnalysisService);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInsights', () => {
    it('should return insights with increasing temperature trend', async () => {

      const mockInsights = {
        summary: 'Temperatura subindo ao longo das últimas 12 horas.',
        trend: 'up' as const,
        alert: false,
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(mockWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateInsights();


      expect(result).toEqual(mockInsights);
      expect(weatherService.findRecent).toHaveBeenCalledWith(12);
      expect(mockAIService.generateContent).toHaveBeenCalled();
    });

    it('should return insights with alert when conditions are extreme', async () => {

      const extremeWeatherLogs = [
        {
          ...mockWeatherLogs[0],
          temperature: 40,
          wind_speed: 60,
        },
      ];

      const mockInsights = {
        summary:
          'Condições climáticas extremas detectadas. Alerta de segurança!',
        trend: 'up' as const,
        alert: true,
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(extremeWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateInsights();


      expect(result.alert).toBe(true);
      expect(result.trend).toBe('up');
    });

    it('should return stable trend when temperature is consistent', async () => {

      const stableWeatherLogs = mockWeatherLogs.map((log) => ({
        ...log,
        temperature: 25,
      }));

      const mockInsights = {
        summary: 'Temperatura estável nas últimas 12 horas.',
        trend: 'stable' as const,
        alert: false,
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(stableWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateInsights();


      expect(result.trend).toBe('stable');
      expect(result.alert).toBe(false);
    });

    it('should return default message when no data is available', async () => {

      jest.spyOn(weatherService, 'findRecent').mockResolvedValue([]);


      const result = await service.generateInsights();


      expect(result).toEqual({
        summary: 'Sem dados suficientes ou dados insuficientes para análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Aguardando dados'],
      });
      expect(mockAIService.generateContent).not.toHaveBeenCalled();
    });

    it('should handle AI API errors gracefully', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(mockWeatherLogs as any);
      mockAIService.generateContent.mockRejectedValue(
        new Error('AI API Error'),
      );


      const result = await service.generateInsights();


      expect(result).toEqual({
        summary: 'Erro ao gerar análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Erro na análise'],
      });
    });

    it('should handle empty AI response', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(mockWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue(null);


      const result = await service.generateInsights();


      expect(result).toEqual({
        summary: 'Erro ao gerar análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Erro na análise'],
      });
    });

    it('should handle invalid JSON from AI', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(mockWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue('invalid json {{{');


      const result = await service.generateInsights();


      expect(result).toEqual({
        summary: 'Erro ao gerar análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Erro na análise'],
      });
    });

    it('should correctly format data context for AI', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(mockWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify({
          summary: 'Analysis',
          trend: 'stable',
          alert: false,
        }),
      );


      await service.generateInsights();


      const callArgs = mockAIService.generateContent.mock.calls[0][0];
      expect(callArgs).toContain('Analise os dados meteorológicos');
      expect(callArgs).toContain('hora');
      expect(callArgs).toContain('temperatura');
      expect(callArgs).toContain('condicao');
    });

    it('should use custom hours parameter when provided', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(mockWeatherLogs as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify({
          summary: 'Analysis for 24 hours',
          trend: 'stable',
          alert: false,
        }),
      );


      await service.generateInsights(24);


      expect(weatherService.findRecent).toHaveBeenCalledWith(24);
    });

    it('should return insights with down trend', async () => {

      const decreasingTempLogs = [
        { ...mockWeatherLogs[0], temperature: 30 },
        { ...mockWeatherLogs[1], temperature: 27 },
        { ...mockWeatherLogs[2], temperature: 22 },
      ];

      const mockInsights = {
        summary: 'Temperatura diminuindo nas últimas horas.',
        trend: 'down' as const,
        alert: false,
        comfortScore: 70,
        tags: ['Esfriando', 'Agradável'],
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue(decreasingTempLogs as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateInsights();


      expect(result.trend).toBe('down');
      expect(result.comfortScore).toBe(70);
      expect(result.tags).toContain('Esfriando');
    });
  });

  describe('generateForecastInsights', () => {
    const mockForecastLog = {
      _id: '1',
      location: 'São Paulo',
      temperature: 25,
      collected_at: new Date('2025-01-01T10:00:00Z'),
      daily_time: [
        '2025-01-01',
        '2025-01-02',
        '2025-01-03',
        '2025-01-04',
        '2025-01-05',
        '2025-01-06',
        '2025-01-07',
      ],
      daily_temperature_max: [28, 30, 32, 31, 29, 27, 26],
      daily_temperature_min: [18, 19, 20, 19, 18, 17, 16],
      daily_weather_code: [0, 1, 2, 3, 61, 63, 0],
    };

    it('should return forecast insights successfully', async () => {

      const mockInsights = {
        summary:
          'Semana com tendência de aquecimento no início e chuva no meio.',
        trend: 'up' as const,
        alert: false,
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateForecastInsights();


      expect(result).toEqual(mockInsights);
      expect(weatherService.findRecent).toHaveBeenCalledWith(1);
      expect(mockAIService.generateContent).toHaveBeenCalled();
    });

    it('should return default message when no forecast data is available', async () => {

      jest.spyOn(weatherService, 'findRecent').mockResolvedValue([]);


      const result = await service.generateForecastInsights();


      expect(result).toEqual({
        summary: 'Sem dados de previsão disponíveis para análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Aguardando previsão'],
      });
      expect(mockAIService.generateContent).not.toHaveBeenCalled();
    });

    it('should return default message when log has no daily_time', async () => {

      const logWithoutForecast = {
        ...mockForecastLog,
        daily_time: [],
      };
      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([logWithoutForecast] as any);


      const result = await service.generateForecastInsights();


      expect(result).toEqual({
        summary: 'Sem dados de previsão disponíveis para análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Aguardando previsão'],
      });
      expect(mockAIService.generateContent).not.toHaveBeenCalled();
    });

    it('should return default message when log has undefined daily_time', async () => {

      const logWithoutDailyTime = {
        _id: '1',
        location: 'São Paulo',
        temperature: 25,
        collected_at: new Date(),
        daily_time: undefined,
      };
      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([logWithoutDailyTime] as any);


      const result = await service.generateForecastInsights();


      expect(result.summary).toBe(
        'Sem dados de previsão disponíveis para análise.',
      );
    });

    it('should handle AI API errors gracefully for forecast', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockRejectedValue(
        new Error('AI API Error'),
      );


      const result = await service.generateForecastInsights();


      expect(result).toEqual({
        summary: 'Erro ao gerar análise da previsão.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Erro na análise'],
      });
    });

    it('should handle empty AI response for forecast', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue(null);


      const result = await service.generateForecastInsights();


      expect(result.summary).toBe('Erro ao gerar análise da previsão.');
    });

    it('should handle invalid JSON from AI for forecast', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue('not valid json {{');


      const result = await service.generateForecastInsights();


      expect(result.summary).toBe('Erro ao gerar análise da previsão.');
    });

    it('should include location in AI prompt', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify({
          summary: 'Forecast analysis',
          trend: 'stable',
          alert: false,
        }),
      );


      await service.generateForecastInsights();


      const callArgs = mockAIService.generateContent.mock.calls[0][0];
      expect(callArgs).toContain('São Paulo');
      expect(callArgs).toContain('previsão do tempo');
      expect(callArgs).toContain('7 dias');
    });

    it('should correctly format forecast data for AI', async () => {

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify({
          summary: 'Forecast',
          trend: 'stable',
          alert: false,
        }),
      );


      await service.generateForecastInsights();


      const callArgs = mockAIService.generateContent.mock.calls[0][0];
      expect(callArgs).toContain('data');
      expect(callArgs).toContain('temperatura_maxima');
      expect(callArgs).toContain('temperatura_minima');
      expect(callArgs).toContain('condicao');
    });

    it('should return forecast with down trend', async () => {

      const mockInsights = {
        summary: 'Temperaturas caindo ao longo da semana.',
        trend: 'down' as const,
        alert: false,
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateForecastInsights();


      expect(result.trend).toBe('down');
    });

    it('should return forecast with alert when extreme conditions', async () => {

      const mockInsights = {
        summary: 'Alerta: Temperaturas extremas previstas para a semana.',
        trend: 'up' as const,
        alert: true,
      };

      jest
        .spyOn(weatherService, 'findRecent')
        .mockResolvedValue([mockForecastLog] as any);
      mockAIService.generateContent.mockResolvedValue(
        JSON.stringify(mockInsights),
      );


      const result = await service.generateForecastInsights();


      expect(result.alert).toBe(true);
    });
  });
});
