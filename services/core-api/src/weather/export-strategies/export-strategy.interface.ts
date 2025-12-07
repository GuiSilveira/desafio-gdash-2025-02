export interface ExportStrategy {
  readonly mimeType: string;

  readonly extension: string;

  export(data: ExportData[]): Buffer | string;
}

export interface ExportData {
  'Data/Hora': string;
  Local: string;
  'Temperatura (°C)': number;
  'Sensação Térmica (°C)'?: number;
  'Umidade (%)': number;
  'Pressão (hPa)'?: number;
  'Visibilidade (m)'?: number;
  Condição: string;
  'Código WMO': number;
  'AQI (US)'?: number;
  'Índice UV'?: number;
  'PM2.5 (µg/m³)'?: number;
  'PM10 (µg/m³)'?: number;
  'CO (µg/m³)'?: number;
  'NO₂ (µg/m³)'?: number;
  'SO₂ (µg/m³)'?: number;
  'O₃ (µg/m³)'?: number;
  'Temp. Máxima (°C)'?: number;
  'Prob. Chuva (%)'?: number;
}

export type ExportFormat = 'xlsx' | 'csv' | 'json';
