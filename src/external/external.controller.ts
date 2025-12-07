import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ExternalService } from './external.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('external')
@ApiBearerAuth('JWT-auth')
@Controller('external/pokemon')
@UseGuards(AuthGuard('jwt'))
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar Pokémon da API externa (PokeAPI)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de resultados (padrão: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset para paginação (padrão: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de Pokémon retornada com sucesso',
    schema: {
      example: {
        count: 1279,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros limit ou offset negativos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    if (limit !== undefined && limitNum < 0) {
      throw new BadRequestException('O parâmetro limit não pode ser negativo');
    }
    if (offset !== undefined && offsetNum < 0) {
      throw new BadRequestException('O parâmetro offset não pode ser negativo');
    }

    const finalLimit = limitNum > 0 ? limitNum : 20;
    const finalOffset = offsetNum >= 0 ? offsetNum : 0;
    return this.externalService.findAll(finalLimit, finalOffset);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar Pokémon por ID ou nome',
  })
  @ApiParam({
    name: 'id',
    description: 'ID ou nome do Pokémon',
    example: 'pikachu',
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon encontrado',
    schema: {
      example: {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        abilities: [
          {
            ability: {
              name: 'static',
              url: 'https://pokeapi.co/api/v2/ability/9/',
            },
            is_hidden: false,
            slot: 1,
          },
        ],
        types: [
          {
            slot: 1,
            type: {
              name: 'electric',
              url: 'https://pokeapi.co/api/v2/type/13/',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pokémon não encontrado',
  })
  async findOne(@Param('id') id: string) {
    return this.externalService.findOne(id);
  }

  @Get(':id/species')
  @ApiOperation({
    summary: 'Buscar species do Pokémon (contém evolution chain)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID ou nome do Pokémon',
    example: 'bulbasaur',
  })
  @ApiResponse({
    status: 200,
    description: 'Species encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Species não encontrada',
  })
  async findSpecies(@Param('id') id: string) {
    return this.externalService.findSpecies(id);
  }

  @Get('evolution-chain/:id')
  @ApiOperation({
    summary: 'Buscar cadeia de evolução por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da evolution chain',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Evolution chain encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Evolution chain não encontrada',
  })
  async findEvolutionChain(@Param('id') id: string) {
    return this.externalService.findEvolutionChain(id);
  }
}
