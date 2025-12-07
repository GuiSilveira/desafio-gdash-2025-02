import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PokemonTypeBadge } from "../pokemon-type-badge";

describe("PokemonTypeBadge component", () => {
  it("should render with type name in Portuguese", () => {
    render(<PokemonTypeBadge type="fire" />);
    
    expect(screen.getByText("Fogo")).toBeInTheDocument();
  });

  it("should render with different Pokemon types", () => {
    const { rerender } = render(<PokemonTypeBadge type="water" />);
    expect(screen.getByText("Água")).toBeInTheDocument();

    rerender(<PokemonTypeBadge type="grass" />);
    expect(screen.getByText("Planta")).toBeInTheDocument();

    rerender(<PokemonTypeBadge type="electric" />);
    expect(screen.getByText("Elétrico")).toBeInTheDocument();

    rerender(<PokemonTypeBadge type="psychic" />);
    expect(screen.getByText("Psíquico")).toBeInTheDocument();
  });

  it("should handle uppercase type names", () => {
    render(<PokemonTypeBadge type="FIRE" />);
    
    expect(screen.getByText("Fogo")).toBeInTheDocument();
  });

  it("should fallback to original type name for unknown types", () => {
    render(<PokemonTypeBadge type="unknown_type" />);
    
    expect(screen.getByText("unknown_type")).toBeInTheDocument();
  });

  it("should render with different sizes", () => {
    const { rerender } = render(<PokemonTypeBadge type="fire" size="xs" />);
    expect(screen.getByText("Fogo")).toHaveClass("text-[10px]");

    rerender(<PokemonTypeBadge type="fire" size="sm" />);
    expect(screen.getByText("Fogo")).toHaveClass("text-xs");

    rerender(<PokemonTypeBadge type="fire" size="md" />);
    expect(screen.getByText("Fogo")).toHaveClass("text-xs");
  });

  it("should render outline variant with border", () => {
    render(<PokemonTypeBadge type="water" variant="outline" />);
    
    expect(screen.getByText("Água")).toHaveClass("border-2");
  });

  it("should render solid variant by default", () => {
    render(<PokemonTypeBadge type="fire" />);
    
    const badge = screen.getByText("Fogo");
    expect(badge).not.toHaveClass("border-2");
  });

  it("should apply custom className", () => {
    render(<PokemonTypeBadge type="fire" className="my-custom-class" />);
    
    expect(screen.getByText("Fogo")).toHaveClass("my-custom-class");
  });

  it("should have rounded-full for pill shape", () => {
    render(<PokemonTypeBadge type="grass" />);
    
    expect(screen.getByText("Planta")).toHaveClass("rounded-full");
  });

  it("should have white text color", () => {
    render(<PokemonTypeBadge type="fire" />);
    
    expect(screen.getByText("Fogo")).toHaveClass("text-white");
  });

  it("should apply type-specific background color via inline style", () => {
    render(<PokemonTypeBadge type="fire" />);
    
    const badge = screen.getByText("Fogo");
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it("should render multiple types correctly", () => {
    render(
      <div>
        <PokemonTypeBadge type="fire" />
        <PokemonTypeBadge type="flying" />
      </div>
    );
    
    expect(screen.getByText("Fogo")).toBeInTheDocument();
    expect(screen.getByText("Voador")).toBeInTheDocument();
  });
});
