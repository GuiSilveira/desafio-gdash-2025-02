import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WeatherExportService } from './weather-export.service';
import { WeatherService } from './weather.service';
import * as XLSX from 'xlsx';

jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
    sheet_to_csv: jest.fn(),
  },
  write: jest.fn(),
}));

describe('WeatherExportService', () => {
  let service: WeatherExportService;
  let weatherService: WeatherService;

  const mockWeatherLogs = [
    {
      _id: '1',
      temperature: 25,
      humidity: 60,
      wind_speed: 10,
      condition: 'Clear',
      weather_code: 0,
      location: 'São Paulo',
      collected_at: new Date('2025-01-01T10:00:00Z'),
    },
    {
      _id: '2',
      temperature: 27,
      humidity: 58,
      wind_speed: 12,
      condition: 'Partly Cloudy',
      weather_code: 1,
      location: 'São Paulo',
      collected_at: new Date('2025-01-01T11:00:00Z'),
    },
    {
      _id: '3',
      temperature: 30,
      humidity: 55,
      wind_speed: 15,
      condition: 'Cloudy',
      weather_code: 2,
      location: 'São Paulo',
      collected_at: new Date('2025-01-01T12:00:00Z'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherExportService,
        {
          provide: WeatherService,
          useValue: {
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherExportService>(WeatherExportService);
    weatherService = module.get<WeatherService>(WeatherService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableFormats', () => {
    it('should return all available export formats', () => {
      const formats = service.getAvailableFormats();

      expect(formats).toContain('xlsx');
      expect(formats).toContain('csv');
      expect(formats).toContain('json');
      expect(formats).toHaveLength(3);
    });
  });

  describe('getStrategy', () => {
    it('should return strategy for valid format', () => {
      const xlsxStrategy = service.getStrategy('xlsx');
      const csvStrategy = service.getStrategy('csv');
      const jsonStrategy = service.getStrategy('json');

      expect(xlsxStrategy).toBeDefined();
      expect(csvStrategy).toBeDefined();
      expect(jsonStrategy).toBeDefined();
    });

    it('should throw BadRequestException for invalid format', () => {
      expect(() => service.getStrategy('pdf' as any)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('export', () => {
    describe('xlsx format', () => {
      it('should generate XLSX with correct metadata', async () => {
        jest
          .spyOn(weatherService, 'getAll')
          .mockResolvedValue(mockWeatherLogs as any);

        const mockWorksheet = { some: 'worksheet' };
        const mockWorkbook = { some: 'workbook' };
        const mockBuffer = Buffer.from('mock-xlsx-content');

        (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
        (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
        (XLSX.write as jest.Mock).mockReturnValue(mockBuffer);

        const result = await service.export('xlsx');

        expect(result.data).toBeInstanceOf(Buffer);
        expect(result.mimeType).toBe(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        expect(result.extension).toBe('xlsx');
        expect(weatherService.getAll).toHaveBeenCalledWith(5000);
        expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
          mockWorkbook,
          mockWorksheet,
          'Dados Climáticos',
        );
      });

      it('should handle empty logs array', async () => {
        jest.spyOn(weatherService, 'getAll').mockResolvedValue([]);

        const mockWorksheet = { empty: 'worksheet' };
        const mockWorkbook = { empty: 'workbook' };
        const mockBuffer = Buffer.from('empty-xlsx');

        (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
        (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
        (XLSX.write as jest.Mock).mockReturnValue(mockBuffer);

        const result = await service.export('xlsx');

        expect(result.data).toBeInstanceOf(Buffer);
        expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
      });
    });

    describe('csv format', () => {
      it('should generate CSV with correct metadata', async () => {
        jest
          .spyOn(weatherService, 'getAll')
          .mockResolvedValue(mockWeatherLogs as any);

        const mockWorksheet = { some: 'worksheet' };
        const mockCsv = 'Data/Hora,Temperatura,Umidade\n2025-01-01,25,60';

        (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
        (XLSX.utils.sheet_to_csv as jest.Mock).mockReturnValue(mockCsv);

        const result = await service.export('csv');

        expect(result.data).toBe(mockCsv);
        expect(typeof result.data).toBe('string');
        expect(result.mimeType).toBe('text/csv');
        expect(result.extension).toBe('csv');
        expect(XLSX.utils.sheet_to_csv).toHaveBeenCalledWith(mockWorksheet);
      });

      it('should handle empty logs array', async () => {
        jest.spyOn(weatherService, 'getAll').mockResolvedValue([]);

        const mockWorksheet = { empty: 'worksheet' };
        const mockCsv = '';

        (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
        (XLSX.utils.sheet_to_csv as jest.Mock).mockReturnValue(mockCsv);

        const result = await service.export('csv');

        expect(result.data).toBe('');
        expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
      });
    });

    describe('json format', () => {
      it('should generate JSON with correct metadata', async () => {
        jest
          .spyOn(weatherService, 'getAll')
          .mockResolvedValue(mockWeatherLogs as any);

        const result = await service.export('json');

        expect(typeof result.data).toBe('string');
        expect(result.mimeType).toBe('application/json');
        expect(result.extension).toBe('json');

        const parsed = JSON.parse(result.data as string);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(3);
      });

      it('should format JSON with indentation', async () => {
        jest
          .spyOn(weatherService, 'getAll')
          .mockResolvedValue(mockWeatherLogs as any);

        const result = await service.export('json');

        expect(result.data).toContain('\n');
        expect(result.data).toContain('  ');
      });

      it('should handle empty logs array', async () => {
        jest.spyOn(weatherService, 'getAll').mockResolvedValue([]);

        const result = await service.export('json');

        expect(result.data).toBe('[]');
      });
    });
  });

  describe('data transformation', () => {
    it('should correctly format data with Portuguese headers', async () => {
      jest
        .spyOn(weatherService, 'getAll')
        .mockResolvedValue(mockWeatherLogs as any);

      const mockWorksheet = { some: 'worksheet' };
      const mockWorkbook = { some: 'workbook' };

      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.write as jest.Mock).mockReturnValue(Buffer.from('mock-buffer'));

      await service.export('xlsx');

      const callArgs = (XLSX.utils.json_to_sheet as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveLength(3);
      expect(callArgs[0]).toHaveProperty(
        'Data/Hora',
        '2025-01-01T10:00:00.000Z',
      );
      expect(callArgs[0]).toHaveProperty('Temperatura (°C)', 25);
      expect(callArgs[0]).toHaveProperty('Umidade (%)', 60);
      expect(callArgs[0]).toHaveProperty('Condição', 'Clear');
      expect(callArgs[0]).toHaveProperty('Local', 'São Paulo');
    });

    it('should convert dates to ISO string format', async () => {
      const logWithDate = [
        {
          ...mockWeatherLogs[0],
          collected_at: new Date('2025-06-15T14:30:00Z'),
        },
      ];

      jest
        .spyOn(weatherService, 'getAll')
        .mockResolvedValue(logWithDate as any);

      const mockWorksheet = { some: 'worksheet' };
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.sheet_to_csv as jest.Mock).mockReturnValue('mock-csv');

      await service.export('csv');

      const preparedData = (XLSX.utils.json_to_sheet as jest.Mock).mock
        .calls[0][0];
      expect(preparedData[0]['Data/Hora']).toBe('2025-06-15T14:30:00.000Z');
    });

    it('should preserve numeric values without modification', async () => {
      const logWithNumbers = [
        {
          ...mockWeatherLogs[0],
          temperature: 28.5,
          humidity: 65.3,
        },
      ];

      jest
        .spyOn(weatherService, 'getAll')
        .mockResolvedValue(logWithNumbers as any);

      const mockWorksheet = { some: 'worksheet' };
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.sheet_to_csv as jest.Mock).mockReturnValue('mock-csv');

      await service.export('csv');

      const preparedData = (XLSX.utils.json_to_sheet as jest.Mock).mock
        .calls[0][0];
      expect(preparedData[0]['Temperatura (°C)']).toBe(28.5);
      expect(preparedData[0]['Umidade (%)']).toBe(65.3);
    });

    it('should respect LOGS_LIMIT constant', async () => {
      jest
        .spyOn(weatherService, 'getAll')
        .mockResolvedValue(mockWeatherLogs as any);

      const mockWorksheet = { some: 'worksheet' };
      const mockWorkbook = { some: 'workbook' };

      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.write as jest.Mock).mockReturnValue(Buffer.from('mock-buffer'));

      await service.export('xlsx');

      expect(weatherService.getAll).toHaveBeenCalledWith(5000);
    });
  });
});
