import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Sun } from "lucide-react";
import { InsightCard } from "@/components/ui/insight-card";
import type { WeatherLog } from "@/types/weather";
import { formatTime, formatDuration } from "@/utils/format";
import { calculateSunPosition } from "@/utils/weather";

interface SunPositionContentProps {
  weather: WeatherLog;
}

const SVG_WIDTH = 300;
const SVG_HEIGHT = 150;
const ARC_RADIUS = 120;
const CENTER_X = 150;
const CENTER_Y = 135;

export function SunPositionContent({ weather }: SunPositionContentProps) {
  const sunPosition = calculateSunPosition(weather);
  const percentage = sunPosition / 100;
  const angle = Math.PI - percentage * Math.PI;
  const sunX = CENTER_X + ARC_RADIUS * Math.cos(angle);
  const sunY = CENTER_Y - ARC_RADIUS * Math.sin(angle);
  const startX = CENTER_X - ARC_RADIUS;
  const fillPath = `M ${startX} ${CENTER_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${sunX} ${sunY} L ${sunX} ${CENTER_Y} Z`;

  return (
    <Card className="h-full rounded-3xl bg-white dark:bg-[#2C3A4B] shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E]">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-[#2D3436] dark:text-[#F7F9FC]">
          Sol
        </CardTitle>
        <CardDescription className="text-xs text-[#636E72] dark:text-[#9BA6B5]">
          {weather.location || "New York, USA"}
        </CardDescription>
        <CardAction>
          <span className="text-2xl font-bold text-orange-500">
            {Math.round(weather.temperature || 0)}°C
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="relative w-full aspect-2/1 -my-2">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="sunGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.3)" />
                <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
              </linearGradient>
            </defs>

            <line
              x1={CENTER_X - ARC_RADIUS - 10}
              y1={CENTER_Y}
              x2={CENTER_X + ARC_RADIUS + 10}
              y2={CENTER_Y}
              stroke="#E2E8F0"
              strokeWidth="1"
              className="dark:stroke-slate-700"
            />

            <path
              d={`M ${CENTER_X - ARC_RADIUS} ${CENTER_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${CENTER_X + ARC_RADIUS} ${CENTER_Y}`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="2"
              strokeDasharray="8 8"
              strokeLinecap="round"
              className="dark:stroke-slate-700"
            />

            <path d={fillPath} fill="url(#sunGradient)" />

            <path
              d={`M ${CENTER_X - ARC_RADIUS} ${CENTER_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${sunX} ${sunY}`}
              fill="none"
              stroke="#F97316"
              strokeWidth="3"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />

            <circle
              cx={CENTER_X - ARC_RADIUS}
              cy={CENTER_Y}
              r="4"
              className="fill-orange-500"
            />
            <circle
              cx={CENTER_X + ARC_RADIUS}
              cy={CENTER_Y}
              r="4"
              className="fill-slate-800 dark:fill-slate-400"
            />

            <g transform={`translate(${sunX}, ${sunY})`}>
              <circle r="12" fill="rgba(249, 115, 22, 0.2)" />
              <circle r="6" fill="#F97316" stroke="white" strokeWidth="2" />
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between px-2">
          <div>
            <div className="text-sm font-medium text-[#636E72] dark:text-[#9BA6B5]">
              Nascer do Sol
            </div>
            <div className="text-base font-bold text-[#2D3436] dark:text-[#F7F9FC]">
              {formatTime(weather.sunrise)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-[#636E72] dark:text-[#9BA6B5]">
              Pôr do Sol
            </div>
            <div className="text-base font-bold text-[#2D3436] dark:text-[#F7F9FC]">
              {formatTime(weather.sunset)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <InsightCard
          variant="orange"
          icon={Sun}
          title={`${formatDuration(weather.daylight_duration, "8h 20m")} de Sol`}
          description={`"Aproveite! ${Math.round(sunPosition)}% do dia será ensolarado."`}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
