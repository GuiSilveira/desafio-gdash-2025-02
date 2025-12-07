import { useCurrentWeather } from "@/hooks/use-weather";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Gauge,
  Eye,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Snowflake,
  CloudLightning,
  CloudFog,
} from "lucide-react";
import { getWeatherIconType } from "@/utils/weather";

export function MainWeatherCard() {
  const { data: weather } = useCurrentWeather();

  if (!weather) {
    return (
      <Card className="rounded-4xl shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E]">
        <CardContent className="py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const iconType = getWeatherIconType(weather.condition);

  const renderWeatherIcon = (className: string) => {
    switch (iconType) {
      case "sunny":
        return <Sun className={className} />;
      case "cloudy":
        return <Cloud className={className} />;
      case "rainy":
        return <CloudRain className={className} />;
      case "snowy":
        return <Snowflake className={className} />;
      case "stormy":
        return <CloudLightning className={className} />;
      case "foggy":
        return <CloudFog className={className} />;
      default:
        return <Sun className={className} />;
    }
  };

  return (
    <Card className="rounded-3xl bg-linear-to-br from-blue-50 to-white dark:from-[#2C3A4B] dark:to-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E] flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#3E4C5E] shadow-sm dark:shadow-none">
            {renderWeatherIcon("w-6 h-6 text-orange-500")}
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-[#2D3436] dark:text-[#F7F9FC]">
              Clima
            </CardTitle>
            <CardDescription className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
              Como está o tempo.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Temperature Display */}
        <div className="my-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-6xl font-bold tracking-tighter text-[#2D3436] dark:text-[#F7F9FC]">
              {Math.round(weather.temperature)}°C
            </div>
            {/* Feels like mini card */}
            <div className="ml-2 px-3 py-2 rounded-xl flex gap-2 shadow-sm items-center bg-white dark:bg-[#3E4C5E] border border-[#EDF1F5] dark:border-[#57606F]">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#636E72] dark:text-[#9BA6B5] font-medium leading-none">
                  Sensação
                </span>
                <span className="text-sm font-bold text-[#2D3436] dark:text-[#F7F9FC] leading-none mt-0.5">
                  {Math.round(
                    weather.apparent_temperature || weather.temperature,
                  )}
                  °C
                </span>
              </div>
            </div>
          </div>
          <p className="text-[#2D3436] dark:text-[#F7F9FC] font-medium flex items-center gap-1.5">
            {renderWeatherIcon("w-4 h-4")}
            {weather.condition}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full">
          <MiniCard
            icon={<Gauge className="w-3 h-3 text-[#6C5CE7]" />}
            label="Pressão"
            value={
              weather.surface_pressure
                ? Math.round(weather.surface_pressure).toString() + "mb"
                : "800mb"
            }
            insight="Estável"
          />
          <MiniCard
            icon={<Eye className="w-3 h-3 text-[#00B894]" />}
            label="Visibilidade"
            value={
              weather.visibility
                ? Math.round(weather.visibility / 1000).toString() + "km"
                : "5km"
            }
            insight="Clara"
          />
          <MiniCard
            icon={<Droplets className="w-3 h-3 text-[#74B9FF]" />}
            label="Umidade"
            value={`${Math.round(weather.humidity)}%`}
            insight="Normal"
          />
        </div>
      </CardFooter>
    </Card>
  );
}

function MiniCard({
  icon,
  label,
  value,
  insight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  insight: string;
}) {
  return (
    <div className="flex flex-col p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#3E4C5E] shadow-sm dark:shadow-none border border-slate-50 dark:border-[#57606F] hover:shadow-md dark:hover:shadow-none transition-all">
      <div className="flex items-center gap-1.5 text-[#2D3436] dark:text-[#9BA6B5]">
        {icon}
        <span className="text-xs font-bold">{label}</span>
      </div>
      <span className="text-lg font-bold text-[#2D3436] dark:text-[#F7F9FC] my-2">
        {value}
      </span>
      <span className="text-xs font-medium text-slate-400 truncate">
        {insight}
      </span>
    </div>
  );
}
