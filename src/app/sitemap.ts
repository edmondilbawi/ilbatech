import type { MetadataRoute } from "next";
import { PUBLIC_PATHS } from "@/config/offerings";
import { getSiteUrl } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];
  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}/`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.7,
  }));
}
