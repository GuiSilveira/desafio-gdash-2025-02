import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/config/api";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";

type ExportFormat = "csv" | "xlsx" | "json";

interface ExportButtonsProps {
  disabled?: boolean;
}

export function ExportButtons({ disabled = false }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    const filename = `weather_logs.${format}`;

    try {
      setIsExporting(format);

      const response = await api.get(API_ENDPOINTS.WEATHER_EXPORT(format), {
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Arquivo exportado com sucesso!", {
        description: `O arquivo ${filename} foi baixado.`,
      });
    } catch (error) {
      console.error(`Erro ao exportar ${format.toUpperCase()}:`, error);
      toast.error(`Erro ao exportar ${format.toUpperCase()}`, {
        description: "Não foi possível exportar os dados. Tente novamente.",
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => handleExport("csv")}
        disabled={disabled || isExporting !== null}
        variant="outline"
        size="sm"
        className="border-green-500/50 text-green-700 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
      >
        {isExporting === "csv" ? (
          <>
            <Download className="mr-2 h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Exportar CSV
          </>
        )}
      </Button>

      <Button
        onClick={() => handleExport("xlsx")}
        disabled={disabled || isExporting !== null}
        variant="outline"
        size="sm"
        className="border-blue-500/50 text-blue-700 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {isExporting === "xlsx" ? (
          <>
            <Download className="mr-2 h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar XLSX
          </>
        )}
      </Button>
    </div>
  );
}
