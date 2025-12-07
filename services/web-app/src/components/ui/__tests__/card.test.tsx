import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "../card";

describe("Card components", () => {
  describe("Card", () => {
    it("should render with default props", () => {
      render(<Card data-testid="card">Card content</Card>);
      
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
      expect(card).toHaveTextContent("Card content");
    });

    it("should have proper styling classes", () => {
      render(<Card data-testid="card">Content</Card>);
      
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("rounded-xl");
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("shadow-sm");
    });

    it("should apply custom className", () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>);
      
      expect(screen.getByTestId("card")).toHaveClass("custom-card");
    });
  });

  describe("CardHeader", () => {
    it("should render with default props", () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>);
      
      const header = screen.getByTestId("card-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("data-slot", "card-header");
    });

    it("should apply custom className", () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>);
      
      expect(screen.getByTestId("header")).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("should render with default props", () => {
      render(<CardTitle>My Title</CardTitle>);
      
      const title = screen.getByText("My Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("data-slot", "card-title");
    });

    it("should have font-semibold class", () => {
      render(<CardTitle>Title</CardTitle>);
      
      expect(screen.getByText("Title")).toHaveClass("font-semibold");
    });

    it("should apply custom className", () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      
      expect(screen.getByText("Title")).toHaveClass("custom-title");
    });
  });

  describe("CardDescription", () => {
    it("should render with default props", () => {
      render(<CardDescription>Description text</CardDescription>);
      
      const desc = screen.getByText("Description text");
      expect(desc).toBeInTheDocument();
      expect(desc).toHaveAttribute("data-slot", "card-description");
    });

    it("should have text-sm class", () => {
      render(<CardDescription>Description</CardDescription>);
      
      expect(screen.getByText("Description")).toHaveClass("text-sm");
    });
  });

  describe("CardContent", () => {
    it("should render with default props", () => {
      render(<CardContent data-testid="content">Content area</CardContent>);
      
      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-slot", "card-content");
      expect(content).toHaveClass("px-6");
    });

    it("should apply custom className", () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
      
      expect(screen.getByTestId("content")).toHaveClass("custom-content");
    });
  });

  describe("CardFooter", () => {
    it("should render with default props", () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);
      
      const footer = screen.getByTestId("footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute("data-slot", "card-footer");
    });

    it("should have flex and items-center classes", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      
      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
    });
  });

  describe("CardAction", () => {
    it("should render with default props", () => {
      render(<CardAction data-testid="action">Action</CardAction>);
      
      const action = screen.getByTestId("action");
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute("data-slot", "card-action");
    });
  });

  describe("Full Card composition", () => {
    it("should render complete card structure", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Card body content</p>
          </CardContent>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByTestId("full-card")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Card body content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Footer Action" })).toBeInTheDocument();
    });
  });
});
