import type { MetadataRoute } from "next";

const SITE_URL = "https://resa-service.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/restaurant/",
          "/setup",
          "/setup/",
          "/api/",
          "/subscribe/success",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
