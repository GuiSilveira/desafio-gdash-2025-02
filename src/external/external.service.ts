import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { lastValueFrom } from 'rxjs';

const CACHE_TTL = {
  POKEMON_LIST: 60 * 60 * 1000,
  POKEMON_DETAIL: 24 * 60 * 60 * 1000,
  POKEMON_SPECIES: 24 * 60 * 60 * 1000,
  EVOLUTION_CHAIN: 24 * 60 * 60 * 1000,
};

@Injectable()
export class ExternalService {
  private readonly logger = new Logger(ExternalService.name);
  private readonly pokeApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.pokeApiUrl = this.configService.get<string>(
      'POKEAPI_URL',
      'https://pokeapi.co/api/v2',
    );
  }

  private async fetchWithCache<T>(
    cacheKey: string,
    url: string,
    ttl: number,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached) {
      this.logger.debug(`📦 Cache hit: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`🌐 Cache miss: ${cacheKey}, fetching from API`);
    const response = await lastValueFrom(
      this.httpService.get<T>(url, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await this.cacheManager.set(cacheKey, response.data, ttl);

    return response.data;
  }

  async findAll(limit: number = 20, offset: number = 0) {
    this.logger.log(`🎮 Buscando Pokémon - Offset: ${offset}, Limit: ${limit}`);

    try {
      const cacheKey = `pokemon:list:${limit}:${offset}`;
      const url = `${this.pokeApiUrl}/pokemon?limit=${limit}&offset=${offset}`;

      return await this.fetchWithCache(cacheKey, url, CACHE_TTL.POKEMON_LIST);
    } catch (error) {
      this.logger.error('Erro na PokeAPI', error);
      throw new HttpException(
        'Falha ao buscar dados da PokeAPI',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async findOne(id: string) {
    this.logger.log(`🔎 Buscando detalhes do Pokémon ${id}`);

    try {
      const cacheKey = `pokemon:detail:${id.toLowerCase()}`;
      const url = `${this.pokeApiUrl}/pokemon/${id}`;

      return await this.fetchWithCache(cacheKey, url, CACHE_TTL.POKEMON_DETAIL);
    } catch (error) {
      this.logger.error(`Erro ao buscar Pokémon ${id}`, error);
      throw new HttpException('Pokémon não encontrado', HttpStatus.NOT_FOUND);
    }
  }

  async findSpecies(id: string) {
    this.logger.log(`🧬 Buscando species do Pokémon ${id}`);

    try {
      const cacheKey = `pokemon:species:${id.toLowerCase()}`;
      const url = `${this.pokeApiUrl}/pokemon-species/${id}`;

      return await this.fetchWithCache(
        cacheKey,
        url,
        CACHE_TTL.POKEMON_SPECIES,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar species do Pokémon ${id}`, error);
      throw new HttpException('Species não encontrada', HttpStatus.NOT_FOUND);
    }
  }

  async findEvolutionChain(id: string) {
    this.logger.log(`🔄 Buscando evolution chain ${id}`);

    try {
      const cacheKey = `pokemon:evolution:${id}`;
      const url = `${this.pokeApiUrl}/evolution-chain/${id}`;

      return await this.fetchWithCache(
        cacheKey,
        url,
        CACHE_TTL.EVOLUTION_CHAIN,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar evolution chain ${id}`, error);
      throw new HttpException(
        'Evolution chain não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
