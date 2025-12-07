import {
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  CloudSun,
  CloudFog,
  CloudLightning,
  Thermometer,
  Wind,
  AreaChart as AreaChartIcon,
  LineChart as LineChartIcon,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  HourlyTabConfig,
  HourlyChartTypeConfig,
  HourlyTimeRangeConfig,
} from "@/types/weather";

export const WEATHER_CONDITIONS = {
  clear: { label: "Ensolarado", icon: "☀️", color: "text-yellow-500" },
  cloudy: { label: "Nublado", icon: "☁️", color: "text-gray-500" },
  rainy: { label: "Chuvoso", icon: "🌧️", color: "text-blue-500" },
  partly_cloudy: {
    label: "Parcialmente Nublado",
    icon: "🌤️",
    color: "text-blue-300",
  },
  stormy: { label: "Tempestuoso", icon: "⛈️", color: "text-purple-500" },
  snowy: { label: "Nevando", icon: "🌨️", color: "text-blue-200" },
  foggy: { label: "Nebuloso", icon: "🌫️", color: "text-gray-400" },
} as const;

export const WMO_CODES: Record<number, keyof typeof WEATHER_CONDITIONS> = {
  0: "clear",
  1: "partly_cloudy",
  2: "partly_cloudy",
  3: "cloudy",
  45: "foggy",
  48: "foggy",
  51: "rainy",
  53: "rainy",
  55: "rainy",
  61: "rainy",
  63: "rainy",
  65: "rainy",
  71: "snowy",
  73: "snowy",
  75: "snowy",
  80: "rainy",
  81: "rainy",
  82: "rainy",
  95: "stormy",
  96: "stormy",
  99: "stormy",
};

export const WMO_ICON_MAP: Record<number, { icon: LucideIcon; condition: string }> = {
  0: { icon: Sun, condition: "sunny" },
  1: { icon: Sun, condition: "sunny" },
  2: { icon: CloudSun, condition: "partly_cloudy" },
  3: { icon: Cloud, condition: "cloudy" },
  45: { icon: CloudFog, condition: "foggy" },
  48: { icon: CloudFog, condition: "foggy" },
  51: { icon: CloudRain, condition: "rainy" },
  53: { icon: CloudRain, condition: "rainy" },
  55: { icon: CloudRain, condition: "rainy" },
  61: { icon: CloudRain, condition: "rainy" },
  63: { icon: CloudRain, condition: "rainy" },
  65: { icon: CloudRain, condition: "rainy" },
  80: { icon: CloudRain, condition: "rainy" },
  81: { icon: CloudRain, condition: "rainy" },
  82: { icon: CloudRain, condition: "rainy" },
  95: { icon: CloudLightning, condition: "storm" },
  96: { icon: CloudLightning, condition: "storm" },
  99: { icon: CloudLightning, condition: "storm" },
  71: { icon: Snowflake, condition: "snow" },
  73: { icon: Snowflake, condition: "snow" },
  75: { icon: Snowflake, condition: "snow" },
  77: { icon: Snowflake, condition: "snow" },
  85: { icon: Snowflake, condition: "snow" },
  86: { icon: Snowflake, condition: "snow" },
};

export const CONDITION_ICON_COLORS: Record<string, string> = {
  sunny: "text-amber-500 bg-amber-100 dark:bg-amber-950/30",
  partly_cloudy: "text-orange-400 bg-orange-100 dark:bg-orange-950/30",
  cloudy: "text-slate-500 bg-slate-100 dark:bg-slate-950/30",
  rainy: "text-blue-500 bg-blue-100 dark:bg-blue-950/30",
  snow: "text-cyan-500 bg-cyan-100 dark:bg-cyan-950/30",
  foggy: "text-gray-400 bg-gray-100 dark:bg-gray-950/30",
  storm: "text-purple-500 bg-purple-100 dark:bg-purple-950/30",
};

export const COMFORT_CATEGORIES = [
  { min: 0, max: 20, label: "Muito Desconfortável", color: "bg-red-500" },
  { min: 21, max: 40, label: "Desconfortável", color: "bg-orange-500" },
  { min: 41, max: 60, label: "Moderado", color: "bg-yellow-500" },
  { min: 61, max: 80, label: "Confortável", color: "bg-green-500" },
  { min: 81, max: 100, label: "Muito Confortável", color: "bg-blue-500" },
] as const;

