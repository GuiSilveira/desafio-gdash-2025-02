import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateInsightsDto {
  @ApiProperty({
    description: 'Número de horas para análise de insights',
    example: 12,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'O número de horas deve ser maior que 0' })
  hours: number;
}
