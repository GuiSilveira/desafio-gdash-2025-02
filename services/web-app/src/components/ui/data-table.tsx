import * as React from "react";
import { cn } from "@/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination";
import type { LucideIcon } from "lucide-react";
import {
  CARD_STYLES,
  ICON_CONTAINER_STYLES,
  TITLE_STYLES,
  SUBTITLE_STYLES,
  TABLE_CONTAINER_STYLES,
} from "./data-table-styles";

interface DataTableCardProps {
  /** Icon component to display in header */
  icon?: LucideIcon;
  /** Title text */
  title: string;
  /** Subtitle text (e.g., "10 registros") */
  subtitle?: string;
  /** Action element (e.g., button) to display on the right side of header */
  action?: React.ReactNode;
  /** Children content (table, empty state, etc.) */
  children: React.ReactNode;
  /** Additional class names for the card */
  className?: string;
  /** Pagination props - if provided, pagination will be rendered */
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageNumbers: (number | "...")[];
    onPageChange: (page: number) => void;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
}

export function DataTableCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className,
  pagination,
}: DataTableCardProps) {
  return (
    <div className="grid grid-cols-1">
      <Card className={cn(CARD_STYLES, className)}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-4">
              {Icon && (
                <div className={ICON_CONTAINER_STYLES}>
                  <Icon className="w-6 h-6 text-blue-500" />
                </div>
              )}
              <div>
                <CardTitle className={TITLE_STYLES}>{title}</CardTitle>
                {subtitle && <p className={SUBTITLE_STYLES}>{subtitle}</p>}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>
        </CardHeader>
        <CardContent>
          {children}

          {pagination && (
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageNumbers={pagination.pageNumbers}
              onPageChange={pagination.onPageChange}
              isFirstPage={pagination.isFirstPage}
              isLastPage={pagination.isLastPage}
              className="py-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DataTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableContainer({
  children,
  className,
}: DataTableContainerProps) {
  return (
    <div className={cn(TABLE_CONTAINER_STYLES, className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

interface DataTableEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  colSpan?: number;
}

export function DataTableEmptyState({
  icon: Icon,
  title,
  description,
  colSpan = 1,
}: DataTableEmptyStateProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-center py-12 text-[#636E72] dark:text-[#9BA6B5]"
      >
        {Icon && <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />}
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm mt-1">{description}</p>}
      </td>
    </tr>
  );
}

interface DataTableSkeletonProps {
  /** Icon component for skeleton header */
  icon?: LucideIcon;
  /** Number of skeleton rows to display */
  rows?: number;
  /** Whether to show skeleton header (with icon, title, subtitle) */
  showHeader?: boolean;
  /** Whether to show action button skeleton in header */
  showAction?: boolean;
  /** Whether to show pagination skeleton */
  showPagination?: boolean;
  /** Custom title width */
  titleWidth?: string;
  /** Custom subtitle width */
  subtitleWidth?: string;
  /** Custom action width */
  actionWidth?: string;
  /** Additional class name */
  className?: string;
}

export function DataTableSkeleton({
  rows = 5,
  showHeader = true,
  showAction = true,
  showPagination = true,
  titleWidth = "140px",
  subtitleWidth = "200px",
  actionWidth = "140px",
  className,
}: DataTableSkeletonProps) {
  return (
    <Card className={cn(CARD_STYLES, className)}>
      {showHeader && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className={ICON_CONTAINER_STYLES}>
                <Skeleton className="w-6 h-6" />
              </div>
              <div>
                <Skeleton className="h-6" style={{ width: titleWidth }} />
                <Skeleton
                  className="h-4 mt-2"
                  style={{ width: subtitleWidth }}
                />
              </div>
            </div>
            {showAction && (
              <Skeleton className="h-10" style={{ width: actionWidth }} />
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        {showPagination && (
          <div className="flex justify-center gap-2 pt-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export {
  DataTableTextFilter,
  DataTableSelectFilter,
  DataTableFilters,
  DataTableFilterBar,
  DataTableInlineFilter,
  type FilterValue,
  type FilterOption,
  type ColumnFilterConfig,
  type FilterState,
} from "./data-table-filters";
