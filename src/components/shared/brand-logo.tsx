import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  full: {
    sm: { width: 120, height: 32 },
    md: { width: 160, height: 42 },
    lg: { width: 220, height: 58 },
  },
  icon: {
    sm: { width: 28, height: 28 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
  },
} as const;

export function BrandLogo({
  variant = "full",
  size = "md",
  className,
}: BrandLogoProps) {
  const dimensions = sizeMap[variant][size];
  const src =
    variant === "full"
      ? "/branding/CycleCare_Full_Logo.png"
      : "/branding/CycleCare_PWA_App_Icon.png";

  return (
    <Image
      src={src}
      alt="CycleCare"
      width={dimensions.width}
      height={dimensions.height}
      className={cn("object-contain", className)}
      priority
    />
  );
}
