import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RESA — Site & réservations pour restaurants",
    short_name: "RESA",
    description:
      "Site web, réservations en ligne et espace d'administration tout-en-un pour les restaurants.",
    start_url: "/",
    display: "standalone",
    background_color: "#13503B",
    theme_color: "#13503B",
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
