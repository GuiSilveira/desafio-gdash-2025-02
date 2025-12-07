import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import { POKEMON_GAMES } from "@/constants/pokemon";
import { getRandomItems } from "@/utils/pokemon";
import { GameCard } from "./game-card";

export function GameRecommendationsCard() {
  const [recommendedGames] = useState(() => getRandomItems(POKEMON_GAMES, 2));

  return (
    <Card className="rounded-3xl bg-[#EE5253] shadow-[0px_12px_30px_rgba(238,82,83,0.25)] dark:shadow-[0px_12px_30px_rgba(238,82,83,0.15)] border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-xs font-bold text-white/90 uppercase tracking-wider">
            Jogos Recomendados
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
