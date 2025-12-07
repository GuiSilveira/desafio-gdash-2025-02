import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Thermometer, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { InsightCard } from "@/components/ui/insight-card";
import { formatForecastDate } from "@/utils/format";
import { getWeatherIconInfo, getConditionIconColor } from "@/utils/weather";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { WeatherLog } from "@/types/weather";
import { TrendIndicator } from "./trend-indicator";

interface ForecastInsights {
  summary?: string;
  trend?: string;
}

interface ForecastContentProps {
  weatherData: WeatherLog | null | undefined;
  isLoading: boolean;
  insights: ForecastInsights | null | undefined;
  isInsightsLoading: boolean;
  isGenerating: boolean;
  onGenerateInsights: () => void;
}

export function ForecastContent({
  weatherData,
  isLoading,
  insights,
  isInsightsLoading,
  isGenerating,
  onGenerateInsights,
}: ForecastContentProps) {
  const {
    ref: daysScrollRef,
    onMouseDown,
    scrollBack,
    scrollForward,
  } = useDragScroll();

  const hasForecastData =
    weatherData?.daily_time &&
    weatherData.daily_time.length > 0 &&
    weatherData.daily_temperature_max &&
    weatherData.daily_temperature_min &&
    weatherData.daily_weather_code;

  return (
    <Card className="rounded-4xl bg-white dark:bg-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E] h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/30">
            <Thermometer className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
              Previsão 7 Dias
            </CardTitle>
            <CardDescription className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
              {weatherData?.location || "Carregando..."}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBack()}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-[#F7F9FC] dark:bg-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollForward()}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-[#F7F9FC] dark:bg-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col items-center p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#3E4C5E] min-w-[90px] animate-pulse"
              >
                <div className="w-8 h-3 bg-slate-200 dark:bg-slate-600 rounded mb-1" />
                <div className="w-10 h-3 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
                <div className="w-11 h-11 bg-slate-200 dark:bg-slate-600 rounded-xl mb-3" />
                <div className="w-8 h-5 bg-slate-200 dark:bg-slate-600 rounded mb-1" />
                <div className="w-6 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
              </div>
            ))}
          </div>
        ) : hasForecastData ? (
          <div
            ref={daysScrollRef}
            onMouseDown={onMouseDown}
            className="flex gap-3 overflow-x-auto cursor-grab select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {weatherData.daily_time!.map((dateStr, index) => {
              const { day, date } = formatForecastDate(dateStr);
              const tempMax = Math.round(
                weatherData.daily_temperature_max![index],
              );
              const tempMin = Math.round(
                weatherData.daily_temperature_min![index],
              );
              const weatherCode = weatherData.daily_weather_code![index];
              const { icon: Icon, condition } = getWeatherIconInfo(weatherCode);
              const isToday = index === 0;

              return (
                <div
                  key={dateStr}
                  className={`shrink-0 flex flex-col items-center p-4 rounded-2xl transition-colors min-w-[90px] ${
                    isToday
                      ? "bg-[#EE5253] text-white"
                      : "bg-[#F7F9FC] dark:bg-[#3E4C5E] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F]"
                  }`}
                >
                  <div
                    className={`text-xs font-bold mb-1 ${
                      isToday
                        ? "text-white"
                        : "text-[#2D3436] dark:text-[#F7F9FC]"
                    }`}
                  >
                    {isToday ? "Hoje" : day}
                  </div>

                  <div
                    className={`text-xs mb-3 ${
                      isToday
                        ? "text-white/80"
                        : "text-[#636E72] dark:text-[#9BA6B5]"
                    }`}
                  >
                    {date}
                  </div>

                  <div
                    className={`p-3 rounded-xl mb-3 ${
                      isToday ? "bg-white/20" : getConditionIconColor(condition)
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isToday ? "text-white" : ""}`}
                    />
                  </div>

                  <div
                    className={`text-lg font-bold ${
                      isToday
                        ? "text-white"
                        : "text-[#2D3436] dark:text-[#F7F9FC]"
                    }`}
                  >
                    {tempMax}°
                  </div>

                  <div
                    className={`text-sm ${
                      isToday
                        ? "text-white/70"
                        : "text-[#636E72] dark:text-[#9BA6B5]"
                    }`}
                  >
                    {tempMin}°
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-[#636E72] dark:text-[#9BA6B5]">
            <p className="text-sm">Dados de previsão não disponíveis</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <InsightCard
          variant="blue"
          icon={Sparkles}
          title="Análise da Semana"
          titleExtra={
            insights?.trend && <TrendIndicator trend={insights.trend} />
          }
          description={insights?.summary}
          isLoading={isInsightsLoading}
          emptyText="Clique no botão para gerar uma análise da previsão"
          onRefresh={onGenerateInsights}
          isRefreshing={isGenerating || isInsightsLoading}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
