import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';

describe('ExternalController', () => {
  let controller: ExternalController;
  let externalService: ExternalService;

  const mockPokemon = {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: [{ slot: 1, type: { name: 'electric' } }],
  };

  const mockPokemonList = {
    count: 1279,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    ],
  };

  const mockSpecies = {
    id: 25,
    name: 'pikachu',
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
  };

  const mockEvolutionChain = {
    id: 10,
    chain: {
      species: { name: 'pichu' },
      evolves_to: [{ species: { name: 'pikachu' } }],
    },
  };

  const mockExternalService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findSpecies: jest.fn(),
    findEvolutionChain: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalController],
      providers: [
        {
          provide: ExternalService,
          useValue: mockExternalService,
        },
      ],
    }).compile();

    controller = module.get<ExternalController>(ExternalController);
    externalService = module.get<ExternalService>(ExternalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of pokemon with default pagination', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      const result = await controller.findAll();

      expect(result).toEqual(mockPokemonList);
      expect(externalService.findAll).toHaveBeenCalledWith(20, 0);
    });

    it('should return list of pokemon with custom limit', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      const result = await controller.findAll('50');

      expect(result).toEqual(mockPokemonList);
      expect(externalService.findAll).toHaveBeenCalledWith(50, 0);
    });

    it('should return list of pokemon with custom offset', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      const result = await controller.findAll(undefined, '20');

      expect(result).toEqual(mockPokemonList);
      expect(externalService.findAll).toHaveBeenCalledWith(20, 20);
    });

    it('should return list of pokemon with custom limit and offset', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      const result = await controller.findAll('50', '100');

      expect(result).toEqual(mockPokemonList);
      expect(externalService.findAll).toHaveBeenCalledWith(50, 100);
    });

    it('should throw BadRequestException when limit is negative', async () => {
      await expect(controller.findAll('-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll('-1')).rejects.toThrow(
        'O parâmetro limit não pode ser negativo',
      );
    });

    it('should throw BadRequestException when offset is negative', async () => {
      await expect(controller.findAll(undefined, '-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll(undefined, '-1')).rejects.toThrow(
        'O parâmetro offset não pode ser negativo',
      );
    });

    it('should use default limit when limit is 0', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      await controller.findAll('0');

      expect(externalService.findAll).toHaveBeenCalledWith(20, 0);
    });

    it('should allow offset of 0', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      await controller.findAll('20', '0');

      expect(externalService.findAll).toHaveBeenCalledWith(20, 0);
    });

    it('should handle NaN limit by using default', async () => {
      mockExternalService.findAll.mockResolvedValue(mockPokemonList);

      await controller.findAll('invalid');

      expect(externalService.findAll).toHaveBeenCalledWith(20, 0);
    });
  });

  describe('findOne', () => {
    it('should return a pokemon by id', async () => {
      mockExternalService.findOne.mockResolvedValue(mockPokemon);

      const result = await controller.findOne('25');

      expect(result).toEqual(mockPokemon);
      expect(externalService.findOne).toHaveBeenCalledWith('25');
    });

    it('should return a pokemon by name', async () => {
      mockExternalService.findOne.mockResolvedValue(mockPokemon);

      const result = await controller.findOne('pikachu');

      expect(result).toEqual(mockPokemon);
      expect(externalService.findOne).toHaveBeenCalledWith('pikachu');
    });

    it('should handle pokemon not found', async () => {
      mockExternalService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findSpecies', () => {
    it('should return species by pokemon id', async () => {
      mockExternalService.findSpecies.mockResolvedValue(mockSpecies);

      const result = await controller.findSpecies('25');

      expect(result).toEqual(mockSpecies);
      expect(externalService.findSpecies).toHaveBeenCalledWith('25');
    });

    it('should return species by pokemon name', async () => {
      mockExternalService.findSpecies.mockResolvedValue(mockSpecies);

      const result = await controller.findSpecies('pikachu');

      expect(result).toEqual(mockSpecies);
      expect(externalService.findSpecies).toHaveBeenCalledWith('pikachu');
    });

    it('should handle species not found', async () => {
      mockExternalService.findSpecies.mockResolvedValue(null);

      const result = await controller.findSpecies('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findEvolutionChain', () => {
    it('should return evolution chain by id', async () => {
      mockExternalService.findEvolutionChain.mockResolvedValue(
        mockEvolutionChain,
      );

      const result = await controller.findEvolutionChain('10');

      expect(result).toEqual(mockEvolutionChain);
      expect(externalService.findEvolutionChain).toHaveBeenCalledWith('10');
    });

    it('should handle evolution chain not found', async () => {
      mockExternalService.findEvolutionChain.mockResolvedValue(null);

      const result = await controller.findEvolutionChain('99999');

      expect(result).toBeNull();
    });
  });
});
