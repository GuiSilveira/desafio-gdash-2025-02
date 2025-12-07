import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { POKEMON_ITEMS } from "@/constants/pokemon";
import { getRandomItems } from "@/utils/pokemon";
import { ItemRow } from "./item-row";

export function DailyItemsCard() {
  const [dailyItems] = useState(() => getRandomItems(POKEMON_ITEMS, 3));

  return (
    <Card className="rounded-3xl bg-[#0F1724] text-white shadow-[0px_8px_24px_rgba(0,0,0,0.3)] h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <CardTitle className="text-md font-bold text-white">
            Itens do Dia
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          {dailyItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
