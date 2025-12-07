import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'Formato de email inválido',
    },
  )
  @IsNotEmpty({
    message: 'Email é obrigatório',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({
    message: 'Senha é obrigatória',
  })
  @MinLength(6, {
    message: 'Senha deve ter no mínimo 6 caracteres',
  })
  password: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Nome é obrigatório',
  })
  name: string;

  @ApiProperty({
    description: 'Perfis de acesso do usuário',
    example: ['user'],
    enum: Role,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, {
    each: true,
    message: 'Role inválida',
  })
  roles?: Role[];
}
