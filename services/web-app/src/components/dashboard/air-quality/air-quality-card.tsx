import { useCurrentWeather } from "@/hooks/use-weather";
import { AirQualityContent } from "./air-quality-content";
import { BoostedTypesCard } from "@/components/pokemon";

interface AirQualityCardProps {
  isPokemonMode?: boolean;
}

export function AirQualityCard({ isPokemonMode = false }: AirQualityCardProps) {
  const { data: weather } = useCurrentWeather();

  if (isPokemonMode) {
    return <BoostedTypesCard />;
  }

  return <AirQualityContent weather={weather} />;
}
