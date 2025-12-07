import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60 * 60 * 1000,
      max: 100,
    }),
  ],
  controllers: [ExternalController],
  providers: [ExternalService],
})
export class ExternalModule {}
