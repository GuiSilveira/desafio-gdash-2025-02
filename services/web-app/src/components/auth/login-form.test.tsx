import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

const mockSignIn = vi.fn();
const mockNavigate = vi.fn();
const mockIsAxiosError = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/config/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  isAxiosError: (error: unknown) => mockIsAxiosError(error),
}));

import { api } from "@/config/api";
import { toast } from "sonner";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockReturnValue(true);
    mockNavigate.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("should render the login form with title", () => {
      render(<LoginForm />);

      expect(screen.getByText("Bem-vindo de volta!")).toBeInTheDocument();
      expect(
        screen.getByText("Entre com seu email para acessar sua conta"),
      ).toBeInTheDocument();
    });

    it("should render email and password fields", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<LoginForm />);

      expect(
        screen.getByRole("button", { name: "Entrar" }),
      ).toBeInTheDocument();
    });

    it("should render footer with author info", () => {
      render(<LoginForm />);

      expect(screen.getByText("Guilherme Silveira")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<LoginForm className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("form validation", () => {
    it("should show error for invalid email", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Insira um email válido")).toBeInTheDocument();
      });
    });

    it("should show error for short password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText("••••••••");
      await user.type(passwordInput, "12345");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("A senha deve ter no mínimo 6 caracteres"),
        ).toBeInTheDocument();
      });
    });

    it("should not show errors for valid inputs", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText("Insira um email válido"),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText("A senha deve ter no mínimo 6 caracteres"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("should call api.post with credentials on submit", async () => {
      const user = userEvent.setup();
      vi.mocked(api.post).mockResolvedValue({
        data: { access_token: "test-token" },
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/auth/login", {
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should call signIn with access token on successful login", async () => {
      const user = userEvent.setup();
      vi.mocked(api.post).mockResolvedValue({
        data: { access_token: "new-test-token" },
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("new-test-token");
      });
    });

    it("should navigate to home page after successful login", async () => {
      const user = userEvent.setup();
      vi.mocked(api.post).mockResolvedValue({
        data: { access_token: "test-token" },
      });
      mockSignIn.mockReturnValue(true);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
      });
    });

    it("should not navigate if signIn returns false", async () => {
      const user = userEvent.setup();
      vi.mocked(api.post).mockResolvedValue({
        data: { access_token: "invalid-token" },
      });
      mockSignIn.mockReturnValue(false);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolvePost: (value: { data: { access_token: string } }) => void;
      const postPromise = new Promise<{ data: { access_token: string } }>(
        (resolve) => {
          resolvePost = resolve;
        },
      );
      vi.mocked(api.post).mockReturnValue(postPromise);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Entrando...")).toBeInTheDocument();
      });

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();

      resolvePost!({ data: { access_token: "test-token" } });

      await waitFor(() => {
        expect(screen.queryByText("Entrando...")).not.toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should show toast error for axios error with message", async () => {
      const user = userEvent.setup();
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            message: "Credenciais inválidas",
          },
        },
      };
      vi.mocked(api.post).mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao entrar", {
          description: "Credenciais inválidas",
        });
      });
    });

    it("should show toast error for axios error with array message (uses first error)", async () => {
      const user = userEvent.setup();
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            message: ["Erro 1", "Erro 2"],
          },
        },
      };
      vi.mocked(api.post).mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao entrar", {
          description: "Erro 1",
        });
      });
    });

    it("should show default error for axios error without message", async () => {
      const user = userEvent.setup();
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {},
        },
      };
      vi.mocked(api.post).mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao entrar", {
          description: "Credenciais inválidas ou erro no servidor.",
        });
      });
    });

    it("should show error message for generic Error", async () => {
      const user = userEvent.setup();
      vi.mocked(api.post).mockRejectedValue(new Error("Network error"));
      mockIsAxiosError.mockReturnValue(false);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao entrar", {
          description: "Network error",
        });
      });
    });

    it("should show default error for unknown error type", async () => {
      const user = userEvent.setup();
      vi.mocked(api.post).mockRejectedValue("string error");
      mockIsAxiosError.mockReturnValue(false);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao entrar", {
          description: "Erro inesperado ao tentar entrar.",
        });
      });
    });

    it("should log error to console", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");
      vi.mocked(api.post).mockRejectedValue(error);
      mockIsAxiosError.mockReturnValue(false);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("seu@email.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: "Entrar" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Login falhou", error);
      });

      consoleSpy.mockRestore();
    });
  });
});
