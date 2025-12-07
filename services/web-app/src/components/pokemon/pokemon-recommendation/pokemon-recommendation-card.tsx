import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/api";
import { API_ENDPOINTS } from "@/constants/api";
import { TYPE_BG_COLORS } from "@/constants/pokemon";
import { getWeatherKey } from "@/utils/weather";
import { getRandomPokemonId, getRandomWeatherMessage } from "@/utils/pokemon";
import { useCurrentWeather } from "@/hooks/use-weather";
import { PokemonDetailModal } from "../shared/pokemon-detail-modal";
import { PokemonTypeBadge } from "../shared/pokemon-type-badge";
import type { PokemonDetail } from "@/types/pokemon";

export function PokemonRecommendationCard() {
  const { data: weather } = useCurrentWeather();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weatherKey = weather?.condition
    ? getWeatherKey(weather.condition)
    : "partly_cloudy";

  const pokemonId = useMemo(() => {
    return getRandomPokemonId(weatherKey);
  }, [weatherKey]);

  const message = useMemo(() => {
    return getRandomWeatherMessage(weatherKey);
  }, [weatherKey]);

  const { data: pokemon, isLoading } = useQuery<PokemonDetail>({
    queryKey: ["pokemon", "recommendation", pokemonId],
    queryFn: async () => {
      const { data } = await api.get(
        API_ENDPOINTS.EXPLORE_BY_ID(pokemonId.toString()),
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!weather,
  });

  if (isLoading || !pokemon) {
    return (
      <div className="h-full w-full rounded-3xl bg-linear-to-br from-gray-300 to-gray-400 p-6 animate-pulse">
        <div className="h-6 bg-white/20 rounded w-16 mb-2"></div>
        <div className="h-8 bg-white/20 rounded w-32 mb-4"></div>
        <div className="flex gap-2 mb-8">
          <div className="h-6 bg-white/20 rounded-full w-16"></div>
          <div className="h-6 bg-white/20 rounded-full w-16"></div>
        </div>
        <div className="h-32 bg-white/10 rounded-xl"></div>
      </div>
    );
  }

  const primaryType = pokemon.types[0]?.type.name || "normal";
  const bgGradient = TYPE_BG_COLORS[primaryType] || TYPE_BG_COLORS.normal;

  const pokemonNumber = `#${pokemon.id.toString().padStart(3, "0")}`;
  const pokemonName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const artworkUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  return (
    <>
      <div
        className={`h-full w-full rounded-3xl bg-linear-to-br ${bgGradient} p-6 flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsModalOpen(true);
          }
        }}
      >
        <div className="text-white/80 text-sm font-bold">{pokemonNumber}</div>

        <h3 className="text-2xl font-bold text-white mt-1">{pokemonName}</h3>

        <div className="flex gap-2 mt-3">
          {pokemon.types.map((t) => (
            <PokemonTypeBadge
              key={t.type.name}
              type={t.type.name}
              size="md"
              variant="outline"
            />
          ))}
        </div>

        <p className="text-white/90 text-sm mt-auto pt-4 max-w-[60%] z-50">
          {message}
        </p>

        <img
          src={artworkUrl}
          alt={pokemonName}
          className="absolute bottom-0 right-0 w-60 h-60 object-contain drop-shadow-lg transition-transform duration-300 ease-out group-hover:scale-125"
          style={{ transform: "translate(10%, 10%)" }}
        />
      </div>

      <PokemonDetailModal
        pokemon={pokemon}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
