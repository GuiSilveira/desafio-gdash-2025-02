/**
 * Tabs de métricas do gráfico horário (Temperatura, Chuva, UV, AQI)
 */

import { HOURLY_CHART_TABS } from "@/constants/weather";
import type { HourlyTabType } from "@/types/weather";

interface HourlyChartTabsProps {
  activeTab: HourlyTabType;
  onTabChange: (tab: HourlyTabType) => void;
}

export function HourlyChartTabs({ activeTab, onTabChange }: HourlyChartTabsProps) {
  return (
    <div className="flex gap-2">
      {HOURLY_CHART_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              isActive
                ? "text-white"
                : "bg-[#F7F9FC] dark:bg-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F]"
            }`}
            style={
              isActive
                ? {
                    backgroundColor: tab.buttonBg,
                    boxShadow: `0 4px 15px ${tab.buttonShadow}`,
                  }
                : undefined
            }
            title={tab.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
