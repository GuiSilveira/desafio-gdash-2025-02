/**
 * Utilitários para formulários
 */

/**
 * Extrai mensagem de erro de um array de erros do TanStack Form
 * Suporta erros como string ou objeto com propriedade message
 */
export function getFieldError(errors: unknown[]): string | undefined {
  if (!errors.length) return undefined;
  const error = errors[0];
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return "Erro de validação";
}

/**
 * Extrai mensagem de erro de API (Axios)
 * Suporta mensagens como string ou array de strings (NestJS validation pipe)
 */
export function extractApiErrorMessage(
  apiMessage: unknown,
  fallback = "Erro inesperado"
): string {
  if (Array.isArray(apiMessage)) {
    return apiMessage[0] || fallback;
  }
  if (typeof apiMessage === "string") {
    return apiMessage;
  }
  return fallback;
}
