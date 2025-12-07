import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteDialog } from "./delete-dialog";

describe("DeleteDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onConfirm: mockOnConfirm,
    userName: "João Silva",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnConfirm.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("should render dialog with title and description", () => {
      render(<DeleteDialog {...defaultProps} />);

      expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
      expect(
        screen.getByText("Esta ação não pode ser desfeita.")
      ).toBeInTheDocument();
    });

    it("should render confirmation message with user name", () => {
      render(<DeleteDialog {...defaultProps} />);

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(
        screen.getByText(/Tem certeza que deseja excluir o usuário/)
      ).toBeInTheDocument();
    });

    it("should render warning about permanent deletion", () => {
      render(<DeleteDialog {...defaultProps} />);

      expect(
        screen.getByText(
          "Todos os dados associados a este usuário serão permanentemente removidos."
        )
      ).toBeInTheDocument();
    });

    it("should render cancel and delete buttons", () => {
      render(<DeleteDialog {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Cancelar" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Excluir Usuário/ })
      ).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      render(<DeleteDialog {...defaultProps} open={false} />);

      expect(screen.queryByText("Confirmar Exclusão")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onOpenChange(false) when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<DeleteDialog {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("should call onConfirm when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<DeleteDialog {...defaultProps} />);

      await user.click(
        screen.getByRole("button", { name: /Excluir Usuário/ })
      );

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalled();
      });
    });

    it("should show loading state during deletion", async () => {
      const user = userEvent.setup();
      let resolveConfirm: () => void;
      const confirmPromise = new Promise<void>((resolve) => {
        resolveConfirm = resolve;
      });
      mockOnConfirm.mockReturnValue(confirmPromise);

      render(<DeleteDialog {...defaultProps} />);

      await user.click(
        screen.getByRole("button", { name: /Excluir Usuário/ })
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
        expect(
          screen.getByRole("button", { name: /Excluir Usuário/ })
        ).toBeDisabled();
      });

      resolveConfirm!();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Cancelar" })
        ).not.toBeDisabled();
      });
    });

    it("should handle synchronous onConfirm", async () => {
      const user = userEvent.setup();
      mockOnConfirm.mockReturnValue(undefined);

      render(<DeleteDialog {...defaultProps} />);

      await user.click(
        screen.getByRole("button", { name: /Excluir Usuário/ })
      );

      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  describe("different user names", () => {
    it("should display different user name correctly", () => {
      render(<DeleteDialog {...defaultProps} userName="Maria Costa" />);

      expect(screen.getByText("Maria Costa")).toBeInTheDocument();
    });

    it("should handle empty user name", () => {
      render(<DeleteDialog {...defaultProps} userName="" />);

      expect(
        screen.getByText(/Tem certeza que deseja excluir o usuário/)
      ).toBeInTheDocument();
    });
  });
});
