import * as React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

/**
 * Variantes de cor pré-definidas para o InsightCard
 */
export type InsightCardVariant = "orange" | "blue" | "red" | "green" | "purple" | "custom";

const variantStyles: Record<Exclude<InsightCardVariant, "custom">, {
  container: string;
  icon: string;
  title: string;
  description: string;
}> = {
  orange: {
    container: "bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-100 dark:border-orange-900/50",
    icon: "text-orange-700",
    title: "text-orange-700 dark:text-orange-400",
    description: "text-orange-500 dark:text-orange-300",
  },
  blue: {
    container: "bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/50",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-700 dark:text-blue-300",
    description: "text-blue-800 dark:text-blue-200",
  },
  red: {
    container: "bg-linear-to-br from-red-950/30 to-red-900/20 border border-red-900/50",
    icon: "text-red-400",
    title: "text-red-400",
    description: "text-slate-300",
  },
  green: {
    container: "bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20 border border-green-100 dark:border-green-900/50",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-700 dark:text-green-300",
    description: "text-green-600 dark:text-green-200",
  },
  purple: {
    container: "bg-linear-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-900/20 border border-purple-100 dark:border-purple-900/50",
    icon: "text-purple-600 dark:text-purple-400",
    title: "text-purple-700 dark:text-purple-300",
    description: "text-purple-600 dark:text-purple-200",
  },
};

interface InsightCardBaseProps {
  /** Ícone exibido à esquerda do título */
  icon: LucideIcon;
  /** Título do card */
  title: string;
  /** Descrição/conteúdo do card */
  description?: string;
  /** Conteúdo adicional após o título (ex: badge de tendência) */
  titleExtra?: React.ReactNode;
  /** Classe adicional para o container */
  className?: string;
  /** Se true, exibe estado de loading para a descrição */
  isLoading?: boolean;
  /** Placeholder quando não há descrição */
  emptyText?: string;
}

interface InsightCardWithVariant extends InsightCardBaseProps {
  /** Variante de cor pré-definida */
  variant: Exclude<InsightCardVariant, "custom">;
  /** Estilos customizados não são usados com variantes pré-definidas */
  customStyles?: never;
}

interface InsightCardWithCustomStyles extends InsightCardBaseProps {
  /** Variante customizada */
  variant: "custom";
  /** Estilos customizados obrigatórios para variante custom */
  customStyles: {
    container: string;
    icon: string;
    title: string;
    description: string;
  };
}

interface InsightCardWithRefresh {
  /** Callback para gerar nova análise */
  onRefresh: () => void;
  /** Se true, desabilita o botão de refresh */
  isRefreshing?: boolean;
}

interface InsightCardWithoutRefresh {
  onRefresh?: never;
  isRefreshing?: never;
}

export type InsightCardProps = (InsightCardWithVariant | InsightCardWithCustomStyles) &
  (InsightCardWithRefresh | InsightCardWithoutRefresh);

/**
 * Card de insight/informação reutilizável
 * Usado para exibir informações destacadas com ícone, título e descrição
 */
export function InsightCard({
  icon: Icon,
  title,
  description,
  titleExtra,
  className,
  isLoading,
  emptyText,
  variant,
  customStyles,
  onRefresh,
  isRefreshing,
}: InsightCardProps) {
  const styles = variant === "custom" ? customStyles : variantStyles[variant];

  return (
    <div className={cn("p-4 rounded-xl", styles.container, className)}>
      {/* Header com ícone, título e botão opcional */}
      <div className={cn("flex items-center gap-2", description || isLoading || emptyText ? "mb-2" : "mb-0.5")}>
        <div className="flex items-center gap-2 flex-1">
          <Icon className={cn("w-5 h-5", styles.icon)} />
          <span className={cn("text-sm font-bold", styles.title)}>
            {title}
          </span>
          {titleExtra}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "p-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              variant === "blue" && "hover:bg-blue-200/50 dark:hover:bg-blue-800/30",
              variant === "orange" && "hover:bg-orange-200/50 dark:hover:bg-orange-800/30",
              variant === "red" && "hover:bg-red-800/30",
              variant === "green" && "hover:bg-green-200/50 dark:hover:bg-green-800/30",
              variant === "purple" && "hover:bg-purple-200/50 dark:hover:bg-purple-800/30",
            )}
            title="Gerar nova análise"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4",
                styles.icon,
                isRefreshing && "animate-spin",
              )}
            />
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className={cn(
            "h-4 rounded w-full",
            variant === "blue" && "bg-blue-200 dark:bg-blue-800/50",
            variant === "orange" && "bg-orange-200 dark:bg-orange-800/50",
            variant === "red" && "bg-red-800/50",
            variant === "green" && "bg-green-200 dark:bg-green-800/50",
            variant === "purple" && "bg-purple-200 dark:bg-purple-800/50",
          )} />
          <div className={cn(
            "h-4 rounded w-3/4",
            variant === "blue" && "bg-blue-200 dark:bg-blue-800/50",
            variant === "orange" && "bg-orange-200 dark:bg-orange-800/50",
            variant === "red" && "bg-red-800/50",
            variant === "green" && "bg-green-200 dark:bg-green-800/50",
            variant === "purple" && "bg-purple-200 dark:bg-purple-800/50",
          )} />
        </div>
      ) : description ? (
        <p className={cn("text-sm leading-relaxed", styles.description)}>
          {description}
        </p>
      ) : emptyText ? (
        <p className={cn("text-sm italic opacity-70", styles.description)}>
          {emptyText}
        </p>
      ) : null}
    </div>
  );
}
