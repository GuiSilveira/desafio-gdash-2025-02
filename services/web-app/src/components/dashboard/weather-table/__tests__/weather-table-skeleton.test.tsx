import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { WeatherTableSkeleton } from "../weather-table-skeleton";

vi.mock("@/components/ui/data-table", () => ({
  DataTableSkeleton: ({
    rows,
    showHeader,
    showAction,
    showPagination,
    titleWidth,
    subtitleWidth,
    actionWidth,
  }: {
    rows: number;
    showHeader: boolean;
    showAction: boolean;
    showPagination: boolean;
    titleWidth: string;
    subtitleWidth: string;
    actionWidth: string;
  }) => (
    <div
      data-testid="data-table-skeleton"
      data-rows={rows}
      data-show-header={showHeader}
      data-show-action={showAction}
      data-show-pagination={showPagination}
      data-title-width={titleWidth}
      data-subtitle-width={subtitleWidth}
      data-action-width={actionWidth}
    >
      DataTableSkeleton Mock
    </div>
  ),
}));

describe("WeatherTableSkeleton", () => {
  it("should render the skeleton", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toBeInTheDocument();
  });

  it("should render with 10 rows", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-rows", "10");
  });

  it("should show header", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-show-header", "true");
  });

  it("should show action column", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-show-action", "true");
  });

  it("should show pagination", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-show-pagination", "true");
  });

  it("should have correct title width", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-title-width", "180px");
  });

  it("should have correct subtitle width", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-subtitle-width", "220px");
  });

  it("should have correct action width", () => {
    const { getByTestId } = render(<WeatherTableSkeleton />);
    expect(getByTestId("data-table-skeleton")).toHaveAttribute("data-action-width", "200px");
  });
});