export const FILTER_PERIODS = {
  last_hour: { label: "Última hora", hours: 1 },
  today: { label: "Hoje", hours: 24 },
  last_3_days: { label: "Últimos 3 dias", hours: 72 },
  last_week: { label: "Última semana", hours: 168 },
  last_month: { label: "Último mês", hours: 720 },
  custom: { label: "Personalizado", hours: 0 },
} as const;

export const CONDITION_BADGE_COLORS: Record<string, string> = {
  clear: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  sunny: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  cloudy: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  overcast: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  rainy: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  rain: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  drizzle: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  stormy: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  storm: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  thunderstorm: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  snowy: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  snow: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  foggy: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  fog: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  mist: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  partly_cloudy: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  windy: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

export const CHART_COLORS = {
  temperature: {
    light: "hsl(0, 70%, 55%)",
    dark: "hsl(0, 60%, 65%)",
  },
  humidity: {
    light: "hsl(200, 70%, 55%)",
    dark: "hsl(200, 60%, 65%)",
  },
  wind: {
    light: "hsl(150, 60%, 50%)",
    dark: "hsl(150, 50%, 60%)",
  },
  rain: {
    light: "hsl(210, 80%, 50%)",
    dark: "hsl(210, 70%, 60%)",
  },
} as const;

export const WEATHER_BOOSTED_TYPES: Record<string, string[]> = {
  sunny: ["grass", "fire", "ground"],
  rainy: ["water", "electric", "bug"],
  partly_cloudy: ["normal", "rock"],
  cloudy: ["fairy", "fighting", "poison"],
  windy: ["flying", "psychic", "dragon"],
  snowy: ["ice", "steel"],
  foggy: ["dark", "ghost"],
};

export const TABLE_CONDITION_BADGE_COLORS: Record<
  keyof typeof WEATHER_CONDITIONS,
  string
> = {
  clear: "bg-amber-500 hover:bg-amber-500 text-white",
  partly_cloudy: "bg-orange-400 hover:bg-orange-400 text-white",
  cloudy: "bg-slate-400 hover:bg-slate-400 text-white",
  rainy: "bg-blue-500 hover:bg-blue-500 text-white",
  stormy: "bg-purple-600 hover:bg-purple-600 text-white",
  snowy: "bg-sky-300 hover:bg-sky-300 text-slate-700",
  foggy: "bg-gray-400 hover:bg-gray-400 text-white",
};

export const HOURLY_CHART_TABS: HourlyTabConfig[] = [
  {
    id: "temperature",
    icon: Thermometer,
    label: "Temperatura",
    dataKey: "temperature",
    unit: "°C",
    color: "#FF6B6B",
    gradientFrom: "#FF6B6B",
    gradientTo: "#FF9999",
    buttonBg: "#FF6B6B",
    buttonShadow: "rgba(255,107,107,0.4)",
  },
  {
    id: "rain",
    icon: CloudRain,
    label: "Chuva",
    dataKey: "precipitation",
    unit: "%",
    color: "#74B9FF",
    gradientFrom: "#74B9FF",
    gradientTo: "#A5D6FF",
    buttonBg: "#74B9FF",
    buttonShadow: "rgba(116,185,255,0.4)",
  },
  {
    id: "uv",
    icon: Sun,
    label: "UV",
    dataKey: "uv",
    unit: "",
    color: "#F59E0B",
    gradientFrom: "#FBBF24",
    gradientTo: "#FCD34D",
    buttonBg: "#F59E0B",
    buttonShadow: "rgba(245,158,11,0.4)",
  },
  {
    id: "aqi",
    icon: Wind,
    label: "Qualidade do Ar",
    dataKey: "aqi",
    unit: " AQI",
    color: "#00B894",
    gradientFrom: "#00B894",
    gradientTo: "#55EFC4",
    buttonBg: "#00B894",
    buttonShadow: "rgba(0,184,148,0.4)",
  },
];

export const HOURLY_CHART_TYPES: HourlyChartTypeConfig[] = [
  { id: "area", icon: AreaChartIcon, label: "Área" },
  { id: "line", icon: LineChartIcon, label: "Linha" },
  { id: "bar", icon: BarChart3, label: "Barras" },
];

export const HOURLY_TIME_RANGES: HourlyTimeRangeConfig[] = [
  { id: "6h", label: "6 horas", hours: 6 },
  { id: "12h", label: "12 horas", hours: 12 },
  { id: "24h", label: "24 horas", hours: 24 },
];
