import * as React from "react";
import { cn } from "@/utils/cn";
import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { SortDirection } from "@/hooks/use-table-sort";

/**
 * Props for the SortableTableHead component
 */
interface SortableTableHeadProps<T extends string = string>
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Column identifier for sorting */
  column: T;
  /** Current sort direction for this column */
  sortDirection: SortDirection;
  /** Handler called when sort is toggled */
  onSort: (column: T) => void;
  /** Children content (column label) */
  children: React.ReactNode;
  /** Whether sorting is disabled */
  disabled?: boolean;
  /** Align content to the right (for numeric columns) */
  alignRight?: boolean;
}

/**
 * Sortable table header cell component
 *
 * @example
 * ```tsx
 * <SortableTableHead
 *   column="temperature"
 *   sortDirection={getSortDirection('temperature')}
 *   onSort={toggleSort}
 * >
 *   Temperatura
 * </SortableTableHead>
 * ```
 */
export function SortableTableHead<T extends string = string>({
  column,
  sortDirection,
  onSort,
  children,
  disabled = false,
  alignRight = false,
  className,
  ...props
}: SortableTableHeadProps<T>) {
  const handleClick = () => {
    if (!disabled) {
      onSort(column);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSort(column);
    }
  };

  return (
    <TableHead
      className={cn(
        "select-none",
        !disabled && "cursor-pointer hover:bg-muted/50 transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        alignRight && "text-right",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="columnheader"
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none"
      }
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          alignRight && "float-right"
        )}
      >
        <span className="whitespace-nowrap">{children}</span>
        <SortIcon direction={sortDirection} />
      </span>
    </TableHead>
  );
}

/**
 * Sort icon component
 */
interface SortIconProps {
  direction: SortDirection;
  className?: string;
}

function SortIcon({ direction, className }: SortIconProps) {
  const iconClass = cn("h-3 w-3 shrink-0 text-muted-foreground", className);

  if (direction === "asc") {
    return <ArrowUp className={cn(iconClass, "text-foreground")} />;
  }

  if (direction === "desc") {
    return <ArrowDown className={cn(iconClass, "text-foreground")} />;
  }

  return <ArrowUpDown className={cn(iconClass, "opacity-40")} />;
}

/**
 * Non-sortable table header for consistency
 * Use this for columns that shouldn't be sorted
 */
interface NonSortableTableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function NonSortableTableHead({
  children,
  className,
  ...props
}: NonSortableTableHeadProps) {
  return (
    <TableHead className={className} {...props}>
      {children}
    </TableHead>
  );
}
