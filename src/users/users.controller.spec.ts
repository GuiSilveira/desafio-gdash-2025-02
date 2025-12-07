import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/enums/role.enum';
import type { Request } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    roles: [Role.User],
  };

  const mockAdminUser = {
    _id: '507f1f77bcf86cd799439012',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: [Role.Admin],
  };

  const mockUsersService = {
    create: jest.fn(),
    findAllPaginated: jest.fn(),
    findOne: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should create a user successfully', async () => {
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      const duplicateError = { code: 11000 };
      mockUsersService.create.mockRejectedValue(duplicateError);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email já cadastrado',
      );
    });

    it('should rethrow other errors', async () => {
      const genericError = new Error('Database error');
      mockUsersService.create.mockRejectedValue(genericError);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockUsersService.findAllPaginated.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResult);
      expect(usersService.findAllPaginated).toHaveBeenCalledWith(1, 10);
    });

    it('should use default values when not provided', async () => {
      const paginatedResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockUsersService.findAllPaginated.mockResolvedValue(paginatedResult);

      await controller.findAll();

      expect(usersService.findAllPaginated).toHaveBeenCalledWith(1, 10);
    });

    it('should throw BadRequestException when page is NaN', async () => {
      await expect(
        controller.findAll('invalid' as unknown as number, 10),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when limit is NaN', async () => {
      await expect(
        controller.findAll(1, 'invalid' as unknown as number),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when page is less than 1', async () => {
      await expect(controller.findAll(0, 10)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll(0, 10)).rejects.toThrow(
        'O parâmetro page deve ser maior que 0',
      );
    });

    it('should throw BadRequestException when limit is less than 1', async () => {
      await expect(controller.findAll(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when limit is greater than 100', async () => {
      await expect(controller.findAll(1, 101)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll(1, 101)).rejects.toThrow(
        'O parâmetro limit deve ser entre 1 e 100',
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.findOne('notfound@example.com'),
      ).rejects.toThrow('Usuário não encontrado.');
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.findOneById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(usersService.findOneById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw BadRequestException for invalid ObjectId format', async () => {
      await expect(controller.findOneById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOneById('invalid-id')).rejects.toThrow(
        'Formato de ID inválido',
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(
        controller.findOneById('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.findOneById('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    const createMockRequest = (user: {
      userId: string;
      roles: Role[];
    }): Request => {
      return { user } as unknown as Request;
    };

    it('should allow admin to update any user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const req = createMockRequest({
        userId: mockAdminUser._id,
        roles: [Role.Admin],
      });

      const result = await controller.update(
        mockUser._id,
        updateUserDto,
        req,
      );

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(
        mockUser._id,
        updateUserDto,
      );
    });

    it('should allow user to update their own data', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const req = createMockRequest({
        userId: mockUser._id,
        roles: [Role.User],
      });

      const result = await controller.update(mockUser._id, updateUserDto, req);

      expect(result).toEqual(updatedUser);
    });

    it('should throw ForbiddenException when user tries to update another user', async () => {
      const req = createMockRequest({
        userId: 'different-user-id',
        roles: [Role.User],
      });

      await expect(
        controller.update('507f1f77bcf86cd799439011', updateUserDto, req),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.update('507f1f77bcf86cd799439011', updateUserDto, req),
      ).rejects.toThrow(
        'Você não tem permissão para alterar os dados de outro usuário.',
      );
    });

    it('should throw ForbiddenException when non-admin tries to update roles', async () => {
      const updateWithRoles: UpdateUserDto = {
        name: 'Updated Name',
        roles: [Role.Admin],
      };

      const req = createMockRequest({
        userId: mockUser._id,
        roles: [Role.User],
      });

      await expect(
        controller.update(mockUser._id, updateWithRoles, req),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.update(mockUser._id, updateWithRoles, req),
      ).rejects.toThrow('Você não pode alterar suas próprias permissões.');
    });

    it('should allow admin to update roles', async () => {
      const updateWithRoles: UpdateUserDto = {
        roles: [Role.Admin],
      };
      const updatedUser = { ...mockUser, roles: [Role.Admin] };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const req = createMockRequest({
        userId: mockAdminUser._id,
        roles: [Role.Admin],
      });

      const result = await controller.update(
        mockUser._id,
        updateWithRoles,
        req,
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid ObjectId format', async () => {
      const req = createMockRequest({
        userId: mockAdminUser._id,
        roles: [Role.Admin],
      });

      await expect(
        controller.update('invalid-id', updateUserDto, req),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update('invalid-id', updateUserDto, req),
      ).rejects.toThrow('Formato de ID inválido');
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      mockUsersService.remove.mockResolvedValue({ deleted: true });

      const result = controller.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(usersService.remove('507f1f77bcf86cd799439011'));
    });

    it('should throw BadRequestException for invalid ObjectId format', () => {
      expect(() => controller.remove('invalid-id')).toThrow(
        BadRequestException,
      );
      expect(() => controller.remove('invalid-id')).toThrow(
        'Formato de ID inválido',
      );
    });
  });
});
