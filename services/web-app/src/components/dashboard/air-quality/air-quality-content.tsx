import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Wind } from "lucide-react";
import { getAQILevel } from "@/utils/weather";
import type { WeatherLog } from "@/types/weather";

interface AirQualityContentProps {
  weather: WeatherLog | null | undefined;
}

export function AirQualityContent({ weather }: AirQualityContentProps) {
  if (!weather) {
    return (
      <Card className="rounded-4xl shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E] h-full">
        <CardContent className="py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const aqi = weather.us_aqi || 0;
  const { label, color, bgColor, barColor } = getAQILevel(aqi);
  const aqiPercentage = Math.min((aqi / 500) * 100, 100);

  return (
    <Card className="rounded-3xl bg-white dark:bg-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E] h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className={`p-2 rounded-xl ${bgColor}`}>
            <Wind className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
              Qualidade do Ar
            </CardTitle>
            <CardDescription className="text-xs text-[#636E72] dark:text-[#9BA6B5]">
              Índice AQI US
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center">
        {/* AQI Score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-[#2D3436] dark:text-[#F7F9FC] mb-1">
            {aqi || "--"}
          </div>
          <div className={`inline-block py-1 px-6 rounded-full ${bgColor}`}>
            <span className={`text-xs font-semibold ${color}`}>{label}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        {/* AQI Scale Bar */}
        <div className="w-full">
          <div className="relative h-2 bg-[#EDF1F5] dark:bg-[#3E4C5E] rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${aqiPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[#B2BEC3] dark:text-[#6E7C8F]">
            <span>Bom</span>
            <span>Moderado</span>
            <span>Ruim</span>
          </div>
        </div>

        {/* Pollutant Details */}
        <div className="space-y-1.5 text-xs w-full">
          {weather.pm2_5 !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[#636E72] dark:text-[#9BA6B5]">PM2.5</span>
              <span className="font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                {weather.pm2_5.toFixed(1)} µg/m³
              </span>
            </div>
          )}
          {weather.pm10 !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[#636E72] dark:text-[#9BA6B5]">PM10</span>
              <span className="font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                {weather.pm10.toFixed(1)} µg/m³
              </span>
            </div>
          )}
          {weather.ozone !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[#636E72] dark:text-[#9BA6B5]">
                Ozônio (O₃)
              </span>
              <span className="font-bold text-[#2D3436] dark:text-[#F7F9FC]">
                {weather.ozone.toFixed(1)} µg/m³
              </span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
