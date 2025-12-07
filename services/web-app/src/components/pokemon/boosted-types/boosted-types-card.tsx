/**
 * Card de tipos Pokemon fortificados pelo clima atual
 */

import { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useCurrentWeather } from "@/hooks/use-weather";
import { PokemonTypeRow } from "./pokemon-type-row";
import { WEATHER_BOOSTED_TYPES } from "@/constants/weather";
import { getWeatherKey } from "@/utils/weather";

export function BoostedTypesCard() {
  const { data: weather } = useCurrentWeather();

  const weatherKey = useMemo(() => {
    return weather?.condition ? getWeatherKey(weather.condition) : "sunny";
  }, [weather?.condition]);

  const boostedTypes =
    WEATHER_BOOSTED_TYPES[weatherKey] || WEATHER_BOOSTED_TYPES.sunny;

  return (
    <Card className="rounded-3xl bg-[#F0FDF4] dark:bg-[#052e16] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none border border-green-200 dark:border-green-900/50 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
          <CardTitle className="text-md font-bold text-[#2D3436] dark:text-[#F7F9FC]">
            Tipos fortificados no Pokémon GO
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          {boostedTypes.map((type) => (
            <PokemonTypeRow key={type} type={type} boost="+20%" />
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <p className="text-[10px] text-[#636E72] dark:text-[#9BA6B5] text-center w-full">
          +20% de dano de ataque para esses tipos no clima atual.
        </p>
      </CardFooter>
    </Card>
  );
}
