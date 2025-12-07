/**
 * Utilitários relacionados a usuários
 */
import type { User } from "@/types/user";

/**
 * Verifica se o usuário é administrador
 */
export function isAdmin(user: User): boolean {
  return user.roles?.includes("admin") ?? false;
}

/**
 * Obtém o nome da role em português
 */
export function getRoleName(user: User): string {
  return isAdmin(user) ? "Administrador" : "Usuário";
}

/**
 * Obtém a role principal do usuário
 */
export function getPrimaryRole(user: User): "admin" | "user" {
  return isAdmin(user) ? "admin" : "user";
}

/**
 * Configuração de badge por role
 */
export interface RoleBadgeConfig {
  label: string;
  variant: "admin" | "user";
  bgClass: string;
  textClass: string;
}

/**
 * Obtém configuração de badge baseado na role do usuário
 */
export function getRoleBadgeConfig(user: User): RoleBadgeConfig {
  if (isAdmin(user)) {
    return {
      label: "Admin",
      variant: "admin",
      bgClass: "bg-purple-100 dark:bg-purple-950/50",
      textClass: "text-purple-700 dark:text-purple-300",
    };
  }
  return {
    label: "Usuário",
    variant: "user",
    bgClass: "bg-slate-100 dark:bg-slate-800",
    textClass: "text-slate-600 dark:text-slate-300",
  };
}
