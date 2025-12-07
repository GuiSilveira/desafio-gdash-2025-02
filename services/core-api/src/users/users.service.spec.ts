import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    roles: ['user'],
  };

  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        ADMIN_EMAIL: 'admin@test.com',
        ADMIN_PASS: 'testpass123',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [
        { ...mockUser, _id: '1' },
        { ...mockUser, _id: '2', email: 'user2@example.com' },
      ];

      const selectMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(users),
      });

      mockUserModel.find.mockReturnValue({
        select: selectMock,
      });

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalledWith('-password');
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null when user is not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.findOne('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findOneById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user is not found by id', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.findOneById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneWithPassword', () => {
    it('should return a user with password by email', async () => {
      const userWithPassword = {
        ...mockUser,
        password: '$2b$10$hashedpassword',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithPassword),
      });

      const result = await service.findOneWithPassword('test@example.com');

      expect(result).toEqual(userWithPassword);
      expect(result?.password).toBe('$2b$10$hashedpassword');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null when user is not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOneWithPassword(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated users with metadata', async () => {
      const users = [
        { ...mockUser, _id: '1' },
        { ...mockUser, _id: '2', email: 'user2@example.com' },
      ];

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(users),
              }),
            }),
          }),
        }),
      });

      mockUserModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await service.findAllPaginated(1, 10);

      expect(result).toEqual({
        data: users,
        total: 10,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should calculate correct skip value for page 2', async () => {
      const users = [{ ...mockUser, _id: '3' }];

      const limitMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(users),
      });
      const skipMock = jest.fn().mockReturnValue({
        limit: limitMock,
      });
      const sortMock = jest.fn().mockReturnValue({
        skip: skipMock,
      });
      const selectMock = jest.fn().mockReturnValue({
        sort: sortMock,
      });

      mockUserModel.find.mockReturnValue({
        select: selectMock,
      });

      mockUserModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(25),
      });

      const result = await service.findAllPaginated(2, 10);

      expect(skipMock).toHaveBeenCalledWith(10);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('should use default values when no parameters provided', async () => {
      const users = [{ ...mockUser, _id: '1' }];

      const limitMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(users),
      });
      const skipMock = jest.fn().mockReturnValue({
        limit: limitMock,
      });

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: skipMock,
          }),
        }),
      });

      mockUserModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllPaginated();

      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return empty data when no users exist', async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      mockUserModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findAllPaginated(1, 10);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should sort users by createdAt descending', async () => {
      const sortMock = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: sortMock,
        }),
      });

      mockUserModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAllPaginated(1, 10);

      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('onModuleInit', () => {
    it('should create admin user if not exists', async () => {

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn(),
      });

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);

      const hashedPassword = '$2b$10$hashedAdminPass';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue({
        email: 'admin@test.com',
        name: 'Admin GDASH',
        roles: ['admin'],
      });


      await service.onModuleInit();


      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@test.com',
      });
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin GDASH',
        roles: ['admin'],
      });
    });

    it('should not create admin user if already exists', async () => {

      const existingAdmin = {
        _id: '123',
        email: 'admin@test.com',
        name: 'Admin GDASH',
      };
      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(existingAdmin);


      await service.onModuleInit();


      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@test.com',
      });
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should use default values if env vars not set', async () => {


      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => defaultValue,
      );

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);

      const hashedPassword = '$2b$10$hashedDefaultPass';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue({});


      await service.onModuleInit();


      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'admin@gdash.com',
      });
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {

      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        roles: [Role.User],
      };

      const hashedPassword = '$2b$10$hashedpassword';
      const createdUserId = '507f1f77bcf86cd799439012';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUserModel.create.mockResolvedValue({
        ...createUserDto,
        password: hashedPassword,
        _id: createdUserId,
      });


      const userWithoutPassword = {
        email: createUserDto.email,
        name: createUserDto.name,
        roles: createUserDto.roles,
        _id: createdUserId,
      };

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(userWithoutPassword),
        }),
      });


      const result = await service.create(createUserDto);


      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    });
  });

  describe('update', () => {
    it('should update user and return updated data without password', async () => {

      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };

      const selectMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: selectMock,
      });


      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateUserDto,
      );


      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateUserDto,
        { new: true },
      );
      expect(selectMock).toHaveBeenCalledWith('-password');
    });

    it('should hash password when updating password', async () => {

      const updateUserDto: UpdateUserDto = {
        password: 'newpassword123',
      };

      const hashedPassword = '$2b$10$newhashedpassword';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const selectMock = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockUser, password: hashedPassword }),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: selectMock,
      });


      await service.update('507f1f77bcf86cd799439011', updateUserDto);


      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 'salt');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { password: hashedPassword },
        { new: true },
      );
    });

    it('should throw NotFoundException when user is not found', async () => {

      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

 & Assert
      await expect(
        service.update('nonexistent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {

      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });


      await service.remove('507f1f77bcf86cd799439011');


      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException when user is not found', async () => {

      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

 & Assert
      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
