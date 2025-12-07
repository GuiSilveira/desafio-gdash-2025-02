import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { genSalt, hash } from 'bcrypt';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@gdash.com',
    );
    const adminPass = this.configService.get<string>('ADMIN_PASS', '123456');

    const existingAdmin = await this.userModel.findOne({
      email: adminEmail,
    });

    if (!existingAdmin) {
      this.logger.log(`👤 Criando usuário padrão: ${adminEmail}`);
      const hashedPassword = await this.hashPassword(adminPass);

      await this.userModel.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin GDASH',
        roles: [Role.Admin],
      });
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        email,
      })
      .select('-password')
      .exec();
  }

  async findOneWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        email,
      })
      .exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userModel
      .findById(user._id)
      .select('-password')
      .exec() as Promise<UserDocument>;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return hash(password, salt);
  }
}
