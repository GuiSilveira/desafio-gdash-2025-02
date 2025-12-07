import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeatherInsightsDto {
  @ApiProperty({
    description: 'Resumo textual dos insights meteorológicos',
    example: 'Temperatura média: 22°C, Condição mais comum: Ensolarado',
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    description: 'Tendência da temperatura',
    example: 'stable',
    enum: ['up', 'down', 'stable'],
  })
  @IsEnum(['up', 'down', 'stable'])
  @IsNotEmpty()
  trend: 'up' | 'down' | 'stable';

  @ApiProperty({
    description: 'Indica se há algum alerta meteorológico',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  alert: boolean;

  @ApiProperty({
    description: 'Índice de conforto climático (0-100)',
    example: 75,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  comfortScore?: number;

  @ApiProperty({
    description: 'Tags descritivas das condições climáticas',
    example: ['Ensolarado', 'Baixa Umidade', 'Boa Visibilidade'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
