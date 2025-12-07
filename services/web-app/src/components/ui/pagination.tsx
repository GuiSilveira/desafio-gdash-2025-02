import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/utils/cn"
import { Button, buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export interface PaginationControlsProps {
  /** Página atual */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Array de números de página (pode incluir "...") */
  pageNumbers: (number | "...")[];
  /** Callback ao mudar de página */
  onPageChange: (page: number) => void;
  /** Está na primeira página? */
  isFirstPage?: boolean;
  /** Está na última página? */
  isLastPage?: boolean;
  /** Variante de estilo */
  variant?: "default" | "minimal" | "pokemon";
  /** Mostrar labels "Anterior"/"Próximo" */
  showLabels?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

function PaginationControls({
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange,
  isFirstPage = currentPage === 1,
  isLastPage = currentPage === totalPages,
  variant = "default",
  showLabels = true,
  className,
}: PaginationControlsProps) {
  const getButtonStyles = () => {
    switch (variant) {
      case "pokemon":
        return {
          nav: "w-9 h-9 rounded-lg flex items-center justify-center bg-[#F7F9FC] dark:bg-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
          page: "w-9 h-9 rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer",
          pageActive: "bg-red-500 text-white",
          pageInactive:
            "bg-[#F7F9FC] dark:bg-[#3E4C5E] text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#EDF1F5] dark:hover:bg-[#57606F]",
          ellipsis:
            "w-9 h-9 flex items-center justify-center text-[#636E72] dark:text-[#9BA6B5]",
        };
      case "minimal":
        return {
          nav: "p-2 cursor-pointer",
          page: "w-8 h-8 text-sm cursor-pointer",
          pageActive: "bg-primary text-primary-foreground",
          pageInactive: "hover:bg-muted",
          ellipsis: "px-2 text-muted-foreground",
        };
      default:
        return {
          nav: "gap-1 cursor-pointer",
          page: "w-9 h-9 p-0 cursor-pointer",
          pageActive: "border-2 font-semibold",
          pageInactive: "",
          ellipsis: "px-2 text-muted-foreground",
        };
    }
  };

  const styles = getButtonStyles();

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Botão Anterior */}
      {variant === "pokemon" ? (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={styles.nav}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={styles.nav}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {showLabels && <span className="hidden sm:inline">Anterior</span>}
        </Button>
      )}

      {/* Números de Página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) =>
          pageNum === "..." ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              ...
            </span>
          ) : variant === "pokemon" ? (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                styles.page,
                currentPage === pageNum ? styles.pageActive : styles.pageInactive,
              )}
              aria-label={`Página ${pageNum}`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </button>
          ) : (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "outline" : "ghost"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                styles.page,
                currentPage === pageNum ? styles.pageActive : styles.pageInactive,
              )}
              aria-label={`Página ${pageNum}`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </Button>
          ),
        )}
      </div>

      {/* Botão Próximo */}
      {variant === "pokemon" ? (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className={styles.nav}
          aria-label="Próxima página"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className={styles.nav}
          aria-label="Próxima página"
        >
          {showLabels && <span className="hidden sm:inline">Próximo</span>}
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationControls,
}
