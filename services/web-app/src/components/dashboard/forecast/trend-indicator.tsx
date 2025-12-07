import { cn } from "@/utils/cn";
import { getTrendColor } from "@/utils/weather";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export function TrendIndicator({ trend }: { trend: string }) {
  const colorClass = getTrendColor(trend);

  if (trend === "up") {
    return <TrendingUp className={cn("w-4 h-4", colorClass)} />;
  }
  if (trend === "down") {
    return <TrendingDown className={cn("w-4 h-4", colorClass)} />;
  }
  return <Minus className={cn("w-4 h-4", colorClass)} />;
}
