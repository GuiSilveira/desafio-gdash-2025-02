import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({
  timestamps: true,
  collection: 'weather_logs',
})
export class WeatherLog {
  @Prop({
    required: true,
  })
  location: string;

  @Prop({
    required: true,
    index: true,
  })
  collected_at: Date;

  @Prop({
    required: true,
  })
  temperature: number;

  @Prop({
    required: true,
  })
  humidity: number;

  @Prop()
  apparent_temperature: number;

  @Prop({
    required: true,
  })
  weather_code: number;

  @Prop()
  surface_pressure: number;

  @Prop()
  visibility: number;

  @Prop({
    required: true,
  })
  condition: string;

  @Prop()
  us_aqi: number;

  @Prop()
  uv_index: number;

  @Prop()
  pm2_5: number;

  @Prop()
  pm10: number;

  @Prop()
  carbon_monoxide: number;

  @Prop()
  nitrogen_dioxide: number;

  @Prop()
  sulphur_dioxide: number;

  @Prop()
  ozone: number;

  @Prop()
  temperature_max: number;

  @Prop()
  sunrise: string;

  @Prop()
  sunset: string;

  @Prop()
  daylight_duration: number;

  @Prop()
  sunshine_duration: number;

  @Prop()
  precipitation_probability: number;

  @Prop({ type: [String] })
  hourly_time: string[];

  @Prop({ type: [Number] })
  hourly_temperature: number[];

  @Prop({ type: [Number] })
  hourly_precipitation_probability: number[];

  @Prop({ type: [Number] })
  hourly_uv_index: number[];

  @Prop({ type: [Number] })
  hourly_us_aqi: number[];

  @Prop({ type: [String] })
  daily_time: string[];

  @Prop({ type: [Number] })
  daily_temperature_max: number[];

  @Prop({ type: [Number] })
  daily_temperature_min: number[];

  @Prop({ type: [Number] })
  daily_weather_code: number[];
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);
