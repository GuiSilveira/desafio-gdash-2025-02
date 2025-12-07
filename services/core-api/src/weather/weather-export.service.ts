import { Injectable, BadRequestException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherLogDocument } from './schemas/weather.schema';
import {
  ExportStrategy,
  ExportData,
  ExportFormat,
  XlsxExportStrategy,
  CsvExportStrategy,
  JsonExportStrategy,
} from './export-strategies';

@Injectable()
export class WeatherExportService {
  private static LOGS_LIMIT = 5000;
  private readonly strategies: Map<ExportFormat, ExportStrategy>;

  constructor(private readonly weatherService: WeatherService) {
    this.strategies = new Map<ExportFormat, ExportStrategy>([
      ['xlsx', new XlsxExportStrategy()],
      ['csv', new CsvExportStrategy()],
      ['json', new JsonExportStrategy()],
    ]);
  }

  getStrategy(format: ExportFormat): ExportStrategy {
    const strategy = this.strategies.get(format);
    if (!strategy) {
      throw new BadRequestException(
        `Formato de exportação '${format}' não suportado. Formatos disponíveis: ${this.getAvailableFormats().join(', ')}`,
      );
    }
    return strategy;
  }

  getAvailableFormats(): ExportFormat[] {
    return Array.from(this.strategies.keys());
  }

  private prepareData(logs: WeatherLogDocument[]): ExportData[] {
    return logs.map((log) => ({
      'Data/Hora': log.collected_at.toISOString(),
      Local: log.location,
      'Temperatura (°C)': log.temperature,
      'Sensação Térmica (°C)': log.apparent_temperature,
      'Umidade (%)': log.humidity,
      'Pressão (hPa)': log.surface_pressure,
      'Visibilidade (m)': log.visibility,
      Condição: log.condition,
      'Código WMO': log.weather_code,
      'AQI (US)': log.us_aqi,
      'Índice UV': log.uv_index,
      'PM2.5 (µg/m³)': log.pm2_5,
      'PM10 (µg/m³)': log.pm10,
      'CO (µg/m³)': log.carbon_monoxide,
      'NO₂ (µg/m³)': log.nitrogen_dioxide,
      'SO₂ (µg/m³)': log.sulphur_dioxide,
      'O₃ (µg/m³)': log.ozone,
      'Temp. Máxima (°C)': log.temperature_max,
      'Prob. Chuva (%)': log.precipitation_probability,
    }));
  }

  async export(format: ExportFormat): Promise<{
    data: Buffer | string;
    mimeType: string;
    extension: string;
  }> {
    const strategy = this.getStrategy(format);
    const logs = await this.weatherService.getAll(
      WeatherExportService.LOGS_LIMIT,
    );
    const data = this.prepareData(logs);

    return {
      data: strategy.export(data),
      mimeType: strategy.mimeType,
      extension: strategy.extension,
    };
  }
}
