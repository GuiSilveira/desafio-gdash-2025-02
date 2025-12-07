import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useCurrentWeather } from "@/hooks/use-weather";
import { WEATHER_DECK_TITLES, WEATHER_TEAM_MAP } from "@/constants/pokemon";
import { getWeatherKey } from "@/utils/pokemon";
import { PokemonDetailModal } from "../shared/pokemon-detail-modal";
import { PokemonMiniCard } from "../shared/pokemon-mini-card";
import type { PokemonDetail } from "@/types/pokemon";

export function WeatherTeamCard() {
  const { data: weather } = useCurrentWeather();
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weatherKey = useMemo(() => {
    return weather?.condition ? getWeatherKey(weather.condition) : "sunny";
  }, [weather?.condition]);

  const teamIds = useMemo(() => {
    return WEATHER_TEAM_MAP[weatherKey] || WEATHER_TEAM_MAP.sunny;
  }, [weatherKey]);

  const deckTitle = WEATHER_DECK_TITLES[weatherKey] || "Weather Deck";

  const handleSelectPokemon = (pokemon: PokemonDetail) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="rounded-4xl bg-white dark:bg-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E] flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#2D3436] dark:text-[#F7F9FC]">
            {deckTitle}
          </CardTitle>
          <CardDescription className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
            Pokémon fortes para este clima
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          {/* 6 Pokemon Grid - 2 columns x 3 rows */}
          <div className="grid grid-cols-2 gap-3">
            {teamIds.map((pokemonId) => (
              <PokemonMiniCard
                key={pokemonId}
                pokemonId={pokemonId}
                variant="list"
                onSelect={handleSelectPokemon}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <PokemonDetailModal
          pokemon={selectedPokemon}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
