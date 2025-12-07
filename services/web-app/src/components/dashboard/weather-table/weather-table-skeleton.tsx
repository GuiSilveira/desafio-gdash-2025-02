import { DataTableSkeleton } from "@/components/ui/data-table";

export function WeatherTableSkeleton() {
  return (
    <DataTableSkeleton
      rows={10}
      showHeader={true}
      showAction={true}
      showPagination={true}
      titleWidth="180px"
      subtitleWidth="220px"
      actionWidth="200px"
    />
  );
}
