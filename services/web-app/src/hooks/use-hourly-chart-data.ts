import { useMemo } from "react";
import { useWeatherLogs } from "@/hooks/use-weather";
import { HOURLY_CHART_TABS, HOURLY_TIME_RANGES } from "@/constants/weather";
import type {
  HourlyTabType,
  HourlyTimeRange,
  HourlyChartDataPoint,
  HourlyTabConfig,
  HourlyTimeRangeConfig,
  WeatherLog,
} from "@/types/weather";

interface UseHourlyChartDataParams {
  activeTab: HourlyTabType;
  timeRange: HourlyTimeRange;
}

interface ChartStats {
  min: number;
  max: number;
  avg: number;
}

interface UseHourlyChartDataReturn {
  chartData: HourlyChartDataPoint[];
  currentTab: HourlyTabConfig;
  currentTimeRange: HourlyTimeRangeConfig;
  stats: ChartStats;
  isLoading: boolean;
  hasData: boolean;
}

function transformLogToDataPoints(
  log: WeatherLog | undefined,
): HourlyChartDataPoint[] {
  if (!log?.hourly_time || log.hourly_time.length === 0) {
    return [];
  }

  return log.hourly_time.map((time: string, index: number) => {
    const date = new Date(time);
    const hour = date.getHours().toString().padStart(2, "0") + ":00";

    return {
      hour,
      hourNum: date.getHours(),
      time,
      temperature: Math.round(log.hourly_temperature?.[index] ?? 0),
      precipitation: log.hourly_precipitation_probability?.[index] ?? 0,
      uv: log.hourly_uv_index?.[index] ?? 0,
      aqi: log.hourly_us_aqi?.[index] ?? 0,
    };
  });
}

function filterDataByTimeRange(
  data: HourlyChartDataPoint[],
  hoursToShow: number,
): HourlyChartDataPoint[] {
  if (data.length === 0) return [];

  if (hoursToShow === 24) {
    return data;
  }

  const currentHour = new Date().getHours();
  const endHour = (currentHour + hoursToShow) % 24;

  return data.filter((d) => {
    if (currentHour < endHour) {
      return d.hourNum >= currentHour && d.hourNum < endHour;
    } else {
      return d.hourNum >= currentHour || d.hourNum < endHour;
    }
  });
}

function calculateStats(
  data: HourlyChartDataPoint[],
  dataKey: string,
): ChartStats {
  const values = data.map((d) => d[dataKey as keyof HourlyChartDataPoint] as number);

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  };
}

export function useHourlyChartData({
  activeTab,
  timeRange,
}: UseHourlyChartDataParams): UseHourlyChartDataReturn {
  const { data: weatherLogs, isLoading } = useWeatherLogs({ limit: 1 });

  const currentTab = useMemo(
    () => HOURLY_CHART_TABS.find((tab) => tab.id === activeTab) || HOURLY_CHART_TABS[0],
    [activeTab],
  );

  const currentTimeRange = useMemo(
    () => HOURLY_TIME_RANGES.find((t) => t.id === timeRange) || HOURLY_TIME_RANGES[2],
    [timeRange],
  );

  const fullChartData = useMemo(() => {
    const latestLog = weatherLogs?.data?.[0];
    return transformLogToDataPoints(latestLog);
  }, [weatherLogs]);

  const chartData = useMemo(
    () => filterDataByTimeRange(fullChartData, currentTimeRange.hours),
    [fullChartData, currentTimeRange.hours],
  );

  const stats = useMemo(
    () => calculateStats(chartData, currentTab.dataKey),
    [chartData, currentTab.dataKey],
  );

  return {
    chartData,
    currentTab,
    currentTimeRange,
    stats,
    isLoading,
    hasData: chartData.length > 0,
  };
}
