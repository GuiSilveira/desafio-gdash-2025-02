import { useAIInsights } from "@/hooks/use-ai-insights";
import { AIContent } from "./ai-content";
import { GameRecommendationsCard } from "@/components/pokemon";

interface AIInsightsCardProps {
  isPokemonMode?: boolean;
}

export function AIInsightsCard({ isPokemonMode = false }: AIInsightsCardProps) {
  const { insights, isLoading } = useAIInsights();

  if (isPokemonMode) {
    return <GameRecommendationsCard />;
  }

  return <AIContent insights={insights} isLoading={isLoading} />;
}
