/**
 * Filtros do gráfico horário (tipo de gráfico e período)
 */

import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HOURLY_CHART_TYPES, HOURLY_TIME_RANGES } from "@/constants/weather";
import type { HourlyChartType, HourlyTimeRange } from "@/types/weather";

interface HourlyChartFiltersProps {
  chartType: HourlyChartType;
  timeRange: HourlyTimeRange;
  onChartTypeChange: (type: HourlyChartType) => void;
  onTimeRangeChange: (range: HourlyTimeRange) => void;
}

export function HourlyChartFilters({
  chartType,
  timeRange,
  onChartTypeChange,
  onTimeRangeChange,
}: HourlyChartFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      {/* Chart Type Toggle */}
      <ToggleGroup
        type="single"
        value={chartType}
        onValueChange={(value: HourlyChartType) => value && onChartTypeChange(value)}
        className="bg-[#F7F9FC] dark:bg-[#3E4C5E] rounded-lg p-1"
      >
        {HOURLY_CHART_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <ToggleGroupItem
              key={type.id}
              value={type.id}
              aria-label={type.label}
              className="px-3 py-1.5 data-[state=on]:bg-white dark:data-[state=on]:bg-[#2C3A4B] data-[state=on]:shadow-sm rounded-md transition-all"
            >
              <Icon className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-medium">{type.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      {/* Time Range Select */}
      <Select
        value={timeRange}
        onValueChange={(value: HourlyTimeRange) => onTimeRangeChange(value)}
      >
        <SelectTrigger className="w-[140px] h-9 bg-[#F7F9FC] dark:bg-[#3E4C5E] border-0 rounded-lg">
          <Clock className="w-4 h-4 mr-2 text-[#636E72] dark:text-[#9BA6B5]" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {HOURLY_TIME_RANGES.map((range) => (
            <SelectItem key={range.id} value={range.id}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
