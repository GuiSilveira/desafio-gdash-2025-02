import { PokedexCard } from "@/components/pokemon";
import { HourlyChartContent } from "./hourly-chart-content";

interface HourlyChartProps {
  isPokemonMode?: boolean;
}

export function HourlyChart({ isPokemonMode = false }: HourlyChartProps) {
  if (isPokemonMode) {
    return <PokedexCard />;
  }

  return <HourlyChartContent />;
}
