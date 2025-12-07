import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsightCard } from "../insight-card";
import { Sun, Cloud, Thermometer } from "lucide-react";

describe("InsightCard", () => {
  describe("basic rendering", () => {
    it("should render with icon and title", () => {
      render(<InsightCard icon={Sun} title="Test Title" variant="orange" />);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      render(
        <InsightCard
          icon={Sun}
          title="Test Title"
          description="Test description"
          variant="orange"
        />
      );
      expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("should render emptyText when no description", () => {
      render(
        <InsightCard
          icon={Sun}
          title="Test Title"
          emptyText="No data available"
          variant="orange"
        />
      );
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should render titleExtra content", () => {
      render(
        <InsightCard
          icon={Sun}
          title="Test Title"
          titleExtra={<span data-testid="extra">Extra</span>}
          variant="orange"
        />
      );
      expect(screen.getByTestId("extra")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("should render orange variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Orange" variant="orange" />
      );
      expect(container.firstChild).toHaveClass("rounded-xl");
    });

    it("should render blue variant", () => {
      const { container } = render(
        <InsightCard icon={Cloud} title="Blue" variant="blue" />
      );
      expect(container.firstChild).toHaveClass("rounded-xl");
    });

    it("should render red variant", () => {
      const { container } = render(
        <InsightCard icon={Thermometer} title="Red" variant="red" />
      );
      expect(container.firstChild).toHaveClass("rounded-xl");
    });

    it("should render green variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Green" variant="green" />
      );
      expect(container.firstChild).toHaveClass("rounded-xl");
    });

    it("should render purple variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Purple" variant="purple" />
      );
      expect(container.firstChild).toHaveClass("rounded-xl");
    });

    it("should render custom variant with custom styles", () => {
      const customStyles = {
        container: "bg-yellow-100",
        icon: "text-yellow-600",
        title: "text-yellow-700",
        description: "text-yellow-500",
      };

      const { container } = render(
        <InsightCard
          icon={Sun}
          title="Custom"
          description="Custom description"
          variant="custom"
          customStyles={customStyles}
        />
      );
      expect(container.firstChild).toHaveClass("bg-yellow-100");
    });
  });

  describe("loading state", () => {
    it("should render loading skeleton when isLoading is true", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Loading" variant="orange" isLoading />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should not render description when loading", () => {
      render(
        <InsightCard
          icon={Sun}
          title="Loading"
          description="This should not show"
          variant="orange"
          isLoading
        />
      );
      expect(screen.queryByText("This should not show")).not.toBeInTheDocument();
    });

    it("should render loading skeleton with blue variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Loading" variant="blue" isLoading />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should render loading skeleton with red variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Loading" variant="red" isLoading />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should render loading skeleton with green variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Loading" variant="green" isLoading />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should render loading skeleton with purple variant", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Loading" variant="purple" isLoading />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("refresh functionality", () => {
    it("should render refresh button when onRefresh is provided", () => {
      const onRefresh = vi.fn();
      render(
        <InsightCard
          icon={Sun}
          title="Refresh Test"
          variant="blue"
          onRefresh={onRefresh}
        />
      );
      expect(screen.getByTitle("Gerar nova análise")).toBeInTheDocument();
    });

    it("should call onRefresh when refresh button is clicked", () => {
      const onRefresh = vi.fn();
      render(
        <InsightCard
          icon={Sun}
          title="Refresh Test"
          variant="blue"
          onRefresh={onRefresh}
        />
      );

      fireEvent.click(screen.getByTitle("Gerar nova análise"));
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it("should disable refresh button when isRefreshing is true", () => {
      const onRefresh = vi.fn();
      render(
        <InsightCard
          icon={Sun}
          title="Refresh Test"
          variant="blue"
          onRefresh={onRefresh}
          isRefreshing
        />
      );

      const button = screen.getByTitle("Gerar nova análise");
      expect(button).toBeDisabled();
    });

    it("should show spinning animation when refreshing", () => {
      const onRefresh = vi.fn();
      const { container } = render(
        <InsightCard
          icon={Sun}
          title="Refresh Test"
          variant="blue"
          onRefresh={onRefresh}
          isRefreshing
        />
      );

      const refreshIcon = container.querySelector(".animate-spin");
      expect(refreshIcon).toBeInTheDocument();
    });

    it("should not render refresh button when onRefresh is not provided", () => {
      render(<InsightCard icon={Sun} title="No Refresh" variant="orange" />);
      expect(screen.queryByTitle("Gerar nova análise")).not.toBeInTheDocument();
    });
  });

  describe("custom className", () => {
    it("should apply custom className to container", () => {
      const { container } = render(
        <InsightCard
          icon={Sun}
          title="Custom Class"
          variant="orange"
          className="my-custom-class"
        />
      );
      expect(container.firstChild).toHaveClass("my-custom-class");
    });
  });

  describe("icon rendering", () => {
    it("should render the provided icon", () => {
      const { container } = render(
        <InsightCard icon={Sun} title="Icon Test" variant="orange" />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-5", "h-5");
    });
  });
});
