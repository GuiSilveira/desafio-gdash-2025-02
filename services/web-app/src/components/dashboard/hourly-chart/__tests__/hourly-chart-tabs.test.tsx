import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HourlyChartTabs } from "../hourly-chart-tabs";

describe("HourlyChartTabs", () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tab buttons", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);
  });

  it("should render temperature tab with title", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );
    expect(screen.getByTitle("Temperatura")).toBeInTheDocument();
  });

  it("should render rain tab with title", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );
    expect(screen.getByTitle("Chuva")).toBeInTheDocument();
  });

  it("should render UV tab with title", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );
    expect(screen.getByTitle("UV")).toBeInTheDocument();
  });

  it("should render AQI tab with title", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );
    expect(screen.getByTitle("Qualidade do Ar")).toBeInTheDocument();
  });

  it("should call onTabChange with correct tab when clicked", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    fireEvent.click(screen.getByTitle("Chuva"));
    expect(mockOnTabChange).toHaveBeenCalledWith("rain");
  });

  it("should call onTabChange with uv when UV tab is clicked", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    fireEvent.click(screen.getByTitle("UV"));
    expect(mockOnTabChange).toHaveBeenCalledWith("uv");
  });

  it("should call onTabChange with aqi when AQI tab is clicked", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    fireEvent.click(screen.getByTitle("Qualidade do Ar"));
    expect(mockOnTabChange).toHaveBeenCalledWith("aqi");
  });

  it("should apply active styles to selected tab", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    const activeTab = screen.getByTitle("Temperatura");
    expect(activeTab).toHaveClass("text-white");
  });

  it("should apply inactive styles to non-selected tabs", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    const inactiveTab = screen.getByTitle("Chuva");
    expect(inactiveTab).toHaveClass("bg-[#F7F9FC]");
  });

  it("should render icons in each tab", () => {
    const { container } = render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(4);
  });

  it("should have rounded-full class on all buttons", () => {
    render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("rounded-full");
    });
  });

  it("should work with different active tabs", () => {
    const { rerender } = render(
      <HourlyChartTabs activeTab="temperature" onTabChange={mockOnTabChange} />
    );

    let activeTab = screen.getByTitle("Temperatura");
    expect(activeTab).toHaveClass("text-white");

    rerender(
      <HourlyChartTabs activeTab="rain" onTabChange={mockOnTabChange} />
    );

    activeTab = screen.getByTitle("Chuva");
    expect(activeTab).toHaveClass("text-white");
  });
});
