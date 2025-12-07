import { STAT_NAMES, STAT_COLORS } from "@/constants/pokemon";
import type { PokemonStat } from "@/types/pokemon";

interface PokemonStatsTabProps {
  stats: PokemonStat[];
}

export function PokemonStatsTab({ stats }: PokemonStatsTabProps) {
  const totalStats = stats.reduce((acc, stat) => acc + stat.base_stat, 0);

  return (
    <div className="space-y-3">
      {stats.map((stat) => (
        <div key={stat.stat.name} className="flex items-center gap-3">
          <span className="text-gray-400 text-sm w-16">
            {STAT_NAMES[stat.stat.name] || stat.stat.name}
          </span>
          <span className="text-[#2D3436] dark:text-white font-bold w-8 text-right">
            {stat.base_stat}
          </span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${STAT_COLORS[stat.stat.name] || "bg-gray-500"}`}
              style={{
                width: `${Math.min(100, (stat.base_stat / 255) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
        <span className="text-gray-400 text-sm w-16">Total</span>
        <span className="text-[#2D3436] dark:text-white font-bold w-8 text-right">
          {totalStats}
        </span>
        <div className="flex-1" />
      </div>
    </div>
  );
}
