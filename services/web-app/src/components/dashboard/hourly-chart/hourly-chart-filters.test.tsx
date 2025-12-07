import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HourlyChartFilters } from "./hourly-chart-filters";
import type { HourlyChartType, HourlyTimeRange } from "@/types/weather";

describe("HourlyChartFilters", () => {
  const defaultProps = {
    chartType: "area" as HourlyChartType,
    timeRange: "12h" as HourlyTimeRange,
    onChartTypeChange: vi.fn(),
    onTimeRangeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render chart type toggle group", () => {
      render(<HourlyChartFilters {...defaultProps} />);

      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("should render time range select", () => {
      render(<HourlyChartFilters {...defaultProps} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render all chart type options", () => {
      render(<HourlyChartFilters {...defaultProps} />);

      expect(screen.getByRole("radio", { name: /área/i })).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /linha/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /barras/i })
      ).toBeInTheDocument();
    });
  });

  describe("chart type toggle", () => {
    it("should call onChartTypeChange when clicking a different chart type", async () => {
      const user = userEvent.setup();
      const onChartTypeChange = vi.fn();

      render(
        <HourlyChartFilters
          {...defaultProps}
          chartType="area"
          onChartTypeChange={onChartTypeChange}
        />
      );

      const linhaToggle = screen.getByRole("radio", { name: /linha/i });
      await user.click(linhaToggle);

      expect(onChartTypeChange).toHaveBeenCalledWith("line");
    });

    it("should call onChartTypeChange when clicking bar chart type", async () => {
      const user = userEvent.setup();
      const onChartTypeChange = vi.fn();

      render(
        <HourlyChartFilters
          {...defaultProps}
          chartType="area"
          onChartTypeChange={onChartTypeChange}
        />
      );

      const barrasToggle = screen.getByRole("radio", { name: /barras/i });
      await user.click(barrasToggle);

      expect(onChartTypeChange).toHaveBeenCalledWith("bar");
    });

    it("should not call onChartTypeChange when clicking the already selected chart type", async () => {
      const user = userEvent.setup();
      const onChartTypeChange = vi.fn();

      render(
        <HourlyChartFilters
          {...defaultProps}
          chartType="area"
          onChartTypeChange={onChartTypeChange}
        />
      );

      const areaToggle = screen.getByRole("radio", { name: /área/i });
      await user.click(areaToggle);

      expect(onChartTypeChange).not.toHaveBeenCalled();
    });

    it("should show area as selected when chartType is area", () => {
      render(<HourlyChartFilters {...defaultProps} chartType="area" />);

      const areaToggle = screen.getByRole("radio", { name: /área/i });
      expect(areaToggle).toHaveAttribute("data-state", "on");
    });

    it("should show line as selected when chartType is line", () => {
      render(<HourlyChartFilters {...defaultProps} chartType="line" />);

      const linhaToggle = screen.getByRole("radio", { name: /linha/i });
      expect(linhaToggle).toHaveAttribute("data-state", "on");
    });

    it("should show bar as selected when chartType is bar", () => {
      render(<HourlyChartFilters {...defaultProps} chartType="bar" />);

      const barrasToggle = screen.getByRole("radio", { name: /barras/i });
      expect(barrasToggle).toHaveAttribute("data-state", "on");
    });
  });

  describe("time range select", () => {
    it("should display the current 12h time range value", () => {
      render(<HourlyChartFilters {...defaultProps} timeRange="12h" />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveTextContent(/12 horas/i);
    });

    it("should display the current 6h time range value", () => {
      render(<HourlyChartFilters {...defaultProps} timeRange="6h" />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveTextContent(/6 horas/i);
    });

    it("should display the current 24h time range value", () => {
      render(<HourlyChartFilters {...defaultProps} timeRange="24h" />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveTextContent(/24 horas/i);
    });
  });
});
