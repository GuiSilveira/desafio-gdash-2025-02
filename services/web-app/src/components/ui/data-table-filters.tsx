import * as React from "react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Search, Filter } from "lucide-react";

export type FilterValue = string | string[] | undefined;

export interface FilterOption {
  label: string;
  value: string;
}

export interface ColumnFilterConfig {
  id: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: string;
}

export interface FilterState {
  [key: string]: FilterValue;
}

interface DataTableTextFilterProps {
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function DataTableTextFilter({
  id,
  value,
  onChange,
  placeholder = "Filtrar...",
  label,
  className,
  showIcon = true,
}: DataTableTextFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.value);
  };

  const handleClear = () => {
    onChange(id, "");
  };

  return (
    <div className={cn("relative", className)}>
      {showIcon && (
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      )}
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className={cn(
          "h-9 rounded-lg border-[#E5E9F0] dark:border-[#3D4F5F] bg-white dark:bg-[#1E2A35] text-sm",
          showIcon && "pl-8",
          value && "pr-8"
        )}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
          aria-label="Limpar filtro"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  );
}

interface DataTableSelectFilterProps {
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function DataTableSelectFilter({
  id,
  value,
  onChange,
  options,
  placeholder = "Selecionar...",
  label,
  className,
  showAllOption = true,
  allOptionLabel = "Todos",
}: DataTableSelectFilterProps) {
  const handleChange = (newValue: string) => {
    onChange(id, newValue === "__all__" ? "" : newValue);
  };

  return (
    <Select value={value || "__all__"} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-9 w-full rounded-lg border-[#E5E9F0] dark:border-[#3D4F5F] bg-white dark:bg-[#1E2A35] text-sm",
          className
        )}
        aria-label={label || placeholder}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="__all__">{allOptionLabel}</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface DataTableFiltersProps {
  filters: ColumnFilterConfig[];
  filterState: FilterState;
  onFilterChange: (id: string, value: FilterValue) => void;
  onClearAll?: () => void;
  className?: string;
  showClearAll?: boolean;
  layout?: "horizontal" | "vertical";
}

export function DataTableFilters({
  filters,
  filterState,
  onFilterChange,
  onClearAll,
  className,
  showClearAll = true,
  layout = "horizontal",
}: DataTableFiltersProps) {
  const hasActiveFilters = Object.values(filterState).some(
    (v) => v !== undefined && v !== ""
  );

  const handleFilterChange = (id: string, value: FilterValue) => {
    onFilterChange(id, value);
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        layout === "horizontal"
          ? "flex-col sm:flex-row sm:items-center flex-wrap"
          : "flex-col",
        className
      )}
    >
      <div
        className={cn(
          "flex gap-3 flex-1",
          layout === "horizontal"
            ? "flex-col sm:flex-row sm:items-center flex-wrap"
            : "flex-col"
        )}
      >
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={cn(
              "flex flex-col gap-1",
              layout === "horizontal" && "sm:min-w-[180px]"
            )}
          >
            {filter.label && (
              <label
                htmlFor={`filter-${filter.id}`}
                className="text-xs font-medium text-muted-foreground"
              >
                {filter.label}
              </label>
            )}
            {filter.type === "text" ? (
              <DataTableTextFilter
                id={filter.id}
                value={(filterState[filter.id] as string) || ""}
                onChange={handleFilterChange}
                placeholder={filter.placeholder}
              />
            ) : (
              <DataTableSelectFilter
                id={filter.id}
                value={(filterState[filter.id] as string) || ""}
                onChange={handleFilterChange}
                options={filter.options || []}
                placeholder={filter.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      {showClearAll && hasActiveFilters && onClearAll && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-9 px-3 text-muted-foreground hover:text-foreground gap-1.5 self-end sm:self-auto"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

interface DataTableFilterBarProps {
  filters: ColumnFilterConfig[];
  filterState: FilterState;
  onFilterChange: (id: string, value: FilterValue) => void;
  onClearAll?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function DataTableFilterBar({
  filters,
  filterState,
  onFilterChange,
  onClearAll,
  actions,
  className,
}: DataTableFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-4 p-4 rounded-lg bg-[#F7F9FC] dark:bg-[#1E2A35]/50 border border-[#E5E9F0] dark:border-[#3D4F5F]",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filtros
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <DataTableFilters
          filters={filters}
          filterState={filterState}
          onFilterChange={onFilterChange}
          onClearAll={onClearAll}
          layout="horizontal"
        />
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}

interface DataTableInlineFilterProps {
  type: "text" | "select";
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  placeholder?: string;
  options?: FilterOption[];
  className?: string;
}

export function DataTableInlineFilter({
  type,
  id,
  value,
  onChange,
  placeholder,
  options = [],
  className,
}: DataTableInlineFilterProps) {
  if (type === "select") {
    return (
      <DataTableSelectFilter
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        className={cn("h-7 text-xs", className)}
        showAllOption={true}
        allOptionLabel="Todos"
      />
    );
  }

  return (
    <DataTableTextFilter
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("h-7 text-xs", className)}
      showIcon={false}
    />
  );
}
