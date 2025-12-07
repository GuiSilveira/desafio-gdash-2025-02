import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UVIndexSkeleton } from "../uv-index-skeleton";

describe("UVIndexSkeleton", () => {
  it("should render the skeleton card", () => {
    const { container } = render(<UVIndexSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have animate-pulse class for loading animation", () => {
    const { container } = render(<UVIndexSkeleton />);
    const animatedElement = container.querySelector(".animate-pulse");
    expect(animatedElement).toBeInTheDocument();
  });

  it("should render skeleton placeholders with dark theme styling", () => {
    const { container } = render(<UVIndexSkeleton />);
    const skeletonDivs = container.querySelectorAll(".bg-white\\/10");
    expect(skeletonDivs.length).toBeGreaterThan(0);
  });

  it("should render a card with dark background", () => {
    const { container } = render(<UVIndexSkeleton />);
    const card = container.querySelector(".bg-\\[\\#0F1724\\]");
    expect(card).toBeInTheDocument();
  });

  it("should have rounded corners", () => {
    const { container } = render(<UVIndexSkeleton />);
    const card = container.querySelector(".rounded-4xl");
    expect(card).toBeInTheDocument();
  });

  it("should have full height", () => {
    const { container } = render(<UVIndexSkeleton />);
    const card = container.querySelector(".h-full");
    expect(card).toBeInTheDocument();
  });
});
