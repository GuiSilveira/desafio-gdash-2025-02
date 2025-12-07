import { formatPokemonName } from "@/utils/pokemon";

interface Move {
  name: string;
  level: number;
}

interface PokemonMovesTabProps {
  moves: Move[];
}

export function PokemonMovesTab({ moves }: PokemonMovesTabProps) {
  if (moves.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        <p>Nenhum golpe encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[250px] overflow-y-auto">
      <div className="grid grid-cols-[50px_1fr] gap-2 text-xs text-gray-400 font-medium pb-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1a1a2e]">
        <span>Nível</span>
        <span>Golpe</span>
      </div>
      {moves.map((move, index) => (
        <div
          key={`${move.name}-${index}`}
          className="grid grid-cols-[50px_1fr] gap-2 text-sm py-1.5 border-b border-gray-100 dark:border-gray-800"
        >
          <span className="text-gray-400 font-medium">
            {move.level === 0 ? "—" : move.level}
          </span>
          <span className="text-[#2D3436] dark:text-white font-medium">
            {formatPokemonName(move.name)}
          </span>
        </div>
      ))}
    </div>
  );
}
