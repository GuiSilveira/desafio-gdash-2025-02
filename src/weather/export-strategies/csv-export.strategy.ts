import * as XLSX from 'xlsx';
import { ExportStrategy, ExportData } from './export-strategy.interface';

export class CsvExportStrategy implements ExportStrategy {
  readonly mimeType = 'text/csv';
  readonly extension = 'csv';

  export(data: ExportData[]): string {
    const worksheet = XLSX.utils.json_to_sheet(data);
    return XLSX.utils.sheet_to_csv(worksheet);
  }
}
