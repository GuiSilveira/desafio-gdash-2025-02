import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  Min,
  Max,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
  @ApiProperty({
    description: 'Localização da coleta',
    example: 'Caruaru, PE',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Data e hora da coleta (formato ISO 8601)',
    example: '2025-12-04T15:30:00-03:00',
  })
  @IsDateString()
  @IsNotEmpty()
  collected_at: string;

  @ApiProperty({
    description: 'Temperatura em graus Celsius',
    example: 22.5,
    minimum: -90,
    maximum: 60,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(-90, { message: 'A temperatura não pode ser menor que -90°C' })
  @Max(60, { message: 'A temperatura não pode ser maior que 60°C' })
  temperature: number;

  @ApiProperty({
    description: 'Umidade relativa do ar em porcentagem',
    example: 65,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'A umidade não pode ser negativa' })
  @Max(100, { message: 'A umidade não pode ser maior que 100%' })
  humidity: number;

  @ApiProperty({
    description: 'Temperatura aparente (sensação térmica) em graus Celsius',
    example: 24.1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  apparent_temperature?: number;

  @ApiProperty({
    description: 'Código WMO da condição meteorológica',
    example: 0,
  })
  @IsInt()
  @IsNotEmpty()
  weather_code: number;

  @ApiProperty({
    description: 'Pressão atmosférica ao nível do mar em hPa',
    example: 1013.25,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  surface_pressure?: number;

  @ApiProperty({
    description: 'Visibilidade em metros',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  visibility?: number;

  @ApiProperty({
    description: 'Condição meteorológica em texto',
    example: 'Céu Limpo',
  })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({
    description: 'Índice de Qualidade do Ar (US AQI)',
    example: 42,
    required: false,
  })
  @IsInt()
  @IsOptional()
  us_aqi?: number;

  @ApiProperty({
    description: 'Índice UV',
    example: 5.2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  uv_index?: number;

  @ApiProperty({
    description: 'Concentração de PM2.5 em µg/m³',
    example: 12.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  pm2_5?: number;

  @ApiProperty({
    description: 'Concentração de PM10 em µg/m³',
    example: 23.8,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  pm10?: number;

  @ApiProperty({
    description: 'Concentração de monóxido de carbono em µg/m³',
    example: 230.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  carbon_monoxide?: number;

  @ApiProperty({
    description: 'Concentração de dióxido de nitrogênio em µg/m³',
    example: 15.2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  nitrogen_dioxide?: number;

  @ApiProperty({
    description: 'Concentração de dióxido de enxofre em µg/m³',
    example: 5.1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sulphur_dioxide?: number;

  @ApiProperty({
    description: 'Concentração de ozônio em µg/m³',
    example: 78.3,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  ozone?: number;

  @ApiProperty({
    description: 'Temperatura máxima do dia em graus Celsius',
    example: 28.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  temperature_max?: number;

  @ApiProperty({
    description: 'Horário do nascer do sol (ISO 8601)',
    example: '2025-12-04T05:30:00-03:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  sunrise?: string;

  @ApiProperty({
    description: 'Horário do pôr do sol (ISO 8601)',
    example: '2025-12-04T18:15:00-03:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  sunset?: string;

  @ApiProperty({
    description: 'Duração da luz do dia em segundos',
    example: 45900,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  daylight_duration?: number;

  @ApiProperty({
    description: 'Duração do sol direto em segundos',
    example: 32400,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sunshine_duration?: number;

  @ApiProperty({
    description: 'Probabilidade de precipitação em porcentagem',
    example: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  precipitation_probability?: number;

  @ApiProperty({
    description: 'Array de horários (24 horas)',
    example: ['2025-12-04T00:00', '2025-12-04T01:00'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  hourly_time?: string[];

  @ApiProperty({
    description: 'Array de temperaturas horárias em °C',
    example: [22.5, 21.8, 21.2],
    required: false,
  })
  @IsArray()
  @IsOptional()
  hourly_temperature?: number[];

  @ApiProperty({
    description: 'Array de probabilidade de precipitação horária em %',
    example: [10, 15, 20],
    required: false,
  })
  @IsArray()
  @IsOptional()
  hourly_precipitation_probability?: number[];

  @ApiProperty({
    description: 'Array de índice UV horário',
    example: [0, 0.5, 2.1],
    required: false,
  })
  @IsArray()
  @IsOptional()
  hourly_uv_index?: number[];

  @ApiProperty({
    description: 'Array de índice de qualidade do ar horário (US AQI)',
    example: [42, 45, 48],
    required: false,
  })
  @IsArray()
  @IsOptional()
  hourly_us_aqi?: number[];

  @ApiProperty({
    description: 'Array de datas do forecast (YYYY-MM-DD)',
    example: ['2025-12-04', '2025-12-05', '2025-12-06'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  daily_time?: string[];

  @ApiProperty({
    description: 'Array de temperaturas máximas diárias em °C',
    example: [28.5, 29.1, 27.8],
    required: false,
  })
  @IsArray()
  @IsOptional()
  daily_temperature_max?: number[];

  @ApiProperty({
    description: 'Array de temperaturas mínimas diárias em °C',
    example: [18.5, 19.1, 17.8],
    required: false,
  })
  @IsArray()
  @IsOptional()
  daily_temperature_min?: number[];

  @ApiProperty({
    description: 'Array de códigos WMO diários',
    example: [0, 1, 3],
    required: false,
  })
  @IsArray()
  @IsOptional()
  daily_weather_code?: number[];
}
