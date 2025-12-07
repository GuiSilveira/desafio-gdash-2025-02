import { describe, it, expect, vi, beforeEach } from "vitest";
import { authToasts, showLoadingToast, toastPromise } from "./toast";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => "toast-id-123"),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

import { toast } from "sonner";

describe("authToasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginSuccess", () => {
    it("should show success toast with user name", () => {
      authToasts.loginSuccess("João");

      expect(toast.success).toHaveBeenCalledWith("Login realizado com sucesso!", {
        description: "Bem-vindo de volta, João!",
        duration: 3000,
      });
    });

    it("should show success toast without user name", () => {
      authToasts.loginSuccess();

      expect(toast.success).toHaveBeenCalledWith("Login realizado com sucesso!", {
        description: "Bem-vindo de volta!",
        duration: 3000,
      });
    });

    it("should show success toast with undefined user name", () => {
      authToasts.loginSuccess(undefined);

      expect(toast.success).toHaveBeenCalledWith("Login realizado com sucesso!", {
        description: "Bem-vindo de volta!",
        duration: 3000,
      });
    });
  });

  describe("logoutSuccess", () => {
    it("should show info toast for logout", () => {
      authToasts.logoutSuccess();

      expect(toast.info).toHaveBeenCalledWith("Logout realizado", {
        description: "Você foi desconectado com sucesso.",
        duration: 3000,
      });
    });
  });

  describe("invalidToken", () => {
    it("should show error toast for invalid token", () => {
      authToasts.invalidToken();

      expect(toast.error).toHaveBeenCalledWith("Token inválido", {
        description: "O token fornecido não é válido.",
        duration: 4000,
      });
    });
  });

  describe("tokenExpired", () => {
    it("should show error toast for expired token", () => {
      authToasts.tokenExpired();

      expect(toast.error).toHaveBeenCalledWith("Token expirado", {
        description: "O token já expirou. Faça login novamente.",
        duration: 4000,
      });
    });
  });

  describe("sessionExpired", () => {
    it("should show warning toast for session expired", () => {
      authToasts.sessionExpired();

      expect(toast.warning).toHaveBeenCalledWith("Sessão expirada", {
        description: "Sua sessão expirou. Você será redirecionado para o login.",
        duration: 5000,
      });
    });
  });

  describe("sessionExpiredOnLoad", () => {
    it("should show error toast for session expired on load", () => {
      authToasts.sessionExpiredOnLoad();

      expect(toast.error).toHaveBeenCalledWith("Sessão expirada", {
        description: "Por favor, faça login novamente.",
        duration: 4000,
      });
    });
  });

  describe("unauthorizedRequest", () => {
    it("should show error toast for unauthorized request", () => {
      authToasts.unauthorizedRequest();

      expect(toast.error).toHaveBeenCalledWith("Sessão expirada", {
        description: "Sua sessão expirou. Redirecionando para o login...",
        duration: 4000,
      });
    });
  });

  describe("loginError", () => {
    it("should show error toast with custom message", () => {
      authToasts.loginError("Email ou senha incorretos");

      expect(toast.error).toHaveBeenCalledWith("Erro ao fazer login", {
        description: "Email ou senha incorretos",
        duration: 5000,
      });
    });

    it("should show error toast with default message", () => {
      authToasts.loginError();

      expect(toast.error).toHaveBeenCalledWith("Erro ao fazer login", {
        description: "Verifique suas credenciais e tente novamente.",
        duration: 5000,
      });
    });
  });

  describe("networkError", () => {
    it("should show error toast for network error", () => {
      authToasts.networkError();

      expect(toast.error).toHaveBeenCalledWith("Erro de conexão", {
        description: "Não foi possível conectar ao servidor. Verifique sua internet.",
        duration: 5000,
      });
    });
  });

  describe("authRequired", () => {
    it("should show warning toast for auth required", () => {
      authToasts.authRequired();

      expect(toast.warning).toHaveBeenCalledWith("Autenticação necessária", {
        description: "Você precisa fazer login para acessar esta página.",
        duration: 4000,
      });
    });
  });

  describe("profileUpdated", () => {
    it("should show success toast for profile update", () => {
      authToasts.profileUpdated();

      expect(toast.success).toHaveBeenCalledWith("Perfil atualizado", {
        description: "Suas informações foram atualizadas com sucesso.",
        duration: 3000,
      });
    });
  });

  describe("custom", () => {
    it("should show custom success toast", () => {
      authToasts.custom("success", "Título", "Descrição");

      expect(toast.success).toHaveBeenCalledWith("Título", {
        description: "Descrição",
        duration: 4000,
      });
    });

    it("should show custom error toast", () => {
      authToasts.custom("error", "Erro", "Algo deu errado");

      expect(toast.error).toHaveBeenCalledWith("Erro", {
        description: "Algo deu errado",
        duration: 4000,
      });
    });

    it("should show custom warning toast", () => {
      authToasts.custom("warning", "Aviso", "Cuidado");

      expect(toast.warning).toHaveBeenCalledWith("Aviso", {
        description: "Cuidado",
        duration: 4000,
      });
    });

    it("should show custom info toast", () => {
      authToasts.custom("info", "Info", "Informação");

      expect(toast.info).toHaveBeenCalledWith("Info", {
        description: "Informação",
        duration: 4000,
      });
    });

    it("should show custom toast without description", () => {
      authToasts.custom("success", "Apenas título");

      expect(toast.success).toHaveBeenCalledWith("Apenas título", {
        description: undefined,
        duration: 4000,
      });
    });
  });
});

describe("showLoadingToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading toast with default message", () => {
    showLoadingToast();

    expect(toast.loading).toHaveBeenCalledWith("Carregando...");
  });

  it("should show loading toast with custom message", () => {
    showLoadingToast("Processando dados...");

    expect(toast.loading).toHaveBeenCalledWith("Processando dados...");
  });

  it("should return function to dismiss toast", () => {
    const dismiss = showLoadingToast();

    expect(typeof dismiss).toBe("function");
  });

  it("should dismiss toast when returned function is called", () => {
    const dismiss = showLoadingToast();
    dismiss();

    expect(toast.dismiss).toHaveBeenCalledWith("toast-id-123");
  });
});

describe("toastPromise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call toast.promise with correct messages", () => {
    const promise = Promise.resolve("data");
    const messages = {
      loading: "Carregando...",
      success: "Sucesso!",
      error: "Erro!",
    };

    toastPromise(promise, messages);

    expect(toast.promise).toHaveBeenCalledWith(promise, {
      loading: "Carregando...",
      success: "Sucesso!",
      error: "Erro!",
    });
  });

  it("should work with different message values", () => {
    const promise = Promise.resolve({ id: 1 });
    const messages = {
      loading: "Salvando dados...",
      success: "Dados salvos!",
      error: "Falha ao salvar",
    };

    toastPromise(promise, messages);

    expect(toast.promise).toHaveBeenCalledWith(promise, messages);
  });
});
