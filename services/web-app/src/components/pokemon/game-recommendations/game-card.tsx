import type { PokemonGame } from "@/types/pokemon";

interface GameCardProps {
  game: PokemonGame;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl ${game.color} transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
    >
      {/* Game "box art" placeholder */}
      <div className="w-16 h-20 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-[10px] text-white/90 font-bold text-center leading-tight whitespace-pre-line px-1">
          {game.shortTitle}
        </span>
      </div>

      {/* Game info */}
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="font-bold text-white text-sm leading-tight">
          {game.title}
        </h4>
        <p className="text-xs text-white/80 leading-snug">{game.description}</p>
      </div>
    </div>
  );
}
