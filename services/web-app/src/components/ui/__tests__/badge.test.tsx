import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge component", () => {
  it("should render with default props", () => {
    render(<Badge>Default Badge</Badge>);
    
    const badge = screen.getByText(/default badge/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("should render with different variants", () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary");

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary");

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText("Destructive")).toHaveClass("bg-destructive");

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("text-foreground");
  });

  it("should apply custom className", () => {
    render(<Badge className="custom-badge-class">Custom</Badge>);
    
    expect(screen.getByText("Custom")).toHaveClass("custom-badge-class");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/status">Status Link</a>
      </Badge>
    );
    
    const link = screen.getByRole("link", { name: /status link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/status");
  });

  it("should render with children containing icons", () => {
    render(
      <Badge>
        <svg data-testid="icon" />
        With Icon
      </Badge>
    );
    
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("With Icon")).toBeInTheDocument();
  });

  it("should have rounded-full class for pill shape", () => {
    render(<Badge>Pill Badge</Badge>);
    
    expect(screen.getByText("Pill Badge")).toHaveClass("rounded-full");
  });

  it("should forward additional props", () => {
    render(<Badge data-testid="test-badge" id="badge-1">Test</Badge>);
    
    const badge = screen.getByTestId("test-badge");
    expect(badge).toHaveAttribute("id", "badge-1");
  });
});
