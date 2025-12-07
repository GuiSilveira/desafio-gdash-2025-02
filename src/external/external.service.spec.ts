import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ExternalService } from './external.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ExternalService', () => {
  let service: ExternalService;
  let httpService: HttpService;

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        POKEAPI_URL: 'https://pokeapi.co/api/v2',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockPokemonListResponse = {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
    ],
  };

  const mockPokemonDetailsResponse = {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    types: [
      {
        slot: 1,
        type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
      },
      {
        slot: 2,
        type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' },
      },
    ],
    abilities: [
      {
        ability: {
          name: 'overgrow',
          url: 'https://pokeapi.co/api/v2/ability/65/',
        },
        is_hidden: false,
        slot: 1,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ExternalService>(ExternalService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated list of Pokemon', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonListResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.findAll(20, 0);

      expect(result).toEqual(mockPokemonListResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    it('should handle different pagination parameters', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonListResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findAll(50, 50);

      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?limit=50&offset=50',
        expect.any(Object),
      );
    });

    it('should use default values when no parameters provided', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonListResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findAll();

      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
        expect.any(Object),
      );
    });

    it('should throw HttpException on API error', async () => {
      const error = new Error('Network error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      await expect(service.findAll(20, 0)).rejects.toThrow(HttpException);
      await expect(service.findAll(20, 0)).rejects.toThrow(
        'Falha ao buscar dados da PokeAPI',
      );
    });

    it('should throw BAD_GATEWAY status on API error', async () => {
      const error = new Error('API Error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findAll(20, 0);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_GATEWAY,
        );
      }
    });
  });

  describe('findOne', () => {
    it('should return Pokemon details by ID', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonDetailsResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.findOne('1');

      expect(result).toEqual(mockPokemonDetailsResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/1',
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    it('should handle Pokemon name instead of ID', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonDetailsResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findOne('bulbasaur');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/bulbasaur',
        expect.any(Object),
      );
    });

    it('should throw HttpException when Pokemon not found', async () => {
      const error = new Error('Not found');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      await expect(service.findOne('99999')).rejects.toThrow(HttpException);
      await expect(service.findOne('99999')).rejects.toThrow(
        'Pokémon não encontrado',
      );
    });

    it('should throw NOT_FOUND status when Pokemon not found', async () => {
      const error = new Error('404 Not Found');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findOne('invalid-pokemon');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should handle special characters in Pokemon name', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: { ...mockPokemonDetailsResponse, name: 'mr-mime' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = (await service.findOne('mr-mime')) as { name: string };

      expect(result.name).toBe('mr-mime');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/mr-mime',
        expect.any(Object),
      );
    });
  });

  describe('API integration', () => {
    it('should use correct base URL', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonListResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findAll();

      const calledUrl = (httpService.get as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain('https://pokeapi.co/api/v2');
    });

    it('should set correct headers', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonListResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findAll();

      const calledHeaders = (httpService.get as jest.Mock).mock.calls[0][1];
      expect(calledHeaders.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('findSpecies', () => {
    const mockSpeciesResponse = {
      id: 1,
      name: 'bulbasaur',
      evolution_chain: {
        url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
      },
      flavor_text_entries: [
        {
          flavor_text: 'A strange seed was planted on its back at birth.',
          language: { name: 'en' },
        },
      ],
    };

    it('should return Pokemon species by ID', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockSpeciesResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.findSpecies('1');

      expect(result).toEqual(mockSpeciesResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon-species/1',
        { headers: { 'Content-Type': 'application/json' } },
      );
    });

    it('should return Pokemon species by name', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockSpeciesResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findSpecies('bulbasaur');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon-species/bulbasaur',
        expect.any(Object),
      );
    });

    it('should throw NOT_FOUND when species not found', async () => {
      const error = new Error('Not found');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      await expect(service.findSpecies('99999')).rejects.toThrow(HttpException);
      await expect(service.findSpecies('99999')).rejects.toThrow(
        'Species não encontrada',
      );
    });

    it('should return NOT_FOUND status on error', async () => {
      const error = new Error('Species error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findSpecies('invalid');
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('findEvolutionChain', () => {
    const mockEvolutionChainResponse = {
      id: 1,
      chain: {
        species: {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
        },
        evolves_to: [
          {
            species: {
              name: 'ivysaur',
              url: 'https://pokeapi.co/api/v2/pokemon-species/2/',
            },
            evolves_to: [
              {
                species: {
                  name: 'venusaur',
                  url: 'https://pokeapi.co/api/v2/pokemon-species/3/',
                },
                evolves_to: [],
              },
            ],
          },
        ],
      },
    };

    it('should return evolution chain by ID', async () => {
      const mockAxiosResponse: AxiosResponse = {
        data: mockEvolutionChainResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.findEvolutionChain('1');

      expect(result).toEqual(mockEvolutionChainResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/evolution-chain/1',
        { headers: { 'Content-Type': 'application/json' } },
      );
    });

    it('should throw NOT_FOUND when evolution chain not found', async () => {
      const error = new Error('Not found');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      await expect(service.findEvolutionChain('99999')).rejects.toThrow(
        HttpException,
      );
      await expect(service.findEvolutionChain('99999')).rejects.toThrow(
        'Evolution chain não encontrada',
      );
    });

    it('should return NOT_FOUND status on error', async () => {
      const error = new Error('Evolution error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findEvolutionChain('invalid');
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('cache behavior', () => {
    it('should return cached data when available (cache hit)', async () => {
      const cachedData = { cached: true, results: [] };
      mockCacheManager.get.mockResolvedValueOnce(cachedData);

      const result = await service.findAll(20, 0);

      expect(result).toEqual(cachedData);
      expect(httpService.get).not.toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith('pokemon:list:20:0');
    });

    it('should fetch from API and cache on cache miss', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonListResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      const result = await service.findAll(20, 0);

      expect(result).toEqual(mockPokemonListResponse);
      expect(httpService.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'pokemon:list:20:0',
        mockPokemonListResponse,
        60 * 60 * 1000,
      );
    });

    it('should use correct cache key for findOne', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      const mockAxiosResponse: AxiosResponse = {
        data: mockPokemonDetailsResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findOne('Pikachu');

      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'pokemon:detail:pikachu',
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'pokemon:detail:pikachu',
        mockPokemonDetailsResponse,
        24 * 60 * 60 * 1000,
      );
    });

    it('should use correct cache key for findSpecies', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      const mockAxiosResponse: AxiosResponse = {
        data: { id: 1, name: 'bulbasaur' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findSpecies('Bulbasaur');

      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'pokemon:species:bulbasaur',
      );
    });

    it('should use correct cache key for findEvolutionChain', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      const mockAxiosResponse: AxiosResponse = {
        data: { id: 1, chain: {} },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosResponse['config'],
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      await service.findEvolutionChain('1');

      expect(mockCacheManager.get).toHaveBeenCalledWith('pokemon:evolution:1');
    });
  });

  describe('error handling', () => {
    it('should log error when findAll fails', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      const error = new Error('API Error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findAll();
      } catch {
      }

      expect(loggerSpy).toHaveBeenCalledWith('Erro na PokeAPI', error);
    });

    it('should log error when findOne fails', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      const error = new Error('Not Found');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findOne('123');
      } catch {
      }

      expect(loggerSpy).toHaveBeenCalledWith(
        'Erro ao buscar Pokémon 123',
        error,
      );
    });

    it('should log error when findSpecies fails', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      const error = new Error('Species Error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findSpecies('25');
      } catch {
      }

      expect(loggerSpy).toHaveBeenCalledWith(
        'Erro ao buscar species do Pokémon 25',
        error,
      );
    });

    it('should log error when findEvolutionChain fails', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      const error = new Error('Evolution Error');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      try {
        await service.findEvolutionChain('1');
      } catch {
      }

      expect(loggerSpy).toHaveBeenCalledWith(
        'Erro ao buscar evolution chain 1',
        error,
      );
    });
  });
});
