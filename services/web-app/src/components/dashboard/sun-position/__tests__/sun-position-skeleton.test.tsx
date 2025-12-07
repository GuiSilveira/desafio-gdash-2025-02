import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SunPositionSkeleton } from "../sun-position-skeleton";

describe("SunPositionSkeleton", () => {
  it("should render the skeleton card", () => {
    const { container } = render(<SunPositionSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have animate-pulse class for loading animation", () => {
    const { container } = render(<SunPositionSkeleton />);
    const animatedElement = container.querySelector(".animate-pulse");
    expect(animatedElement).toBeInTheDocument();
  });

  it("should render skeleton placeholders", () => {
    const { container } = render(<SunPositionSkeleton />);
    const skeletonDivs = container.querySelectorAll(".bg-muted");
    expect(skeletonDivs.length).toBeGreaterThan(0);
  });

  it("should render a card with proper styling", () => {
    const { container } = render(<SunPositionSkeleton />);
    const card = container.querySelector(".rounded-4xl");
    expect(card).toBeInTheDocument();
  });

  it("should have space between skeleton elements", () => {
    const { container } = render(<SunPositionSkeleton />);
    const spacedElement = container.querySelector(".space-y-4");
    expect(spacedElement).toBeInTheDocument();
  });
});
