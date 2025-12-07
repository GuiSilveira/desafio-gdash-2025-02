/**
 * Helpers relacionados à posição do sol
 * Segue SRP: responsável apenas por cálculos de posição solar
 */

import type { WeatherLog } from "@/types/weather";

/**
 * Calcula a posição do sol no arco (0-100%)
 * @param weather - Dados do clima com sunrise/sunset
 * @returns Porcentagem do arco percorrido (0 = nascer, 100 = pôr do sol)
 */
export function calculateSunPosition(weather: WeatherLog): number {
  if (!weather.sunrise || !weather.sunset) return 50;

  const now = new Date();
  const sunrise = new Date(weather.sunrise);
  const sunset = new Date(weather.sunset);

  if (now < sunrise) return 0;
  if (now > sunset) return 100;

  const totalDaylight = sunset.getTime() - sunrise.getTime();
  const timeSinceSunrise = now.getTime() - sunrise.getTime();
  const percentage = (timeSinceSunrise / totalDaylight) * 100;

  return Math.max(0, Math.min(100, percentage));
}

/**
 * Verifica se é dia baseado no sunrise/sunset
 */
export function isDaytime(weather: WeatherLog): boolean {
  if (!weather.sunrise || !weather.sunset) {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  }

  const now = new Date();
  const sunrise = new Date(weather.sunrise);
  const sunset = new Date(weather.sunset);

  return now >= sunrise && now <= sunset;
}

/**
 * Calcula duração do dia em horas
 */
export function getDaylightDuration(weather: WeatherLog): number {
  if (weather.daylight_duration) {
    return weather.daylight_duration / 3600; // seconds to hours
  }

  if (!weather.sunrise || !weather.sunset) return 12;

  const sunrise = new Date(weather.sunrise);
  const sunset = new Date(weather.sunset);
  const durationMs = sunset.getTime() - sunrise.getTime();

  return durationMs / (1000 * 60 * 60); // ms to hours
}

/**
 * Formata horário de sunrise/sunset para exibição
 */
export function formatSunTime(isoString: string | undefined): string {
  if (!isoString) return "--:--";

  const date = new Date(isoString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
