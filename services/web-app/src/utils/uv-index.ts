import {
  Sun,
  Sparkles,
  ShieldAlert,
  Umbrella,
  Skull,
  Stars,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WeatherLog } from "@/types/weather";

export interface UVLevel {
  label: string;
  bgColor: string;
}

export interface UVRecommendation {
  icon: LucideIcon;
  title: string;
  text: string;
  gradient: string;
  border: string;
  iconColor: string;
  titleColor: string;
}

export interface UVStats {
  max: number;
  maxHour: number;
  current: number;
  hourlyData?: number[];
}

const UV_LEVELS: { max: number; label: string; bgColor: string }[] = [
  { max: 0, label: "Nenhum", bgColor: "bg-slate-500" },
  { max: 2, label: "Baixo", bgColor: "bg-green-500" },
  { max: 5, label: "Moderado", bgColor: "bg-lime-400" },
  { max: 7, label: "Alto", bgColor: "bg-orange-500" },
  { max: 10, label: "Muito Alto", bgColor: "bg-red-500" },
  { max: Infinity, label: "Extremo", bgColor: "bg-purple-500" },
];

const UV_RECOMMENDATIONS: {
  max: number;
  icon: LucideIcon;
  title: string;
  text: string;
  gradient: string;
  border: string;
  iconColor: string;
  titleColor: string;
}[] = [
  {
    max: 2,
    icon: Sparkles,
    title: "Aproveite o Sol!",
    text: "Você pode curtir o dia tranquilamente.",
    gradient: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/30",
    iconColor: "text-green-400",
    titleColor: "text-green-400",
  },
  {
    max: 5,
    icon: Sun,
    title: "Proteção Leve",
    text: "Use óculos de sol e protetor solar.",
    gradient: "from-lime-500/20 to-yellow-500/10",
    border: "border-lime-500/30",
    iconColor: "text-lime-400",
    titleColor: "text-lime-400",
  },
  {
    max: 7,
    icon: ShieldAlert,
    title: "Hora do Protetor!",
    text: "Evite exposição ao sol do meio-dia.",
    gradient: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/30",
    iconColor: "text-orange-400",
    titleColor: "text-orange-400",
  },
  {
    max: 10,
    icon: Umbrella,
    title: "Proteção Máxima!",
    text: "Procure sombra entre 10h e 16h.",
    gradient: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    titleColor: "text-red-400",
  },
  {
    max: Infinity,
    icon: Skull,
    title: "Perigo Extremo!",
    text: "Evite sair ao sol. Use proteção total.",
    gradient: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    titleColor: "text-purple-400",
  },
];

const NIGHT_RECOMMENDATION: UVRecommendation = {
  icon: Stars,
  title: "Boa Noite!",
  text: "Sem radiação UV. Aproveite para descansar.",
  gradient: "from-indigo-500/20 to-purple-500/10",
  border: "border-indigo-500/30",
  iconColor: "text-indigo-400",
  titleColor: "text-indigo-400",
};

const UV_BAR_COLORS: { max: number; color: string }[] = [
  { max: 2, color: "bg-gradient-to-t from-green-600 to-green-400" },
  { max: 5, color: "bg-gradient-to-t from-lime-600 to-lime-400" },
  { max: 7, color: "bg-gradient-to-t from-orange-600 to-orange-400" },
  { max: 10, color: "bg-gradient-to-t from-red-600 to-red-400" },
  { max: Infinity, color: "bg-gradient-to-t from-purple-600 to-purple-400" },
];

const UV_RISK_DESCRIPTIONS: { max: number; description: string }[] = [
  { max: 2, description: "Baixo risco de radiação UV" },
  { max: 5, description: "Risco moderado de radiação UV" },
  { max: 7, description: "Alto risco de radiação UV" },
  { max: 10, description: "Risco muito alto de radiação UV" },
  { max: Infinity, description: "Risco extremo de radiação UV" },
];

export function checkIsNightTime(weather: WeatherLog): boolean {
  if (!weather.sunrise || !weather.sunset) {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  }

  const now = new Date();
  const sunrise = new Date(weather.sunrise);
  const sunset = new Date(weather.sunset);

  sunrise.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  sunset.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

  return now < sunrise || now > sunset;
}

export function calculateUVStats(weather: WeatherLog): UVStats {
  if (!weather.hourly_uv_index || weather.hourly_uv_index.length === 0) {
    return { max: 0, maxHour: 12, current: weather.uv_index || 0 };
  }

  const hourlyUV = weather.hourly_uv_index;
  const max = Math.max(...hourlyUV);
  const maxHour = hourlyUV.indexOf(max);
  const currentHour = new Date().getHours();
  const current = hourlyUV[currentHour] ?? weather.uv_index ?? 0;

  return { max, maxHour, current, hourlyData: hourlyUV };
}

export function getUVLevel(uv: number | undefined, isNight: boolean): UVLevel {
  if (isNight) return { label: "Noite", bgColor: "bg-indigo-500" };
  if (!uv || uv === 0) return UV_LEVELS[0];

  const level = UV_LEVELS.find((l) => uv <= l.max);
  return level || UV_LEVELS[UV_LEVELS.length - 1];
}

export function getUVRecommendation(uv: number, isNight: boolean): UVRecommendation {
  if (isNight) return NIGHT_RECOMMENDATION;

  const recommendation = UV_RECOMMENDATIONS.find((r) => uv <= r.max);
  return recommendation || UV_RECOMMENDATIONS[UV_RECOMMENDATIONS.length - 1];
}

export function getUVBarColor(index: number, uvValue: number, isNight: boolean): string {
  if (isNight) return "bg-indigo-900/30";
  if (index > uvValue) return "bg-slate-800/50";

  const barColor = UV_BAR_COLORS.find((b) => uvValue <= b.max);
  return barColor?.color || UV_BAR_COLORS[UV_BAR_COLORS.length - 1].color;
}

export function getUVRiskDescription(uv: number, isNight: boolean): string {
  if (isNight) return "Sem radiação UV no momento";

  const risk = UV_RISK_DESCRIPTIONS.find((r) => uv <= r.max);
  return risk?.description || UV_RISK_DESCRIPTIONS[UV_RISK_DESCRIPTIONS.length - 1].description;
}
