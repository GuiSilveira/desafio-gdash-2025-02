import { ChevronRight } from "lucide-react";
import { formatPokemonName, getPokemonIdFromUrl } from "@/utils/pokemon";
import type { EvolutionChain, EvolutionNode } from "@/types/pokemon";

interface PokemonEvolutionTabProps {
  evolutionChain: EvolutionChain | undefined;
  isLoading: boolean;
}

function EvolutionPokemon({
  name,
  pokemonId,
}: {
  name: string;
  pokemonId: string;
}) {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <img
          src={spriteUrl}
          alt={name}
          className="w-24 h-24 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
          }}
        />
      </div>
      <span className="text-sm text-[#2D3436] dark:text-white font-medium mt-2">
        {formatPokemonName(name)}
      </span>
    </div>
  );
}

function EvolutionChainDisplay({ chain }: { chain: EvolutionNode }) {
  const evolutions: { name: string; id: string; trigger?: string }[] = [];

  function extractEvolutions(node: EvolutionNode, trigger?: string) {
    const id = getPokemonIdFromUrl(node.species.url);
    evolutions.push({
      name: node.species.name,
      id,
      trigger,
    });

    node.evolves_to.forEach((evolution) => {
      const evolutionTrigger = evolution.evolution_details[0]?.min_level
        ? `Nv. ${evolution.evolution_details[0].min_level}`
        : evolution.evolution_details[0]?.item?.name
          ? formatPokemonName(evolution.evolution_details[0].item.name)
          : evolution.evolution_details[0]?.trigger?.name === "trade"
            ? "Troca"
            : "";
      extractEvolutions(evolution, evolutionTrigger);
    });
  }

  extractEvolutions(chain);

  if (evolutions.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <EvolutionPokemon
          name={evolutions[0].name}
          pokemonId={evolutions[0].id}
        />
        <p className="text-gray-400 text-sm mt-4">Este Pokémon não evolui.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
      {evolutions.map((evo, index) => (
        <div key={evo.id} className="flex items-center gap-2">
          <EvolutionPokemon name={evo.name} pokemonId={evo.id} />
          {index < evolutions.length - 1 && (
            <div className="flex flex-col items-center mx-1">
              <ChevronRight className="w-6 h-6 text-gray-400" />
              {evolutions[index + 1]?.trigger && (
                <span className="text-xs text-gray-400">
                  {evolutions[index + 1].trigger}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PokemonEvolutionTab({
  evolutionChain,
  isLoading,
}: PokemonEvolutionTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (evolutionChain?.chain) {
    return <EvolutionChainDisplay chain={evolutionChain.chain} />;
  }

  return (
    <div className="flex items-center justify-center h-40 text-gray-400">
      <p>Não foi possível carregar as evoluções.</p>
    </div>
  );
}
