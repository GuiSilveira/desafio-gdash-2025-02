import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { IAIService, AIGenerateOptions } from './ai.interface';

@Injectable()
export class GeminiAIService implements IAIService {
  private readonly logger = new Logger(GeminiAIService.name);
  private readonly ai: GoogleGenAI;
  private readonly defaultModel = 'gemini-2.5-flash';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('⚠️ GEMINI_API_KEY não configurada');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async generateContent(
    prompt: string,
    options?: AIGenerateOptions,
  ): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: options?.model || this.defaultModel,
        contents: prompt,
        config: {
          responseMimeType: options?.responseMimeType || 'application/json',
        },
      });

      return response.text || null;
    } catch (error) {
      this.logger.error('❌ Erro ao gerar conteúdo com Gemini', error);
      return null;
    }
  }
}
