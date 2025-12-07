import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  BadRequestException,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherInsightsDto } from './dto/weather-insights.dto';
import { AuthGuard } from '@nestjs/passport';
import { InternalTokenGuard } from '../auth/guards/internal-token.guard';
import { WeatherAnalysisService } from './weather-analysis.service';
import { WeatherExportService } from './weather-export.service';
import type { ExportFormat } from './export-strategies';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly analysisService: WeatherAnalysisService,
    private readonly exportService: WeatherExportService,
  ) {}

  @Post()
  @UseGuards(InternalTokenGuard)
  @ApiOperation({
    summary: 'Criar registro meteorológico (serviços internos)',
  })
  @ApiSecurity('internal-token')
  @ApiBody({ type: CreateWeatherDto })
  @ApiResponse({
    status: 201,
    description: 'Registro criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token interno inválido',
  })
  async create(@Body() data: CreateWeatherDto) {
    return this.weatherService.create(data);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar registros meteorológicos com paginação' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (isNaN(pageNum) || isNaN(limitNum)) {
      throw new BadRequestException(
        'Os parâmetros page e limit devem ser números',
      );
    }

    if (pageNum < 1) {
      throw new BadRequestException('O parâmetro page deve ser maior que 0');
    }

    if (limitNum < 1) {
      throw new BadRequestException('O parâmetro limit deve ser maior que 0');
    }

    return this.weatherService.findAll(pageNum, limitNum);
  }

  @Get('recent/:hours')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar registros recentes (últimas N horas)' })
  @ApiParam({
    name: 'hours',
    description: 'Número de horas (deve ser >= 0)',
    example: 24,
  })
  @ApiResponse({
    status: 200,
    description: 'Registros retornados com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetro hours inválido ou negativo',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async findRecent(@Param('hours', ParseIntPipe) hours: number) {
    if (hours < 0) {
      throw new BadRequestException('O parâmetro hours não pode ser negativo');
    }
    return this.weatherService.findRecent(hours);
  }

  @Post('insights')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Gerar insights meteorológicos (apenas resumo)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hours: {
          type: 'number',
          example: 12,
          description: 'Número de horas para análise',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Insights gerados com sucesso',
    schema: {
      example: {
        insights: 'Temperatura média: 22°C, Condição mais comum: Ensolarado',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async generateInsights(@Body('hours') hours: number = 12) {
    const insights = await this.analysisService.generateInsights(hours);
    return { insights: insights.summary };
  }

  @Get('insights')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter insights meteorológicos completos (últimas 12 horas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights completos retornados',
    type: WeatherInsightsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async getInsights(): Promise<WeatherInsightsDto> {
    return this.analysisService.generateInsights(12);
  }

  @Get('forecast-insights')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter insights da previsão de 7 dias gerados por IA',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights da previsão retornados',
    type: WeatherInsightsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async getForecastInsights(): Promise<WeatherInsightsDto> {
    return this.analysisService.generateForecastInsights();
  }

  @Get('export/:format')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Exportar dados meteorológicos no formato especificado',
  })
  @ApiParam({
    name: 'format',
    description: 'Formato de exportação',
    enum: ['csv', 'xlsx', 'json'],
    example: 'xlsx',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo gerado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de exportação inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async exportData(
    @Param('format') format: string,
    @Res() res: Response,
  ): Promise<void> {
    const validFormats: ExportFormat[] = ['csv', 'xlsx', 'json'];

    if (!validFormats.includes(format as ExportFormat)) {
      throw new BadRequestException(
        `Formato '${format}' não suportado. Formatos disponíveis: ${validFormats.join(', ')}`,
      );
    }

    const result = await this.exportService.export(format as ExportFormat);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="weather_logs.${result.extension}"`,
    );

    if (Buffer.isBuffer(result.data)) {
      res.send(result.data);
    } else {
      res.send(result.data);
    }
  }
}
