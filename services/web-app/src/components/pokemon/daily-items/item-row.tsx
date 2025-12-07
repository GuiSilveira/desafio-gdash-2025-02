import type { PokemonItem } from "@/types/pokemon";

export function ItemRow({ item }: { item: PokemonItem }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1a2332] hover:bg-[#243044] transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-[#2a3444] flex items-center justify-center shrink-0">
        <img
          src={item.sprite}
          alt={item.name}
          className="w-8 h-8 object-contain"
        />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-sm text-white">{item.name}</span>
        <p className="text-xs text-slate-400 leading-snug">
          {item.description}
        </p>
      </div>
    </div>
  );
}
