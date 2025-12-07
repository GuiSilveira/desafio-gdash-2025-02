import { TYPE_COLORS, TYPE_ICONS, TYPE_NAMES_PT } from "@/constants/pokemon";
import { cn } from "@/utils/cn";

interface PokemonTypeRowProps {
  type: string;
  boost?: string;
  className?: string;
}

export function PokemonTypeRow({
  type,
  boost,
  className,
}: PokemonTypeRowProps) {
  const typeLower = type.toLowerCase();
  const color = TYPE_COLORS[typeLower] || TYPE_COLORS.normal;
  const name = TYPE_NAMES_PT[typeLower] || type;
  const icon = TYPE_ICONS[typeLower] || "⭐";

  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-xl bg-[#F0FDF4] dark:bg-[#052e16]/30",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className="text-base">{icon}</span>
        </div>
        <span className="font-semibold text-sm text-[#2D3436] dark:text-[#F7F9FC]">
          {name}
        </span>
      </div>

      {boost && (
        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
          {boost}
        </span>
      )}
    </div>
  );
}
