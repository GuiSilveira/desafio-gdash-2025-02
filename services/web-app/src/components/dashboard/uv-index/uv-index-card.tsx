import { useCurrentWeather } from "@/hooks/use-weather";
import { DailyItemsCard } from "@/components/pokemon";
import { UVIndexContent } from "./uv-index-content";
import { UVIndexSkeleton } from "./uv-index-skeleton";

interface UVIndexCardProps {
  isPokemonMode?: boolean;
}

export function UVIndexCard({ isPokemonMode = false }: UVIndexCardProps) {
  const { data: weather, isLoading } = useCurrentWeather();

  if (isPokemonMode) {
    return <DailyItemsCard />;
  }

  if (isLoading || !weather) {
    return <UVIndexSkeleton />;
  }

  return <UVIndexContent weather={weather} />;
}
