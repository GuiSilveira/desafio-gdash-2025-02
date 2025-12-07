import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from './schemas/blacklisted-token.schema';
import {
  DecodedToken,
  JwtPayload,
  LoginResponse,
  LogoutResponse,
  ValidatedUser,
} from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(BlacklistedToken.name)
    private blacklistModel: Model<BlacklistedTokenDocument>,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<ValidatedUser | null> {
    const user = await this.usersService.findOneWithPassword(email);

    if (!user) {
      return null;
    }

    const passwordMatches = await compare(pass, user.password);

    if (!passwordMatches) {
      return null;
    }

    const { ...result } = user.toObject();

    return result;
  }

  login(user: ValidatedUser): LoginResponse {
    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      name: user.name,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        name: user.name,
        email: user.email,
      },
    };
  }

  async logout(token: string): Promise<LogoutResponse> {
    const decodedToken: DecodedToken = this.jwtService.decode(token);

    if (!decodedToken || !decodedToken.exp) {
      return {
        message: 'Token já expirado ou inválido.',
      };
    }

    const expirationDate = new Date(decodedToken.exp * 1000);

    await this.blacklistModel.create({
      token: token,
      expiresAt: expirationDate,
    });

    this.logger.log(
      `🚫 Token invalidado e adicionado à blacklist até ${expirationDate.toISOString()}`,
    );

    return { message: 'Logout realizado e token invalidado.' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistModel.exists({ token });

    return !!blacklistedToken;
  }
}
