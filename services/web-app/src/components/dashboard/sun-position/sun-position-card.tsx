import { useCurrentWeather } from "@/hooks/use-weather";
import { PokemonRecommendationCard } from "@/components/pokemon";
import { SunPositionContent } from "./sun-position-content";
import { SunPositionSkeleton } from "./sun-position-skeleton";

interface SunPositionCardProps {
  isPokemonMode?: boolean;
}

export function SunPositionCard({
  isPokemonMode = false,
}: SunPositionCardProps) {
  const { data: weather } = useCurrentWeather();

  if (isPokemonMode) {
    return <PokemonRecommendationCard />;
  }

  if (!weather) {
    return <SunPositionSkeleton />;
  }

  return <SunPositionContent weather={weather} />;
}
