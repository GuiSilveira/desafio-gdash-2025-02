import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButtons } from "../export-buttons";

vi.mock("@/config/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { api } from "@/config/api";
import { toast } from "sonner";

describe("ExportButtons", () => {
  const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
  const mockRevokeObjectURL = vi.fn();
  const mockClick = vi.fn();
  
  let createElementSpy: ReturnType<typeof vi.spyOn> | null = null;
  let appendChildSpy: ReturnType<typeof vi.spyOn> | null = null;
  let removeChildSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;
    
    mockClick.mockClear();
  });

  afterEach(() => {
    if (createElementSpy) {
      createElementSpy.mockRestore();
      createElementSpy = null;
    }
    if (appendChildSpy) {
      appendChildSpy.mockRestore();
      appendChildSpy = null;
    }
    if (removeChildSpy) {
      removeChildSpy.mockRestore();
      removeChildSpy = null;
    }
  });

  const setupDownloadMock = () => {
    const originalCreateElement = document.createElement.bind(document);
    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
      style: {},
    };
    
    createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });
    
    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
    
    return mockLink;
  };

  describe("rendering", () => {
    it("should render CSV export button", () => {
      render(<ExportButtons />);
      expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    });

    it("should render XLSX export button", () => {
      render(<ExportButtons />);
      expect(screen.getByText("Exportar XLSX")).toBeInTheDocument();
    });

    it("should disable buttons when disabled prop is true", () => {
      render(<ExportButtons disabled={true} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should enable buttons by default", () => {
      render(<ExportButtons />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it("should have correct styling for CSV button", () => {
      render(<ExportButtons />);
      const csvButton = screen.getByText("Exportar CSV").closest("button");
      expect(csvButton).toHaveClass("border-green-500/50");
    });

    it("should have correct styling for XLSX button", () => {
      render(<ExportButtons />);
      const xlsxButton = screen.getByText("Exportar XLSX").closest("button");
      expect(xlsxButton).toHaveClass("border-blue-500/50");
    });

    it("should have outline variant for buttons", () => {
      render(<ExportButtons />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should wrap buttons in a flex container", () => {
      const { container } = render(<ExportButtons />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "flex-wrap", "gap-2");
    });

    it("should render file icons in buttons", () => {
      const { container } = render(<ExportButtons />);
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBe(2);
    });
  });

  describe("CSV export", () => {
    it("should call api with correct endpoint for CSV export", async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/weather/export/csv", {
          responseType: "blob",
        });
      });
    });

    it("should show success toast after CSV export", async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Arquivo exportado com sucesso!", {
          description: "O arquivo weather_logs.csv foi baixado.",
        });
      });
    });

    it("should show error toast when CSV export fails", async () => {
      const user = userEvent.setup();
      vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao exportar CSV", {
          description: "Não foi possível exportar os dados. Tente novamente.",
        });
      });
    });

    it("should create and trigger download link for CSV", async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockClick).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe("XLSX export", () => {
    it("should call api with correct endpoint for XLSX export", async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(["xlsx data"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar XLSX"));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/weather/export/xlsx", {
          responseType: "blob",
        });
      });
    });

    it("should show success toast after XLSX export", async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(["xlsx data"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar XLSX"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Arquivo exportado com sucesso!", {
          description: "O arquivo weather_logs.xlsx foi baixado.",
        });
      });
    });

    it("should show error toast when XLSX export fails", async () => {
      const user = userEvent.setup();
      vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar XLSX"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erro ao exportar XLSX", {
          description: "Não foi possível exportar os dados. Tente novamente.",
        });
      });
    });
  });

  describe("loading state", () => {
    it("should show loading state while exporting CSV", async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(api.get).mockReturnValue(pendingPromise as ReturnType<typeof api.get>);

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        expect(screen.getByText("Exportando...")).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      resolvePromise!({ data: new Blob() });
    });

    it("should disable both buttons while exporting", async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(api.get).mockReturnValue(pendingPromise as ReturnType<typeof api.get>);

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar XLSX"));

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
          expect(button).toBeDisabled();
        });
      });

      resolvePromise!({ data: new Blob() });
    });

    it("should re-enable buttons after export completes", async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(["data"]);
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
          expect(button).not.toBeDisabled();
        });
      });
    });

    it("should re-enable buttons after export fails", async () => {
      const user = userEvent.setup();
      vi.mocked(api.get).mockRejectedValue(new Error("Failed"));

      render(<ExportButtons />);
      setupDownloadMock();
      
      await user.click(screen.getByText("Exportar CSV"));

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
          expect(button).not.toBeDisabled();
        });
      });
    });
  });
});
