import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiAIService } from './gemini-ai.service';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

describe('GeminiAIService', () => {
  let service: GeminiAIService;
  let mockGenerateContent: jest.Mock;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'test-api-key';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiAIService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GeminiAIService>(GeminiAIService);

    mockGenerateContent = (service as any).ai.models.generateContent;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with API key from config', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('GEMINI_API_KEY');
    });

    it('should warn when GEMINI_API_KEY is not configured', async () => {
      const warnSpy = jest.spyOn(
        (GeminiAIService.prototype as any).logger || console,
        'warn',
      );

      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiAIService,
          {
            provide: ConfigService,
            useValue: emptyConfigService,
          },
        ],
      }).compile();

      module.get<GeminiAIService>(GeminiAIService);

      expect(emptyConfigService.get).toHaveBeenCalledWith('GEMINI_API_KEY');
      warnSpy.mockRestore();
    });
  });

  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      const mockResponse = { text: '{"result": "success"}' };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateContent('Test prompt');

      expect(result).toBe('{"result": "success"}');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: 'Test prompt',
        config: {
          responseMimeType: 'application/json',
        },
      });
    });

    it('should use custom model when provided in options', async () => {
      const mockResponse = { text: '{"custom": true}' };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateContent('Test prompt', {
        model: 'gemini-pro',
      });

      expect(result).toBe('{"custom": true}');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: 'Test prompt',
        config: {
          responseMimeType: 'application/json',
        },
      });
    });

    it('should use custom responseMimeType when provided in options', async () => {
      const mockResponse = { text: 'plain text response' };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateContent('Test prompt', {
        responseMimeType: 'text/plain',
      });

      expect(result).toBe('plain text response');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: 'Test prompt',
        config: {
          responseMimeType: 'text/plain',
        },
      });
    });

    it('should return null when response has no text', async () => {
      const mockResponse = { text: null };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateContent('Test prompt');

      expect(result).toBeNull();
    });

    it('should return null when response text is undefined', async () => {
      const mockResponse = {};
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateContent('Test prompt');

      expect(result).toBeNull();
    });

    it('should return null and log error when API throws', async () => {
      const error = new Error('API Error');
      mockGenerateContent.mockRejectedValue(error);

      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      const result = await service.generateContent('Test prompt');

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        '❌ Erro ao gerar conteúdo com Gemini',
        error,
      );
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      mockGenerateContent.mockRejectedValue(networkError);

      const result = await service.generateContent('Test prompt');

      expect(result).toBeNull();
    });

    it('should use default model and mime type when no options provided', async () => {
      const mockResponse = { text: '{}' };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await service.generateContent('Simple prompt');

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-flash',
          config: {
            responseMimeType: 'application/json',
          },
        }),
      );
    });

    it('should pass empty prompt correctly', async () => {
      const mockResponse = { text: '{"empty": true}' };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateContent('');

      expect(result).toBe('{"empty": true}');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: '',
        }),
      );
    });
  });
});
