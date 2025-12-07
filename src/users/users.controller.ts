import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Param,
  UseGuards,
  Query,
  NotFoundException,
  Patch,
  ForbiddenException,
  ConflictException,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import type { Request } from 'express';
import { Types } from 'mongoose';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Criar usuário (admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas admin)',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Listar todos os usuários com paginação (admin only)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas admin)',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
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

    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('O parâmetro limit deve ser entre 1 e 100');
    }

    return this.usersService.findAllPaginated(pageNum, limitNum);
  }

  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Buscar usuário por email' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findOne(@Query('email') email: string) {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new NotFoundException(`Usuário não encontrado.`);
    }

    return user;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Buscar usuário por ID (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do usuário',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de ID inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas admin)',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findOneById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Formato de ID inválido');
    }

    const user = await this.usersService.findOneById(id);

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Usuários comuns podem atualizar apenas seus próprios dados (exceto roles). Admins podem atualizar qualquer usuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do usuário',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de ID inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description:
      'Sem permissão para alterar outro usuário ou para alterar roles',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Formato de ID inválido');
    }

    const currentUser = req.user as ActiveUser;

    const isAdmin = currentUser.roles.includes(Role.Admin);

    const isSelf = currentUser.userId === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar os dados de outro usuário.',
      );
    }

    if (!isAdmin && updateUserDto.roles) {
      throw new ForbiddenException(
        'Você não pode alterar suas próprias permissões.',
      );
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Deletar usuário (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ObjectId do usuário',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de ID inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (apenas admin)',
  })
  remove(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Formato de ID inválido');
    }

    return this.usersService.remove(id);
  }
}
