import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.headers['x-internal-token'];

    const internalSecret = this.configService.get<string>('INTERNAL_API_TOKEN');

    if (!internalSecret) {
      console.error('CRÍTICO: INTERNAL_API_TOKEN não definido no .env');
      return false;
    }

    if (token !== internalSecret) {
      throw new UnauthorizedException('Acesso interno negado: Token inválido.');
    }

    return true;
  }
}
