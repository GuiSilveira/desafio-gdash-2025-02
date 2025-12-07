import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { api } from "@/config/api";
import { API_ENDPOINTS } from "@/constants/api";
import { TYPE_BG_COLORS } from "@/constants/pokemon";
import { PokemonTypeBadge } from "./pokemon-type-badge";
import {
  PokemonAboutTab,
  PokemonStatsTab,
  PokemonEvolutionTab,
  PokemonMovesTab,
} from "./tabs";
import {
  formatPokemonName,
  formatPokemonHeight,
  formatPokemonWeight,
  calculateGenderPercent,
} from "@/utils/pokemon";
import type {
  PokemonDetail,
  PokemonSpecies,
  EvolutionChain,
  PokemonDetailTabType,
} from "@/types/pokemon";

interface PokemonDetailModalProps {
  pokemon: PokemonDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PokemonDetailModal({
  pokemon,
  open,
  onOpenChange,
}: PokemonDetailModalProps) {
  const [activeTab, setActiveTab] = useState<PokemonDetailTabType>("about");

  const primaryType = pokemon.types[0]?.type.name || "normal";
  const bgGradient = TYPE_BG_COLORS[primaryType] || TYPE_BG_COLORS.normal;
  const pokemonNumber = `#${pokemon.id.toString().padStart(3, "0")}`;
  const pokemonName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const artworkUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  const { data: species } = useQuery<PokemonSpecies>({
    queryKey: ["pokemon", "species", pokemon.id],
    queryFn: async () => {
      const { data } = await api.get(
        API_ENDPOINTS.POKEMON_SPECIES(pokemon.id.toString()),
      );
      return data;
    },
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  const evolutionChainId = species?.evolution_chain?.url?.match(
    /\/evolution-chain\/(\d+)\//,
  )?.[1];

  const { data: evolutionChain, isLoading: isLoadingEvolution } =
    useQuery<EvolutionChain>({
      queryKey: ["pokemon", "evolution-chain", evolutionChainId],
      queryFn: async () => {
        const { data } = await api.get(
          API_ENDPOINTS.EVOLUTION_CHAIN(evolutionChainId!),
        );
        return data;
      },
      enabled: open && !!evolutionChainId,
      staleTime: 10 * 60 * 1000,
    });

  const heightInMeters = formatPokemonHeight(pokemon.height);
  const weightInKg = formatPokemonWeight(pokemon.weight);
  const abilities = pokemon.abilities
    .map((a) => formatPokemonName(a.ability.name))
    .join(", ");

  const genus =
    species?.genera?.find((g) => g.language.name === "en")?.genus || "Pokémon";

  const genderRate = species?.gender_rate ?? 1;
  const genderPercent = calculateGenderPercent(genderRate);
  const femalePercent = genderPercent.female;
  const malePercent = genderPercent.male;

  const eggGroups =
    species?.egg_groups?.map((g) => formatPokemonName(g.name)).join(", ") ||
    "Unknown";

  const levelUpMoves =
    pokemon.moves
      ?.filter((m) =>
        m.version_group_details.some(
          (v) => v.move_learn_method.name === "level-up",
        ),
      )
      .map((m) => ({
        name: m.move.name,
        level:
          m.version_group_details.find(
            (v) => v.move_learn_method.name === "level-up",
          )?.level_learned_at || 0,
      }))
      .sort((a, b) => a.level - b.level)
      .slice(0, 15) || [];

  const tabs: { id: PokemonDetailTabType; label: string }[] = [
    { id: "about", label: "Sobre" },
    { id: "stats", label: "Atributos" },
    { id: "evolution", label: "Evolução" },
    { id: "moves", label: "Golpes" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden rounded-3xl border-0 max-w-sm max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{pokemonName} Details</DialogTitle>
        </VisuallyHidden>

        <div className={`bg-linear-to-br ${bgGradient} p-6 pb-16 relative`}>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">{pokemonName}</h2>
            <span className="text-white/80 font-bold mt-1">
              {pokemonNumber}
            </span>
          </div>

          <div className="flex gap-2 mt-2">
            {pokemon.types.map((t) => (
              <PokemonTypeBadge
                key={t.type.name}
                type={t.type.name}
                size="md"
                variant="outline"
              />
            ))}
          </div>

          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <img
              src={artworkUrl}
              alt={pokemonName}
              className="w-36 h-36 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a2e] rounded-t-3xl -mt-4 pt-20 px-6 pb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-[#2D3436] dark:text-white"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r ${bgGradient}`}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === "about" && (
              <PokemonAboutTab
                genus={genus}
                heightInMeters={heightInMeters}
                weightInKg={weightInKg}
                abilities={abilities}
                malePercent={malePercent}
                femalePercent={femalePercent}
                eggGroups={eggGroups}
              />
            )}

            {activeTab === "stats" && (
              <PokemonStatsTab stats={pokemon.stats} />
            )}

            {activeTab === "evolution" && (
              <PokemonEvolutionTab
                evolutionChain={evolutionChain}
                isLoading={isLoadingEvolution}
              />
            )}

            {activeTab === "moves" && (
              <PokemonMovesTab moves={levelUpMoves} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
