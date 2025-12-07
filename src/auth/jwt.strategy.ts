import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { ActiveUser } from './interfaces/active-user.interface';
import { JwtPayload } from './interfaces/auth.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<ActiveUser> {
    const rawToken = req.get('Authorization')?.replace('Bearer ', '').trim();

    if (!rawToken) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    const isBlackListedToken =
      await this.authService.isTokenBlacklisted(rawToken);

    if (rawToken && isBlackListedToken) {
      throw new UnauthorizedException(
        'Token foi invalidado. Por favor, faça login novamente.',
      );
    }

    const user = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return {
      userId: payload.sub,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }
}
