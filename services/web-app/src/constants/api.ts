export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",

  WEATHER_LOGS: "/weather",
  WEATHER_INSIGHTS: "/weather/insights",
  WEATHER_FORECAST_INSIGHTS: "/weather/forecast-insights",
  WEATHER_EXPORT: (format: "csv" | "xlsx" | "json") => `/weather/export/${format}`,

  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,

  EXPLORE: "/external/pokemon",
  EXPLORE_BY_ID: (id: string) => `/external/pokemon/${id}`,
  POKEMON_SPECIES: (id: string) => `/external/pokemon/${id}/species`,
  EVOLUTION_CHAIN: (id: string) => `/external/pokemon/evolution-chain/${id}`,
} as const;
