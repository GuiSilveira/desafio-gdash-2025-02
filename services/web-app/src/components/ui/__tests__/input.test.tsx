import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

describe("Input component", () => {
  it("should render with default props", () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("should render with different types", () => {
    const { rerender } = render(<Input type="text" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "text");

    rerender(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "number");
  });

  it("should handle user input", async () => {
    const user = userEvent.setup();
    
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "Hello World");
    
    expect(input).toHaveValue("Hello World");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="Disabled" />);
    
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("should not accept input when disabled", async () => {
    const user = userEvent.setup();
    
    render(<Input disabled placeholder="Disabled" />);
    
    const input = screen.getByPlaceholderText("Disabled");
    await user.type(input, "Test");
    
    expect(input).toHaveValue("");
  });

  it("should apply custom className", () => {
    render(<Input className="custom-input-class" data-testid="input" />);
    
    expect(screen.getByTestId("input")).toHaveClass("custom-input-class");
  });

  it("should handle onChange events", async () => {
    const user = userEvent.setup();
    let value = "";
    
    render(
      <Input 
        placeholder="Change me" 
        onChange={(e) => { value = e.target.value; }} 
      />
    );
    
    await user.type(screen.getByPlaceholderText("Change me"), "New Value");
    
    expect(value).toBe("New Value");
  });

  it("should display value from controlled input", () => {
    render(<Input value="Controlled Value" readOnly data-testid="input" />);
    
    expect(screen.getByTestId("input")).toHaveValue("Controlled Value");
  });

  it("should have proper styling classes", () => {
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId("input");
    expect(input).toHaveClass("border");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("h-9");
  });

  it("should forward additional props", () => {
    render(
      <Input 
        data-testid="input" 
        id="my-input" 
        name="myInput" 
        maxLength={10} 
        required 
      />
    );
    
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("id", "my-input");
    expect(input).toHaveAttribute("name", "myInput");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toBeRequired();
  });

  it("should clear input value", async () => {
    const user = userEvent.setup();
    
    render(<Input placeholder="Clear me" />);
    
    const input = screen.getByPlaceholderText("Clear me");
    await user.type(input, "Some text");
    expect(input).toHaveValue("Some text");
    
    await user.clear(input);
    expect(input).toHaveValue("");
  });
});
