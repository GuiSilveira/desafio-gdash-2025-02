/**
 * Componente de visualização do gráfico horário
 * Responsável apenas por renderizar Area, Line ou Bar charts
 */

import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import type {
  HourlyChartType,
  HourlyChartDataPoint,
  HourlyTabConfig,
} from "@/types/weather";

interface HourlyChartVisualizerProps {
  data: HourlyChartDataPoint[];
  chartType: HourlyChartType;
  tabConfig: HourlyTabConfig;
}

export function HourlyChartVisualizer({
  data,
  chartType,
  tabConfig,
}: HourlyChartVisualizerProps) {
  const chartConfig: ChartConfig = {
    [tabConfig.dataKey]: {
      label: tabConfig.label,
      color: tabConfig.color,
    },
  };

  const xAxisProps = {
    dataKey: "hour",
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tick: { fontSize: 11 },
    interval: "preserveStartEnd" as const,
    minTickGap: 40,
  };

  const yAxisProps = {
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tick: { fontSize: 11 },
    width: 55,
    tickFormatter: (value: number) => `${value}${tabConfig.unit}`,
  };

  const tooltipContent = (
    <ChartTooltipContent
      labelFormatter={(label) => `Hora: ${label}`}
      formatter={(value) => (
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: tabConfig.color }}
          />
          <span className="font-medium">
            {value}
            {tabConfig.unit}
          </span>
        </div>
      )}
    />
  );

  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="flex-1 w-full min-h-0 aspect-auto!"
    >
      {chartType === "line" ? (
        <LineChart {...commonProps}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-border)"
            opacity={0.3}
          />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip
            cursor={{
              stroke: tabConfig.color,
              strokeWidth: 1,
              strokeDasharray: "5 5",
            }}
            content={tooltipContent}
          />
          <Line
            type="monotone"
            dataKey={tabConfig.dataKey}
            stroke={tabConfig.color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: tabConfig.color, strokeWidth: 0 }}
            activeDot={{
              r: 6,
              fill: tabConfig.color,
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      ) : chartType === "bar" ? (
        <BarChart {...commonProps}>
          <defs>
            <linearGradient
              id={`bar-gradient-${tabConfig.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={tabConfig.gradientFrom}
                stopOpacity={0.9}
              />
              <stop
                offset="100%"
                stopColor={tabConfig.gradientTo}
                stopOpacity={0.6}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-border)"
            opacity={0.3}
          />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip
            cursor={{ fill: tabConfig.color, fillOpacity: 0.1 }}
            content={tooltipContent}
          />
          <Bar
            dataKey={tabConfig.dataKey}
            fill={`url(#bar-gradient-${tabConfig.id})`}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      ) : (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient
              id={`gradient-${tabConfig.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={tabConfig.gradientFrom}
                stopOpacity={0.4}
              />
              <stop
                offset="100%"
                stopColor={tabConfig.gradientTo}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-border)"
            opacity={0.3}
          />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip
            cursor={{ stroke: tabConfig.color, strokeWidth: 1 }}
            content={tooltipContent}
          />
          <Area
            type="monotone"
            dataKey={tabConfig.dataKey}
            stroke={tabConfig.color}
            strokeWidth={2.5}
            fill={`url(#gradient-${tabConfig.id})`}
            dot={false}
            activeDot={{
              r: 5,
              fill: tabConfig.color,
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      )}
    </ChartContainer>
  );
}
