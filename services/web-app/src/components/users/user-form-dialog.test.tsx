import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserFormDialog } from "./user-form-dialog";
import type { User } from "@/types/user";

describe("UserFormDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSubmit: mockOnSubmit,
  };

  const mockUser: User = {
    _id: "user-1",
    name: "João Silva",
    email: "joao@exemplo.com",
    roles: ["admin"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("create mode", () => {
    it("should render create dialog with correct title and description", () => {
      render(<UserFormDialog {...defaultProps} mode="create" />);

      expect(screen.getByText("Novo Usuário")).toBeInTheDocument();
      expect(
        screen.getByText("Preencha os dados para criar um novo usuário.")
      ).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<UserFormDialog {...defaultProps} mode="create" />);

      expect(screen.getByLabelText("Nome")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(screen.getByText("Função")).toBeInTheDocument();
    });

    it("should render create button", () => {
      render(<UserFormDialog {...defaultProps} mode="create" />);

      expect(
        screen.getByRole("button", { name: "Criar Usuário" })
      ).toBeInTheDocument();
    });

    it("should call onSubmit with create data when form is valid", async () => {
      const user = userEvent.setup();
      render(<UserFormDialog {...defaultProps} mode="create" />);

      await user.type(screen.getByPlaceholderText("João Silva"), "Maria Costa");
      await user.type(
        screen.getByPlaceholderText("joao@exemplo.com"),
        "maria@test.com"
      );
      await user.type(screen.getByPlaceholderText("••••••"), "password123");

      await user.click(screen.getByRole("button", { name: "Criar Usuário" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "Maria Costa",
          email: "maria@test.com",
          password: "password123",
          roles: ["user"],
        });
      });
    });

    it("should start with empty form fields in create mode", () => {
      render(<UserFormDialog {...defaultProps} mode="create" />);

      expect(screen.getByPlaceholderText("João Silva")).toHaveValue("");
      expect(screen.getByPlaceholderText("joao@exemplo.com")).toHaveValue("");
      expect(screen.getByPlaceholderText("••••••")).toHaveValue("");
    });
  });

  describe("edit mode", () => {
    it("should render edit dialog with correct title and description", () => {
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={mockUser} />
      );

      expect(screen.getByText("Editar Usuário")).toBeInTheDocument();
      expect(
        screen.getByText("Atualize os dados do usuário.")
      ).toBeInTheDocument();
    });

    it("should render save button", () => {
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={mockUser} />
      );

      expect(
        screen.getByRole("button", { name: "Salvar Alterações" })
      ).toBeInTheDocument();
    });

    it("should show hint that password is optional in edit mode", () => {
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={mockUser} />
      );

      expect(
        screen.getByText("(deixe em branco para não alterar)")
      ).toBeInTheDocument();
    });

    it("should populate form with user data", () => {
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={mockUser} />
      );

      expect(screen.getByPlaceholderText("João Silva")).toHaveValue(
        "João Silva"
      );
      expect(screen.getByPlaceholderText("joao@exemplo.com")).toHaveValue(
        "joao@exemplo.com"
      );
      expect(screen.getByPlaceholderText("••••••")).toHaveValue("");
    });

    it("should allow empty password in edit mode", async () => {
      const user = userEvent.setup();
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={mockUser} />
      );

      await user.click(
        screen.getByRole("button", { name: "Salvar Alterações" })
      );

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "João Silva",
          email: "joao@exemplo.com",
          roles: ["admin"],
        });
      });
    });

    it("should include password in update data when provided", async () => {
      const user = userEvent.setup();
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={mockUser} />
      );

      await user.type(screen.getByPlaceholderText("••••••"), "newpassword");
      await user.click(
        screen.getByRole("button", { name: "Salvar Alterações" })
      );

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "João Silva",
          email: "joao@exemplo.com",
          password: "newpassword",
          roles: ["admin"],
        });
      });
    });

    it("should set role to user when user does not have admin role", async () => {
      const regularUser: User = {
        ...mockUser,
        roles: ["user"],
      };
      render(
        <UserFormDialog {...defaultProps} mode="edit" user={regularUser} />
      );

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveTextContent("Usuário");
    });
  });

  describe("common functionality", () => {
    it("should call onOpenChange when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<UserFormDialog {...defaultProps} mode="create" />);

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("should disable form inputs during submission", async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      render(<UserFormDialog {...defaultProps} mode="create" />);

      await user.type(screen.getByPlaceholderText("João Silva"), "Test User");
      await user.type(
        screen.getByPlaceholderText("joao@exemplo.com"),
        "test@test.com"
      );
      await user.type(screen.getByPlaceholderText("••••••"), "password123");
      await user.click(screen.getByRole("button", { name: "Criar Usuário" }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("João Silva")).toBeDisabled();
        expect(screen.getByPlaceholderText("joao@exemplo.com")).toBeDisabled();
        expect(screen.getByPlaceholderText("••••••")).toBeDisabled();
      });

      resolveSubmit!();

      await waitFor(() => {
        expect(screen.getByPlaceholderText("João Silva")).not.toBeDisabled();
      });
    });

    it("should not render when open is false", () => {
      render(
        <UserFormDialog
          {...defaultProps}
          open={false}
          mode="create"
        />
      );

      expect(screen.queryByText("Novo Usuário")).not.toBeInTheDocument();
    });

    it("should reset form when dialog opens", () => {
      const { rerender } = render(
        <UserFormDialog {...defaultProps} open={false} mode="create" />
      );

      rerender(<UserFormDialog {...defaultProps} open={true} mode="create" />);

      expect(screen.getByPlaceholderText("João Silva")).toHaveValue("");
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();
      render(<UserFormDialog {...defaultProps} mode="create" />);

      const emailInput = screen.getByPlaceholderText("joao@exemplo.com");
      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Insira um email válido")).toBeInTheDocument();
      });
    });

    it("should trim whitespace from name and email on submit", async () => {
      const user = userEvent.setup();
      render(<UserFormDialog {...defaultProps} mode="create" />);

      await user.type(
        screen.getByPlaceholderText("João Silva"),
        "  Test User  "
      );
      await user.type(
        screen.getByPlaceholderText("joao@exemplo.com"),
        "  test@test.com  "
      );
      await user.type(screen.getByPlaceholderText("••••••"), "password123");
      await user.click(screen.getByRole("button", { name: "Criar Usuário" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "Test User",
          email: "test@test.com",
          password: "password123",
          roles: ["user"],
        });
      });
    });
  });

});
