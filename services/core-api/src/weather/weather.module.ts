import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from './schemas/weather.schema';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { AuthModule } from '../auth/auth.module';
import { WeatherAnalysisService } from './weather-analysis.service';
import { WeatherExportService } from './weather-export.service';
import { AIModule } from '../ai';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
    AuthModule,
    AIModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherAnalysisService, WeatherExportService],
})
export class WeatherModule {}
