import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { api } from "@/config/api";
import { API_ENDPOINTS } from "@/constants/api";
import { PAGINATION } from "@/constants/app";
import { PaginationControls } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useIsLargeScreen } from "@/hooks/use-mobile";
import { extractPokemonId } from "@/utils/pokemon";
import { PokemonDetailModal } from "../shared/pokemon-detail-modal";
import { PokemonMiniCard } from "../shared/pokemon-mini-card";
import type { PokemonDetail, PokemonListResponse } from "@/types/pokemon";

export function PokedexCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<PokemonDetail | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLargeScreen = useIsLargeScreen();
  const itemsPerPage = isLargeScreen
    ? PAGINATION.POKEDEX_LARGE
    : PAGINATION.POKEDEX_SMALL;

  const { data: pokemonList, isLoading } = useQuery<PokemonListResponse>({
    queryKey: ["pokemon", "list", 1, itemsPerPage],
    queryFn: async () => {
      const { data } = await api.get(
        `${API_ENDPOINTS.EXPLORE}?limit=${itemsPerPage}&offset=0`,
      );
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const pagination = usePagination({
    totalItems: pokemonList?.count || 0,
    itemsPerPage,
  });

  const offset = pagination.offset;

  const { data: paginatedList } = useQuery<PokemonListResponse>({
    queryKey: ["pokemon", "list", pagination.currentPage, itemsPerPage],
    queryFn: async () => {
      const { data } = await api.get(
        `${API_ENDPOINTS.EXPLORE}?limit=${itemsPerPage}&offset=${offset}`,
      );
      return data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: pagination.currentPage > 0,
  });

  const pokemonData = useMemo(() => {
    const list = paginatedList || pokemonList;
    if (!list?.results) return [];
    return list.results.map((p) => ({
      id: extractPokemonId(p.url),
      name: p.name,
    }));
  }, [paginatedList, pokemonList]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await api.get(
        API_ENDPOINTS.EXPLORE_BY_ID(searchQuery.toLowerCase().trim()),
      );
      setSearchResult(data);
    } catch {
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectPokemon = (pokemon: PokemonDetail) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  useEffect(() => {
    setSearchResult(null);
    setSearchQuery("");
  }, [pagination.currentPage]);

  return (
    <>
      <Card className="rounded-4xl bg-white dark:bg-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/30">
              <BookOpen className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
                Pokédex
              </CardTitle>
              <CardDescription className="text-sm text-[#636E72] dark:text-[#9BA6B5]">
                Saiba tudo sobre os monstrinhos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636E72] dark:text-[#9BA6B5]" />
              <Input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-4 h-10 bg-[#F7F9FC] dark:bg-[#3E4C5E] border-0 rounded-xl"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 h-10 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isSearching ? "..." : "Buscar"}
            </button>
            {searchResult && (
              <button
                onClick={clearSearch}
                className="px-3 h-10 bg-[#F7F9FC] dark:bg-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] font-medium rounded-xl hover:bg-[#EDF1F5] dark:hover:bg-[#57606F] transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 min-[475px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
              {[...Array(itemsPerPage)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse h-26"
                />
              ))}
            </div>
          ) : searchResult ? (
            <div className="grid grid-cols-1 min-[475px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
              <PokemonMiniCard
                pokemonId={searchResult.id}
                variant="grid"
                onSelect={handleSelectPokemon}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[475px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
              {pokemonData.map((p) => (
                <PokemonMiniCard
                  key={p.id}
                  pokemonId={p.id}
                  variant="grid"
                  onSelect={handleSelectPokemon}
                />
              ))}
            </div>
          )}
        </CardContent>

        {!searchResult && (
          <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center">
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageNumbers={pagination.pageNumbers}
              onPageChange={pagination.goToPage}
              isFirstPage={pagination.isFirstPage}
              isLastPage={pagination.isLastPage}
              variant="pokemon"
            />
          </CardFooter>
        )}
      </Card>

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
