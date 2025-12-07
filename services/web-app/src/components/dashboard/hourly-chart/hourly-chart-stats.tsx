/**
 * Componente de estatísticas do gráfico horário
 * Responsável por exibir legenda e valores min/max/média
 */

import type { HourlyTabConfig } from "@/types/weather";

interface ChartStats {
  min: number;
  max: number;
  avg: number;
}

interface HourlyChartStatsProps {
  tabConfig: HourlyTabConfig;
  stats: ChartStats;
}

export function HourlyChartStats({ tabConfig, stats }: HourlyChartStatsProps) {
  return (
    <div className="mt-4 pt-4 border-t border-[#EDF1F5] dark:border-[#3E4C5E] shrink-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Legenda */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tabConfig.color }}
          />
          <span className="text-sm font-medium text-[#636E72] dark:text-[#9BA6B5]">
            {tabConfig.label}
          </span>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-4 text-sm text-[#636E72] dark:text-[#9BA6B5]">
          <span>
            Mín:{" "}
            <strong>
              {stats.min.toFixed(0)}
              {tabConfig.unit}
            </strong>
          </span>
          <span>
            Média:{" "}
            <strong>
              {stats.avg.toFixed(1)}
              {tabConfig.unit}
            </strong>
          </span>
          <span>
            Máx:{" "}
            <strong>
              {stats.max.toFixed(0)}
              {tabConfig.unit}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
