import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Sun, Moon, TrendingUp } from "lucide-react";
import { InsightCard } from "@/components/ui/insight-card";
import { cn } from "@/utils/cn";
import type { WeatherLog } from "@/types/weather";
import {
  checkIsNightTime,
  calculateUVStats,
  getUVLevel,
  getUVRecommendation,
  getUVBarColor,
  getUVRiskDescription,
} from "@/utils/weather";

interface UVIndexContentProps {
  weather: WeatherLog;
}

export function UVIndexContent({ weather }: UVIndexContentProps) {
  const isNightTime = checkIsNightTime(weather);
  const uvStats = calculateUVStats(weather);
  const uvIndex = uvStats.current;
  const { label, bgColor } = getUVLevel(uvIndex, isNightTime);

  const recommendation = getUVRecommendation(
    isNightTime ? 0 : uvStats.max > 0 ? uvStats.max : uvIndex,
    isNightTime,
  );

  const MainIcon = isNightTime ? Moon : Sun;
  const mainIconColor = isNightTime ? "text-indigo-400" : "text-yellow-400";

  return (
    <Card className="rounded-3xl bg-[#0F1724] text-white shadow-[0px_8px_24px_rgba(0,0,0,0.3)] h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MainIcon className={cn("w-5 h-5", mainIconColor)} />
          <CardTitle className="text-lg font-bold">
            {isNightTime ? "0.0" : uvIndex.toFixed(1)} UVI
          </CardTitle>
        </div>
        <CardAction>
          <span
            className={`text-xs font-bold text-slate-900 px-2 py-1 rounded-full ${bgColor}`}
          >
            {label}
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* UV Max do dia */}
        {uvStats.max > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400">
              {isNightTime ? "Pico de hoje: " : "Pico: "}
              <span className="text-white font-semibold">
                {uvStats.max.toFixed(1)} UVI
              </span>{" "}
              às{" "}
              <span className="text-white font-semibold">
                {uvStats.maxHour.toString().padStart(2, "0")}:00
              </span>
            </span>
          </div>
        )}

        {/* Risk Description */}
        <p className="text-sm text-slate-300 leading-snug">
          {getUVRiskDescription(uvIndex, isNightTime)}
        </p>

        {/* UV Bar Chart */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-end justify-between h-16 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => (
              <div
                key={index}
                className={cn(
                  "w-full rounded-t-sm transition-all duration-500",
                  getUVBarColor(index, uvIndex, isNightTime),
                )}
                style={{ height: `${15 + index * 7.5}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 uppercase font-medium tracking-wider">
            <span>Baixo</span>
            <span>Extremo</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <InsightCard
          variant="custom"
          icon={recommendation.icon}
          title={recommendation.title}
          description={recommendation.text}
          customStyles={{
            container: cn(
              "bg-linear-to-br border",
              recommendation.gradient,
              recommendation.border,
            ),
            icon: recommendation.iconColor,
            title: recommendation.titleColor,
            description: "text-slate-300",
          }}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
