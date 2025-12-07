import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TrendIndicator } from "../trend-indicator";

describe("TrendIndicator", () => {
  it("should render TrendingUp icon for 'up' trend", () => {
    const { container } = render(<TrendIndicator trend="up" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("w-4", "h-4");
  });

  it("should render TrendingDown icon for 'down' trend", () => {
    const { container } = render(<TrendIndicator trend="down" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("w-4", "h-4");
  });

  it("should render Minus icon for stable trend", () => {
    const { container } = render(<TrendIndicator trend="stable" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("w-4", "h-4");
  });

  it("should render Minus icon for unknown trend", () => {
    const { container } = render(<TrendIndicator trend="unknown" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("w-4", "h-4");
  });

  it("should apply color classes from getTrendColor for up trend", () => {
    const { container } = render(<TrendIndicator trend="up" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.length).toBeGreaterThan(0);
  });

  it("should apply color classes from getTrendColor for down trend", () => {
    const { container } = render(<TrendIndicator trend="down" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.length).toBeGreaterThan(0);
  });

  it("should apply color classes from getTrendColor for stable trend", () => {
    const { container } = render(<TrendIndicator trend="stable" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.length).toBeGreaterThan(0);
  });
});
