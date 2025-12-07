import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/api";
import { API_ENDPOINTS } from "@/constants/api";
import { TYPE_DOT_COLORS } from "@/constants/pokemon";
import { PokemonTypeBadge } from "./pokemon-type-badge";
import { getTypeGradientClass } from "@/utils/pokemon";
import type { PokemonDetail } from "@/types/pokemon";

interface PokemonMiniCardProps {
  pokemonId: number;
  variant?: "grid" | "list";
  onSelect: (pokemon: PokemonDetail) => void;
}

function PokemonMiniCardSkeleton({ variant }: { variant: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F9FC] dark:bg-[#3E4C5E] animate-pulse">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-xl" />
        <div className="flex-1">
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-600 rounded-full" />
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 p-2 h-26 animate-pulse">
      <div className="h-2 bg-white/30 rounded w-8 mb-0.5" />
      <div className="h-3 bg-white/30 rounded w-14 mb-1" />
      <div className="h-4 bg-white/20 rounded w-10" />
    </div>
  );
}

function GridVariant({
  pokemon,
  onSelect,
}: {
  pokemon: PokemonDetail;
  onSelect: (pokemon: PokemonDetail) => void;
}) {
  const primaryType = pokemon.types[0]?.type.name || "normal";
  const bgGradient = getTypeGradientClass(primaryType);
  const displayName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const spriteUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;
  const pokemonNumber = `#${String(pokemon.id).padStart(3, "0")}`;

  return (
    <button
      onClick={() => onSelect(pokemon)}
      className={`bg-linear-to-br ${bgGradient} rounded-xl p-2 h-26 flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:scale-[1.03] hover:shadow-lg text-left w-full relative overflow-hidden`}
    >
      <div>
        <span className="text-white/70 text-[10px] font-medium drop-shadow-sm">
          {pokemonNumber}
        </span>
        <h4 className="font-bold text-white text-xs drop-shadow-sm leading-tight">
          {displayName}
        </h4>
      </div>

      <div className="flex flex-wrap gap-0.5">
        {pokemon.types.map((t) => (
          <PokemonTypeBadge
            key={t.type.name}
            type={t.type.name}
            variant="outline"
            size="xs"
          />
        ))}
      </div>

      <img
        src={spriteUrl}
        alt={displayName}
        className="absolute -bottom-2 -right-2 w-18 h-18 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110"
      />
    </button>
  );
}

function ListVariant({
  pokemon,
  onSelect,
}: {
  pokemon: PokemonDetail;
  onSelect: (pokemon: PokemonDetail) => void;
}) {
  const pokemonName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const spriteUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  return (
    <button
      onClick={() => onSelect(pokemon)}
      className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F9FC] dark:bg-[#3E4C5E] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F] transition-all duration-200 cursor-pointer group w-full text-left"
    >
      <div className="w-12 h-12 flex items-center justify-center">
        <img
          src={spriteUrl}
          alt={pokemonName}
          className="w-12 h-12 object-contain transition-transform duration-200 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm text-[#2D3436] dark:text-[#F7F9FC]">
          {pokemonName}
        </span>
        <div className="flex gap-1">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className={`w-3 h-3 rounded-full ${TYPE_DOT_COLORS[t.type.name] || "bg-gray-400"}`}
              title={t.type.name}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

export function PokemonMiniCard({
  pokemonId,
  variant = "grid",
  onSelect,
}: PokemonMiniCardProps) {
  const { data: pokemon, isLoading } = useQuery<PokemonDetail>({
    queryKey: ["pokemon", "mini-card", pokemonId],
    queryFn: async () => {
      const { data } = await api.get(
        API_ENDPOINTS.EXPLORE_BY_ID(pokemonId.toString()),
      );
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading || !pokemon) {
    return <PokemonMiniCardSkeleton variant={variant} />;
  }

  if (variant === "list") {
    return <ListVariant pokemon={pokemon} onSelect={onSelect} />;
  }

  return <GridVariant pokemon={pokemon} onSelect={onSelect} />;
}
