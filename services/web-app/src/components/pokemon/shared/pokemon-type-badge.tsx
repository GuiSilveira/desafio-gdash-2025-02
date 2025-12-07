/**
 * Componentes de badge para tipos de Pokemon
 */

import { cn } from "@/utils/cn";
import { TYPE_COLORS, TYPE_NAMES_PT, TYPE_ICONS } from "@/constants/pokemon";

type BadgeSize = "xs" | "sm" | "md";
type BadgeVariant = "solid" | "outline";

interface PokemonTypeBadgeProps {
  type: string;
  size?: BadgeSize;
  variant?: BadgeVariant;
  showIcon?: boolean;
  className?: string;
}

const sizeClasses: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

export function PokemonTypeBadge({
  type,
  size = "sm",
  variant = "solid",
  showIcon = false,
  className,
}: PokemonTypeBadgeProps) {
  const typeLower = type.toLowerCase();
  const color = TYPE_COLORS[typeLower] || TYPE_COLORS.normal;
  const name = TYPE_NAMES_PT[typeLower] || type;
  const icon = TYPE_ICONS[typeLower];

  const baseClasses = cn(
    "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
    sizeClasses[size],
  );

  if (variant === "outline") {
    return (
      <span
        className={cn(
          baseClasses,
          "border-2 border-white/30 text-white",
          className,
        )}
        style={{ backgroundColor: color }}
      >
        {showIcon && icon && <span>{icon}</span>}
        {name}
      </span>
    );
  }

  return (
    <span
      className={cn(baseClasses, "text-white", className)}
      style={{ backgroundColor: color }}
    >
      {showIcon && icon && <span>{icon}</span>}
      {name}
    </span>
  );
}
