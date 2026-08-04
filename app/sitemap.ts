import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Note: /bootcamp is intentionally omitted — it's an unlisted page (noindex).
  const routes = [
    "",
    "/about",
    "/subjects",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
    "/safeguarding",
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
