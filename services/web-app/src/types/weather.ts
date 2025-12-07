import type { LucideIcon } from "lucide-react";

export type HourlyTabType = "temperature" | "rain" | "uv" | "aqi";
export type HourlyChartType = "area" | "line" | "bar";
export type HourlyTimeRange = "6h" | "12h" | "24h";

export interface HourlyTabConfig {
  id: HourlyTabType;
  icon: LucideIcon;
  label: string;
  dataKey: string;
  unit: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  buttonBg: string;
  buttonShadow: string;
}

export interface HourlyChartTypeConfig {
  id: HourlyChartType;
  icon: LucideIcon;
  label: string;
}

export interface HourlyTimeRangeConfig {
  id: HourlyTimeRange;
  label: string;
  hours: number;
}

export interface HourlyChartDataPoint {
  hour: string;
  hourNum: number;
  time: string;
  temperature: number;
  precipitation: number;
  uv: number;
  aqi: number;
}

export interface WeatherBase {
  _id: string;
  location: string;
  collected_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  weather_code: number;
  precipitation_probability?: number;
}

export interface WeatherAtmospheric {
  apparent_temperature?: number;
  surface_pressure?: number;
  visibility?: number;
  temperature_max?: number;
}

export interface WeatherSun {
  sunrise?: string;
  sunset?: string;
  daylight_duration?: number;
  sunshine_duration?: number;
}

export interface WeatherAirQuality {
  us_aqi?: number;
  uv_index?: number;
  pm2_5?: number;
  pm10?: number;
  carbon_monoxide?: number;
  nitrogen_dioxide?: number;
  sulphur_dioxide?: number;
  ozone?: number;
}

export interface WeatherHourly {
  hourly_time?: string[];
  hourly_temperature?: number[];
  hourly_precipitation_probability?: number[];
  hourly_uv_index?: number[];
  hourly_us_aqi?: number[];
}

export interface WeatherDaily {
  daily_time?: string[];
  daily_temperature_max?: number[];
  daily_temperature_min?: number[];
  daily_weather_code?: number[];
}

export interface WeatherLog
  extends WeatherBase,
    WeatherCurrent,
    WeatherAtmospheric,
    WeatherSun,
    WeatherAirQuality,
    WeatherHourly,
    WeatherDaily {}

export interface WeatherInsights {
  summary: string;
  trend: "up" | "down" | "stable";
  alert: boolean;
  comfortScore?: number;
  tags?: string[];
  lastUpdated?: Date;
}

export interface WeatherStats {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  averages: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
  trends: {
    temperature: "up" | "down" | "stable";
    humidity: "up" | "down" | "stable";
  };
}

export interface WeatherFilters {
  startDate?: string;
  endDate?: string;
  minTemp?: number;
  maxTemp?: number;
  minHumidity?: number;
  maxHumidity?: number;
  conditions?: string[];
}

export interface WeatherPaginatedResponse {
  data: WeatherLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
