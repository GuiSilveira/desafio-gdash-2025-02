import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BlacklistedToken } from './schemas/blacklisted-token.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let blacklistModel: Model<BlacklistedToken>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    roles: ['user'],
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['user'],
    }),
  };

  const mockJwtToken = 'mock.jwt.token';
  const mockDecodedToken = {
    email: 'test@example.com',
    sub: '507f1f77bcf86cd799439011',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findOneWithPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockJwtToken),
            decode: jest.fn().mockReturnValue(mockDecodedToken),
          },
        },
        {
          provide: getModelToken(BlacklistedToken.name),
          useValue: {
            create: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    blacklistModel = module.get<Model<BlacklistedToken>>(
      getModelToken(BlacklistedToken.name),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      jest
        .spyOn(usersService, 'findOneWithPassword')
        .mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(usersService.findOneWithPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return null when user does not exist', async () => {
      jest.spyOn(usersService, 'findOneWithPassword').mockResolvedValue(null);

      const result = await service.validateUser(
        'invalid@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      jest
        .spyOn(usersService, 'findOneWithPassword')
        .mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info', () => {
      const validatedUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
      };

      const result = service.login(validatedUser as any);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe(mockJwtToken);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '507f1f77bcf86cd799439011',
        name: 'Test User',
        roles: ['user'],
      });
    });
  });

  describe('logout', () => {
    it('should blacklist token and return success message', async () => {
      jest.spyOn(blacklistModel, 'create').mockResolvedValue({} as any);

      const result = await service.logout(mockJwtToken);

      expect(result.message).toBe('Logout realizado e token invalidado.');
      expect(blacklistModel.create).toHaveBeenCalledWith({
        token: mockJwtToken,
        expiresAt: expect.any(Date),
      });
    });

    it('should return message when token is invalid', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      const result = await service.logout('invalid.token');

      expect(result.message).toBe('Token já expirado ou inválido.');
      expect(blacklistModel.create).not.toHaveBeenCalled();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true when token is blacklisted', async () => {
      jest
        .spyOn(blacklistModel, 'exists')
        .mockResolvedValue({ _id: 'some-id' } as any);

      const result = await service.isTokenBlacklisted(mockJwtToken);

      expect(result).toBe(true);
    });

    it('should return false when token is not blacklisted', async () => {
      jest.spyOn(blacklistModel, 'exists').mockResolvedValue(null);

      const result = await service.isTokenBlacklisted(mockJwtToken);

      expect(result).toBe(false);
    });
  });
});
