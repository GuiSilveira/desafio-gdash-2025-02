import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CloudSun } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DataTableCard,
  DataTableContainer,
  DataTableEmptyState,
} from "@/components/ui/data-table";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { dataTableStyles } from "@/components/ui/data-table-styles";
import { usePagination } from "@/hooks/use-pagination";
import { useTableSort } from "@/hooks/use-table-sort";
import { useWeather } from "@/hooks/use-weather";
import {
  getWeatherCondition,
  getTableConditionBadgeColor,
} from "@/utils/weather";
import { PAGINATION } from "@/constants/app";
import { ExportButtons } from "./export-buttons";
import { WeatherTableSkeleton } from "./weather-table-skeleton";
import type { WeatherLog } from "@/types";

type WeatherSortColumn =
  | "collected_at"
  | "condition"
  | "temperature_max"
  | "temperature_min"
  | "humidity"
  | "uv_index"
  | "us_aqi";

function getSortValue(log: WeatherLog, column: WeatherSortColumn): unknown {
  switch (column) {
    case "collected_at":
      return new Date(log.collected_at).getTime();
    case "condition":
      return getWeatherCondition(log.weather_code).label;
    case "temperature_max":
      return log.temperature_max ?? log.temperature;
    case "temperature_min":
      return log.apparent_temperature
        ? Math.min(log.temperature, log.apparent_temperature)
        : log.temperature - 5;
    case "humidity":
      return log.humidity;
    case "uv_index":
      return log.uv_index ?? -1;
    case "us_aqi":
      return log.us_aqi ?? -1;
    default:
      return null;
  }
}

export function WeatherTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useWeather({
    page: currentPage,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
    autoRefresh: false,
  });

  const pagination = usePagination({
    totalItems: data?.total ?? 0,
    itemsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
    initialPage: currentPage,
  });

  const { toggleSort, getSortDirection, sortData } =
    useTableSort<WeatherSortColumn>({
      initialColumn: "collected_at",
      initialDirection: "desc",
    });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pagination.goToPage(page);
  };

  const weatherData = data?.data;
  const sortedData = useMemo(() => {
    if (!weatherData) return [];
    return sortData(weatherData, getSortValue);
  }, [weatherData, sortData]);

  if (isLoading) {
    return <WeatherTableSkeleton />;
  }

  if (error || !data) {
    return (
      <DataTableCard
        icon={CloudSun}
        title="Histórico Climático"
        subtitle="Dados meteorológicos coletados"
        action={<ExportButtons />}
      >
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados.
        </p>
      </DataTableCard>
    );
  }

  return (
    <DataTableCard
      icon={CloudSun}
      title="Histórico Climático"
      subtitle={`Últimos ${data.total} registros coletados`}
      action={<ExportButtons />}
      pagination={{
        currentPage,
        totalPages: pagination.totalPages,
        pageNumbers: pagination.pageNumbers,
        onPageChange: handlePageChange,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === pagination.totalPages,
      }}
    >
      <DataTableContainer>
        <Table>
          <TableHeader>
            <TableRow className={dataTableStyles.tableHeaderRow}>
              <SortableTableHead
                column="collected_at"
                sortDirection={getSortDirection("collected_at")}
                onSort={toggleSort}
                className={dataTableStyles.tableHeaderCell}
              >
                Data/Hora
              </SortableTableHead>
              <SortableTableHead
                column="condition"
                sortDirection={getSortDirection("condition")}
                onSort={toggleSort}
                className={dataTableStyles.tableHeaderCell}
              >
                Condição
              </SortableTableHead>
              <SortableTableHead
                column="temperature_max"
                sortDirection={getSortDirection("temperature_max")}
                onSort={toggleSort}
                alignRight
                className={dataTableStyles.tableHeaderCell}
              >
                Temp. Max
              </SortableTableHead>
              <SortableTableHead
                column="temperature_min"
                sortDirection={getSortDirection("temperature_min")}
                onSort={toggleSort}
                alignRight
                className={dataTableStyles.tableHeaderCell}
              >
                Temp. Min
              </SortableTableHead>
              <SortableTableHead
                column="humidity"
                sortDirection={getSortDirection("humidity")}
                onSort={toggleSort}
                alignRight
                className={dataTableStyles.tableHeaderCell}
              >
                Umidade
              </SortableTableHead>
              <SortableTableHead
                column="uv_index"
                sortDirection={getSortDirection("uv_index")}
                onSort={toggleSort}
                alignRight
                className={dataTableStyles.tableHeaderCell}
              >
                UV
              </SortableTableHead>
              <SortableTableHead
                column="us_aqi"
                sortDirection={getSortDirection("us_aqi")}
                onSort={toggleSort}
                alignRight
                className={dataTableStyles.tableHeaderCell}
              >
                AQI
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <DataTableEmptyState
                icon={CloudSun}
                title="Nenhum registro encontrado"
                description="Os dados climáticos serão exibidos aqui quando disponíveis"
                colSpan={7}
              />
            ) : (
              sortedData.map((log) => {
                const condition = getWeatherCondition(log.weather_code);
                const badgeColor = getTableConditionBadgeColor(log.weather_code);

                const tempMin = log.apparent_temperature
                  ? Math.min(log.temperature, log.apparent_temperature)
                  : log.temperature - 5;

                return (
                  <TableRow key={log._id} className={dataTableStyles.tableRow}>
                    <TableCell className="font-medium text-[#2D3436] dark:text-[#F7F9FC]">
                      {format(
                        new Date(log.collected_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${badgeColor} font-medium`}>
                        {condition.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-[#2D3436] dark:text-[#F7F9FC]">
                      {Math.round(log.temperature_max ?? log.temperature)}°C
                    </TableCell>
                    <TableCell className="text-right text-[#636E72] dark:text-[#9BA6B5]">
                      {Math.round(tempMin)}°C
                    </TableCell>
                    <TableCell className="text-right text-[#636E72] dark:text-[#9BA6B5]">
                      {log.humidity}%
                    </TableCell>
                    <TableCell className="text-right text-[#636E72] dark:text-[#9BA6B5]">
                      {log.uv_index?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="text-right text-[#636E72] dark:text-[#9BA6B5]">
                      {log.us_aqi ?? "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableContainer>
    </DataTableCard>
  );
}
