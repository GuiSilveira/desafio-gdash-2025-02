import * as XLSX from 'xlsx';
import { ExportStrategy, ExportData } from './export-strategy.interface';

export class XlsxExportStrategy implements ExportStrategy {
  readonly mimeType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  readonly extension = 'xlsx';

  export(data: ExportData[]): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Climáticos');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
