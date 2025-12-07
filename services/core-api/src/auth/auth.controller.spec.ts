import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should register a new user successfully', async () => {
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      const duplicateError = { code: 11000 };
      mockUsersService.create.mockRejectedValue(duplicateError);

      await expect(controller.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.register(createUserDto)).rejects.toThrow(
        'Email já cadastrado',
      );
    });

    it('should rethrow other errors', async () => {
      const genericError = new Error('Database error');
      mockUsersService.create.mockRejectedValue(genericError);

      await expect(controller.register(createUserDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const loginResponse = {
        access_token: 'jwt-token',
        user: mockUser,
      };
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(loginResponse);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthService.validateUser.mockResolvedValue(undefined);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const logoutResponse = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(logoutResponse);

      const result = await controller.logout('Bearer jwt-token-here');

      expect(result).toEqual(logoutResponse);
      expect(authService.logout).toHaveBeenCalledWith('jwt-token-here');
    });

    it('should handle token without Bearer prefix', async () => {
      const logoutResponse = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(logoutResponse);

      await controller.logout('Bearer token-value');

      expect(authService.logout).toHaveBeenCalledWith('token-value');
    });

    it('should trim whitespace from token', async () => {
      const logoutResponse = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(logoutResponse);

      await controller.logout('Bearer   token-with-spaces   ');

      expect(authService.logout).toHaveBeenCalledWith('token-with-spaces');
    });
  });
});
