export const WEATHER_POKEMON_MAP: Record<string, number[]> = {
  sunny: [
    1, 2, 3, 43, 44, 45, 69, 70, 71, 114, 152, 153, 154, 182, 251,
    4, 5, 6, 37, 38, 58, 59, 77, 78, 126, 136, 146, 155, 156, 157, 250,
    27, 28, 50, 51, 104, 105, 111, 112,
  ],

  rainy: [
    7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99, 116,
    117, 118, 119, 120, 121, 129, 130, 131, 134, 158, 159, 160, 170, 171, 183,
    184, 186, 194, 195, 199, 211, 222, 223, 224, 226, 230, 245,
    25, 26, 81, 82, 100, 101, 125, 135, 145, 172, 179, 180, 181, 239, 243,
    10, 11, 12, 13, 14, 15, 46, 47, 48, 49, 123, 127, 165, 166, 167, 168, 193,
    204, 205, 212, 213, 214,
  ],

  partly_cloudy: [
    16, 17, 18, 19, 20, 39, 40, 52, 53, 83, 84, 85, 108, 113, 115, 128, 132,
    133, 137, 143, 161, 162, 163, 174, 175, 190, 203, 206, 216, 217, 233, 234,
    235, 241, 242,
    74, 75, 76, 95, 138, 139, 140, 141, 142, 185, 219, 222, 246, 247, 248,
  ],

  cloudy: [
    35, 36, 39, 40, 122, 173, 174, 175, 176, 183, 184, 209, 210,
    56, 57, 66, 67, 68, 106, 107, 236, 237,
    23, 24, 29, 30, 31, 32, 33, 34, 41, 42, 43, 44, 45, 48, 49, 69, 70, 71, 72,
    73, 88, 89, 92, 93, 94, 109, 110, 167, 168, 169, 211,
  ],

  windy: [
    16, 17, 18, 21, 22, 41, 42, 83, 84, 85, 123, 130, 142, 144, 145, 146, 163,
    164, 165, 166, 169, 176, 177, 178, 187, 188, 189, 193, 198, 207, 225, 226,
    227,
    63, 64, 65, 79, 80, 96, 97, 102, 103, 121, 122, 124, 150, 151, 177, 178,
    196, 199, 201, 202, 203, 238, 249, 251,
    147, 148, 149, 230, 249,
  ],

  snowy: [
    87, 91, 124, 131, 144, 215, 220, 221, 225, 238, 471,
    81, 82, 205, 208, 212, 227,
  ],

  foggy: [
    197, 198, 215, 228, 229, 248,
    92, 93, 94, 200,
  ],
};

export const WEATHER_POKEMON_MESSAGES: Record<string, string[]> = {
  sunny: [
    "Perfeito para aproveitar o sol!",
    "Adora banhos de sol!",
    "Brilha sob o céu ensolarado!",
    "Ideal para um dia de calor!",
  ],
  rainy: [
    "Adora dançar na chuva!",
    "Perfeito para dias chuvosos!",
    "A chuva é seu habitat natural!",
    "Quanto mais chuva, melhor!",
  ],
  partly_cloudy: [
    "Ideal para um passeio tranquilo!",
    "Aproveita bem esse clima ameno!",
    "Perfeito para qualquer aventura!",
    "Versátil para o dia de hoje!",
  ],
  cloudy: [
    "Adora dias nublados!",
    "Perfeito para o tempo encoberto!",
    "Misterioso como as nuvens!",
    "Ideal para esse clima cinzento!",
  ],
  windy: [
    "Voa alto com o vento!",
    "O vento é seu aliado!",
    "Perfeito para dias ventosos!",
    "Desliza nas correntes de ar!",
  ],
  snowy: [
    "Adora brincar na neve!",
    "Perfeito para o frio intenso!",
    "A neve é seu playground!",
    "Ideal para temperaturas geladas!",
  ],
  foggy: [
    "Emerge das sombras!",
    "Misterioso como a neblina!",
    "Aparece quando a névoa cai!",
    "Perfeito para noites sombrias!",
  ],
};

export const WEATHER_DECK_TITLES: Record<string, string> = {
  sunny: "Time Ensolarado",
  rainy: "Time Chuvoso",
  partly_cloudy: "Time Nublado",
  cloudy: "Time Encoberto",
  windy: "Time Ventoso",
  snowy: "Time Gelado",
  foggy: "Time Nebuloso",
};

export const WEATHER_TEAM_MAP: Record<string, number[]> = {
  sunny: [3, 6, 383, 103, 257, 445],

  rainy: [9, 130, 382, 134, 135, 230],

  partly_cloudy: [143, 248, 142, 76, 128, 233],

  cloudy: [36, 68, 94, 282, 237, 169],

  windy: [149, 65, 384, 150, 373, 227],

  snowy: [131, 144, 471, 376, 208, 473],

  foggy: [94, 197, 248, 200, 302, 359],
};
