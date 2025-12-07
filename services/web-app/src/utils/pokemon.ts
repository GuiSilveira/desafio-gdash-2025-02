import {
  TYPE_COLORS,
  TYPE_COLORS_SECONDARY,
  TYPE_GRADIENTS,
  WEATHER_POKEMON_MAP,
  WEATHER_POKEMON_MESSAGES,
} from "@/constants/pokemon";

export { getWeatherKey } from "./weather-key";

export function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getPokemonIdFromUrl(url: string): string {
  const matches = url.match(/\/pokemon-species\/(\d+)\//);
  return matches ? matches[1] : "1";
}

export function extractPokemonId(url: string): number {
  const matches = url.match(/\/pokemon(?:-species)?\/(\d+)\/?/);
  return matches ? parseInt(matches[1], 10) : 1;
}

export function buildPokemonUrl(id: number): string {
  return `https://pokeapi.co/api/v2/pokemon/${id}/`;
}

export function formatPokemonHeight(heightInDecimeters: number): string {
  return (heightInDecimeters / 10).toFixed(1);
}

export function formatPokemonWeight(weightInHectograms: number): string {
  return (weightInHectograms / 10).toFixed(1);
}

export function calculateGenderPercent(genderRate: number): {
  male: number | null;
  female: number | null;
} {
  if (genderRate === -1) {
    return { male: null, female: null };
  }
  const femalePercent = (genderRate / 8) * 100;
  return {
    male: 100 - femalePercent,
    female: femalePercent,
  };
}

export function getTypeGradient(type: string): string {
  const typeLower = type.toLowerCase();
  const primary = TYPE_COLORS[typeLower] || TYPE_COLORS.normal;
  const secondary = TYPE_COLORS_SECONDARY[typeLower] || TYPE_COLORS_SECONDARY.normal;
  return `linear-gradient(135deg, ${primary}, ${secondary})`;
}

export function getTypeGradientClass(type: string): string {
  const typeLower = type.toLowerCase();
  return TYPE_GRADIENTS[typeLower] || TYPE_GRADIENTS.normal;
}

export function getRandomPokemonId(weatherKey: string): number {
  const pokemonIds =
    WEATHER_POKEMON_MAP[weatherKey] || WEATHER_POKEMON_MAP.partly_cloudy;
  return pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
}

export function getRandomWeatherMessage(weatherKey: string): string {
  const messages =
    WEATHER_POKEMON_MESSAGES[weatherKey] || WEATHER_POKEMON_MESSAGES.partly_cloudy;
  return messages[Math.floor(Math.random() * messages.length)];
}
