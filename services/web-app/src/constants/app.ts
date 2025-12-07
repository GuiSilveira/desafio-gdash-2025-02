export const APP_NAME = "GDASH Weather";
export const APP_DESCRIPTION = "Sistema de Monitoramento Climático";

export const REFRESH_INTERVALS = {
  WEATHER_DATA: 5 * 60 * 1000,
  AI_INSIGHTS_AUTO: 60 * 1000,
  AI_INSIGHTS_MANUAL: false,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  LIMITS: [10, 25, 50, 100],
  POKEDEX_SMALL: 6,
  POKEDEX_LARGE: 12,
} as const;

export const PAGINATION_LIMITS = PAGINATION.LIMITS;
export const DEFAULT_PAGE_LIMIT = 25;

export const DELAYS = {
  LOGOUT_REDIRECT: 500,
  TOAST_DURATION: 4000,
  DEBOUNCE_SEARCH: 300,
} as const;

export const STORAGE_KEYS = {
  AI_AUTO_MODE: "gdash_ai_auto_mode",
  THEME: "gdash_theme",
  TOKEN: "gdash_token",
  SEARCHED_LOCATION: "searched-location",
} as const;

export const BREAKPOINTS = {
  MOBILE: 768,
} as const;
