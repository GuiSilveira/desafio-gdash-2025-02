import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AIInsights {
  summary?: string;
  tags?: string[];
  comfortScore?: number;
  alert?: boolean;
}

interface AIContentProps {
  insights: AIInsights | null | undefined;
  isLoading?: boolean;
}

export function AIContent({ insights, isLoading = false }: AIContentProps) {
  if (isLoading) {
    return (
      <Card className="rounded-3xl bg-linear-to-br from-[#6C5CE7] to-[#A29BFE] text-white shadow-[0px_12px_30px_rgba(108,92,231,0.25)] h-full border-0">
        <CardContent className="py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/20 rounded w-32"></div>
            <div className="h-20 bg-white/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl bg-linear-to-br from-[#6C5CE7] to-[#A29BFE] text-white shadow-[0px_12px_30px_rgba(108,92,231,0.25)] dark:shadow-[0px_12px_30px_rgba(108,92,231,0.15)] border-0 h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-white">
              Nimbus AI
            </CardTitle>
            <CardDescription className="text-white/80">
              Análises inteligentes
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Insights Content */}
        <div className="space-y-3">
          {insights?.summary ? (
            <>
              <p className="text-sm leading-relaxed text-white/95">
                {insights.summary}
              </p>

              {/* Tags */}
              {insights.tags && insights.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {insights.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comfort Score */}
              {insights.comfortScore !== undefined && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/90">
                      Índice de Conforto
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${insights.comfortScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {insights.comfortScore}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alert Badge */}
              {insights.alert && (
                <div className="mt-2 px-3 py-1.5 rounded-xl bg-amber-400/20 backdrop-blur-sm border border-amber-300/30">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">⚠️</span>
                    <span className="text-sm font-medium text-white">
                      Alerta Meteorológico Ativo
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/70 text-xs">
                Insights de IA aparecerão aqui baseados nas condições climáticas
                atuais.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
