import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CycleCare - Menstrual Health Tracker",
    short_name: "CycleCare",
    description:
      "A personal menstrual cycle and wellness tracking application.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#F3F0FF",
    theme_color: "#8971E8",
    orientation: "portrait-primary",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
