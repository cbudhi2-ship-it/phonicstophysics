import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/subjects",
    "/bootcamp",
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
    changeFrequency: path === "/bootcamp" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/bootcamp" ? 0.9 : 0.7,
  }));
}
