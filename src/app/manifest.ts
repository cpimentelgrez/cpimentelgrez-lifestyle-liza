import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lifestyle · Liza",
    short_name: "Lifestyle",
    description:
      "Registro diario de bienestar y rutinas: ánimo, energía, medicación, tareas y más.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff1f2",
    theme_color: "#f43f5e",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
