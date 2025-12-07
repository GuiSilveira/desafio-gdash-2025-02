/**
 * Utilitários para toast/notificações
 */

import { toast } from "sonner";

/**
 * Mensagens de toast centralizadas para autenticação
 */
export const authToasts = {
  loginSuccess: (userName?: string) => {
    toast.success("Login realizado com sucesso!", {
      description: userName
        ? `Bem-vindo de volta, ${userName}!`
        : "Bem-vindo de volta!",
      duration: 3000,
    });
  },

  logoutSuccess: () => {
    toast.info("Logout realizado", {
      description: "Você foi desconectado com sucesso.",
      duration: 3000,
    });
  },

  invalidToken: () => {
    toast.error("Token inválido", {
      description: "O token fornecido não é válido.",
      duration: 4000,
    });
  },

  tokenExpired: () => {
    toast.error("Token expirado", {
      description: "O token já expirou. Faça login novamente.",
      duration: 4000,
    });
  },

  sessionExpired: () => {
    toast.warning("Sessão expirada", {
      description: "Sua sessão expirou. Você será redirecionado para o login.",
      duration: 5000,
    });
  },

  sessionExpiredOnLoad: () => {
    toast.error("Sessão expirada", {
      description: "Por favor, faça login novamente.",
      duration: 4000,
    });
  },

  unauthorizedRequest: () => {
    toast.error("Sessão expirada", {
      description: "Sua sessão expirou. Redirecionando para o login...",
      duration: 4000,
    });
  },

  loginError: (message?: string) => {
    toast.error("Erro ao fazer login", {
      description: message || "Verifique suas credenciais e tente novamente.",
      duration: 5000,
    });
  },

  networkError: () => {
    toast.error("Erro de conexão", {
      description:
        "Não foi possível conectar ao servidor. Verifique sua internet.",
      duration: 5000,
    });
  },

  authRequired: () => {
    toast.warning("Autenticação necessária", {
      description: "Você precisa fazer login para acessar esta página.",
      duration: 4000,
    });
  },

  profileUpdated: () => {
    toast.success("Perfil atualizado", {
      description: "Suas informações foram atualizadas com sucesso.",
      duration: 3000,
    });
  },

  custom: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    description?: string
  ) => {
    toast[type](title, {
      description,
      duration: 4000,
    });
  },
};

/**
 * Helper para mostrar toast de loading
 * Retorna função para fechar o toast
 */
export function showLoadingToast(message: string = "Carregando...") {
  const toastId = toast.loading(message);
  return () => toast.dismiss(toastId);
}

/**
 * Helper para mostrar toast com promise
 * Mostra automaticamente estados de loading, success e error
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
}
