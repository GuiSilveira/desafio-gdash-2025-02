import { Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DashboardHeaderProps {
  isPokemonMode: boolean;
  onPokemonModeChange: (checked: boolean) => void;
}

export function DashboardHeader({
  isPokemonMode,
  onPokemonModeChange,
}: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      {/* Left Section - Title and Date */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold text-[#2D3436] dark:text-[#F7F9FC]">
          Painel do Tempo
        </h1>
        <div className="flex items-center gap-2 text-[#636E72] dark:text-[#9BA6B5]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{currentDate}</span>
        </div>
      </div>

      {/* Right Section - Pokemon Mode Switch */}
      <div className="flex items-center">
        <div className="flex items-center gap-3 bg-white dark:bg-[#2D3436] px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-[#3E4C5E]">
          <Label
            htmlFor="pokemon-mode"
            className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Modo Pokemon
          </Label>
          <div className="relative">
            <Switch
              id="pokemon-mode"
              checked={isPokemonMode}
              onCheckedChange={onPokemonModeChange}
              className="data-[state=checked]:bg-red-500"
            />
            {/* Pokeball Center Dot Decoration - overlays on the switch thumb when checked */}
            {isPokemonMode && (
              <div className="absolute right-px top-0.5 w-4 h-4 bg-white rounded-full pointer-events-none shadow-sm border-2 border-slate-800 z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white border border-slate-800 rounded-full" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
