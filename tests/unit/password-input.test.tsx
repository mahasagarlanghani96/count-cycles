import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PasswordInput } from "@/components/ui/password-input";

describe("PasswordInput", () => {
  it("renders with hidden password by default", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("reveals password when eye icon is clicked", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
  });

  it("hides password again on second click", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");

    const hideToggle = screen.getByRole("button", { name: "Hide password" });
    fireEvent.click(hideToggle);
    expect(input).toHaveAttribute("type", "password");
  });

  it("displays error message when error prop is provided", () => {
    render(<PasswordInput error="Password is required" />);
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("does not display error when error prop is absent", () => {
    render(<PasswordInput placeholder="Enter password" />);
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<PasswordInput placeholder="Enter password" className="custom-class" />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input.className).toContain("custom-class");
  });

  it("passes through standard input attributes", () => {
    render(
      <PasswordInput
        placeholder="Enter password"
        id="test-pw"
        autoComplete="current-password"
        disabled
      />
    );
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("id", "test-pw");
    expect(input).toHaveAttribute("autoComplete", "current-password");
    expect(input).toBeDisabled();
  });

  it("toggle button does not have tabindex by default to avoid tab interruption", () => {
    render(<PasswordInput placeholder="Enter password" />);
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle).toHaveAttribute("tabindex", "-1");
  });
});
