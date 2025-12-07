import { useState, useMemo, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/config/api';
import { API_ENDPOINTS } from '@/constants/api';
import type { Pokemon, PokemonListResponse } from '@/types/pokemon';

function buildPokemonUrl(id: number): string {
  return `https://pokeapi.co/api/v2/pokemon/${id}/`;
}

export function usePokemon() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchQuery = useQuery<Pokemon>({
    queryKey: ['pokemon', 'search', debouncedSearch],
    queryFn: async () => {
      const { data } = await api.get(
        `${API_ENDPOINTS.EXPLORE_BY_ID(debouncedSearch.toLowerCase())}`
      );
      return {
        name: data.name,
        url: buildPokemonUrl(data.id),
        id: data.id,
      };
    },
    enabled: debouncedSearch.trim().length > 0,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  const infiniteQuery = useInfiniteQuery<PokemonListResponse>({
    queryKey: ['pokemon', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam as number;
      const { data } = await api.get(
        `${API_ENDPOINTS.EXPLORE}?limit=${limit}&offset=${offset}`
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.searchParams.get('offset');
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !debouncedSearch.trim(),
    staleTime: 10 * 60 * 1000,
  });

  const allPokemon = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.results);
  }, [infiniteQuery.data]);

  const pokemon = useMemo(() => {
    if (debouncedSearch.trim()) {
      return searchQuery.data ? [searchQuery.data] : [];
    }
    return allPokemon;
  }, [debouncedSearch, searchQuery.data, allPokemon]);

  const isLoading = debouncedSearch.trim()
    ? searchQuery.isLoading
    : infiniteQuery.isLoading;

  const hasNextPage = !debouncedSearch.trim() && infiniteQuery.hasNextPage;

  return {
    pokemon,
    isLoading,
    hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    searchTerm,
    setSearchTerm,
    isSearching: searchQuery.isFetching,
    searchNotFound: debouncedSearch.trim() && !searchQuery.data && !searchQuery.isLoading,
  };
}

export function usePokemonList(page: number = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;

  return useInfiniteQuery<PokemonListResponse>({
    queryKey: ["pokemon", "list", page],
    queryFn: async () => {
      const { data } = await api.get(
        `${API_ENDPOINTS.EXPLORE}?limit=${limit}&offset=${offset}`,
      );
      return data;
    },
    getNextPageParam: () => undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}
