import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLogDocument>,
  ) {}

  async create(data: CreateWeatherDto): Promise<WeatherLog> {
    this.logger.log(`🌤️ Recebendo dados climáticos: ${data.temperature}°C`);
    const createdLog = new this.weatherModel(data);
    return createdLog.save();
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.weatherModel
        .find()
        .sort({ collected_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAll(limit: number = 1000): Promise<WeatherLogDocument[]> {
    return this.weatherModel
      .find()
      .sort({ collected_at: -1 })
      .limit(limit)
      .exec();
  }

  async findRecent(hours: number): Promise<WeatherLogDocument[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    return this.weatherModel
      .find({
        collected_at: { $gte: cutoffDate },
      })
      .sort({ collected_at: -1 })
      .exec();
  }
}
