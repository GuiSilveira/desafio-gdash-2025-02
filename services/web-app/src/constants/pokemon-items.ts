import type { PokemonItem, PokemonGame } from "@/types/pokemon";

export const POKEMON_ITEMS: PokemonItem[] = [
  {
    id: "potion",
    name: "Poção",
    description: "Restaura 20 HP.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png",
  },
  {
    id: "super-potion",
    name: "Super Poção",
    description: "Restaura 60 HP.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png",
  },
  {
    id: "hyper-potion",
    name: "Hiper Poção",
    description: "Restaura 120 HP.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png",
  },
  {
    id: "max-potion",
    name: "Poção Máxima",
    description: "Restaura todo o HP.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png",
  },
  {
    id: "poke-ball",
    name: "Poké Ball",
    description: "Um dispositivo para capturar Pokémon selvagens.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
  },
  {
    id: "great-ball",
    name: "Great Ball",
    description: "Uma boa Ball com maior taxa de captura.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",
  },
  {
    id: "ultra-ball",
    name: "Ultra Ball",
    description: "Uma Ball de alto desempenho.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png",
  },
  {
    id: "master-ball",
    name: "Master Ball",
    description: "A melhor Ball. Nunca falha.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png",
  },
  {
    id: "revive",
    name: "Reviver",
    description: "Reanima um Pokémon desmaiado com metade do HP.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png",
  },
  {
    id: "max-revive",
    name: "Reviver Máximo",
    description: "Reanima um Pokémon desmaiado com HP total.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png",
  },
  {
    id: "rare-candy",
    name: "Doce Raro",
    description: "Aumenta o nível de um Pokémon em um.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png",
  },
  {
    id: "full-restore",
    name: "Restauro Total",
    description: "Restaura todo o HP e cura status.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-restore.png",
  },
  {
    id: "antidote",
    name: "Antídoto",
    description: "Cura um Pokémon envenenado.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/antidote.png",
  },
  {
    id: "burn-heal",
    name: "Cura Queimadura",
    description: "Cura um Pokémon queimado.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/burn-heal.png",
  },
  {
    id: "ice-heal",
    name: "Cura Gelo",
    description: "Descongela um Pokémon congelado.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ice-heal.png",
  },
  {
    id: "awakening",
    name: "Despertar",
    description: "Acorda um Pokémon adormecido.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/awakening.png",
  },
  {
    id: "paralyze-heal",
    name: "Cura Paralisia",
    description: "Cura um Pokémon paralisado.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/paralyze-heal.png",
  },
  {
    id: "ether",
    name: "Éter",
    description: "Restaura 10 PP de um golpe.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ether.png",
  },
  {
    id: "elixir",
    name: "Elixir",
    description: "Restaura 10 PP de todos os golpes.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/elixir.png",
  },
  {
    id: "lemonade",
    name: "Limonada",
    description: "Restaura 70 HP.",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lemonade.png",
  },
];

export const POKEMON_GAMES: PokemonGame[] = [
  {
    id: "scarlet",
    title: "Pokémon Scarlet",
    shortTitle: "Pokémon\nScarlet",
    description: "Explore Paldea em uma aventura mundo aberto!",
    color: "bg-[#C62828]",
  },
  {
    id: "violet",
    title: "Pokémon Violet",
    shortTitle: "Pokémon\nViolet",
    description: "Descubra a região de Paldea com novos amigos!",
    color: "bg-[#6A1B9A]",
  },
  {
    id: "legends-za",
    title: "Pokémon Legends: Z-A",
    shortTitle: "Pokémon\nLegends:\nZ-A",
    description: "Em breve! Revisite Kalos de uma nova forma.",
    color: "bg-[#C62828]",
  },
  {
    id: "legends-arceus",
    title: "Pokémon Legends: Arceus",
    shortTitle: "Pokémon\nLegends:\nArceus",
    description: "Viaje no tempo para a antiga Sinnoh!",
    color: "bg-[#1565C0]",
  },
  {
    id: "bdsp",
    title: "Pokémon Brilliant Diamond",
    shortTitle: "Pokémon\nBrilliant\nDiamond",
    description: "Reviva a aventura de Sinnoh em HD!",
    color: "bg-[#0288D1]",
  },
  {
    id: "swsh",
    title: "Pokémon Sword & Shield",
    shortTitle: "Pokémon\nSword &\nShield",
    description: "Explore a região de Galar e seja Campeão!",
    color: "bg-[#0277BD]",
  },
  {
    id: "letsgo",
    title: "Pokémon Let's Go!",
    shortTitle: "Pokémon\nLet's Go!",
    description: "Uma nova versão da aventura em Kanto!",
    color: "bg-[#F9A825]",
  },
  {
    id: "unite",
    title: "Pokémon UNITE",
    shortTitle: "Pokémon\nUNITE",
    description: "Una-se em batalhas estratégicas 5v5!",
    color: "bg-[#FF6F00]",
  },
  {
    id: "go",
    title: "Pokémon GO",
    shortTitle: "Pokémon\nGO",
    description: "Capture Pokémon no mundo real!",
    color: "bg-[#1976D2]",
  },
  {
    id: "sleep",
    title: "Pokémon Sleep",
    shortTitle: "Pokémon\nSleep",
    description: "Acompanhe seu sono com o Snorlax!",
    color: "bg-[#5C6BC0]",
  },
];
