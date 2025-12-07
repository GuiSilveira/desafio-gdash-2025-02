import { useCurrentWeather } from "@/hooks/use-weather";
import { useForecastInsights } from "@/hooks/use-ai-insights";
import { ForecastContent } from "./forecast-content";
import { WeatherTeamCard } from "@/components/pokemon";

interface ForecastWidgetProps {
  isPokemonMode?: boolean;
}

export function ForecastWidget({ isPokemonMode = false }: ForecastWidgetProps) {
  const { data: weatherData, isLoading } = useCurrentWeather();
  const {
    insights,
    isLoading: isInsightsLoading,
    isGenerating,
    generateManually,
  } = useForecastInsights();

  if (isPokemonMode) {
    return <WeatherTeamCard />;
  }

  return (
    <ForecastContent
      weatherData={weatherData}
      isLoading={isLoading}
      insights={insights}
      isInsightsLoading={isInsightsLoading}
      isGenerating={isGenerating}
      onGenerateInsights={generateManually}
    />
  );
}
