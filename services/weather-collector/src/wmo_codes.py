"""
WMO Weather Codes mapping to human-readable descriptions.

IMPORTANT: This must stay in sync with:
- services/core-api/src/common/constants/wmo-codes.ts
- services/web-app/src/constants/weather.ts (WMO_CODES)

Reference: https://open-meteo.com/en/docs#weathervariables
"""

WMO_CODES: dict[int, str] = {
    0: "Céu Limpo",
    
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Encoberto",
    
    45: "Nevoeiro",
    48: "Nevoeiro com geada",
    
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa densa",
    
    56: "Garoa congelante leve",
    57: "Garoa congelante densa",
    
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    
    66: "Chuva congelante leve",
    67: "Chuva congelante forte",
    
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve forte",
    
    77: "Grãos de neve",
    
    80: "Pancadas de chuva leves",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva violentas",
    
    85: "Pancadas de neve leves",
    86: "Pancadas de neve fortes",
    
    95: "Tempestade",
    96: "Tempestade com granizo leve",
    99: "Tempestade com granizo forte",
}

DEFAULT_CONDITION = "Desconhecido"


def get_condition(weather_code: int) -> str:
    """
    Get human-readable weather condition from WMO code.
    
    Args:
        weather_code: WMO weather interpretation code.
        
    Returns:
        Weather condition in Portuguese.
    """
    return WMO_CODES.get(weather_code, DEFAULT_CONDITION)
