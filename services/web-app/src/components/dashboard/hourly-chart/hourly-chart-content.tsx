import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { useHourlyChartData } from "@/hooks/use-hourly-chart-data";
import { HourlyChartTabs } from "./hourly-chart-tabs";
import { HourlyChartFilters } from "./hourly-chart-filters";
import { HourlyChartVisualizer } from "./hourly-chart-visualizer";
import { HourlyChartStats } from "./hourly-chart-stats";
import type {
  HourlyTabType,
  HourlyChartType,
  HourlyTimeRange,
} from "@/types/weather";

export function HourlyChartContent() {
  const [activeTab, setActiveTab] = useState<HourlyTabType>("temperature");
  const [chartType, setChartType] = useState<HourlyChartType>("area");
  const [timeRange, setTimeRange] = useState<HourlyTimeRange>("24h");

  const { chartData, currentTab, stats, isLoading, hasData } =
    useHourlyChartData({
      activeTab,
      timeRange,
    });

  return (
    <Card className="rounded-4xl bg-white dark:bg-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E] h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
          Tendências por Hora
        </CardTitle>
        <CardDescription className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
          Previsão para hoje
        </CardDescription>
        <CardAction>
          <HourlyChartTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <HourlyChartFilters
          chartType={chartType}
          timeRange={timeRange}
          onChartTypeChange={setChartType}
          onTimeRangeChange={setTimeRange}
        />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-[#636E72] dark:text-[#9BA6B5]">
              Carregando dados...
            </div>
          </div>
        ) : hasData ? (
          <div className="flex-1 flex flex-col min-h-[300px]">
            <HourlyChartVisualizer
              data={chartData}
              chartType={chartType}
              tabConfig={currentTab}
            />
            <HourlyChartStats tabConfig={currentTab} stats={stats} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#636E72] dark:text-[#9BA6B5]">
            <div className="text-center">
              <p className="text-sm">Sem dados disponíveis</p>
              <p className="text-xs mt-1">Aguardando coleta de dados</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
