export {
  TYPE_COLORS,
  TYPE_COLORS_SECONDARY,
  TYPE_NAMES_PT,
  TYPE_ICONS,
  TYPE_GRADIENTS,
  TYPE_BG_COLORS,
  TYPE_DOT_COLORS,
} from "./pokemon-types";

export {
  WEATHER_POKEMON_MAP,
  WEATHER_POKEMON_MESSAGES,
  WEATHER_DECK_TITLES,
  WEATHER_TEAM_MAP,
} from "./pokemon-weather";

export { POKEMON_ITEMS, POKEMON_GAMES } from "./pokemon-items";

export const POKEDEX_ITEMS_PER_PAGE = 12;

export const STAT_NAMES: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Atq. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidade",
};

export const STAT_COLORS: Record<string, string> = {
  hp: "bg-red-500",
  attack: "bg-orange-500",
  defense: "bg-yellow-500",
  "special-attack": "bg-blue-500",
  "special-defense": "bg-green-500",
  speed: "bg-pink-500",
};
