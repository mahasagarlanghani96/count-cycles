import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CycleCare",
    short_name: "CycleCare",
    description:
      "Your personal menstrual health companion. Track cycles, understand your body, and get personalized wellness guidance.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#faf9fd",
    theme_color: "#8971e8",
    orientation: "portrait-primary",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
