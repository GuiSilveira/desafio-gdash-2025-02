/**
 * Funções de formatação
 */

/**
 * Extrai iniciais de um nome (até 2 caracteres)
 * @example getInitials("John Doe") => "JD"
 * @example getInitials("Alice") => "AL"
 */
export function getInitials(name: string): string {
  if (!name) return "??";

  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Capitaliza a primeira letra de uma string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formata uma data para exibição
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", options);
}

/**
 * Formata uma data e hora para exibição
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR");
}

/**
 * Formata um número com casas decimais
 */
export function formatNumber(
  value: number,
  decimals: number = 1
): string {
  return value.toFixed(decimals);
}

/**
 * Formata temperatura com unidade
 */
export function formatTemperature(value: number, unit: "C" | "F" = "C"): string {
  return `${formatNumber(value)}°${unit}`;
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number): string {
  return `${formatNumber(value, 0)}%`;
}

/**
 * Formata velocidade do vento
 */
export function formatWindSpeed(value: number, unit: string = "km/h"): string {
  return `${formatNumber(value)} ${unit}`;
}

/**
 * Formata data para exibição no forecast (dia da semana abreviado + data)
 */
export function formatForecastDate(dateStr: string): { day: string; date: string } {
  const date = new Date(dateStr + "T12:00:00"); // Adiciona horário para evitar problemas de timezone

  const dayName = date
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .replace(/^\w/, (c) => c.toUpperCase());

  const dateFormatted = date
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    })
    .replace(".", "");

  return { day: dayName, date: dateFormatted };
}

/**
 * Formata hora a partir de string ISO
 * @param isoString - String ISO de data/hora
 * @param use12Hour - Se deve usar formato 12h (AM/PM) ou 24h
 */
export function formatTime(isoString: string | undefined, use12Hour = true): string {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: use12Hour,
  });
}

/**
 * Formata duração em segundos para formato "Xh Ym"
 * @param seconds - Duração em segundos
 * @param fallback - Valor padrão se seconds for undefined
 */
export function formatDuration(seconds: number | undefined, fallback = "0h 0m"): string {
  if (!seconds) return fallback;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
