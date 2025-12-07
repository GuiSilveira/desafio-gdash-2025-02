interface WeatherPattern {
  key: string;
  patterns: RegExp;
}

const WEATHER_PATTERNS: WeatherPattern[] = [
  {
    key: "sunny",
    patterns: /clear|céu limpo|ensolarado|sunny/i,
  },
  {
    key: "snowy",
    patterns: /snow|neve/i,
  },
  {
    key: "foggy",
    patterns: /fog|neblina|nebuloso|mist/i,
  },
  {
    key: "rainy",
    patterns: /rain|chuva|chuvoso|thunder|storm|tempest|drizzle|garoa/i,
  },
  {
    key: "windy",
    patterns: /wind|vento|ventoso/i,
  },
  {
    key: "cloudy",
    patterns: /overcast|encoberto|cloudy|nublado/i,
  },
  {
    key: "partly_cloudy",
    patterns: /partly|parcial/i,
  },
];

export type WeatherKey =
  | "sunny"
  | "rainy"
  | "cloudy"
  | "partly_cloudy"
  | "windy"
  | "snowy"
  | "foggy";

export function getWeatherKey(condition: string): WeatherKey {
  const conditionLower = condition.toLowerCase();

  for (const { key, patterns } of WEATHER_PATTERNS) {
    if (patterns.test(conditionLower)) {
      return key as WeatherKey;
    }
  }

  return "partly_cloudy";
}

export function matchesWeatherType(condition: string, weatherKey: WeatherKey): boolean {
  return getWeatherKey(condition) === weatherKey;
}

export function getAvailableWeatherKeys(): WeatherKey[] {
  return WEATHER_PATTERNS.map((p) => p.key as WeatherKey);
}
