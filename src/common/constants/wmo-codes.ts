export const WMO_CODES: Record<number, string> = {
  0: 'Céu Limpo',

  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Encoberto',

  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',

  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa densa',

  56: 'Garoa congelante leve',
  57: 'Garoa congelante densa',

  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',

  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',

  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',

  77: 'Grãos de neve',

  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',

  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',

  95: 'Tempestade',
  96: 'Tempestade com granizo leve',
  99: 'Tempestade com granizo forte',
};

export function getWmoDescription(code: number): string {
  return WMO_CODES[code] || 'Desconhecido';
}

export const WMO_CATEGORIES = {
  CLEAR: [0, 1],
  CLOUDY: [2, 3],
  FOG: [45, 48],
  DRIZZLE: [51, 53, 55, 56, 57],
  RAIN: [61, 63, 65, 66, 67, 80, 81, 82],
  SNOW: [71, 73, 75, 77, 85, 86],
  STORM: [95, 96, 99],
} as const;

export function isRainy(code: number): boolean {
  return (WMO_CATEGORIES.RAIN as readonly number[]).includes(code);
}

export function isStormy(code: number): boolean {
  return (WMO_CATEGORIES.STORM as readonly number[]).includes(code);
}

export function isSnowy(code: number): boolean {
  return (WMO_CATEGORIES.SNOW as readonly number[]).includes(code);
}
