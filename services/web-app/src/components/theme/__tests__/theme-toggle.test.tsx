import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle, ThemeSwitch } from "../theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({
    theme: "light",
    setTheme: vi.fn(),
  })),
}));

import { useTheme } from "next-themes";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Alternar tema")).toBeInTheDocument();
  });

  it("should render sun and moon icons", () => {
    const { container } = render(<ThemeToggle />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
  });

  it("should call setTheme with 'dark' when theme is 'light'", () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'light' when theme is 'dark'", () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "dark",
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});

describe("ThemeSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render switch component", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeSwitch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeSwitch />);
    expect(screen.getByLabelText("Alternar tema")).toBeInTheDocument();
  });

  it("should be unchecked when theme is light", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeSwitch />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("data-state", "unchecked");
  });

  it("should be checked when theme is dark", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: vi.fn(),
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "dark",
      forcedTheme: undefined,
    });

    render(<ThemeSwitch />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("data-state", "checked");
  });

  it("should call setTheme with 'dark' when clicked and theme is light", () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    render(<ThemeSwitch />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'light' when clicked and theme is dark", () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "dark",
      forcedTheme: undefined,
    });

    render(<ThemeSwitch />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should render sun and moon icons", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: [],
      systemTheme: undefined,
      resolvedTheme: "light",
      forcedTheme: undefined,
    });

    const { container } = render(<ThemeSwitch />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
  });
});
