import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HourlyChartFilters } from "../hourly-chart-filters";

describe("HourlyChartFilters", () => {
  const mockOnChartTypeChange = vi.fn();
  const mockOnTimeRangeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render chart type toggle group", () => {
    render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    expect(screen.getByText("Linha")).toBeInTheDocument();
    expect(screen.getByText("Barras")).toBeInTheDocument();
  });

  it("should render time range select", () => {
    render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should have line chart type selected", () => {
    render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    const lineButton = screen.getByRole("radio", { name: /linha/i });
    expect(lineButton).toHaveAttribute("data-state", "on");
  });

  it("should have bar chart type selected when chartType is bar", () => {
    render(
      <HourlyChartFilters
        chartType="bar"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    const barButton = screen.getByRole("radio", { name: /barra/i });
    expect(barButton).toHaveAttribute("data-state", "on");
  });

  it("should call onChartTypeChange when clicking bar", () => {
    render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    fireEvent.click(screen.getByRole("radio", { name: /barra/i }));
    expect(mockOnChartTypeChange).toHaveBeenCalledWith("bar");
  });

  it("should call onChartTypeChange when clicking line", () => {
    render(
      <HourlyChartFilters
        chartType="bar"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    fireEvent.click(screen.getByRole("radio", { name: /linha/i }));
    expect(mockOnChartTypeChange).toHaveBeenCalledWith("line");
  });

  it("should render icons in toggle buttons", () => {
    const { container } = render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should have correct layout classes", () => {
    const { container } = render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex", "items-center", "justify-between");
  });

  it("should render clock icon in time range select", () => {
    const { container } = render(
      <HourlyChartFilters
        chartType="line"
        timeRange="24h"
        onChartTypeChange={mockOnChartTypeChange}
        onTimeRangeChange={mockOnTimeRangeChange}
      />
    );
    const selectTrigger = container.querySelector('[role="combobox"]');
    expect(selectTrigger?.querySelector("svg")).toBeInTheDocument();
  });
});
