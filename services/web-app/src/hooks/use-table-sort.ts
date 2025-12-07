import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState<T extends string = string> {
  column: T | null;
  direction: SortDirection;
}

export interface UseTableSortOptions<T extends string = string> {
  initialColumn?: T;
  initialDirection?: SortDirection;
  allowUnsorted?: boolean;
}

export interface UseTableSortReturn<T extends string = string> {
  sortState: SortState<T>;
  toggleSort: (column: T) => void;
  setSort: (column: T, direction: SortDirection) => void;
  clearSort: () => void;
  isSorted: (column: T) => boolean;
  getSortDirection: (column: T) => SortDirection;
  sortData: <D>(data: D[], getValueFn: (item: D, column: T) => unknown) => D[];
}

export function useTableSort<T extends string = string>(
  options: UseTableSortOptions<T> = {}
): UseTableSortReturn<T> {
  const {
    initialColumn = null,
    initialDirection = null,
    allowUnsorted = true,
  } = options;

  const [sortState, setSortState] = useState<SortState<T>>({
    column: initialColumn,
    direction: initialDirection,
  });

  const toggleSort = useCallback(
    (column: T) => {
      setSortState((prev) => {
        if (prev.column !== column) {
          return { column, direction: 'asc' };
        }

        if (prev.direction === 'asc') {
          return { column, direction: 'desc' };
        }
        if (prev.direction === 'desc') {
          return allowUnsorted
            ? { column: null, direction: null }
            : { column, direction: 'asc' };
        }
        return { column, direction: 'asc' };
      });
    },
    [allowUnsorted]
  );

  const setSort = useCallback((column: T, direction: SortDirection) => {
    setSortState({ column, direction });
  }, []);

  const clearSort = useCallback(() => {
    setSortState({ column: null, direction: null });
  }, []);

  const isSorted = useCallback(
    (column: T) => sortState.column === column && sortState.direction !== null,
    [sortState.column, sortState.direction]
  );

  const getSortDirection = useCallback(
    (column: T): SortDirection =>
      sortState.column === column ? sortState.direction : null,
    [sortState.column, sortState.direction]
  );

  const sortData = useCallback(
    <D>(data: D[], getValueFn: (item: D, column: T) => unknown): D[] => {
      if (!sortState.column || !sortState.direction) {
        return data;
      }

      const column = sortState.column;
      const direction = sortState.direction;

      return [...data].sort((a, b) => {
        const aValue = getValueFn(a, column);
        const bValue = getValueFn(b, column);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return direction === 'asc' ? 1 : -1;
        if (bValue == null) return direction === 'asc' ? -1 : 1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        const comparison = aStr.localeCompare(bStr, 'pt-BR');
        return direction === 'asc' ? comparison : -comparison;
      });
    },
    [sortState.column, sortState.direction]
  );

  return useMemo(
    () => ({
      sortState,
      toggleSort,
      setSort,
      clearSort,
      isSorted,
      getSortDirection,
      sortData,
    }),
    [sortState, toggleSort, setSort, clearSort, isSorted, getSortDirection, sortData]
  );
}

export function createSortComparator<T>(
  direction: SortDirection,
  getValue: (item: T) => unknown
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    if (!direction) return 0;

    const aValue = getValue(a);
    const bValue = getValue(b);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr, 'pt-BR');
    return direction === 'asc' ? comparison : -comparison;
  };
}
