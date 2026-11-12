import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrandLogo } from "@/components/shared/brand-logo";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const { priority, ...rest } = props;
    return <img {...rest} data-priority={priority ? "true" : undefined} />;
  },
}));

describe("BrandLogo", () => {
  it("renders full logo by default", () => {
    render(<BrandLogo />);
    const img = screen.getByAltText("CycleCare");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/branding/CycleCare_Full_Logo.png");
  });

  it("renders icon variant", () => {
    render(<BrandLogo variant="icon" />);
    const img = screen.getByAltText("CycleCare");
    expect(img).toHaveAttribute("src", "/branding/CycleCare_PWA_App_Icon.png");
  });

  it("applies correct dimensions for each size", () => {
    const { rerender } = render(<BrandLogo variant="full" size="sm" />);
    let img = screen.getByAltText("CycleCare");
    expect(img).toHaveAttribute("width", "120");
    expect(img).toHaveAttribute("height", "32");

    rerender(<BrandLogo variant="full" size="lg" />);
    img = screen.getByAltText("CycleCare");
    expect(img).toHaveAttribute("width", "220");
    expect(img).toHaveAttribute("height", "58");
  });

  it("applies custom className", () => {
    render(<BrandLogo className="my-custom-class" />);
    const img = screen.getByAltText("CycleCare");
    expect(img.className).toContain("my-custom-class");
  });

  it("sets priority for eager loading", () => {
    render(<BrandLogo />);
    const img = screen.getByAltText("CycleCare");
    expect(img).toHaveAttribute("data-priority", "true");
  });
});
