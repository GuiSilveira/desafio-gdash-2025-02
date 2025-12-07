import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { usePokemon, usePokemonList } from "./use-pokemon";
import type { PokemonListResponse, Pokemon } from "@/types/pokemon";

vi.mock("@/config/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "@/config/api";

const mockPokemonList: Pokemon[] = [
  { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
  { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
  { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
];

const mockListResponse: PokemonListResponse = {
  count: 1000,
  next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  previous: null,
  results: mockPokemonList,
};

const mockPokemonDetails = {
  id: 25,
  name: "pikachu",
  sprites: { front_default: "https://example.com/pikachu.png" },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("usePokemon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should fetch pokemon list on mount", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      vi.useRealTimers();
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/external/pokemon?limit=20&offset=0")
      );
    });

    it("should return empty search term initially", () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      expect(result.current.searchTerm).toBe("");
    });

    it("should not be searching initially", () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe("pokemon list", () => {
    it("should return pokemon from infinite query", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      vi.useRealTimers();
      await waitFor(() => {
        expect(result.current.pokemon).toEqual(mockPokemonList);
      });
    });

    it("should return hasNextPage when next URL exists", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      vi.useRealTimers();
      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });
    });

    it("should return hasNextPage false when no next URL", async () => {
      const responseWithoutNext = { ...mockListResponse, next: null };
      vi.mocked(api.get).mockResolvedValue({ data: responseWithoutNext });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      vi.useRealTimers();
      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(false);
      });
    });

    it("should have fetchNextPage function", () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.fetchNextPage).toBe("function");
    });
  });

  describe("search functionality", () => {
    it("should update searchTerm when setSearchTerm is called", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchTerm("pikachu");
      });

      expect(result.current.searchTerm).toBe("pikachu");
    });

    it("should debounce search for 500ms", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchTerm("pikachu");
      });

      expect(api.get).not.toHaveBeenCalledWith(
        expect.stringContaining("/external/pokemon/pikachu")
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      vi.useRealTimers();
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/external/pokemon/pikachu");
      });
    });

    it("should return search result as array when found", async () => {
      vi.useRealTimers();
      
      vi.mocked(api.get).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes("/pokemon/pikachu")) {
          return Promise.resolve({ data: mockPokemonDetails });
        }
        return Promise.resolve({ data: mockListResponse });
      });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchTerm("pikachu");
      });

      await waitFor(() => {
        expect(result.current.pokemon.length).toBe(1);
      }, { timeout: 2000 });

      expect(result.current.pokemon[0].name).toBe("pikachu");
    });

    it("should show searchNotFound when search fails", async () => {
      vi.useRealTimers();
      
      vi.mocked(api.get).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes("/pokemon/notapokemon")) {
          return Promise.reject(new Error("Not found"));
        }
        return Promise.resolve({ data: mockListResponse });
      });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchTerm("notapokemon");
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      }, { timeout: 2000 });

      expect(result.current.pokemon).toEqual([]);
    });

    it("should have hasNextPage as false when searchTerm is set", () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchTerm("pikachu");
      });

      expect(result.current.hasNextPage).toBe(false);
    });

    it("should return to list when search is cleared", async () => {
      vi.useRealTimers();
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearchTerm("pikachu");
      });

      act(() => {
        result.current.setSearchTerm("");
      });

      await waitFor(() => {
        expect(result.current.pokemon).toEqual(mockPokemonList);
      });
    });
  });

  describe("returned values", () => {
    it("should return all expected properties", () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

      const { result } = renderHook(() => usePokemon(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("pokemon");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("hasNextPage");
      expect(result.current).toHaveProperty("fetchNextPage");
      expect(result.current).toHaveProperty("isFetchingNextPage");
      expect(result.current).toHaveProperty("searchTerm");
      expect(result.current).toHaveProperty("setSearchTerm");
      expect(result.current).toHaveProperty("isSearching");
      expect(result.current).toHaveProperty("searchNotFound");
    });
  });
});

describe("usePokemonList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch pokemon list with default page", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

    renderHook(() => usePokemonList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("offset=0")
      );
    });
  });

  it("should calculate correct offset for page", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

    renderHook(() => usePokemonList(2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("offset=20")
      );
    });
  });

  it("should calculate correct offset for page 3", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

    renderHook(() => usePokemonList(3), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("offset=40")
      );
    });
  });

  it("should handle error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => usePokemonList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
