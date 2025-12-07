import { Injectable, Inject, Logger } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherInsightsDto } from './dto/weather-insights.dto';
import { WMO_CODES } from '../common/constants';
import { AI_SERVICE } from '../ai';
import type { IAIService } from '../ai';

@Injectable()
export class WeatherAnalysisService {
  private readonly logger = new Logger(WeatherAnalysisService.name);
  private static ANALYSIS_PERIOD_HOURS = 12;

  constructor(
    private readonly weatherService: WeatherService,
    @Inject(AI_SERVICE) private readonly aiService: IAIService,
  ) {}

  async generateInsights(hours?: number): Promise<WeatherInsightsDto> {
    const period = hours || WeatherAnalysisService.ANALYSIS_PERIOD_HOURS;
    const logs = await this.weatherService.findRecent(period);

    if (!logs.length) {
      return {
        summary: 'Sem dados suficientes ou dados insuficientes para análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Aguardando dados'],
      };
    }

    const dataContext = logs.map((log) => ({
      hora: log.collected_at,
      temperatura: log.temperature,
      temperatura_aparente: log.apparent_temperature,
      umidade: log.humidity,
      pressao: log.surface_pressure,
      visibilidade: log.visibility,
      condicao: log.condition,
      aqi: log.us_aqi,
      uv_index: log.uv_index,
      precipitacao_prob: log.precipitation_probability,
    }));

    const prompt = `
      Analise os dados meteorológicos e de qualidade do ar das últimas ${period} horas: 
      ${JSON.stringify(dataContext)}
      
      Considere:
      - Tendências de temperatura
      - Qualidade do ar (AQI e índice UV)
      - Condições climáticas
      - Probabilidade de chuva
      - Conforto térmico baseado em temperatura aparente e umidade
      
      Responda APENAS JSON no formato:
      { 
        "summary": "Resumo conciso em português com principais insights (máximo 2 frases)",
        "trend": "up"|"down"|"stable",
        "alert": boolean,
        "comfortScore": número de 0 a 100 representando o índice de conforto climático (considere temperatura, umidade, vento e qualidade do ar),
        "tags": ["array de 2-4 tags curtas em português descrevendo as condições atuais, ex: 'Ensolarado', 'Baixa Umidade', 'Ar Limpo', 'Ventilado'"]
      }
    `;

    try {
      const jsonText = await this.aiService.generateContent(prompt);
      if (!jsonText) throw new Error('Resposta vazia');

      return JSON.parse(jsonText) as WeatherInsightsDto;
    } catch (error) {
      this.logger.error('Erro na IA', error);
      return {
        summary: 'Erro ao gerar análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Erro na análise'],
      };
    }
  }

  async generateForecastInsights(): Promise<WeatherInsightsDto> {
    const logs = await this.weatherService.findRecent(1);

    if (
      !logs.length ||
      !logs[0].daily_time ||
      logs[0].daily_time.length === 0
    ) {
      return {
        summary: 'Sem dados de previsão disponíveis para análise.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Aguardando previsão'],
      };
    }

    const latestLog = logs[0];

    const forecastData = latestLog.daily_time.map((date, index) => ({
      data: date,
      temperatura_maxima: latestLog.daily_temperature_max?.[index] ?? 0,
      temperatura_minima: latestLog.daily_temperature_min?.[index] ?? 0,
      condicao:
        WMO_CODES[latestLog.daily_weather_code?.[index] ?? 0] || 'Desconhecido',
      codigo_wmo: latestLog.daily_weather_code?.[index] ?? 0,
    }));

    const prompt = `
      Analise a previsão do tempo para os próximos 7 dias em ${latestLog.location}:
      ${JSON.stringify(forecastData)}
      
      Considere:
      - Variação de temperatura ao longo da semana
      - Padrões climáticos (dias consecutivos de chuva, sol, etc.)
      - Dias mais quentes e mais frios
      - Recomendações práticas para a semana
      
      Responda APENAS JSON no formato:
      { 
        "summary": "Análise concisa em português (máximo 2 frases) sobre a previsão da semana, incluindo dicas práticas",
        "trend": "up"|"down"|"stable",
        "alert": boolean
      }
    `;

    try {
      const jsonText = await this.aiService.generateContent(prompt);
      if (!jsonText) throw new Error('Resposta vazia');

      return JSON.parse(jsonText) as WeatherInsightsDto;
    } catch (error) {
      this.logger.error('Erro na IA (forecast)', error);
      return {
        summary: 'Erro ao gerar análise da previsão.',
        trend: 'stable',
        alert: false,
        comfortScore: 50,
        tags: ['Erro na análise'],
      };
    }
  }
}
