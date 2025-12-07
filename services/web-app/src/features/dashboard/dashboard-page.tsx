import { useState } from "react";
import {
  DashboardHeader,
  MainWeatherCard,
  SunPositionCard,
  AIInsightsCard,
  AirQualityCard,
  UVIndexCard,
  ForecastWidget,
  HourlyChart,
  WeatherTable,
} from "@/components/dashboard";

export default function DashboardPage() {
  const [isPokemonMode, setIsPokemonMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0a0a0a] overflow-x-hidden">
      <div className="w-full max-w-full lg:p-6 space-y-6 overflow-hidden">
        {/* Linha 1: Header with Search and Pokemon Mode Toggle */}
        <DashboardHeader
          isPokemonMode={isPokemonMode}
          onPokemonModeChange={setIsPokemonMode}
        />

        {/* Linha 2: Main Weather + Sun + 7 Days Forecast */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
          <MainWeatherCard />
          <SunPositionCard isPokemonMode={isPokemonMode} />
          <ForecastWidget isPokemonMode={isPokemonMode} />
        </div>

        {/* Linha 3: AI Grid + Hourly Chart (mesma altura) */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch min-w-0">
          {/* Grid de I.A - 2 colunas (40%) */}
          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 grid-rows-[auto_1fr] min-w-0">
            {/* AI Insights - full width no topo */}
            <div className="sm:col-span-2">
              <AIInsightsCard isPokemonMode={isPokemonMode} />
            </div>

            {/* Air Quality e UV Index lado a lado - expandem para preencher */}
            <AirQualityCard isPokemonMode={isPokemonMode} />
            <UVIndexCard isPokemonMode={isPokemonMode} />
          </div>
          {/* Hourly Chart - 3 colunas (60%) */}
          <div className="xl:col-span-3 min-w-0">
            <HourlyChart isPokemonMode={isPokemonMode} />
          </div>
        </div>

        {/* Linha 4: Data Table - Hidden in Pokemon Mode */}
        {!isPokemonMode && <WeatherTable />}
      </div>
    </div>
  );
}
