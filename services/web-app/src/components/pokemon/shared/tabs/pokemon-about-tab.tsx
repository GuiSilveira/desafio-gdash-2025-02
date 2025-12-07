interface PokemonAboutTabProps {
  genus: string;
  heightInMeters: string;
  weightInKg: string;
  abilities: string;
  malePercent: number | null;
  femalePercent: number | null;
  eggGroups: string;
}

export function PokemonAboutTab({
  genus,
  heightInMeters,
  weightInKg,
  abilities,
  malePercent,
  femalePercent,
  eggGroups,
}: PokemonAboutTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
        <span className="text-gray-400">Espécie</span>
        <span className="text-[#2D3436] dark:text-white font-medium">
          {genus}
        </span>

        <span className="text-gray-400">Altura</span>
        <span className="text-[#2D3436] dark:text-white font-medium">
          {heightInMeters} m
        </span>

        <span className="text-gray-400">Peso</span>
        <span className="text-[#2D3436] dark:text-white font-medium">
          {weightInKg} kg
        </span>

        <span className="text-gray-400">Habilidades</span>
        <span className="text-[#2D3436] dark:text-white font-medium">
          {abilities}
        </span>
      </div>

      <div className="pt-4">
        <h4 className="font-bold text-[#2D3436] dark:text-white mb-3">
          Reprodução
        </h4>
        <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
          <span className="text-gray-400">Gênero</span>
          {femalePercent !== null ? (
            <div className="flex gap-3">
              <span className="text-blue-500 font-medium">
                ♂ {malePercent?.toFixed(1)}%
              </span>
              <span className="text-pink-500 font-medium">
                ♀ {femalePercent.toFixed(1)}%
              </span>
            </div>
          ) : (
            <span className="text-gray-500 font-medium">Sem gênero</span>
          )}

          <span className="text-gray-400">Grupo de Ovos</span>
          <span className="text-[#2D3436] dark:text-white font-medium">
            {eggGroups}
          </span>
        </div>
      </div>
    </div>
  );
}
