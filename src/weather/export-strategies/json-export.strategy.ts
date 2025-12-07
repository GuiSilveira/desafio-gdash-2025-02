import { ExportStrategy, ExportData } from './export-strategy.interface';

export class JsonExportStrategy implements ExportStrategy {
  readonly mimeType = 'application/json';
  readonly extension = 'json';

  export(data: ExportData[]): string {
    return JSON.stringify(data, null, 2);
  }
}
