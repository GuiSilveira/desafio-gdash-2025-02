import { Cloud, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  WEATHER_CONDITIONS,
  WMO_CODES,
  COMFORT_CATEGORIES,
  CHART_COLORS,
  CONDITION_BADGE_COLORS,
  WMO_ICON_MAP,
  CONDITION_ICON_COLORS,
  TABLE_CONDITION_BADGE_COLORS,
} from "@/constants/weather";

export {
  calculateSunPosition,
  isDaytime,
  getDaylightDuration,
  formatSunTime,
} from "./sun-position";

export {
  checkIsNightTime,
  calculateUVStats,
  getUVLevel,
  getUVRecommendation,
  getUVBarColor,
  getUVRiskDescription,
} from "./uv-index";

export type { UVLevel, UVRecommendation, UVStats } from "./uv-index";

export { getWeatherKey, matchesWeatherType, getAvailableWeatherKeys } from "./weather-key";

export type { WeatherKey } from "./weather-key";

export function getWeatherCondition(code: number) {
  const conditionKey = WMO_CODES[code] || "cloudy";
  return WEATHER_CONDITIONS[conditionKey];
}

export function getComfortCategory(score: number) {
  return (
    COMFORT_CATEGORIES.find((cat) => score >= cat.min && score <= cat.max) ||
    COMFORT_CATEGORIES[2]
  );
}

export function getChartColor(
  metric: keyof typeof CHART_COLORS,
  theme: "light" | "dark" = "light",
) {
  return CHART_COLORS[metric][theme];
}

export function getConditionBadgeColor(condition: string): string {
  const conditionLower = condition.toLowerCase();

  if (CONDITION_BADGE_COLORS[conditionLower]) {
    return CONDITION_BADGE_COLORS[conditionLower];
  }

  for (const [key, value] of Object.entries(CONDITION_BADGE_COLORS)) {
    if (conditionLower.includes(key)) {
      return value;
    }
  }

  return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

export function getTableConditionBadgeColor(code: number): string {
  const conditionKey = WMO_CODES[code] || "cloudy";
  return TABLE_CONDITION_BADGE_COLORS[conditionKey];
}

export function getWeatherIconInfo(code: number): { icon: LucideIcon; condition: string } {
  return WMO_ICON_MAP[code] || { icon: Cloud, condition: "cloudy" };
}

export function getConditionIconColor(condition: string): string {
  return CONDITION_ICON_COLORS[condition] || CONDITION_ICON_COLORS.cloudy;
}

export type WeatherIconType = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy";

export function getWeatherIconType(condition: string): WeatherIconType {
  const conditionLower = condition.toLowerCase();

  if (
    conditionLower.includes("clear") ||
    conditionLower.includes("sunny") ||
    conditionLower.includes("céu limpo") ||
    conditionLower.includes("ensolarado")
  ) {
    return "sunny";
  }

  if (
    conditionLower.includes("rain") ||
    conditionLower.includes("chuva") ||
    conditionLower.includes("chuvoso")
  ) {
    return "rainy";
  }

  if (
    conditionLower.includes("storm") ||
    conditionLower.includes("tempest") ||
    conditionLower.includes("thunder")
  ) {
    return "stormy";
  }

  if (
    conditionLower.includes("snow") ||
    conditionLower.includes("neve") ||
    conditionLower.includes("nevando")
  ) {
    return "snowy";
  }

  if (
    conditionLower.includes("fog") ||
    conditionLower.includes("mist") ||
    conditionLower.includes("nebl") ||
    conditionLower.includes("nebuloso")
  ) {
    return "foggy";
  }

  if (
    conditionLower.includes("cloud") ||
    conditionLower.includes("nublado") ||
    conditionLower.includes("encoberto")
  ) {
    return "cloudy";
  }

  return "sunny";
}

export function getTrendIcon(trend: string): LucideIcon {
  switch (trend) {
    case "up":
      return TrendingUp;
    case "down":
      return TrendingDown;
    default:
      return Minus;
  }
}

export function getTrendColor(trend: string): string {
  switch (trend) {
    case "up":
      return "text-red-500";
    case "down":
      return "text-blue-500";
    default:
      return "text-slate-500";
  }
}

const AQI_LEVELS = [
  {
    max: 50,
    label: "Bom",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950/30",
    barColor: "bg-green-500",
  },
  {
    max: 100,
    label: "Moderado",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
    barColor: "bg-yellow-500",
  },
  {
    max: 150,
    label: "Ruim p/ Sensíveis",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950/30",
    barColor: "bg-orange-500",
  },
  {
    max: 200,
    label: "Ruim",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-950/30",
    barColor: "bg-red-500",
  },
  {
    max: 300,
    label: "Muito Ruim",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950/30",
    barColor: "bg-purple-500",
  },
  {
    max: Infinity,
    label: "Perigoso",
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-950/30",
    barColor: "bg-rose-700",
  },
];

export function getAQILevel(aqi: number | undefined) {
  if (!aqi) {
    return {
      label: "Desconhecido",
      color: "text-slate-500",
      bgColor: "bg-slate-100 dark:bg-slate-950/30",
      barColor: "bg-slate-400",
    };
  }

  const level = AQI_LEVELS.find((l) => aqi <= l.max);
  return level || AQI_LEVELS[AQI_LEVELS.length - 1];
}
