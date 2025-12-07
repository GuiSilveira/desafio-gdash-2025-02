import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardHeader } from "../dashboard-header";

describe("DashboardHeader", () => {
  const mockOnPokemonModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dashboard title", () => {
    render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    expect(screen.getByText("Painel do Tempo")).toBeInTheDocument();
  });

  it("should render the current date", () => {
    render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const dateContainer = screen.getByText(/\d{1,2} de \w+ de \d{4}/i);
    expect(dateContainer).toBeInTheDocument();
  });

  it("should render the Pokemon Mode label", () => {
    render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    expect(screen.getByText("Modo Pokemon")).toBeInTheDocument();
  });

  it("should render the Pokemon Mode switch", () => {
    render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should have switch unchecked when isPokemonMode is false", () => {
    render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("data-state", "unchecked");
  });

  it("should have switch checked when isPokemonMode is true", () => {
    render(
      <DashboardHeader
        isPokemonMode={true}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("data-state", "checked");
  });

  it("should call onPokemonModeChange when switch is clicked", () => {
    render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(mockOnPokemonModeChange).toHaveBeenCalledWith(true);
  });

  it("should render pokeball decoration when pokemon mode is enabled", () => {
    const { container } = render(
      <DashboardHeader
        isPokemonMode={true}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const pokeballDecoration = container.querySelector(".pointer-events-none.shadow-sm");
    expect(pokeballDecoration).toBeInTheDocument();
  });

  it("should not render pokeball decoration when pokemon mode is disabled", () => {
    const { container } = render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const pokeballDecorations = container.querySelectorAll(".pointer-events-none.shadow-sm.border-2");
    expect(pokeballDecorations.length).toBe(0);
  });

  it("should render calendar icon", () => {
    const { container } = render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have responsive layout classes", () => {
    const { container } = render(
      <DashboardHeader
        isPokemonMode={false}
        onPokemonModeChange={mockOnPokemonModeChange}
      />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex", "flex-col", "lg:flex-row");
  });
});
